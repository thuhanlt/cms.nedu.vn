import type { ArticleSeo } from '../types/article'

interface Props {
  value: ArticleSeo
  onChange: (patch: Partial<ArticleSeo>) => void
}

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = (value ?? '').length
  const ok = len >= min && len <= max
  const over = len > max
  const color = over ? '#DC2626' : ok ? '#15803D' : '#9CA3AF'
  return (
    <span className="text-[11px] tabular-nums" style={{ color }}>
      {len} ký tự · gợi ý {min}–{max}
    </span>
  )
}

export function SeoFields({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#6B7280]">
        SEO không bắt buộc — nhưng giúp Google + Facebook hiển thị đúng tiêu đề và ảnh khi chia sẻ.
      </p>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-[#374151]">Tiêu đề Google</label>
          <CharCounter value={value.seoTitle ?? ''} min={50} max={60} />
        </div>
        <input
          className={inputClass}
          value={value.seoTitle ?? ''}
          onChange={(e) => onChange({ seoTitle: e.target.value })}
          placeholder="Tiêu đề hiển thị trên kết quả Google"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-[#374151]">Mô tả Google</label>
          <CharCounter value={value.seoDesc ?? ''} min={120} max={160} />
        </div>
        <textarea
          className={`${inputClass} resize-y min-h-[64px]`}
          value={value.seoDesc ?? ''}
          onChange={(e) => onChange({ seoDesc: e.target.value })}
          placeholder="Đoạn mô tả ngắn hiển thị dưới tiêu đề trên Google"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1.5">Tiêu đề chia sẻ MXH (Open Graph)</label>
        <input
          className={inputClass}
          value={value.ogTitle ?? ''}
          onChange={(e) => onChange({ ogTitle: e.target.value })}
          placeholder="Để trống → dùng tiêu đề Google"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1.5">Mô tả chia sẻ MXH</label>
        <textarea
          className={`${inputClass} resize-y min-h-[64px]`}
          value={value.ogDesc ?? ''}
          onChange={(e) => onChange({ ogDesc: e.target.value })}
          placeholder="Để trống → dùng mô tả Google"
        />
      </div>
    </div>
  )
}
