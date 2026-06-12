// Helpers trình bày cho 2 bảng Lịch sử gửi — gom 1 chỗ để không lặp trong page.

/** Label tiếng Việt cho kênh gửi. */
export function channelLabel(channel: string): string {
  switch (channel) {
    case 'email':
      return 'Email'
    case 'telegram':
      return 'Telegram'
    case 'in_app':
      return 'Trong ứng dụng'
    default:
      return channel
  }
}

/** Thời gian dd/mm/yyyy HH:MM (giờ địa phương trình duyệt) — '—' khi rỗng. */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Map event_key → label tiếng Việt từ cả trigger-catalog (event) và
 * anchor-catalog (anchor.course_start/anchor.deposit_due). Fallback raw key
 * khi catalog chưa nạp / không có entry — không bao giờ hiện chuỗi rỗng.
 */
export function buildEventLabelMap(
  triggers: { event_key: string; label: string }[],
  anchors: { event_key: string; label: string }[],
): Map<string, string> {
  const m = new Map<string, string>()
  for (const t of triggers) m.set(t.event_key, t.label)
  for (const a of anchors) m.set(a.event_key, a.label)
  return m
}
