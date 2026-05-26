import { useEffect, useState } from 'react'
import { Modal } from '@shared/components/Modal'
import { StarRating } from '@shared/components/StarRating'
import { toast } from '@shared/stores/useToastStore'
import { useCreateReview, useUpdateReview } from '../hooks/useReviews'
import type { Review } from '../types/review'

interface Props {
  open: boolean
  onClose: () => void
  item: Review | null
}

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

const empty = (): Partial<Review> => ({
  student: '',
  cohort: '',
  course: '',
  rating: 5,
  month: '',
  featured: false,
  status: 'draft',
})

export function ReviewFormModal({ open, onClose, item }: Props) {
  const isEdit = !!item
  const create = useCreateReview()
  const update = useUpdateReview()
  const [draft, setDraft] = useState<Partial<Review>>(empty())
  const [studentError, setStudentError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(item ?? empty())
      setStudentError(null)
    }
  }, [open, item])

  const onSubmit = async () => {
    if (!draft.student?.trim()) {
      setStudentError('Tên học viên bắt buộc')
      return
    }
    try {
      if (isEdit && item) {
        await update.mutateAsync({ id: item.id, patch: draft })
        toast.success('Đã cập nhật đánh giá')
      } else {
        await create.mutateAsync(draft)
        toast.success('Đã thêm đánh giá mới')
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
      title={isEdit ? 'Sửa đánh giá' : 'Thêm đánh giá mới'}
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
            {busy ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm đánh giá'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">
            Tên học viên <span className="text-[#DC2626]">*</span>
          </label>
          <input
            className={`${inputClass} ${studentError ? 'border-[#DC2626]' : ''}`}
            value={draft.student ?? ''}
            onChange={(e) => {
              setDraft({ ...draft, student: e.target.value })
              if (studentError && e.target.value.trim()) setStudentError(null)
            }}
            placeholder="VD: Minh Anh"
          />
          {studentError && <p className="text-xs text-[#DC2626] mt-1">{studentError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Khoá học</label>
            <input
              className={inputClass}
              value={draft.course ?? ''}
              onChange={(e) => setDraft({ ...draft, course: e.target.value })}
              placeholder="VD: Cuộc Sống Của Bạn"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Cohort</label>
            <input
              className={inputClass}
              value={draft.cohort ?? ''}
              onChange={(e) => setDraft({ ...draft, cohort: e.target.value })}
              placeholder="VD: K3"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Số sao</label>
          <StarRating
            value={draft.rating ?? 5}
            onChange={(v) => setDraft({ ...draft, rating: v })}
            size={24}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Tháng</label>
            <input
              type="month"
              className={inputClass}
              value={draft.month ?? ''}
              onChange={(e) => setDraft({ ...draft, month: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Trạng thái</label>
            <select
              className={inputClass}
              value={draft.status ?? 'draft'}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as Review['status'] })}
            >
              <option value="draft">Nháp</option>
              <option value="published">Đã đăng</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={draft.featured ?? false}
            onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
            className="w-4 h-4 accent-[#2D6A8C]"
          />
          <div>
            <div className="text-sm font-medium text-[#111827]">Featured</div>
            <div className="text-[11px] text-[#6B7280]">Hiển thị nổi bật ở trang chủ nedu.vn</div>
          </div>
        </label>
      </div>
    </Modal>
  )
}
