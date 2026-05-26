import { RepeaterList } from '@shared/components/RepeaterList'
import type { ChallengeContent, ChallengeFaq } from '../../types/challenge'
import { inputClass, textareaClass } from './Field'

interface Props {
  content: ChallengeContent
  onContentChange: (patch: Partial<ChallengeContent>) => void
}

export function FaqSection({ content, onContentChange }: Props) {
  const update = (faqs: ChallengeFaq[]) => onContentChange({ faqs })

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#6B7280]">Các câu hỏi học viên hay hỏi trước khi đăng ký.</p>
      <RepeaterList<ChallengeFaq>
        items={content.faqs}
        onChange={update}
        createItem={() => ({ q: 'Câu hỏi mới?', a: '' })}
        addLabel="Thêm câu hỏi"
        itemLabel={(i) => `Câu hỏi ${i + 1}`}
        renderItem={(faq, _i, patch) => (
          <div className="space-y-2">
            <input
              className={inputClass}
              value={faq.q}
              onChange={(e) => patch({ q: e.target.value })}
              placeholder="Câu hỏi"
            />
            <textarea
              className={textareaClass}
              value={faq.a}
              onChange={(e) => patch({ a: e.target.value })}
              placeholder="Câu trả lời"
            />
          </div>
        )}
      />
    </div>
  )
}
