import { ImageUpload } from '@shared/components/ImageUpload'
import { RepeaterList } from '@shared/components/RepeaterList'
import type { CourseContent, CourseReview } from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  content: CourseContent
  onContentChange: (patch: Partial<CourseContent>) => void
}

export function ReviewsSection({ content, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionNote>Feedback dạng danh sách dọc: ★★★★★ + trích dẫn + tên + khoá.</SectionNote>

      <Field label="Mô tả ngắn">
        <input
          className={inputClass}
          value={content.reviewsSub}
          onChange={(e) => onContentChange({ reviewsSub: e.target.value })}
          placeholder="Từ các khoá Là Chính Mình K3, K4"
        />
      </Field>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Feedback học viên</div>
        <RepeaterList<CourseReview>
          items={content.reviews}
          onChange={(reviews) => onContentChange({ reviews })}
          createItem={() => ({ name: '', cohort: '', text: '', avatarUrl: '' })}
          addLabel="Thêm feedback học viên"
          itemLabel={(i) => `Học viên ${i + 1}`}
          renderItem={(r, _i, patch) => (
            <div className="space-y-2">
              <div className="flex gap-3 items-start">
                <div className="w-14 shrink-0">
                  <ImageUpload
                    ratio="avatar"
                    kind="review-avatar"
                    value={r.avatarUrl || null}
                    onChange={(url) => patch({ avatarUrl: url ?? '' })}
                    fallbackLetter={r.name.charAt(0).toUpperCase() || 'A'}
                  />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    className={inputClass}
                    value={r.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="Tên học viên"
                  />
                  <input
                    className={inputClass}
                    value={r.cohort}
                    onChange={(e) => patch({ cohort: e.target.value })}
                    placeholder="Khoá / nghề nghiệp"
                  />
                </div>
              </div>
              <textarea
                className={textareaClass}
                value={r.text}
                onChange={(e) => patch({ text: e.target.value })}
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
