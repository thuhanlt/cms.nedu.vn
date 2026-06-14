import type { Course, CourseContent, CourseFormat, CourseType } from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  draft: Course
  onChange: (patch: Partial<Course>) => void
  onContentChange: (patch: Partial<CourseContent>) => void
}

const TYPE_OPTIONS: Array<{ value: CourseType; label: string }> = [
  { value: 'retreat', label: 'Retreat' },
  { value: 'online', label: 'Khoá online' },
  { value: 'offline', label: 'Khoá offline' },
  { value: 'hybrid', label: 'Hybrid' },
]

const FORMAT_OPTIONS: Array<{ value: CourseFormat; label: string }> = [
  { value: '', label: '— Chưa chọn —' },
  { value: 'offline', label: 'Offline' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
]

export function HeroSection({ draft, onChange, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionNote>Phần học viên thấy đầu tiên. Tiêu đề ngắn, mạnh. Sub-title 1-2 câu.</SectionNote>

      <Field label="Tiêu đề khoá học" required>
        <input
          className={inputClass}
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="VD: Là Chính Mình 5"
        />
      </Field>

      <Field label="Mô tả ngắn (sub-title)" required>
        <textarea
          className={textareaClass}
          value={draft.content.subTitle}
          onChange={(e) => onContentChange({ subTitle: e.target.value })}
          placeholder="VD: Hành trình 4 ngày để hiểu rõ bản thân..."
        />
      </Field>

      <Field label="URL slug" hint="Tự sinh từ tên khoá khi lưu — hiện ở /khoa-hoc/<slug>">
        <input
          className={inputClass}
          value={draft.slug ?? ''}
          onChange={(e) => onChange({ slug: e.target.value })}
          placeholder="la-chinh-minh-5"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Loại khoá học">
          <select
            className={inputClass}
            value={draft.content.type}
            onChange={(e) => onContentChange({ type: e.target.value as CourseType })}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Hình thức">
          <select
            className={inputClass}
            value={draft.content.format}
            onChange={(e) => onContentChange({ format: e.target.value as CourseFormat })}
          >
            {FORMAT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Khai giảng">
          <input
            type="date"
            className={inputClass}
            value={draft.content.startDate}
            onChange={(e) => onContentChange({ startDate: e.target.value })}
          />
        </Field>
        <Field label="Kết thúc">
          <input
            type="date"
            className={inputClass}
            value={draft.content.endDate}
            onChange={(e) => onContentChange({ endDate: e.target.value })}
          />
        </Field>
      </div>
    </div>
  )
}
