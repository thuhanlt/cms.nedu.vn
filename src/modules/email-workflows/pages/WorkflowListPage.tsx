// List Workflow kiểu Google Workspace Flows: row card (icon + tên + subtitle
// + status dot + kebab ⋮) thay cho DataTable. Logic toggle/delete/error
// GIỮ NGUYÊN bản cũ; thêm "Tạo bản sao" (POST create mutation có sẵn).
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Copy, History, Mail, Pencil, Play, Plus, Power, Timer, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import { SoonBadge } from '@shared/components/SoonBadge'
import { toast } from '@shared/stores/useToastStore'
import { ApiError } from '@shared/config/api-client'
import {
  useCreateWorkflow,
  useDeleteWorkflow,
  useEmailWorkflows,
  useUpdateWorkflow,
  useWorkflowTriggerCatalog,
} from '../hooks/useEmailWorkflows'
import { triggerClause } from '../components/builder-steps'
import { KebabMenu } from '../components/KebabMenu'
import {
  WORKFLOW_NAME_MAX,
  type EmailWorkflow,
  type WorkflowStatus,
} from '../types/email-workflow'

// Status dot + label (mirror Active/Stopped của Google Flows)
const STATUS_META: Record<WorkflowStatus, { label: string; color: string }> = {
  enabled: { label: 'Đang bật', color: '#15803D' },
  draft: { label: 'Nháp', color: '#6B7280' },
  disabled: { label: 'Đã tắt', color: '#B45309' },
}

export function WorkflowListPage() {
  const navigate = useNavigate()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useEmailWorkflows()
  const list = data ?? []
  const catalogQ = useWorkflowTriggerCatalog()
  const update = useUpdateWorkflow()
  const remove = useDeleteWorkflow()
  const create = useCreateWorkflow() // "Tạo bản sao" — POST cùng trigger+steps

  // event_key → label tiếng Việt (fallback raw key khi catalog chưa có entry)
  const triggerLabels = useMemo(() => {
    const m = new Map<string, string>()
    for (const t of catalogQ.data ?? []) m.set(t.event_key, t.label)
    return m
  }, [catalogQ.data])

  const onToggle = async (wf: EmailWorkflow) => {
    const next: WorkflowStatus = wf.status === 'enabled' ? 'disabled' : 'enabled'
    try {
      await update.mutateAsync({ id: wf.id, patch: { status: next } })
      toast.success(next === 'enabled' ? `Đã bật "${wf.name}"` : `Đã tắt "${wf.name}"`)
    } catch (err) {
      // 400 = chưa đủ điều kiện bật (rỗng / thiếu send_email / template không
      // tồn tại) — surface message server thay vì toast chung chung.
      toast.error(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại')
    }
  }

  const onDuplicate = async (wf: EmailWorkflow) => {
    try {
      const name = `${wf.name} (bản sao)`.slice(0, WORKFLOW_NAME_MAX)
      const created = await create.mutateAsync({
        name,
        trigger: wf.trigger,
        steps: wf.steps,
      })
      // BE: POST luôn tạo ở status draft — bản sao không tự chạy
      toast.success(`Đã tạo bản sao "${created.name}" — đang ở trạng thái nháp`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tạo bản sao thất bại')
    }
  }

  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá luồng tự động')
    } catch (err) {
      // 409 = workflow đang bật — message server hướng dẫn tắt trước khi xoá
      if (err instanceof ApiError && err.status === 409) {
        toast.error(err.message)
      } else {
        toast.error(err instanceof Error ? err.message : 'Xoá thất bại')
      }
    }
    setConfirmId(null)
  }

  /** Subtitle gọn dưới tên: "Khi thanh toán thành công · 3 bước" / luồng mốc
   *  ngày: "⏱ trước 3 ngày ngày khai giảng · 2 bước". */
  const subtitle = (w: EmailWorkflow): string => {
    const stepsLabel = `${w.steps.length} bước`
    if (w.trigger.type === 'date_anchor') {
      const anchorLabel =
        w.trigger.anchor_key === 'course_run.start_date'
          ? 'ngày khai giảng'
          : w.trigger.anchor_key === 'deposit.balance_due_date'
            ? 'hạn đóng đủ cọc'
            : w.trigger.anchor_key
      const o = w.trigger.offset_days
      const offsetLabel = o < 0 ? `trước ${-o} ngày` : o > 0 ? `sau ${o} ngày` : 'đúng ngày'
      return `⏱ ${offsetLabel} ${anchorLabel} · ${stepsLabel}`
    }
    const label = triggerLabels.get(w.trigger.event_key)
    return `${label ? `Khi ${triggerClause(label)}` : w.trigger.event_key} · ${stepsLabel}`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1
            className="text-2xl font-semibold text-[#111827]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Workflow
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {list.length} luồng tự động · khi sự kiện xảy ra, hệ thống tự gửi email theo các bước
            bạn đặt sẵn
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/email-workflows/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
        >
          <Plus size={16} />
          Workflow mới
        </button>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton height={72} />
          <Skeleton height={72} />
          <Skeleton height={72} />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được danh sách"
            description="Có thể do mất mạng hoặc server đang gặp sự cố."
            action={
              <button
                onClick={() => void refetch()}
                className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
              >
                Thử lại
              </button>
            }
          />
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<Mail size={22} />}
            title="Chưa có workflow"
            description='Bấm "Workflow mới" để tạo luồng tự động đầu tiên — vd: gửi email cảm ơn ngay sau khi khách thanh toán.'
            action={
              <button
                onClick={() => navigate('/dashboard/email-workflows/new')}
                className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
              >
                Workflow mới
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((w) => {
            const meta = STATUS_META[w.status]
            const isAnchor = w.trigger.type === 'date_anchor'
            const toggleBusy = update.isPending && update.variables?.id === w.id
            return (
              <div
                key={w.id}
                role="button"
                tabIndex={0}
                aria-label={`Mở luồng ${w.name}`}
                onClick={() => navigate(`/dashboard/email-workflows/${w.id}/edit`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/dashboard/email-workflows/${w.id}/edit`)
                  }
                }}
                className="flex items-center gap-3.5 rounded-2xl bg-[#F1F3F6] hover:bg-[#E9EDF2] px-4 py-3.5 cursor-pointer transition"
              >
                <span className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#1F5374] shrink-0">
                  {isAnchor ? <Timer size={17} /> : <Mail size={17} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#111827] truncate">{w.name}</div>
                  <div className="text-xs text-[#6B7280] truncate mt-0.5">{subtitle(w)}</div>
                </div>
                <span
                  className="flex items-center gap-1.5 text-xs font-medium shrink-0"
                  style={{ color: meta.color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </span>
                <KebabMenu
                  label={`Tuỳ chọn cho ${w.name}`}
                  items={[
                    {
                      key: 'edit',
                      label: 'Sửa',
                      icon: <Pencil size={14} />,
                      onSelect: () => navigate(`/dashboard/email-workflows/${w.id}/edit`),
                    },
                    {
                      key: 'duplicate',
                      label: 'Tạo bản sao',
                      icon: <Copy size={14} />,
                      // POST chỉ nhận trigger event (mirror BE) — luồng mốc ngày
                      // tạo qua API, bản sao cũng vậy.
                      disabled: isAnchor || create.isPending,
                      onSelect: () => void onDuplicate(w),
                    },
                    {
                      key: 'history',
                      label: 'Lịch sử',
                      icon: <History size={14} />,
                      disabled: true, // trang CMS-3 sau
                      badge: <SoonBadge />,
                    },
                    'divider',
                    {
                      key: 'toggle',
                      label: w.status === 'enabled' ? 'Tắt' : 'Bật',
                      icon: w.status === 'enabled' ? <Power size={14} /> : <Play size={14} />,
                      disabled: toggleBusy,
                      onSelect: () => void onToggle(w),
                    },
                    {
                      key: 'delete',
                      label: 'Xoá',
                      icon: <Trash2 size={14} />,
                      danger: true,
                      onSelect: () => setConfirmId(w.id),
                    },
                  ]}
                />
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Xoá luồng tự động?"
        message="Luồng sẽ bị xoá vĩnh viễn. Luồng đang bật cần tắt trước rồi mới xoá được."
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        onConfirm={() => void onDelete()}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
