import { ImageUpload } from '@shared/components/ImageUpload'
import { RepeaterList } from '@shared/components/RepeaterList'
import type { ChallengeContent, ChallengeReview } from '../../types/challenge'
import { inputClass, textareaClass } from './Field'

interface Props {
  content: ChallengeContent
  onContentChange: (patch: Partial<ChallengeContent>) => void
}

export function ReviewsSection({ content, onContentChange }: Props) {
  const update = (reviews: ChallengeReview[]) => onContentChange({ reviews })

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#6B7280]">Học viên đã hoàn thành nói gì về chương trình này.</p>
      <RepeaterList<ChallengeReview>
        items={content.reviews}
        onChange={update}
        createItem={() => ({ avatarLetter: 'A', avatarUrl: '', name: 'Học viên', role: '', topic: '', text: '' })}
        addLabel="Thêm học viên"
        itemLabel={(i) => `Học viên ${i + 1}`}
        renderItem={(r, _i, patch) => (
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-16 shrink-0">
                <ImageUpload
                  ratio="avatar"
                  value={r.avatarUrl || null}
                  onChange={(url) => patch({ avatarUrl: url ?? '' })}
                  fallbackLetter={r.avatarLetter || r.name.charAt(0).toUpperCase() || 'A'}
                />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  value={r.name}
                  onChange={(e) => patch({ name: e.target.value, avatarLetter: e.target.value.charAt(0).toUpperCase() })}
                  placeholder="Họ tên"
                />
                <input
                  className={inputClass}
                  value={r.role}
                  onChange={(e) => patch({ role: e.target.value })}
                  placeholder="Nghề nghiệp"
                />
                <input
                  className={`${inputClass} col-span-2`}
                  value={r.topic}
                  onChange={(e) => patch({ topic: e.target.value })}
                  placeholder="Đã tốt nghiệp chương trình nào"
                />
              </div>
            </div>
            <textarea
              className={textareaClass}
              value={r.text}
              onChange={(e) => patch({ text: e.target.value })}
              placeholder="Nội dung đánh giá học viên chia sẻ"
            />
          </div>
        )}
      />
    </div>
  )
}
