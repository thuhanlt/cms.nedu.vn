import type { DeliveryStatus, RunStatus } from '../types/email-delivery'

// Pill trạng thái delivery — đồng bộ palette WorkflowStatusPill (CMS-2):
// sent xanh / failed đỏ / skipped xám / pending vàng.
const DELIVERY_MAP: Record<DeliveryStatus, { label: string; bg: string; text: string }> = {
  sent: { label: 'Đã gửi', bg: '#DCFCE7', text: '#15803D' },
  failed: { label: 'Thất bại', bg: '#FEE2E2', text: '#B91C1C' },
  skipped: { label: 'Bỏ qua', bg: '#F3F4F6', text: '#6B7280' },
  pending: { label: 'Đang chờ', bg: '#FEF3C7', text: '#B45309' },
}

export function DeliveryStatusPill({ status }: { status: DeliveryStatus }) {
  const cfg = DELIVERY_MAP[status] ?? {
    label: status,
    bg: '#F3F4F6',
    text: '#6B7280',
  }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}

// Pill trạng thái lượt chạy: running xanh-dương / completed xanh / failed đỏ /
// cancelled xám.
const RUN_MAP: Record<RunStatus, { label: string; bg: string; text: string }> = {
  running: { label: 'Đang chạy', bg: '#DBEAFE', text: '#1D4ED8' },
  completed: { label: 'Hoàn tất', bg: '#DCFCE7', text: '#15803D' },
  failed: { label: 'Lỗi', bg: '#FEE2E2', text: '#B91C1C' },
  cancelled: { label: 'Đã huỷ', bg: '#F3F4F6', text: '#6B7280' },
}

export function RunStatusPill({ status }: { status: RunStatus }) {
  const cfg = RUN_MAP[status] ?? { label: status, bg: '#F3F4F6', text: '#6B7280' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}
