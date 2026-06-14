import { RepeaterList } from '@shared/components/RepeaterList'
import type { CourseEditableContent, Outcome, OutcomeIcon } from '../../types/course'
import { inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  content: CourseEditableContent
  onContentChange: (patch: Partial<CourseEditableContent>) => void
}

const ICON_OPTIONS: Array<{ value: OutcomeIcon; label: string }> = [
  { value: 'check', label: '✓ Check' },
  { value: 'chart', label: '📈 Chart' },
  { value: 'clock', label: '🕐 Clock' },
  { value: 'users', label: '👥 Users' },
  { value: 'heart', label: '♡ Heart' },
  { value: 'target', label: '◎ Target' },
]

export function OutcomesSection({ content, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionNote>
        Liệt kê năng lực cốt lõi học viên đạt được sau khoá. Hiển thị dạng 2 cột với icon, tiêu đề, mô tả ngắn.
      </SectionNote>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Danh sách năng lực</div>
        <RepeaterList<Outcome>
          items={content.outcomes}
          onChange={(outcomes) => onContentChange({ outcomes })}
          createItem={() => ({ icon: 'check', title: 'Năng lực mới', desc: 'Mô tả ngắn' })}
          addLabel="Thêm năng lực"
          itemLabel={(i) => `Năng lực ${i + 1}`}
          renderItem={(item, _i, patch) => (
            <div className="grid grid-cols-[140px_1fr] gap-2">
              <select
                className={inputClass}
                value={item.icon}
                onChange={(e) => patch({ icon: e.target.value as OutcomeIcon })}
              >
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
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
