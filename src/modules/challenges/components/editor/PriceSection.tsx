import { Plus, X } from 'lucide-react'
import type { ChallengeContent, Plan } from '../../types/challenge'
import type { Challenge } from '../../types/challenge'
import { Field, inputClass, textareaClass } from './Field'

interface Props {
  draft: Challenge
  onChange: (patch: Partial<Challenge>) => void
  onContentChange: (patch: Partial<ChallengeContent>) => void
}

export function PriceSection({ draft, onChange, onContentChange }: Props) {
  const monthly = draft.content.plans.monthly
  const yearly = draft.content.plans.yearly

  const updateMonthly = (patch: Partial<Plan>) =>
    onContentChange({ plans: { ...draft.content.plans, monthly: { ...monthly, ...patch } } })
  const updateYearly = (patch: Partial<Plan>) =>
    onContentChange({ plans: { ...draft.content.plans, yearly: { ...yearly, ...patch } } })

  return (
    <div className="space-y-6">
      <p className="text-xs text-[#6B7280]">Để trống ô giá → ẩn khỏi bảng giá. Quyền lợi trống tự loại khi lưu.</p>

      {/* Gói tháng */}
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4 space-y-3">
        <h4 className="font-semibold text-[#111827] text-sm">Gói tháng</h4>
        <Field label="Giá / tháng">
          <input
            className={inputClass}
            value={monthly.price}
            onChange={(e) => {
              updateMonthly({ price: e.target.value })
              onChange({ priceMonthly: e.target.value })
            }}
            placeholder="VD: 299.000đ"
          />
        </Field>
        <Field label="Quyền lợi">
          <BenefitsList items={monthly.benefits} onChange={(benefits) => updateMonthly({ benefits })} />
        </Field>
      </div>

      {/* Gói năm */}
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4 space-y-3">
        <h4 className="font-semibold text-[#111827] text-sm">Gói năm</h4>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Giá / năm">
            <input
              className={inputClass}
              value={yearly.price}
              onChange={(e) => {
                updateYearly({ price: e.target.value })
                onChange({ priceYearly: e.target.value })
              }}
              placeholder="VD: 2.490.000đ"
            />
          </Field>
          <Field label="Tiết kiệm">
            <input
              className={inputClass}
              value={yearly.saving ?? ''}
              onChange={(e) => updateYearly({ saving: e.target.value })}
              placeholder="VD: Tiết kiệm 1.098.000đ"
            />
          </Field>
        </div>
        <Field label="Ghi chú">
          <textarea
            className={textareaClass}
            value={yearly.note ?? ''}
            onChange={(e) => updateYearly({ note: e.target.value })}
            placeholder="VD: Trả 1 lần · dùng cả năm"
          />
        </Field>
        <Field label="Quyền lợi">
          <BenefitsList items={yearly.benefits} onChange={(benefits) => updateYearly({ benefits })} />
        </Field>
      </div>
    </div>
  )
}

function BenefitsList({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={inputClass}
            value={it}
            onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))}
            placeholder="Quyền lợi"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded"
            aria-label="Xoá"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="inline-flex items-center gap-1 text-xs text-[#2D6A8C] hover:text-[#1F5374]"
      >
        <Plus size={12} />
        Thêm quyền lợi
      </button>
    </div>
  )
}
