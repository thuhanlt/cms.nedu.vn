import type {
  NotificationEvent,
  NotificationRecipient,
} from '@modules/notifications/types/notification'

const now = '2026-05-29T10:00:00.000Z'

export const NOTIFICATION_EVENTS: NotificationEvent[] = [
  { key: '*', label: 'Tất cả thông báo (mọi event)', channels: ['telegram', 'email'] },
  { key: 'payment.paid', label: 'Đơn mới — thanh toán thành công', channels: ['telegram', 'email'] },
  { key: 'payment.failed', label: 'Thanh toán thất bại / lỗi', channels: ['telegram', 'email'] },
  { key: 'lead.created', label: 'Lead mới', channels: ['telegram', 'email'] },
  { key: 'hieucon.report.ready', label: 'Báo cáo Thiên Mệnh sẵn sàng', channels: ['telegram', 'email'] },
]

export const NOTIFICATION_RECIPIENTS_SEED: NotificationRecipient[] = [
  { id: 'r1', event_key: '*', channel: 'telegram', address: '1080713491', label: 'Sơn (founder)', enabled: true, created_at: now, updated_at: now },
  { id: 'r2', event_key: 'lead.created', channel: 'telegram', address: '-1001234567890', label: 'Group ops', enabled: true, created_at: now, updated_at: now },
  { id: 'r3', event_key: 'payment.failed', channel: 'email', address: 'founder@nedu.vn', label: 'Admin email', enabled: false, created_at: now, updated_at: now },
]
