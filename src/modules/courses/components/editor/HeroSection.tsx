import { ImageUpload } from '@shared/components/ImageUpload'
import { RepeaterList } from '@shared/components/RepeaterList'
import type {
  Course,
  CourseEditableContent,
  Hero,
  HeroBadge,
  HeroBadgeVariant,
  HeroMeta,
} from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  draft: Course
  onChange: (patch: Partial<Course>) => void
  onContentChange: (patch: Partial<CourseEditableContent>) => void
}

const VARIANT_OPTIONS: Array<{ value: HeroBadgeVariant; label: string }> = [
  { value: 'amber', label: 'Vàng (amber)' },
  { value: 'open', label: 'Đang mở (open)' },
  { value: 'red', label: 'Đỏ (red)' },
]

export function HeroSection({ draft, onChange, onContentChange }: Props) {
  const hero = draft.content.hero
  const setHero = (patch: Partial<Hero>) => onContentChange({ hero: { ...hero, ...patch } })

  return (
    <div className="space-y-4">
      <SectionNote>Phần học viên thấy đầu tiên. Tiêu đề ngắn, mạnh. Sub-title 1-2 câu.</SectionNote>

      <Field label="Tiêu đề khoá học" required>
        <input
          className={inputClass}
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="VD: Là Chính Mình"
        />
        <p className="text-[11px] text-[#9CA3AF] mt-1">Tên này dùng chung cho cả hero title nếu để trống bên dưới.</p>
      </Field>

      <Field label="Hero title" hint="Để trống → dùng tên khoá học.">
        <input
          className={inputClass}
          value={hero.title}
          onChange={(e) => setHero({ title: e.target.value })}
          placeholder="Là Chính Mình"
        />
      </Field>

      <Field label="Hero subtitle" required>
        <textarea
          className={textareaClass}
          value={hero.subtitle}
          onChange={(e) => setHero({ subtitle: e.target.value })}
          placeholder="Hành trình 3.5 ngày đánh thức sức mạnh nội tại..."
        />
      </Field>

      <Field label="URL slug" hint="Hiện ở /khoa-hoc/<slug>.">
        <input
          className={inputClass}
          value={draft.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          placeholder="la-chinh-minh-05"
        />
      </Field>

      <Field
        label="Ảnh bìa khoá học (banner)"
        hint="Banner lớn của khoá. Thumbnail card chỉnh riêng ở mục Card."
      >
        <ImageUpload
          ratio="banner"
          kind="challenge-banner"
          value={draft.cover_image_url || null}
          onChange={(url) => onChange({ cover_image_url: url ?? '' })}
        />
      </Field>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Badges (nhãn trên hero)</div>
        <RepeaterList<HeroBadge>
          items={hero.badges}
          onChange={(badges) => setHero({ badges })}
          createItem={() => ({ label: 'Nhãn mới', variant: 'amber' })}
          addLabel="Thêm badge"
          itemLabel={(i) => `Badge ${i + 1}`}
          renderItem={(b, _i, patch) => (
            <div className="grid grid-cols-[1fr_140px] gap-2">
              <input
                className={inputClass}
                value={b.label}
                onChange={(e) => patch({ label: e.target.value })}
                placeholder="Đang mở đăng ký"
              />
              <select
                className={inputClass}
                value={b.variant}
                onChange={(e) => patch({ variant: e.target.value as HeroBadgeVariant })}
              >
                {VARIANT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
        />
      </div>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Meta (thông tin nhanh)</div>
        <RepeaterList<HeroMeta>
          items={hero.meta}
          onChange={(meta) => setHero({ meta })}
          createItem={() => ({ label: 'Nhãn', value: 'Giá trị' })}
          addLabel="Thêm meta"
          itemLabel={(i) => `Meta ${i + 1}`}
          renderItem={(m, _i, patch) => (
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                value={m.label}
                onChange={(e) => patch({ label: e.target.value })}
                placeholder="Thời lượng"
              />
              <input
                className={inputClass}
                value={m.value}
                onChange={(e) => patch({ value: e.target.value })}
                placeholder="3.5 ngày"
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}
