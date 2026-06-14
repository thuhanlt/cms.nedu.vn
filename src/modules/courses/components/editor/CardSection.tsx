import { ImageUpload } from '@shared/components/ImageUpload'
import type {
  Course,
  CourseEditableContent,
  CourseCard,
  CourseDelivery,
} from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  draft: Course
  onChange: (patch: Partial<Course>) => void
  onContentChange: (patch: Partial<CourseEditableContent>) => void
}

const TYPE_TAG_OPTIONS: Array<{ value: CourseCard['type_tag']; label: string }> = [
  { value: 'khoa-hoc-theo-nhom', label: 'Khoá học theo nhóm' },
  { value: 'tu-hoc-theo-lo-trinh', label: 'Tự học theo lộ trình' },
  { value: 'khoa-hoc-chuyen-sau', label: 'Khoá học chuyên sâu' },
  { value: 'co-van-ca-nhan', label: 'Cố vấn cá nhân' },
  { value: 'khoa-hoc-thuc-chien', label: 'Khoá học thực chiến' },
]

// Hình thức học = field `delivery` cấp course (online/offline/hybrid). Label
// hiển thị trên card (format_label) tự derive theo lựa chọn để card listing +
// delivery luôn đồng bộ.
const DELIVERY_OPTIONS: Array<{ value: CourseDelivery; label: string }> = [
  { value: 'online', label: 'Học online' },
  { value: 'offline', label: 'Học offline' },
  { value: 'hybrid', label: 'Học kết hợp online và offline' },
]
const DELIVERY_LABEL: Record<CourseDelivery, string> = {
  online: 'Học online',
  offline: 'Học offline',
  hybrid: 'Học kết hợp online và offline',
}

export function CardSection({ draft, onChange, onContentChange }: Props) {
  const card = draft.content.card
  const setCard = (patch: Partial<CourseCard>) => onContentChange({ card: { ...card, ...patch } })

  return (
    <div className="space-y-4">
      <SectionNote>
        Nội dung card khoá học ở trang listing nedu.vn. Thumbnail riêng với ảnh bìa hero.
      </SectionNote>

      <Field label="Tên hiển thị trên card" required>
        <input
          className={inputClass}
          value={card.name}
          onChange={(e) => setCard({ name: e.target.value })}
          placeholder="VD: Là Chính Mình"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Nhãn loại (hiển thị)">
          <input
            className={inputClass}
            value={card.type_label}
            onChange={(e) => setCard({ type_label: e.target.value })}
            placeholder="Khoá học chuyên sâu"
          />
        </Field>
        <Field label="Loại (tag lọc)">
          <select
            className={inputClass}
            value={card.type_tag}
            onChange={(e) => setCard({ type_tag: e.target.value as CourseCard['type_tag'] })}
          >
            {TYPE_TAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Hình thức học" hint="Liên kết với loại hình giao (delivery) của khoá.">
          <select
            className={inputClass}
            value={draft.delivery}
            onChange={(e) => {
              const delivery = e.target.value as CourseDelivery
              onChange({ delivery })
              setCard({ format_label: DELIVERY_LABEL[delivery] })
            }}
          >
            {DELIVERY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Lịch / thời gian">
          <input
            className={inputClass}
            value={card.schedule_label}
            onChange={(e) => setCard({ schedule_label: e.target.value })}
            placeholder="Tháng 8/2026"
          />
        </Field>
      </div>

      <Field label="Mô tả ngắn">
        <textarea
          className={textareaClass}
          value={card.short_description}
          onChange={(e) => setCard({ short_description: e.target.value })}
          placeholder="Hành trình 3.5 ngày đánh thức sức mạnh nội tại..."
        />
      </Field>

      <Field label="Giảng viên (ngắn)">
        <input
          className={inputClass}
          value={card.instructor_short}
          onChange={(e) => setCard({ instructor_short: e.target.value })}
          placeholder="NhiLe x Guest Instructors"
        />
      </Field>

      <Field label="Thumbnail card" hint="Ảnh nhỏ hiển thị trên card listing (khác ảnh bìa hero).">
        <ImageUpload
          ratio="banner"
          kind="challenge-banner"
          value={card.image || null}
          onChange={(url) => setCard({ image: url ?? '' })}
        />
      </Field>
    </div>
  )
}
