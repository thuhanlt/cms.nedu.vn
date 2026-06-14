// Builder 2-pane theo layout Google Workspace Flows (Studio):
// CANVAS trái (nền xanh-xám nhạt, cột card dọc) + PANEL PHẢI (config theo
// thẻ đang chọn). Logic save/activate/guard/race-fix GIỮ NGUYÊN từ bản cũ —
// chỉ dựng lại lớp trình bày.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, AlertTriangle, ArrowLeft, Pause, Pencil, Play } from 'lucide-react'
import { SaveButton, type SaveState } from '@shared/components/SaveButton'
import { Skeleton } from '@shared/components/Skeleton'
import { EmptyState } from '@shared/components/EmptyState'
import { toast } from '@shared/stores/useToastStore'
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard'
import {
  useCreateFlow,
  useEmailTemplateOptions,
  useFlow,
  useUpdateFlow,
  useFlowTriggerCatalog,
} from '../hooks/useFlows'
import {
  fromApiSteps,
  newDelayStep,
  newSendEmailStep,
  toApiSteps,
  type BuilderStep,
} from '../components/builder-steps'
import {
  FlowCanvas,
  type CanvasSelection,
  type CanvasStarter,
} from '../components/FlowCanvas'
import {
  PanelAddStep,
  PanelChooseStarter,
  PanelDelay,
  PanelReadOnlyAnchor,
  PanelSendEmail,
  PanelStarterDetail,
} from '../components/ConfigPanel'
import { FlowStatusPill } from '../components/FlowStatusPill'
import {
  WORKFLOW_MAX_STEPS,
  WORKFLOW_NAME_MAX,
  type WorkflowStep,
  type WorkflowTrigger,
} from '../types/flow'

interface WorkflowDraft {
  name: string
  event_key: string // '' = chưa chọn trigger
  steps: BuilderStep[]
}

const EMPTY_DRAFT: WorkflowDraft = { name: '', event_key: '', steps: [] }

/** Label tiếng Việt cho anchor_key/offset của luồng mốc ngày (read-only). */
function anchorLabels(anchor_key: string, offset_days: number) {
  const anchorLabel =
    anchor_key === 'course_run.start_date'
      ? 'ngày khai giảng khoá học'
      : anchor_key === 'deposit.balance_due_date'
        ? 'hạn đóng đủ tiền cọc'
        : anchor_key
  const offsetLabel =
    offset_days < 0
      ? `trước ${-offset_days} ngày`
      : offset_days > 0
        ? `sau ${offset_days} ngày`
        : 'đúng ngày'
  return { anchorLabel, offsetLabel }
}

// Route: /dashboard/flows/new (tạo) + /:id/edit (sửa) — cùng page.
export function FlowBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id
  const navigate = useNavigate()

  const detailQ = useFlow(id)
  const catalogQ = useFlowTriggerCatalog()
  const catalog = catalogQ.data ?? []
  const templatesQ = useEmailTemplateOptions()

  const create = useCreateFlow()
  const update = useUpdateFlow()

  const [draft, setDraft] = useState<WorkflowDraft | null>(isNew ? { ...EMPTY_DRAFT } : null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [activating, setActivating] = useState(false)
  // Thẻ đang chọn trên canvas → panel phải. Tạo mới: panel chọn starter mở sẵn.
  const [selection, setSelection] = useState<CanvasSelection>({ kind: 'starter' })
  // Sửa tên inline qua icon bút chì trên pill tên (thay field "Tên" form cũ)
  const [editingName, setEditingName] = useState(isNew)

  // Luồng theo MỐC NGÀY (date_anchor — tạo qua API, BE đã hỗ trợ): builder
  // chưa có UI sửa → mở lên là READ-ONLY, tuyệt đối không save (save sẽ ghi
  // đè trigger thành event = mất cấu hình mốc ngày im lặng).
  const isDateAnchor = !isNew && detailQ.data?.trigger.type === 'date_anchor'

  // Init draft từ server khi edit (1 lần — sau đó user own draft)
  useEffect(() => {
    if (!isNew && detailQ.data && !draft) {
      setDraft({
        name: detailQ.data.name,
        event_key:
          detailQ.data.trigger.type === 'event'
            ? detailQ.data.trigger.event_key
            : '',
        steps: fromApiSteps(detailQ.data.steps),
      })
    }
  }, [isNew, detailQ.data, draft])

  const status = detailQ.data?.status ?? 'draft'

  // So sánh ở dạng canonical (delay quy về giờ) — "3 ngày" với "72 giờ" là một.
  // Steps đang invalid (chưa chọn template / số sai) → coi như dirty.
  const dirty = useMemo(() => {
    if (!draft || isDateAnchor) return false // read-only — không có gì để mất
    const conv = toApiSteps(draft.steps)
    const current = JSON.stringify({
      name: draft.name,
      event_key: draft.event_key,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- tách uid khỏi rest để so sánh
      steps: conv.ok ? conv.steps : draft.steps.map(({ uid: _uid, ...rest }) => rest),
    })
    if (isNew) return current !== JSON.stringify({ name: '', event_key: '', steps: [] })
    if (!detailQ.data) return false
    return (
      current !==
      JSON.stringify({
        name: detailQ.data.name,
        event_key:
          detailQ.data.trigger.type === 'event'
            ? detailQ.data.trigger.event_key
            : '',
        steps: detailQ.data.steps,
      })
    )
  }, [draft, isNew, isDateAnchor, detailQ.data])

  useUnsavedChangesGuard(dirty)

  if (!isNew && detailQ.isError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được luồng tự động"
            description="Luồng này không tồn tại hoặc server đang gặp sự cố."
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void detailQ.refetch()}
                  className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
                >
                  Thử lại
                </button>
                <Link
                  to="/dashboard/flows"
                  className="px-3 py-1.5 rounded-md border border-[#D1D5DB] text-xs hover:bg-[#F7F8FA]"
                >
                  Về danh sách
                </Link>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="p-4 lg:h-screen flex flex-col lg:flex-row gap-4">
        <div className="flex-1 rounded-2xl bg-[#EEF3F9] p-6 space-y-4">
          <Skeleton height={36} width={280} />
          <div className="max-w-[620px] mx-auto mt-10 space-y-3">
            <Skeleton height={64} />
            <Skeleton height={64} />
            <Skeleton height={64} />
          </div>
        </div>
        <div className="lg:w-[460px] shrink-0 rounded-2xl bg-white border border-[#E5E7EB] p-5 space-y-3">
          <Skeleton height={24} width={200} />
          <Skeleton height={120} />
        </div>
      </div>
    )
  }

  const onChange = (patch: Partial<WorkflowDraft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    // reset cả 'error': user sửa tiếp thì trạng thái lỗi cũ không còn đúng
    if (saveState === 'saved' || saveState === 'error') setSaveState('idle')
  }

  /** Validate phần "lưu được": tên + trigger + steps đúng shape (BE reject nếu sai). */
  const validateBase = (): { trigger: WorkflowTrigger; steps: WorkflowStep[] } | null => {
    if (!draft.name.trim()) {
      setNameError('Tên bắt buộc')
      setEditingName(true)
      toast.error('Đặt tên cho luồng trước khi lưu')
      return null
    }
    if (!draft.event_key) {
      toast.error('Chọn sự kiện bắt đầu trước khi lưu')
      setSelection({ kind: 'starter' })
      return null
    }
    const conv = toApiSteps(draft.steps)
    if (!conv.ok) {
      toast.error(conv.error)
      return null
    }
    return { trigger: { type: 'event', event_key: draft.event_key }, steps: conv.steps }
  }

  /** Lưu nháp / lưu thay đổi — KHÔNG đổi status. */
  const onSave = async () => {
    if (isDateAnchor) return // read-only — save sẽ ghi đè mất trigger mốc ngày
    const base = validateBase()
    if (!base) return
    setSaveState('saving')
    try {
      if (isNew) {
        const created = await create.mutateAsync({
          name: draft.name.trim(),
          trigger: base.trigger,
          steps: base.steps,
        })
        setSavedAt(new Date())
        setSaveState('saved')
        toast.success('Đã lưu nháp — luồng chưa chạy cho tới khi bấm Kích hoạt')
        // /new và /:id/edit cùng component type ở cùng vị trí route — React
        // không remount khi navigate, draft/saveState giữ nguyên.
        navigate(`/dashboard/flows/${created.id}/edit`, { replace: true })
        return
      }
      await update.mutateAsync({ id: id!, patch: { name: draft.name.trim(), ...base } })
      setSavedAt(new Date())
      setSaveState('saved')
      toast.success('Đã lưu thay đổi')
    } catch (err) {
      // 400 từ BE (vd sửa steps của workflow đang bật mà không đủ điều kiện)
      // — surface message server.
      setSaveState('error')
      toast.error(err instanceof Error ? err.message : 'Lưu thất bại — thử lại')
    }
  }

  /** Lưu + bật (status:'enabled'). Client validate trước, vẫn surface 400 server nếu lọt. */
  const onActivate = async () => {
    if (isDateAnchor) return
    const base = validateBase()
    if (!base) return
    if (base.steps.length === 0) {
      toast.error('Chưa có node nào — thêm ít nhất 1 node Gửi email trước khi bật')
      return
    }
    if (!base.steps.some((s) => s.type === 'send_email')) {
      toast.error('Cần ít nhất 1 node Gửi email trước khi bật')
      return
    }
    setActivating(true)
    let createdId: string | null = null
    try {
      if (isNew) {
        // POST luôn tạo draft → PATCH bật ngay sau (BE không cho enable lúc tạo)
        const created = await create.mutateAsync({
          name: draft.name.trim(),
          trigger: base.trigger,
          steps: base.steps,
        })
        createdId = created.id
        await update.mutateAsync({ id: created.id, patch: { status: 'enabled' } })
      } else {
        await update.mutateAsync({
          id: id!,
          patch: { name: draft.name.trim(), ...base, status: 'enabled' },
        })
      }
      setSavedAt(new Date())
      setSaveState('saved')
      toast.success('Đã kích hoạt — hệ thống sẽ tự gửi email khi sự kiện xảy ra')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kích hoạt thất bại')
    } finally {
      setActivating(false)
      // Tạo xong (kể cả enable fail) → về route edit để không tạo trùng lần sau
      if (createdId) navigate(`/dashboard/flows/${createdId}/edit`, { replace: true })
    }
  }

  /** Tắt workflow đang bật — chỉ đổi status, KHÔNG lưu thay đổi đang soạn dở. */
  const onDeactivate = async () => {
    if (!id) return
    try {
      await update.mutateAsync({ id, patch: { status: 'disabled' } })
      toast.success('Đã tắt — sự kiện mới sẽ không gửi email nữa')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tắt thất bại')
    }
  }

  const patchStep = (index: number, patch: Partial<BuilderStep>) => {
    onChange({
      steps: draft.steps.map((s, i) => (i === index ? ({ ...s, ...patch } as BuilderStep) : s)),
    })
  }

  const moveStep = (index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= draft.steps.length) return
    const next = [...draft.steps]
    ;[next[index], next[j]] = [next[j], next[index]]
    onChange({ steps: next })
  }

  const removeStep = (index: number) => {
    const removed = draft.steps[index]
    onChange({ steps: draft.steps.filter((_, i) => i !== index) })
    if (selection.kind === 'step' && selection.uid === removed.uid) {
      setSelection({ kind: 'starter' })
    }
  }

  const addStep = (type: 'send_email' | 'delay') => {
    if (draft.steps.length >= WORKFLOW_MAX_STEPS) return
    const step = type === 'send_email' ? newSendEmailStep() : newDelayStep()
    onChange({ steps: [...draft.steps, step] })
    setSelection({ kind: 'step', uid: step.uid }) // chọn luôn step mới → panel config
  }

  const selectedTrigger = catalog.find((t) => t.event_key === draft.event_key)
  const busy = activating || update.isPending || create.isPending

  // Lý do chưa bật được — hiện ngay trên bottom bar (đỡ phải bấm rồi mới biết)
  const activateBlocker = !draft.event_key
    ? 'Cần chọn sự kiện bắt đầu'
    : !draft.steps.some((s) => s.type === 'send_email')
      ? 'Cần ít nhất 1 node Gửi email'
      : null

  // ── Starter card + thông tin mốc ngày (read-only) ─────────────────────────
  const anchorInfo =
    isDateAnchor && detailQ.data && detailQ.data.trigger.type === 'date_anchor'
      ? anchorLabels(detailQ.data.trigger.anchor_key, detailQ.data.trigger.offset_days)
      : null

  const starter: CanvasStarter = anchorInfo
    ? { type: 'anchor', label: `⏱ ${anchorInfo.offsetLabel} ${anchorInfo.anchorLabel}` }
    : draft.event_key
      ? { type: 'event', label: selectedTrigger?.label ?? draft.event_key }
      : { type: 'empty' }

  // ── Panel phải theo selection ──────────────────────────────────────────────
  const renderPanel = () => {
    if (anchorInfo && detailQ.data) {
      return (
        <PanelReadOnlyAnchor
          offsetLabel={anchorInfo.offsetLabel}
          anchorLabel={anchorInfo.anchorLabel}
          stepCount={detailQ.data.steps.length}
        />
      )
    }
    if (
      selection.kind === 'starter-pick' ||
      (selection.kind === 'starter' && (!draft.event_key || !selectedTrigger))
    ) {
      return (
        <PanelChooseStarter
          catalog={catalog}
          isLoading={catalogQ.isLoading}
          isError={catalogQ.isError}
          onRetry={() => void catalogQ.refetch()}
          value={draft.event_key}
          onChange={(event_key) => {
            onChange({ event_key })
            setSelection({ kind: 'starter' })
          }}
        />
      )
    }
    if (selection.kind === 'starter' && selectedTrigger) {
      return (
        <PanelStarterDetail
          trigger={selectedTrigger}
          onChangeStarter={() => setSelection({ kind: 'starter-pick' })}
        />
      )
    }
    if (selection.kind === 'add') {
      return <PanelAddStep full={draft.steps.length >= WORKFLOW_MAX_STEPS} onPick={addStep} />
    }
    if (selection.kind === 'step') {
      const idx = draft.steps.findIndex((s) => s.uid === selection.uid)
      const step = idx >= 0 ? draft.steps[idx] : undefined
      if (step) {
        return step.type === 'send_email' ? (
          <PanelSendEmail
            stepNumber={idx + 2}
            step={step}
            templates={templatesQ.data ?? []}
            templatesLoading={templatesQ.isLoading}
            templatesError={templatesQ.isError}
            onReloadTemplates={() => void templatesQ.refetch()}
            onPatch={(patch) => patchStep(idx, patch)}
          />
        ) : (
          <PanelDelay stepNumber={idx + 2} step={step} onPatch={(patch) => patchStep(idx, patch)} />
        )
      }
    }
    return (
      <p className="text-sm text-[#6B7280]">Chọn một thẻ trên canvas để xem cấu hình.</p>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4 lg:flex-row lg:h-screen">
      {/* ── CANVAS trái ─────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0 rounded-2xl bg-[#EEF3F9] overflow-hidden min-h-[480px]">
        {/* Header floating: back + pill tên (bút chì sửa inline) + status */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 flex-wrap">
          <Link
            to="/dashboard/flows"
            aria-label="Về danh sách"
            className="p-2.5 rounded-full bg-white shadow-sm text-[#6B7280] hover:text-[#111827]"
          >
            <ArrowLeft size={15} />
          </Link>
          {editingName && !isDateAnchor ? (
            <input
              autoFocus
              value={draft.name}
              maxLength={WORKFLOW_NAME_MAX}
              placeholder="Đặt tên luồng... (vd: Chăm sóc sau mua)"
              aria-label="Tên luồng tự động"
              onChange={(e) => {
                onChange({ name: e.target.value })
                if (nameError && e.target.value.trim()) setNameError(null)
              }}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setEditingName(false)
              }}
              className={`rounded-full bg-white shadow-sm px-4 py-2 text-sm w-72 max-w-full focus:outline-none ring-1 ${
                nameError ? 'ring-[#DC2626]' : 'ring-[#2D6A8C]'
              }`}
            />
          ) : (
            <div
              className={`flex items-center gap-1 rounded-full bg-white shadow-sm py-1.5 pl-4 ${
                isDateAnchor ? 'pr-4' : 'pr-1.5'
              } ${nameError ? 'ring-1 ring-[#DC2626]' : ''}`}
            >
              <span
                className={`text-sm font-medium truncate max-w-[280px] ${
                  draft.name ? 'text-[#111827]' : 'text-[#9CA3AF]'
                }`}
              >
                {draft.name || 'Luồng tự động mới'}
              </span>
              {!isDateAnchor && (
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  aria-label="Đổi tên luồng"
                  title="Đổi tên — tên nội bộ để team nhận ra luồng, người nhận email không thấy"
                  className="p-1.5 rounded-full text-[#6B7280] hover:bg-[#F1F3F6] hover:text-[#111827]"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          )}
          {!isNew && <FlowStatusPill status={status} />}
          {dirty && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">
              Chưa lưu
            </span>
          )}
        </div>

        {/* Vùng cuộn của canvas */}
        <div className="h-full overflow-y-auto px-6 pt-20 pb-44">
          {/* Cảnh báo snapshot khi sửa workflow đang bật */}
          {status === 'enabled' && dirty && (
            <div className="max-w-[620px] mx-auto mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A]">
              <AlertTriangle size={15} className="text-[#B45309] mt-0.5 shrink-0" />
              <p className="text-xs text-[#92400E] leading-relaxed">
                Luồng đang bật — những lượt gửi đang chạy giữ nội dung cũ, thay đổi chỉ áp dụng cho
                lượt gửi mới sau khi lưu.
              </p>
            </div>
          )}

          <FlowCanvas
            starter={starter}
            steps={draft.steps}
            templates={templatesQ.data ?? []}
            selection={selection}
            readOnly={isDateAnchor}
            onSelectStarter={() => setSelection({ kind: 'starter' })}
            onChangeStarter={() => setSelection({ kind: 'starter-pick' })}
            onSelectStep={(uid) => setSelection({ kind: 'step', uid })}
            onAddStep={() => setSelection({ kind: 'add' })}
            onMove={moveStep}
            onRemove={removeStep}
          />
        </div>

        {/* BOTTOM CENTER floating bar: Lưu + Kích hoạt/Tắt (ẩn khi read-only) */}
        {!isDateAnchor && (
          <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
            {status !== 'enabled' && activateBlocker && (
              <span className="pointer-events-auto text-[11px] text-[#B45309] bg-white/95 px-2.5 py-1 rounded-full shadow-sm">
                {activateBlocker}
              </span>
            )}
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white border border-[#E5E7EB] shadow-lg px-3 py-2">
              <SaveButton
                // busy cover cả Kích hoạt đang bay — chặn double-POST tạo workflow
                // trùng khi bấm Lưu nháp trong lúc create/update của Kích hoạt chưa xong.
                state={busy ? 'saving' : saveState}
                onClick={() => void onSave()}
                savedAt={savedAt}
                label={isNew || status === 'draft' ? 'Lưu nháp' : 'Lưu thay đổi'}
              />
              <div className="h-6 w-px bg-[#E5E7EB]" />
              {status === 'enabled' ? (
                <button
                  onClick={() => void onDeactivate()}
                  disabled={busy}
                  title="Tắt luồng — sự kiện mới sẽ không gửi email"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#D1D5DB] text-xs font-medium text-[#B45309] hover:bg-[#FEF8EC] disabled:opacity-50"
                >
                  <Pause size={13} />
                  Tắt
                </button>
              ) : (
                <button
                  onClick={() => void onActivate()}
                  disabled={busy}
                  title="Lưu và bật — hệ thống tự gửi email khi sự kiện xảy ra"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-medium disabled:opacity-50"
                >
                  <Play size={13} />
                  {activating ? 'Đang kích hoạt...' : 'Kích hoạt'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── PANEL PHẢI ──────────────────────────────────────────────────── */}
      <div className="lg:w-[460px] shrink-0 rounded-2xl bg-white border border-[#E5E7EB] p-5 lg:overflow-y-auto">
        {renderPanel()}
      </div>
    </div>
  )
}
