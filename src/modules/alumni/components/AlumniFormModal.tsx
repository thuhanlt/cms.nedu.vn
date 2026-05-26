import { useEffect, useState } from 'react'
import { Modal } from '@shared/components/Modal'
import { toast } from '@shared/stores/useToastStore'
import { useCreateAlumni, useUpdateAlumni } from '../hooks/useAlumni'
import type { Alumni, AlumniType } from '../types/alumni'

interface Props {
  open: boolean
  onClose: () => void
  item: Alumni | null
}

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

const TYPES: Array<{ key: AlumniType; label: string; icon: string }> = [
  { key: 'spotlight', label: 'Spotlight', icon: '⭐' },
  { key: 'event', label: 'Event', icon: '📅' },
  { key: 'job', label: 'Job', icon: '💼' },
]

const empty = (): Partial<Alumni> => ({ title: '', quote: '', type: 'spotlight', status: 'draft' })

export function AlumniFormModal({ open, onClose, item }: Props) {
  const isEdit = !!item
  const create = useCreateAlumni()
  const update = useUpdateAlumni()
  const [draft, setDraft] = useState<Partial<Alumni>>(empty())
  const [titleError, setTitleError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(item ?? empty())
      setTitleError(null)
    }
  }, [open, item])

  const onSubmit = async () => {
    if (!draft.title?.trim()) {
      setTitleError('Tiêu đề bắt buộc')
      return
    }
    try {
      if (isEdit && item) {
        await update.mutateAsync({ id: item.id, patch: draft })
        toast.success('Đã cập nhật mục alumni')
      } else {
        await create.mutateAsync(draft)
        toast.success('Đã thêm mục alumni mới')
      }
      onClose()
    } catch {
      toast.error('Lưu thất bại')
    }
  }

  const busy = create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={isEdit ? 'Sửa mục alumni' : 'Thêm mục alumni'}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-md border border-[#D1D5DB] text-sm hover:bg-[#F7F8FA] disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={onSubmit}
            disabled={busy}
            className="px-4 py-2 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm mục'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Loại nội dung</label>
          <div className="flex gap-2">
            {TYPES.map((t) => {
              const active = draft.type === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setDraft({ ...draft, type: t.key })}
                  className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium transition ${
                    active
                      ? 'bg-[#E0EFF5] border-[#2D6A8C] text-[#1F5374]'
                      : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#9CA3AF]'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">
            Tiêu đề <span className="text-[#DC2626]">*</span>
          </label>
          <input
            className={`${inputClass} ${titleError ? 'border-[#DC2626]' : ''}`}
            value={draft.title ?? ''}
            onChange={(e) => {
              setDraft({ ...draft, title: e.target.value })
              if (titleError && e.target.value.trim()) setTitleError(null)
            }}
            placeholder="VD: Hà Linh — Từ PM mệt mỏi đến Founder agency 5 người"
          />
          {titleError && <p className="text-xs text-[#DC2626] mt-1">{titleError}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Trích dẫn / Mô tả</label>
          <textarea
            className={`${inputClass} resize-y min-h-[96px]`}
            value={draft.quote ?? ''}
            onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
            placeholder='"Sau 6 tháng học, mình không còn tự hỏi mình hợp với gì nữa — mình đã làm điều đó."'
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Trạng thái</label>
          <select
            className={inputClass}
            value={draft.status ?? 'draft'}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as Alumni['status'] })}
          >
            <option value="draft">Nháp</option>
            <option value="published">Đã đăng</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}
