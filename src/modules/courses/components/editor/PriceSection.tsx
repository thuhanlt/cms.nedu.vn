import { Plus, X } from 'lucide-react'
import type { Course, CourseContent, PriceData, PromoData, PromoTab } from '../../types/course'
import { MERCH_PRESETS } from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  draft: Course
  onContentChange: (patch: Partial<CourseContent>) => void
}

const splitMerch = (s: string): string[] => (s ? s.split('||').filter(Boolean) : [])
const joinMerch = (arr: string[]): string => arr.join('||')

export function PriceSection({ draft, onContentChange }: Props) {
  const pricing = draft.content.pricing
  const setPricing = (patch: Partial<PriceData>) =>
    onContentChange({ pricing: { ...pricing, ...patch } })
  const setPromo = (patch: Partial<PromoData>) =>
    onContentChange({ pricing: { ...pricing, promo: { ...pricing.promo, ...patch } } })

  // Auto label = "Học phí · <name>"
  const autoLabel = draft.name ? `Học phí · ${draft.name}` : 'Học phí'
  const labelValue = pricing.labelAuto ? autoLabel : pricing.label

  const merchSelected = new Set(splitMerch(pricing.promo.merchList))
  const toggleMerch = (item: string) => {
    const next = new Set(merchSelected)
    if (next.has(item)) next.delete(item)
    else next.add(item)
    setPromo({ merchList: joinMerch(Array.from(next)) })
  }

  return (
    <div className="space-y-5">
      <SectionNote>Card sidebar phải: học phí → quyền lợi (✓) → lịch khai giảng → ưu đãi (nếu bật).</SectionNote>

      {/* Pricing main */}
      <section className="rounded-lg border border-[#E5E7EB] p-4 space-y-3 bg-white">
        <h4 className="text-sm font-semibold text-[#111827]">Thông tin học phí</h4>

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-[#374151] mb-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={pricing.labelAuto}
              onChange={(e) => setPricing({ labelAuto: e.target.checked })}
              className="accent-[#2D6A8C]"
            />
            Label học phí · TỰ ĐỘNG ("Học phí · {`<tên khoá>`}")
          </label>
          <input
            className={inputClass}
            value={labelValue}
            readOnly={pricing.labelAuto}
            onChange={(e) => setPricing({ label: e.target.value })}
            placeholder="Học phí · Là Chính Mình 5"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Mức giá">
            <input
              className={inputClass}
              value={pricing.price}
              onChange={(e) => setPricing({ price: e.target.value })}
              placeholder="68.690.000đ"
            />
          </Field>
          <Field label="Dòng urgency (đỏ)">
            <input
              className={inputClass}
              value={pricing.urgency}
              onChange={(e) => setPricing({ urgency: e.target.value })}
              placeholder="Còn 30 suất"
            />
          </Field>
        </div>

        <Field label="Ghi chú thêm">
          <input
            className={inputClass}
            value={pricing.note}
            onChange={(e) => setPricing({ note: e.target.value })}
            placeholder="Bao gồm tài liệu + cộng đồng"
          />
        </Field>
      </section>

      {/* Features */}
      <section className="rounded-lg border border-[#E5E7EB] p-4 space-y-2 bg-white">
        <h4 className="text-sm font-semibold text-[#111827] mb-2">Quyền lợi (✓ checkmark)</h4>
        {pricing.features.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputClass}
              value={f}
              onChange={(e) => setPricing({ features: pricing.features.map((v, idx) => (idx === i ? e.target.value : v)) })}
              placeholder="VD: 4 ngày học cùng giảng viên"
            />
            <button
              type="button"
              onClick={() => setPricing({ features: pricing.features.filter((_, idx) => idx !== i) })}
              className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded"
              aria-label="Xoá"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPricing({ features: [...pricing.features, ''] })}
          className="inline-flex items-center gap-1 text-xs text-[#2D6A8C] hover:text-[#1F5374]"
        >
          <Plus size={12} /> Thêm quyền lợi
        </button>
      </section>

      {/* Promo */}
      <section className="rounded-lg border border-[#E5E7EB] p-4 space-y-3 bg-white">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={pricing.promo.enabled}
            onChange={(e) => setPromo({ enabled: e.target.checked })}
            className="w-4 h-4 accent-[#2D6A8C]"
          />
          <div>
            <div className="text-sm font-medium text-[#111827]">Bật ưu đãi Early Bird</div>
            <div className="text-[11px] text-[#6B7280]">Hiển thị banner ưu đãi + (tuỳ chọn) đổi giá hiển thị.</div>
          </div>
        </label>

        {pricing.promo.enabled && (
          <div className="space-y-3 pl-2 border-l-2 border-[#FEF3C7]">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ngày bắt đầu">
                <input
                  type="date"
                  className={inputClass}
                  value={pricing.promo.startDate}
                  onChange={(e) => setPromo({ startDate: e.target.value })}
                />
              </Field>
              <Field label="Ngày kết thúc">
                <input
                  type="date"
                  className={inputClass}
                  value={pricing.promo.endDate}
                  onChange={(e) => setPromo({ endDate: e.target.value })}
                />
              </Field>
            </div>

            {/* Promo type tabs */}
            <div className="flex gap-2 p-1 bg-[#F7F8FA] rounded-md">
              {([
                { key: 'discount', icon: '🎓', title: 'Ưu đãi khoá học', sub: 'Tặng khoá, giảm giá học phí' },
                { key: 'gift', icon: '🎁', title: 'Tặng kèm merchandise', sub: 'Áo, túi tote, sổ tay, sticker…' },
              ] as Array<{ key: PromoTab; icon: string; title: string; sub: string }>).map((t) => {
                const active = pricing.promo.tab === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setPromo({ tab: t.key })}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded text-left transition ${
                      active ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#3D3325]">{t.title}</div>
                      <div className="text-[10px] text-[#9C7A2E] mt-0.5">{t.sub}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            {pricing.promo.tab === 'discount' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Giá gốc (hiện gạch)">
                    <input
                      className={inputClass}
                      value={pricing.promo.priceOriginal}
                      onChange={(e) => setPromo({ priceOriginal: e.target.value })}
                      placeholder="68.690.000đ"
                    />
                  </Field>
                  <Field label="Giá sau ưu đãi">
                    <input
                      className={inputClass}
                      value={pricing.promo.priceFinal}
                      onChange={(e) => setPromo({ priceFinal: e.target.value })}
                      placeholder="59.690.000đ"
                    />
                  </Field>
                </div>
                <Field label="Tên khoá tặng kèm (tuỳ chọn)">
                  <input
                    className={inputClass}
                    value={pricing.promo.bonusCourse}
                    onChange={(e) => setPromo({ bonusCourse: e.target.value })}
                    placeholder="Là Chính Mình + Thương Hiệu Của Bạn"
                  />
                </Field>
                <Field label="Mô tả chi tiết">
                  <textarea
                    className={textareaClass}
                    value={pricing.promo.discountDesc}
                    onChange={(e) => setPromo({ discountDesc: e.target.value })}
                    placeholder="Áp dụng 20 đăng ký đầu tiên..."
                    rows={2}
                  />
                </Field>
              </div>
            )}

            {pricing.promo.tab === 'gift' && (
              <div className="space-y-3">
                <Field label="Tên ưu đãi tặng kèm">
                  <input
                    className={inputClass}
                    value={pricing.promo.giftTitle}
                    onChange={(e) => setPromo({ giftTitle: e.target.value })}
                    placeholder="Gift Pack trị giá 500.000đ"
                  />
                </Field>

                <div>
                  <div className="text-xs font-medium text-[#374151] mb-1.5">Chọn merchandise tặng kèm</div>
                  <div className="flex flex-wrap gap-1.5">
                    {MERCH_PRESETS.map((m) => {
                      const active = merchSelected.has(m)
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleMerch(m)}
                          className={`px-2.5 py-1 rounded-full text-xs transition ${
                            active
                              ? 'bg-[#2D6A8C] text-white'
                              : 'bg-[#F7F8FA] border border-[#E5E7EB] text-[#374151] hover:border-[#2D6A8C]'
                          }`}
                        >
                          {active ? '✓ ' : ''}{m}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Field label="Mô tả thêm">
                  <textarea
                    className={textareaClass}
                    value={pricing.promo.giftDesc}
                    onChange={(e) => setPromo({ giftDesc: e.target.value })}
                    placeholder="Gửi tới địa chỉ học viên sau khi khai giảng..."
                    rows={2}
                  />
                </Field>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
