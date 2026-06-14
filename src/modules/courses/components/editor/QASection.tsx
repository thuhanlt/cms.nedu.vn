import { RepeaterList } from '@shared/components/RepeaterList'
import type { CourseContent, CourseFaq } from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  content: CourseContent
  onContentChange: (patch: Partial<CourseContent>) => void
}

export function QASection({ content, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionNote>Giải đáp băn khoăn trước khi đăng ký (học phí, lịch, hoàn tiền…). Hiển thị dạng accordion.</SectionNote>

      <Field label="Tiêu đề section">
        <input
          className={inputClass}
          value={content.qaTitle}
          onChange={(e) => onContentChange({ qaTitle: e.target.value })}
        />
      </Field>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Danh sách câu hỏi</div>
        <RepeaterList<CourseFaq>
          items={content.qa}
          onChange={(qa) => onContentChange({ qa })}
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
                rows={3}
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}
