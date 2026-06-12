import type { WorkflowStatus } from '../types/email-workflow'

// Pill trạng thái workflow: Nháp xám / Đang bật xanh / Đã tắt vàng.
// Local cho module — shared StatusPill chỉ map content status (published/draft/...).
const MAP: Record<WorkflowStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Nháp', bg: '#F3F4F6', text: '#6B7280' },
  enabled: { label: 'Đang bật', bg: '#DCFCE7', text: '#15803D' },
  disabled: { label: 'Đã tắt', bg: '#FEF3C7', text: '#B45309' },
}

export function WorkflowStatusPill({ status, className = '' }: { status: WorkflowStatus; className?: string }) {
  const cfg = MAP[status]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}
