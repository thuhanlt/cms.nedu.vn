import { RepeaterList } from '@shared/components/RepeaterList'
import { ImageUpload } from '@shared/components/ImageUpload'
import type { CourseEditableContent, Review, Reviews } from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  content: CourseEditableContent
  onContentChange: (patch: Partial<CourseEditableContent>) => void
}

export function ReviewsSection({ content, onContentChange }: Props) {
  const reviews = content.reviews
  const setReviews = (patch: Partial<Reviews>) => onContentChange({ reviews: { ...reviews, ...patch } })

  return (
    <div className="space-y-4">
      <SectionNote>
        Điểm tổng + số phản hồi hiển thị đầu section. Mỗi review: ★ rating + trích dẫn + tên + khoá.
      </SectionNote>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Điểm tổng (0-5)">
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            className={inputClass}
            value={reviews.rating_overall}
            onChange={(e) => setReviews({ rating_overall: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Số lượng phản hồi">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={reviews.rating_count}
            onChange={(e) => setReviews({ rating_count: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Feedback học viên</div>
        <RepeaterList<Review>
          items={reviews.items}
          onChange={(items) => setReviews({ items })}
          createItem={() => ({ author: '', role: '', cohort: '', rating: 5, title: '', body: '' })}
          addLabel="Thêm feedback học viên"
          itemLabel={(i) => `Học viên ${i + 1}`}
          renderItem={(r, _i, patch) => (
            <div className="space-y-2">
              <Field label="Ảnh đại diện" hint="Tỉ lệ vuông. Trống → hiện chữ cái đầu của tên.">
                <div className="w-24">
                  <ImageUpload
                    ratio="avatar"
                    kind="review-avatar"
                    value={r.avatar_url || null}
                    onChange={(url) => patch({ avatar_url: url ?? undefined })}
                    fallbackLetter={r.author.charAt(0).toUpperCase() || '?'}
                  />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  value={r.author}
                  onChange={(e) => patch({ author: e.target.value })}
                  placeholder="Tên học viên"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  className={inputClass}
                  value={r.rating}
                  onChange={(e) => patch({ rating: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })}
                  placeholder="Rating 1-5"
                />
                <input
                  className={inputClass}
                  value={r.role ?? ''}
                  onChange={(e) => patch({ role: e.target.value })}
                  placeholder="Nghề nghiệp / vai trò"
                />
                <input
                  className={inputClass}
                  value={r.cohort ?? ''}
                  onChange={(e) => patch({ cohort: e.target.value })}
                  placeholder="Khoá (VD: LCM 04)"
                />
              </div>
              <input
                className={inputClass}
                value={r.title ?? ''}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Tiêu đề đánh giá (tuỳ chọn)"
              />
              <textarea
                className={textareaClass}
                value={r.body}
                onChange={(e) => patch({ body: e.target.value })}
                placeholder="Nội dung feedback"
                rows={4}
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}
