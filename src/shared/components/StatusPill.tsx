import type { ContentStatus } from '@shared/types'

type ChallengeStatus = 'open' | 'upcoming' | 'closed'

interface StatusPillProps {
  status: ContentStatus | ChallengeStatus
  className?: string
}

const MAP: Record<string, { label: string; bg: string; text: string }> = {
  published: { label: 'Đã đăng', bg: '#DCFCE7', text: '#15803D' },
  draft: { label: 'Nháp', bg: '#F3F4F6', text: '#6B7280' },
  open: { label: 'Đang mở', bg: '#DCFCE7', text: '#15803D' },
  upcoming: { label: 'Sắp mở', bg: '#FEF3C7', text: '#B45309' },
  closed: { label: 'Đã đóng', bg: '#F3F4F6', text: '#6B7280' },
}

export function StatusPill({ status, className = '' }: StatusPillProps) {
  const cfg = MAP[status] ?? { label: status, bg: '#F3F4F6', text: '#6B7280' }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}
