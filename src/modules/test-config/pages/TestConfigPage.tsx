import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Save, Sparkles, Rocket, AlertTriangle, AlertCircle } from 'lucide-react'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import { SoonBadge } from '@shared/components/SoonBadge'
import { StatusPill } from '@shared/components/StatusPill'
import { RepeaterList } from '@shared/components/RepeaterList'
import { toast } from '@shared/stores/useToastStore'
import {
  usePersonas,
  useCreatePersona,
  useUpdatePersona,
  useDeletePersona,
  usePublishAllPersonas,
} from '../hooks/usePersonas'
import {
  type Persona,
  type PersonaProblem,
  MAX_PERSONAS,
  MAX_PROBLEMS_PER_PERSONA,
} from '../types/persona'

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

const textareaClass = `${inputClass} resize-y min-h-[72px]`

export function TestConfigPage() {
  const { data, isLoading, isError, refetch } = usePersonas()
  const personas = data ?? []

  const create = useCreatePersona()
  const update = useUpdatePersona()
  const remove = useDeletePersona()
  const publishAll = usePublishAllPersonas()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Persona | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmPublishAll, setConfirmPublishAll] = useState(false)

  // Auto select first persona on load
  useEffect(() => {
    if (!selectedId && personas.length > 0) {
      setSelectedId(personas[0].id)
    }
  }, [personas, selectedId])

  // Sync draft when selection changes
  useEffect(() => {
    const p = personas.find((x) => x.id === selectedId) ?? null
    setDraft(p ? { ...p, problems: [...p.problems] } : null)
  }, [selectedId, personas])

  const dirty = useMemo(() => {
    if (!draft || !selectedId) return false
    const original = personas.find((x) => x.id === selectedId)
    if (!original) return false
    return JSON.stringify(draft) !== JSON.stringify(original)
  }, [draft, personas, selectedId])

  const onAddPersona = async () => {
    if (personas.length >= MAX_PERSONAS) {
      toast.warn(`Đã đạt giới hạn ${MAX_PERSONAS} persona`)
      return
    }
    try {
      const created = await create.mutateAsync({
        name: `Persona ${personas.length + 1}`,
        icon: '🧩',
        instruction: '',
        status: 'draft',
        problems: [],
      })
      toast.success('Đã thêm persona mới')
      setSelectedId(created.id)
    } catch {
      toast.error('Tạo persona thất bại')
    }
  }

  const onSave = async () => {
    if (!draft || !selectedId) return
    if (!draft.name.trim()) {
      toast.error('Tên persona không được để trống')
      return
    }
    try {
      await update.mutateAsync({ id: selectedId, patch: draft })
      toast.success('Đã lưu persona')
    } catch {
      toast.error('Lưu thất bại')
    }
  }

  const onDelete = async () => {
    if (!selectedId) return
    try {
      await remove.mutateAsync(selectedId)
      toast.success('Đã xoá persona')
      setSelectedId(null)
      setConfirmDelete(false)
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  const onPublishAll = async () => {
    try {
      const res = await publishAll.mutateAsync()
      toast.success(`Đã publish ${res.published} persona lên test.nedu.vn`)
      setConfirmPublishAll(false)
    } catch {
      toast.error('Publish thất bại')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Test Config
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Quản lý {personas.length}/{MAX_PERSONAS} persona dùng cho bài test trên test.nedu.vn — chỉ Quản trị viên truy cập.
          </p>
        </div>
        <button
          onClick={() => setConfirmPublishAll(true)}
          disabled={personas.length === 0 || publishAll.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#15803D] hover:bg-[#14532D] text-white text-sm font-medium disabled:opacity-50"
        >
          <Rocket size={15} />
          {publishAll.isPending ? 'Đang publish...' : 'Publish All → test.nedu.vn'}
        </button>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-[280px_1fr] gap-4">
          <Skeleton height={400} />
          <Skeleton height={400} />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được persona"
            description="Có thể do quyền admin chưa được cấp hoặc mất mạng."
            action={
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
              >
                Thử lại
              </button>
            }
          />
        </div>
      ) : personas.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            title="Chưa có persona nào"
            description="Thêm persona đầu tiên để bắt đầu cấu hình bài test."
            action={
              <button
                onClick={onAddPersona}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
              >
                <Plus size={14} /> Thêm persona
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* LEFT: persona list */}
          <aside className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[calc(100vh-180px)]">
            <header className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold">Personas</h3>
              <button
                onClick={onAddPersona}
                disabled={personas.length >= MAX_PERSONAS || create.isPending}
                className="text-[#2D6A8C] hover:bg-[#E0EFF5] p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title={personas.length >= MAX_PERSONAS ? `Tối đa ${MAX_PERSONAS} persona` : 'Thêm persona'}
              >
                <Plus size={16} />
              </button>
            </header>
            <ul className="flex-1 overflow-y-auto py-1">
              {personas.map((p) => {
                const active = p.id === selectedId
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition border-l-2 ${
                        active
                          ? 'bg-[#E0EFF5] text-[#1F5374] border-[#2D6A8C] font-medium'
                          : 'border-transparent hover:bg-[#F7F8FA] text-[#374151]'
                      }`}
                    >
                      <span className="text-lg shrink-0">{p.icon || '🧩'}</span>
                      <span className="flex-1 min-w-0 truncate">{p.name}</span>
                      <StatusPill status={p.status} />
                    </button>
                  </li>
                )
              })}
            </ul>
            <footer className="px-4 py-2 border-t border-[#E5E7EB] text-[11px] text-[#9CA3AF]">
              {personas.length}/{MAX_PERSONAS}
            </footer>
          </aside>

          {/* RIGHT: persona detail */}
          {draft ? (
            <section className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[calc(100vh-180px)]">
              <header className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl">{draft.icon || '🧩'}</span>
                  <h3 className="text-sm font-semibold text-[#111827] truncate">{draft.name}</h3>
                  {dirty && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">Chưa lưu</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEE2E2] rounded-md"
                  >
                    <Trash2 size={13} /> Xoá persona
                  </button>
                  <button
                    onClick={onSave}
                    disabled={update.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium disabled:opacity-50"
                  >
                    <Save size={13} /> {update.isPending ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Persona meta */}
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Icon</label>
                    <input
                      className={`${inputClass} text-center text-xl`}
                      value={draft.icon ?? ''}
                      onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">
                      Tên persona <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      className={inputClass}
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#374151]">Trạng thái</label>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          status: draft.status === 'published' ? 'draft' : 'published',
                        })
                      }
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        draft.status === 'published'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {draft.status === 'published' ? '✅ Published' : '○ Nháp'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Hướng dẫn (instruction)</label>
                  <textarea
                    className={textareaClass}
                    value={draft.instruction ?? ''}
                    onChange={(e) => setDraft({ ...draft, instruction: e.target.value })}
                    placeholder="Đặc điểm + bối cảnh persona này để AI/bài test xử lý đúng"
                  />
                </div>

                {/* Problems */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-[#111827]">
                        Vấn đề MaxDiff ({draft.problems.length}/{MAX_PROBLEMS_PER_PERSONA})
                      </h4>
                      <p className="text-[11px] text-[#6B7280]">Vấn đề sẽ hiện trong bài test ở test.nedu.vn để học viên rank theo độ ưu tiên.</p>
                    </div>
                    <button
                      disabled
                      title="Sắp ra mắt"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#6B7280] border border-[#E5E7EB] rounded-md opacity-60 cursor-not-allowed"
                    >
                      <Sparkles size={12} />
                      Generate problems
                      <SoonBadge />
                    </button>
                  </div>

                  {draft.problems.length >= MAX_PROBLEMS_PER_PERSONA && (
                    <div className="mb-3 flex items-start gap-2 px-3 py-2 bg-[#FEF3C7] text-[#B45309] text-xs rounded-md">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        Đã đạt giới hạn {MAX_PROBLEMS_PER_PERSONA} vấn đề / persona. Xoá bớt để thêm mới.
                      </span>
                    </div>
                  )}

                  <RepeaterList<PersonaProblem>
                    items={draft.problems}
                    onChange={(problems) =>
                      setDraft({ ...draft, problems: problems.slice(0, MAX_PROBLEMS_PER_PERSONA) })
                    }
                    createItem={() => ({ title: 'Vấn đề mới', description: '', courseSlug: '', urgency: '' })}
                    addLabel={
                      draft.problems.length >= MAX_PROBLEMS_PER_PERSONA
                        ? `Đã đủ ${MAX_PROBLEMS_PER_PERSONA} vấn đề`
                        : 'Thêm vấn đề'
                    }
                    itemLabel={(i) => `Vấn đề ${i + 1}`}
                    renderItem={(item, _i, patch) => (
                      <div className="space-y-2">
                        <input
                          className={inputClass}
                          value={item.title}
                          onChange={(e) => patch({ title: e.target.value })}
                          placeholder="Tiêu đề vấn đề"
                        />
                        <textarea
                          className={textareaClass}
                          value={item.description ?? ''}
                          onChange={(e) => patch({ description: e.target.value })}
                          placeholder="Mô tả ngắn (1-2 câu)"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className={inputClass}
                            value={item.courseSlug ?? ''}
                            onChange={(e) => patch({ courseSlug: e.target.value })}
                            placeholder="Course slug (VD: cuoc-song-cua-ban)"
                          />
                          <input
                            className={inputClass}
                            value={item.urgency ?? ''}
                            onChange={(e) => patch({ urgency: e.target.value })}
                            placeholder="Urgency (VD: Khẩn cấp)"
                          />
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            </section>
          ) : (
            <div className="bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-center">
              <EmptyState title="Chọn persona để chỉnh sửa" description="Bấm vào một persona ở cột trái." />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Xoá persona?"
        message="Toàn bộ vấn đề trong persona này cũng sẽ bị xoá. Hành động không thể hoàn tác."
        confirmLabel="Xoá persona"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={confirmPublishAll}
        title="Publish tất cả persona?"
        message="Toàn bộ persona sẽ được đẩy lên test.nedu.vn ngay lập tức. Học viên sẽ thấy ngay."
        confirmLabel="Publish ngay"
        cancelLabel="Để sau"
        variant="primary"
        loading={publishAll.isPending}
        onConfirm={onPublishAll}
        onClose={() => setConfirmPublishAll(false)}
      />
    </div>
  )
}
