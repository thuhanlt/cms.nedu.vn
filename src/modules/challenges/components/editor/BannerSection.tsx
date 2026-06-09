import { ImageUpload } from '@shared/components/ImageUpload'
import type { Challenge } from '../../types/challenge'
import { Field, inputClass } from './Field'

interface Props {
  draft: Challenge
  onChange: (patch: Partial<Challenge>) => void
  onContentChange: (patch: Partial<Challenge['content']>) => void
}

export function BannerSection({ draft, onChange, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <Field label="Tên thử thách" required>
        <input
          className={inputClass}
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="VD: Cuộc Sống Của Bạn"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Trạng thái">
          <select
            className={inputClass}
            value={draft.status}
            onChange={(e) => onChange({ status: e.target.value as Challenge['status'] })}
          >
            <option value="open">Đang mở</option>
            <option value="upcoming">Sắp mở</option>
            <option value="closed">Đã đóng</option>
          </select>
        </Field>
        <Field label="Hiển thị">
          <select
            className={inputClass}
            value={draft.published ? 'published' : 'draft'}
            onChange={(e) => onChange({ published: e.target.value === 'published' })}
          >
            <option value="published">Đã đăng (public)</option>
            <option value="draft">Nháp (ẩn)</option>
          </select>
        </Field>
      </div>

      <Field label="Ảnh Banner — Desktop" hint="Tỉ lệ 1440×600. Để trống → giữ gradient mặc định.">
        <ImageUpload
          ratio="banner"
          kind="challenge-banner"
          value={draft.content.heroImg || null}
          onChange={(url) => onContentChange({ heroImg: url ?? '' })}
        />
      </Field>

      <Field label="Ảnh Banner — Mobile" hint="Tỉ lệ 390×500. Để trống → giữ gradient mặc định.">
        <ImageUpload
          ratio="mobile"
          kind="challenge-banner-mobile"
          value={draft.content.heroImgMobile || null}
          onChange={(url) => onContentChange({ heroImgMobile: url ?? '' })}
        />
      </Field>
    </div>
  )
}
