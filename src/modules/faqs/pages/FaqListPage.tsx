import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, HelpCircle, ChevronDown, AlertCircle } from 'lucide-react'
import { StatusPill } from '@shared/components/StatusPill'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import { toast } from '@shared/stores/useToastStore'
import { FaqFormModal } from '../components/FaqFormModal'
import { useDeleteFaq, useFaqs } from '../hooks/useFaqs'
import type { Faq } from '../types/faq'

export function FaqListPage() {
  const { data, isLoading, isError, refetch } = useFaqs()
  const list = data?.data ?? []

  const [editing, setEditing] = useState<Faq | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const remove = useDeleteFaq()

  const groups = useMemo(() => {
    const map = new Map<string, Faq[]>()
    list.forEach((f) => {
      const arr = map.get(f.category) ?? []
      arr.push(f)
      map.set(f.category, arr)
    })
    map.forEach((arr) => arr.sort((a, b) => a.orderIndex - b.orderIndex))
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [list])

  const knownCategories = useMemo(() => Array.from(new Set(list.map((f) => f.category))), [list])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (f: Faq) => {
    setEditing(f)
    setModalOpen(true)
  }
  const toggleFaq = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá FAQ')
      setConfirmId(null)
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
            FAQ
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {list.length} câu hỏi · {groups.length} danh mục · hiển thị ở trang FAQ + chân các landing
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
        >
          <Plus size={16} /> Thêm FAQ
        </button>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được FAQ"
            description="Có thể do mất mạng hoặc server đang gặp sự cố."
            action={
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
              >
                Thử lại
              </button>
            }
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<HelpCircle size={22} />}
            title="Chưa có FAQ"
            description="Bấm 'Thêm FAQ' để bắt đầu — sẽ tự gom theo danh mục."
          />
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([category, items]) => (
            <section key={category} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <header className="px-5 py-3 border-b border-[#E5E7EB] bg-[#F7F8FA] flex items-center gap-2">
                <HelpCircle size={15} className="text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">{category}</h3>
                <span className="text-xs text-[#6B7280] ml-1">· {items.length} câu</span>
              </header>
              <ul>
                {items.map((f) => {
                  const isOpen = openIds.has(f.id)
                  return (
                    <li key={f.id} className="border-t first:border-t-0 border-[#E5E7EB]">
                      <div className="px-5 py-3 flex items-center gap-3">
                        <button
                          onClick={() => toggleFaq(f.id)}
                          className="flex-1 min-w-0 flex items-center gap-2 text-left"
                        >
                          <ChevronDown
                            size={14}
                            className={`text-[#6B7280] transition shrink-0 ${isOpen ? 'rotate-180' : '-rotate-90'}`}
                          />
                          <span className="text-sm font-medium text-[#111827] truncate">{f.question}</span>
                        </button>
                        <StatusPill status={f.status} />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(f)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
                          >
                            <Pencil size={12} /> Sửa
                          </button>
                          <button
                            onClick={() => setConfirmId(f.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#DC2626] hover:bg-[#FEE2E2]"
                          >
                            <Trash2 size={12} /> Xoá
                          </button>
                        </div>
                      </div>
                      {isOpen && f.answer && (
                        <div className="px-5 pb-4 pl-[44px] text-sm text-[#374151] leading-relaxed">{f.answer}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <FaqFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editing}
        knownCategories={knownCategories}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="Xoá FAQ?"
        message="Câu hỏi sẽ bị xoá vĩnh viễn. Hành động không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
