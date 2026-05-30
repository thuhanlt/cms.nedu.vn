import { http } from 'msw'
import { ok, notFound } from '../config'
import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_RECIPIENTS_SEED,
} from '../data/notifications'
import type {
  NotificationChannel,
  NotificationRecipient,
} from '@modules/notifications/types/notification'

let recipients: NotificationRecipient[] = [...NOTIFICATION_RECIPIENTS_SEED]
let seq = 100

export const notificationHandlers = [
  http.get('*/api/cms/notification-settings/events', () => ok(NOTIFICATION_EVENTS)),

  http.get('*/api/cms/notification-settings/recipients', ({ request }) => {
    const ev = new URL(request.url).searchParams.get('event_key')
    return ok(ev ? recipients.filter((r) => r.event_key === ev) : recipients)
  }),

  http.post('*/api/cms/notification-settings/recipients', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<NotificationRecipient>
    const ts = new Date().toISOString()
    const address = (body.address ?? '').trim()
    const existing = recipients.find(
      (r) =>
        r.event_key === body.event_key &&
        r.channel === body.channel &&
        r.address === address,
    )
    if (existing) {
      existing.enabled = true
      existing.label = body.label ?? existing.label
      existing.updated_at = ts
      return ok(existing)
    }
    const row: NotificationRecipient = {
      id: `r${seq++}`,
      event_key: body.event_key ?? '*',
      channel: (body.channel as NotificationChannel) ?? 'telegram',
      address,
      label: body.label ?? null,
      enabled: true,
      created_at: ts,
      updated_at: ts,
    }
    recipients.unshift(row)
    return ok(row, { status: 201 })
  }),

  http.patch('*/api/cms/notification-settings/recipients/:id', async ({ params, request }) => {
    const r = recipients.find((x) => x.id === params.id)
    if (!r) return notFound('Recipient không tồn tại')
    const patch = (await request.json().catch(() => ({}))) as {
      label?: string
      enabled?: boolean
    }
    if (patch.label !== undefined) r.label = patch.label
    if (patch.enabled !== undefined) r.enabled = patch.enabled
    r.updated_at = new Date().toISOString()
    return ok(r)
  }),

  // 404 khi id không tồn tại — match BE (DELETE trả 404, fix review A-#4).
  http.delete('*/api/cms/notification-settings/recipients/:id', ({ params }) => {
    const exists = recipients.some((x) => x.id === params.id)
    if (!exists) return notFound('Recipient không tồn tại')
    recipients = recipients.filter((x) => x.id !== params.id)
    return ok({ ok: true })
  }),
]
