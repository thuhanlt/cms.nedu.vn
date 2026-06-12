// Logic thuần của builder step (UI state ↔ API shape) — tách khỏi component
// canvas để redesign UI không đụng vào conversion/validate.
// GIỮ NGUYÊN từ StepListEditor cũ: fromApiSteps / toApiSteps / new*Step.
import { DELAY_HOURS_MAX, type WorkflowStep } from '../types/flow'

/**
 * Label catalog ("Thanh toán thành công") → mệnh đề sau "Khi" ("thanh toán
 * thành công") để card đọc thành câu hoàn chỉnh kiểu Google Flows.
 * Chỉ hạ chữ cái đầu — label catalog không bắt đầu bằng tên riêng.
 */
export function triggerClause(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1)
}

export type DelayUnit = 'hours' | 'days'

/** Step ở dạng builder (UI state) — send_email cho phép CHƯA chọn template. */
export type BuilderStep =
  | { uid: string; type: 'send_email'; template_id: string }
  | { uid: string; type: 'delay'; amount: string; unit: DelayUnit }

export function newSendEmailStep(): BuilderStep {
  return { uid: crypto.randomUUID(), type: 'send_email', template_id: '' }
}

export function newDelayStep(): BuilderStep {
  return { uid: crypto.randomUUID(), type: 'delay', amount: '1', unit: 'days' }
}

/** API steps (hours) → builder steps: 72h hiện thành "3 ngày" cho thân thiện. */
export function fromApiSteps(steps: WorkflowStep[]): BuilderStep[] {
  return steps.map((s) => {
    if (s.type === 'send_email') {
      return { uid: crypto.randomUUID(), type: 'send_email', template_id: s.template_id }
    }
    return s.hours >= 24 && s.hours % 24 === 0
      ? { uid: crypto.randomUUID(), type: 'delay', amount: String(s.hours / 24), unit: 'days' }
      : { uid: crypto.randomUUID(), type: 'delay', amount: String(s.hours), unit: 'hours' }
  })
}

/** Builder steps → API steps (delay quy về GIỜ). Trả lỗi tiếng Việt theo bước. */
export function toApiSteps(
  steps: BuilderStep[],
): { ok: true; steps: WorkflowStep[] } | { ok: false; error: string } {
  const out: WorkflowStep[] = []
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i]
    const pos = i + 1
    if (s.type === 'send_email') {
      if (!s.template_id) return { ok: false, error: `Node ${pos}: chưa chọn mẫu email` }
      out.push({ type: 'send_email', template_id: s.template_id })
    } else {
      const amount = Number(s.amount)
      if (!Number.isInteger(amount) || amount < 1) {
        return { ok: false, error: `Node ${pos}: thời gian đợi phải là số nguyên ≥ 1` }
      }
      const hours = s.unit === 'days' ? amount * 24 : amount
      if (hours > DELAY_HOURS_MAX) {
        return { ok: false, error: `Node ${pos}: đợi tối đa ${DELAY_HOURS_MAX} giờ (90 ngày)` }
      }
      out.push({ type: 'delay', hours })
    }
  }
  return { ok: true, steps: out }
}

/** Step delay đang hợp lệ? (số nguyên ≥ 1 và không vượt 90 ngày) — dùng cho card canvas. */
export function isDelayStepValid(step: Extract<BuilderStep, { type: 'delay' }>): boolean {
  const amount = Number(step.amount)
  if (!Number.isInteger(amount) || amount < 1) return false
  const hours = step.unit === 'days' ? amount * 24 : amount
  return hours <= DELAY_HOURS_MAX
}
