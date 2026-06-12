// Nội dung PANEL PHẢI của builder (mirror side panel Google Workspace Flows):
// đổi theo thẻ đang chọn trên canvas — chọn starter / chi tiết starter /
// config Gửi email / config Đợi / Thêm bước / thông báo read-only mốc ngày.
// Logic field GIỮ NGUYÊN từ SendEmailFields/DelayFields cũ — chỉ đổi bố cục.
import { Clock, ExternalLink, Mail, RefreshCw } from 'lucide-react'
import {
  DELAY_HOURS_MAX,
  WORKFLOW_MAX_STEPS,
  type EmailTemplateOption,
  type TriggerCatalogItem,
} from '../types/email-workflow'
import { triggerClause, type BuilderStep, type DelayUnit } from './builder-steps'
import { TriggerPicker } from './TriggerPicker'

const inputClass =
  'px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

// Trigger nào KHÁCH đã tự động nhận 1 email giao dịch (biên nhận / báo cáo) —
// nhắc admin để workflow là email CHĂM SÓC thêm, đừng lặp lại (NLH-NEDU-EMAIL-
// WORKFLOW-001 §9.2). Tạm hardcode ở FE; sẽ chuyển sang catalog BG ở phase
// System Templates (§9.3). Trigger không có trong map = không nhắc.
const SYSTEM_EMAIL_NOTE: Record<string, string> = {
  'payment.paid':
    'Khách đã tự động nhận biên nhận thanh toán. Workflow này là email CHĂM SÓC thêm (cảm ơn, hướng dẫn vào học…) — đừng lặp lại nội dung biên nhận.',
  'hieucon.report.ready':
    'Phụ huynh đã tự động nhận email báo cáo Thiên Mệnh. Workflow này là email CHĂM SÓC thêm — đừng lặp lại nội dung báo cáo.',
}

function PanelHeader({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-4">
      {kicker && <div className="text-[11px] font-medium text-[#6B7280] mb-1">{kicker}</div>}
      <h2 className="text-lg font-semibold text-[#111827] leading-snug">{title}</h2>
      {sub && <p className="text-xs text-[#6B7280] mt-1">{sub}</p>}
    </div>
  )
}

// ── 1. Chọn sự kiện bắt đầu (grid catalog) ──────────────────────────────────

export function PanelChooseStarter(props: {
  catalog: TriggerCatalogItem[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  value: string
  onChange: (eventKey: string) => void
}) {
  return (
    <div>
      <PanelHeader
        title="Chọn sự kiện bắt đầu"
        sub="Sự kiện này sẽ khởi động luồng — hệ thống tự biết gửi cho ai"
      />
      <TriggerPicker {...props} />
      <p className="text-[11px] text-[#9CA3AF] mt-3">
        Không cần nhập danh sách người nhận — hệ thống tự gửi đúng người theo sự kiện.
      </p>
    </div>
  )
}

// ── 2. Chi tiết starter đã chọn ──────────────────────────────────────────────

export function PanelStarterDetail({
  trigger,
  onChangeStarter,
}: {
  trigger: TriggerCatalogItem
  onChangeStarter: () => void
}) {
  return (
    <div>
      <PanelHeader kicker="Bước 1 · Sự kiện bắt đầu" title={`Khi ${triggerClause(trigger.label)}`} />
      <span className="inline-block text-[11px] px-2 py-1 rounded bg-[#E0EFF5] text-[#1F5374]">
        → gửi cho {trigger.audience_label}
      </span>

      {SYSTEM_EMAIL_NOTE[trigger.event_key] && (
        <div className="mt-3 rounded-md border border-[#FCE8C3] bg-[#FFFBEB] px-3 py-2 text-[11px] text-[#7C5E10] leading-relaxed">
          ℹ️ {SYSTEM_EMAIL_NOTE[trigger.event_key]}
        </div>
      )}

      <div className="mt-5">
        <div className="text-xs font-medium text-[#374151] mb-2">
          Biến dùng được trong mẫu email
        </div>
        <ul className="space-y-1.5">
          {trigger.context_vars.map((v) => (
            <li key={v.key} className="flex items-center gap-2 min-w-0">
              <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#F7F8FA] border border-[#E5E7EB] text-[#1F5374] shrink-0">
                {'{{'}{v.key}{'}}'}
              </code>
              <span className="text-[11px] text-[#6B7280] truncate" title={`${v.label} — ví dụ: ${v.sample}`}>
                {v.label} · vd: {v.sample}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onChangeStarter}
        className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D1D5DB] text-xs text-[#374151] hover:bg-[#F7F8FA]"
      >
        <RefreshCw size={12} />
        Đổi sự kiện
      </button>
    </div>
  )
}

// ── 3. Config bước Gửi email (logic giữ nguyên SendEmailFields cũ) ──────────

export function PanelSendEmail({
  stepNumber,
  step,
  templates,
  templatesLoading,
  templatesError,
  onReloadTemplates,
  onPatch,
}: {
  stepNumber: number
  step: Extract<BuilderStep, { type: 'send_email' }>
  templates: EmailTemplateOption[]
  templatesLoading: boolean
  templatesError: boolean
  onReloadTemplates: () => void
  onPatch: (patch: Partial<BuilderStep>) => void
}) {
  const selectId = `step-${step.uid}-template`
  const selected = templates.find((t) => t.id === step.template_id)
  return (
    <div>
      <PanelHeader kicker={`Bước ${stepNumber}`} title="Gửi email" sub="Gửi 1 mẫu email đã soạn" />
      <label htmlFor={selectId} className="block text-xs font-medium text-[#374151] mb-1.5">
        Mẫu email <span className="text-[#DC2626]">*</span>
      </label>
      {templatesError ? (
        <div className="flex items-center gap-2 text-xs text-[#DC2626]">
          Không tải được danh sách mẫu.
          <button type="button" onClick={onReloadTemplates} className="underline hover:text-[#B91C1C]">
            Thử lại
          </button>
        </div>
      ) : (
        <select
          id={selectId}
          className={`${inputClass} w-full ${!step.template_id ? 'text-[#9CA3AF]' : ''}`}
          value={step.template_id}
          onChange={(e) => onPatch({ template_id: e.target.value })}
          disabled={templatesLoading}
        >
          <option value="">{templatesLoading ? 'Đang tải mẫu...' : '— Chọn mẫu email —'}</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      )}
      {selected && (
        <p className="text-[11px] text-[#6B7280] mt-1 truncate" title={selected.subject}>
          Tiêu đề email: {selected.subject}
        </p>
      )}
      <div className="flex items-center gap-3 mt-2">
        <a
          href="/dashboard/email-templates/new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[#1F5374] hover:underline"
        >
          <ExternalLink size={11} /> Soạn mẫu mới
        </a>
        <button
          type="button"
          onClick={onReloadTemplates}
          title="Tải lại danh sách mẫu (sau khi soạn mẫu mới ở tab khác)"
          className="inline-flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-[#1F5374]"
        >
          <RefreshCw size={11} /> Tải lại danh sách
        </button>
      </div>
    </div>
  )
}

// ── 4. Config bước Đợi (logic giữ nguyên DelayFields cũ) ────────────────────

export function PanelDelay({
  stepNumber,
  step,
  onPatch,
}: {
  stepNumber: number
  step: Extract<BuilderStep, { type: 'delay' }>
  onPatch: (patch: Partial<BuilderStep>) => void
}) {
  const amountId = `step-${step.uid}-amount`
  const unitId = `step-${step.uid}-unit`
  const amount = Number(step.amount)
  const valid = Number.isInteger(amount) && amount >= 1
  const hours = step.unit === 'days' ? amount * 24 : amount
  const tooLong = valid && hours > DELAY_HOURS_MAX
  return (
    <div>
      <PanelHeader
        kicker={`Bước ${stepNumber}`}
        title="Đợi"
        sub="Chờ một khoảng thời gian trước khi làm bước tiếp theo"
      />
      <div className="flex items-end gap-2">
        <div>
          <label htmlFor={amountId} className="block text-xs font-medium text-[#374151] mb-1.5">
            Đợi trong
          </label>
          <input
            id={amountId}
            type="number"
            min={1}
            step={1}
            className={`${inputClass} w-24 ${!valid || tooLong ? 'border-[#DC2626]' : ''}`}
            value={step.amount}
            onChange={(e) => onPatch({ amount: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor={unitId} className="sr-only">
            Đơn vị thời gian
          </label>
          <select
            id={unitId}
            className={inputClass}
            value={step.unit}
            onChange={(e) => onPatch({ unit: e.target.value as DelayUnit })}
          >
            <option value="hours">Giờ</option>
            <option value="days">Ngày</option>
          </select>
        </div>
      </div>
      {!valid ? (
        <p className="text-[11px] text-[#DC2626] mt-1.5">Nhập số nguyên ≥ 1</p>
      ) : tooLong ? (
        <p className="text-[11px] text-[#DC2626] mt-1.5">
          Tối đa {DELAY_HOURS_MAX} giờ (90 ngày) — hiện {hours} giờ
        </p>
      ) : (
        <p className="text-[11px] text-[#6B7280] mt-1.5">
          Đợi {amount} {step.unit === 'days' ? 'ngày' : 'giờ'}
          {step.unit === 'days' && ` (= ${hours} giờ)`} rồi mới chạy bước kế tiếp
        </p>
      )}
    </div>
  )
}

// ── 5. Thêm bước (mirror panel "Add step") ──────────────────────────────────

export function PanelAddStep({
  full,
  onPick,
}: {
  full: boolean
  onPick: (type: 'send_email' | 'delay') => void
}) {
  return (
    <div>
      <PanelHeader title="Thêm bước" sub="Bước mới được thêm vào cuối luồng" />
      {full && (
        <p className="text-xs text-[#B45309] mb-3">
          Đã đạt tối đa {WORKFLOW_MAX_STEPS} bước — xoá bớt để thêm bước mới.
        </p>
      )}
      <div className="space-y-3">
        <button
          type="button"
          disabled={full}
          onClick={() => onPick('send_email')}
          className="w-full flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-[#A8C7FA] hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="w-9 h-9 rounded-lg bg-[#E0EFF5] text-[#1F5374] flex items-center justify-center shrink-0">
            <Mail size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[#111827]">Gửi email</span>
            <span className="block text-xs text-[#6B7280] mt-0.5">Gửi 1 mẫu email đã soạn</span>
          </span>
        </button>
        <button
          type="button"
          disabled={full}
          onClick={() => onPick('delay')}
          className="w-full flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-[#A8C7FA] hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <Clock size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[#111827]">Đợi</span>
            <span className="block text-xs text-[#6B7280] mt-0.5">
              Chờ một khoảng thời gian trước khi làm bước tiếp theo
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

// ── 6. Read-only luồng theo mốc ngày (giữ nội dung guard cũ) ────────────────

export function PanelReadOnlyAnchor({
  offsetLabel,
  anchorLabel,
  stepCount,
}: {
  offsetLabel: string
  anchorLabel: string
  stepCount: number
}) {
  return (
    <div>
      <PanelHeader kicker="Luồng theo mốc ngày" title="Chỉ xem — chưa sửa được" />
      <div className="rounded-lg border border-[#FCE8C3] bg-[#FFFBEB] px-4 py-3 text-[13px] text-[#7C5E10] leading-relaxed">
        ⏱ Luồng này chạy theo <b>mốc ngày</b>: gửi {offsetLabel} so với <b>{anchorLabel}</b> (
        {stepCount} bước). Trình soạn chưa hỗ trợ sửa loại luồng này — bản cập nhật sau sẽ mở. Cần
        thay đổi gấp, liên hệ kỹ thuật.
      </div>
    </div>
  )
}
