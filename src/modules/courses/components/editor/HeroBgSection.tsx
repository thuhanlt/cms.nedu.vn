import { ImageUpload } from '@shared/components/ImageUpload'
import type { Course, CourseContent } from '../../types/course'
import { Field, inputClass, SectionNote } from './Field'

interface Props {
  draft: Course
  onContentChange: (patch: Partial<CourseContent>) => void
}

function badgeAutoValue1(type: CourseContent['type'], name: string): string {
  const typeLabel: Record<string, string> = { retreat: 'RETREAT', online: 'ONLINE', offline: 'OFFLINE', hybrid: 'HYBRID' }
  const t = typeLabel[type] ?? type.toUpperCase()
  return name ? `${t} · ${name.toUpperCase()}` : t
}

function badgeAutoValue2(name: string): string {
  const m = name.match(/(\d+)\s*$/)
  return m ? `KHOÁ ${m[1]}` : ''
}

export function HeroBgSection({ draft, onContentChange }: Props) {
  const c = draft.content
  const { badges } = c

  const setBadges = (patch: Partial<CourseContent['badges']>) =>
    onContentChange({ badges: { ...badges, ...patch } })

  const b1Display = badges.b1.auto ? badgeAutoValue1(c.type, draft.name) : badges.b1.value
  const b2Display = badges.b2.auto ? badgeAutoValue2(draft.name) : badges.b2.value

  return (
    <div className="space-y-4">
      <SectionNote>Ảnh nền cho hero. Nên dùng ảnh tối, có không gian để text trắng hiển thị rõ.</SectionNote>

      <Field label="Ảnh bìa Desktop" hint="Tỉ lệ ~16:9. Khuyến nghị 1920×1080.">
        <ImageUpload
          ratio="banner"
          kind="challenge-banner"
          value={c.heroDesktop || null}
          onChange={(url) => onContentChange({ heroDesktop: url ?? '' })}
        />
      </Field>

      <Field label="Ảnh bìa Mobile" hint="Tỉ lệ dọc 2:3. Khuyến nghị 1080×1620. Để trống → dùng ảnh Desktop.">
        <ImageUpload
          ratio="mobile"
          kind="challenge-banner-mobile"
          value={c.heroMobile || null}
          onChange={(url) => onContentChange({ heroMobile: url ?? '' })}
        />
      </Field>

      <div className="bg-[#FEF3C7]/30 border border-[#FEF3C7] rounded-lg p-3 space-y-3">
        <div className="text-xs font-semibold text-[#92400E]">Badges trên ảnh bìa</div>

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-[#374151] mb-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={badges.b1.auto}
              onChange={(e) => setBadges({ b1: { ...badges.b1, auto: e.target.checked } })}
              className="accent-[#2D6A8C]"
            />
            Badge 1 · TỰ ĐỘNG (kết hợp Loại + Tên)
          </label>
          <input
            className={inputClass}
            value={b1Display}
            readOnly={badges.b1.auto}
            onChange={(e) => setBadges({ b1: { ...badges.b1, value: e.target.value } })}
            placeholder="RETREAT · LÀ CHÍNH MÌNH 5"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-[#374151] mb-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={badges.b2.auto}
              onChange={(e) => setBadges({ b2: { ...badges.b2, auto: e.target.checked } })}
              className="accent-[#2D6A8C]"
            />
            Badge 2 · TỰ ĐỘNG (số khoá từ tên)
          </label>
          <input
            className={inputClass}
            value={b2Display}
            readOnly={badges.b2.auto}
            onChange={(e) => setBadges({ b2: { ...badges.b2, value: e.target.value } })}
            placeholder="KHOÁ 5"
          />
        </div>

        <Field label="Badge 3 (tuỳ chọn)">
          <input
            className={inputClass}
            value={badges.b3}
            onChange={(e) => setBadges({ b3: e.target.value })}
            placeholder="VD: SUẤT CUỐI · 30 NGƯỜI"
          />
        </Field>
      </div>
    </div>
  )
}

export { badgeAutoValue1, badgeAutoValue2 }
