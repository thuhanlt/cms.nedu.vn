export type NotificationChannel = 'telegram' | 'email'

// Catalog event (từ BE GET /cms/notification-settings/events).
export interface NotificationEvent {
  key: string // 'payment.paid' | '*' | ...
  label: string
  channels: NotificationChannel[]
}

// Recipient config (BE GET /cms/notification-settings/recipients) — snake_case theo API.
export interface NotificationRecipient {
  id: string
  event_key: string
  channel: NotificationChannel
  address: string
  label: string | null
  enabled: boolean
  created_at: string
  updated_at: string
}
