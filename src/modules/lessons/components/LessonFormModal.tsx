import { useEffect, useState } from 'react'
import { Modal } from '@shared/components/Modal'
import { toast } from '@shared/stores/useToastStore'
import { useCreateLesson, useUpdateLesson } from '../hooks/useLessons'
import type { Lesson } from '../types/lesson'

interface Props {
  open: boolean
  onClose: () => void
  lesson: Lesson | null
  knownCourses: string[]
}

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

const emptyDraft = (): Partial<Lesson> => ({
  course: '',
  title: '',
  cohort: '',
  videoUrl: '',
  status: 'draft',
})

export function LessonFormModal({ open, onClose, lesson, knownCourses }: Props) {
  const isEdit = !!lesson
  const create = useCreateLesson()
  const update = useUpdateLesson()
  const [draft, setDraft] = useState<Partial<Lesson>>(emptyDraft())
  const [titleError, setTitleError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(lesson ?? emptyDraft())
      setTitleError(null)
    }
  }, [open, lesson])

  const onSubmit = async () => {
    if (!draft.title?.trim()) {
      setTitleError('Tên bài học bắt buộc')
      return
    }
    try {
      if (isEdit && lesson) {
        await update.mutateAsync({ id: lesson.id, patch: draft })
        toast.success('Đã cập nhật bài học')
      } else {
        await create.mutateAsync(draft)
        toast.success('Đã tạo bài học mới')
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
      title={isEdit ? 'Sửa bài học' : 'Thêm bài học mới'}
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
            {busy ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bài học'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">
            Khoá học <span className="text-[#DC2626]">*</span>
          </label>
          <input
            className={inputClass}
            value={draft.course ?? ''}
            onChange={(e) => setDraft({ ...draft, course: e.target.value })}
            placeholder="VD: Cuộc Sống Của Bạn"
            list="lesson-courses"
          />
          <datalist id="lesson-courses">
            {knownCourses.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <p className="text-[11px] text-[#9CA3AF] mt-1">Gõ tên khoá mới hoặc chọn khoá có sẵn.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">
            Tên bài học <span className="text-[#DC2626]">*</span>
          </label>
          <input
            className={`${inputClass} ${titleError ? 'border-[#DC2626]' : ''}`}
            value={draft.title ?? ''}
            onChange={(e) => {
              setDraft({ ...draft, title: e.target.value })
              if (titleError && e.target.value.trim()) setTitleError(null)
            }}
            placeholder="VD: Buổi 1 — Khai mạc"
          />
          {titleError && <p className="text-xs text-[#DC2626] mt-1">{titleError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Cohort</label>
            <input
              className={inputClass}
              value={draft.cohort ?? ''}
              onChange={(e) => setDraft({ ...draft, cohort: e.target.value })}
              placeholder="VD: K3"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Trạng thái</label>
            <select
              className={inputClass}
              value={draft.status ?? 'draft'}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as Lesson['status'] })}
            >
              <option value="draft">Nháp</option>
              <option value="published">Đã đăng</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Link video</label>
          <input
            className={inputClass}
            value={draft.videoUrl ?? ''}
            onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
            placeholder="https://youtu.be/..."
          />
          <p className="text-[11px] text-[#9CA3AF] mt-1">Để trống → hiển thị "Chưa có video".</p>
        </div>
      </div>
    </Modal>
  )
}
