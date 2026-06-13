import { RepeaterList } from '@shared/components/RepeaterList'
import type { CourseContent, Outcome } from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  content: CourseContent
  onContentChange: (patch: Partial<CourseContent>) => void
}

export function OutcomesSection({ content, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionNote>
        Liệt kê năng lực cốt lõi học viên đạt được sau khoá. Hiển thị dạng 2 cột với icon, tiêu đề, mô tả ngắn.
      </SectionNote>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tiêu đề section">
          <input
            className={inputClass}
            value={content.outcomesTitle}
            onChange={(e) => onContentChange({ outcomesTitle: e.target.value })}
          />
        </Field>
        <Field label="Mô tả ngắn dưới tiêu đề">
          <input
            className={inputClass}
            value={content.outcomesSub}
            onChange={(e) => onContentChange({ outcomesSub: e.target.value })}
          />
        </Field>
      </div>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Danh sách năng lực</div>
        <RepeaterList<Outcome>
          items={content.outcomes}
          onChange={(outcomes) => onContentChange({ outcomes })}
          createItem={() => ({ icon: '◎', title: 'Năng lực mới', desc: 'Mô tả ngắn' })}
          addLabel="Thêm năng lực"
          itemLabel={(i) => `Năng lực ${i + 1}`}
          renderItem={(item, _i, patch) => (
            <div className="grid grid-cols-[60px_1fr] gap-2">
              <input
                className={`${inputClass} text-center text-lg`}
                value={item.icon}
                maxLength={4}
                onChange={(e) => patch({ icon: e.target.value })}
                placeholder="◎"
              />
              <input
                className={inputClass}
                value={item.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Tiêu đề năng lực"
              />
              <textarea
                className={`${textareaClass} col-span-2`}
                value={item.desc}
                onChange={(e) => patch({ desc: e.target.value })}
                placeholder="Mô tả ngắn (1-2 câu)"
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}
