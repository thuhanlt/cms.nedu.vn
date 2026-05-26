import { useEffect, useState } from 'react'
import { Modal } from '@shared/components/Modal'
import { toast } from '@shared/stores/useToastStore'
import { useCreateFaq, useUpdateFaq } from '../hooks/useFaqs'
import type { Faq } from '../types/faq'

interface Props {
  open: boolean
  onClose: () => void
  item: Faq | null
  knownCategories: string[]
}

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

const empty = (): Partial<Faq> => ({
  category: '',
  question: '',
  answer: '',
  status: 'draft',
})

export function FaqFormModal({ open, onClose, item, knownCategories }: Props) {
  const isEdit = !!item
  const create = useCreateFaq()
  const update = useUpdateFaq()
  const [draft, setDraft] = useState<Partial<Faq>>(empty())
  const [questionError, setQuestionError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(item ?? empty())
      setQuestionError(null)
    }
  }, [open, item])

  const onSubmit = async () => {
    if (!draft.question?.trim()) {
      setQuestionError('Câu hỏi bắt buộc')
      return
    }
    try {
      if (isEdit && item) {
        await update.mutateAsync({ id: item.id, patch: draft })
        toast.success('Đã cập nhật FAQ')
      } else {
        await create.mutateAsync({ ...draft, category: draft.category || 'Chung' })
        toast.success('Đã thêm FAQ mới')
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
      title={isEdit ? 'Sửa FAQ' : 'Thêm FAQ mới'}
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
            {busy ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm FAQ'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Danh mục</label>
          <input
            className={inputClass}
            value={draft.category ?? ''}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            placeholder="VD: Chung, Học phí, Kỹ thuật..."
            list="faq-categories"
          />
          <datalist id="faq-categories">
            {knownCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <p className="text-[11px] text-[#9CA3AF] mt-1">Gõ danh mục mới hoặc chọn danh mục có sẵn.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">
            Câu hỏi <span className="text-[#DC2626]">*</span>
          </label>
          <input
            className={`${inputClass} ${questionError ? 'border-[#DC2626]' : ''}`}
            value={draft.question ?? ''}
            onChange={(e) => {
              setDraft({ ...draft, question: e.target.value })
              if (questionError && e.target.value.trim()) setQuestionError(null)
            }}
            placeholder="Câu hỏi học viên hay hỏi"
          />
          {questionError && <p className="text-xs text-[#DC2626] mt-1">{questionError}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Câu trả lời</label>
          <textarea
            className={`${inputClass} resize-y min-h-[120px]`}
            value={draft.answer ?? ''}
            onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
            placeholder="Trả lời ngắn gọn, dễ hiểu cho người trưởng thành"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Trạng thái</label>
          <select
            className={inputClass}
            value={draft.status ?? 'draft'}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as Faq['status'] })}
          >
            <option value="draft">Nháp</option>
            <option value="published">Đã đăng</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}
