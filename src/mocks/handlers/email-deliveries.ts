// Mock handlers cho trang "Lịch sử gửi" — khớp contract nedu-backend:
//   - GET /cms/notification-settings/deliveries (notification-dispatch config.controller.ts)
//   - GET /cms/flows/runs            (flows.controller.ts)
//   - GET /cms/flows/anchor-catalog  (flows.controller.ts)
// 2 endpoint list trả { data, meta } SẴN (không bọc trong { data }). status sai
// whitelist → 400 THẬT. Auth-aware: thiếu token → 401; role != admin → 403.
//
// LƯU Ý thứ tự: GET runs + anchor-catalog là path cụ thể dưới /cms/flows
// → handler này phải đăng ký TRƯỚC flowsHandlers (GET :id) trong index.
import { http } from 'msw'
import { okRaw, forbidden, unauthorized, badRequest, resolveMockUidFromRequest } from '../config'
import { MOCK_USERS } from '../data/users'
import {
  EMAIL_DELIVERIES_SEED,
  WORKFLOW_RUNS_SEED,
  EMAIL_ANCHOR_CATALOG,
} from '../data/email-deliveries'
import type {
  DeliveryStatus,
  RunStatus,
  EmailDelivery,
  WorkflowRun,
} from '@modules/email-deliveries/types/email-delivery'

const deliveries: EmailDelivery[] = EMAIL_DELIVERIES_SEED.map((d) => ({ ...d }))
const runs: WorkflowRun[] = WORKFLOW_RUNS_SEED.map((r) => ({ ...r }))

const DELIVERY_STATUSES: DeliveryStatus[] = ['pending', 'sent', 'failed', 'skipped']
const RUN_STATUSES: RunStatus[] = ['running', 'completed', 'failed', 'cancelled']

function requireAdmin(request: Request): Response | null {
  const uid = resolveMockUidFromRequest(request)
  if (!uid) return unauthorized()
  const user = MOCK_USERS[uid]
  if (!user) return unauthorized('Mock user not found')
  if (user.role !== 'admin') return forbidden('Chỉ Quản trị viên truy cập được Lịch sử gửi')
  return null
}

function parsePaging(url: URL): { page: number; limit: number } {
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '30', 10) || 30))
  return { page, limit }
}

export const emailDeliveriesHandlers = [
  // Catalog mốc ngày — path cụ thể, đăng ký trước GET /cms/flows/:id.
  http.get('*/api/cms/flows/anchor-catalog', ({ request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    return okRaw({ data: EMAIL_ANCHOR_CATALOG })
  }),

  // Lượt chạy — { data, meta } sẵn. status sai → 400 (whitelist BE).
  http.get('*/api/cms/flows/runs', ({ request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const url = new URL(request.url)
    const subjectRef = url.searchParams.get('subject_ref')?.trim() || undefined
    const workflowId = url.searchParams.get('workflow_id')?.trim() || undefined
    const status = url.searchParams.get('status')?.trim() || undefined
    if (status && !RUN_STATUSES.includes(status as RunStatus)) {
      return badRequest('status phải là running | completed | failed | cancelled')
    }
    const { page, limit } = parsePaging(url)

    let list = [...runs]
    if (subjectRef) list = list.filter((r) => r.subject_ref === subjectRef)
    if (workflowId) list = list.filter((r) => r.workflow_id === workflowId)
    if (status) list = list.filter((r) => r.status === status)
    list.sort((a, b) => b.created_at.localeCompare(a.created_at))

    const total = list.length
    const slice = list.slice((page - 1) * limit, (page - 1) * limit + limit)
    return okRaw({ data: slice, meta: { page, limit, total } })
  }),

  // Email đã gửi (delivery log) — { data, meta } sẵn. status sai → 400.
  http.get('*/api/cms/notification-settings/deliveries', ({ request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const url = new URL(request.url)
    const recipientRef = url.searchParams.get('recipient_ref')?.trim() || undefined
    const eventKey = url.searchParams.get('event_key')?.trim() || undefined
    const status = url.searchParams.get('status')?.trim() || undefined
    if (status && !DELIVERY_STATUSES.includes(status as DeliveryStatus)) {
      return badRequest('status phải là pending | sent | failed | skipped')
    }
    const { page, limit } = parsePaging(url)

    let list = [...deliveries]
    // recipient_ref filter = substring (UI tra "khách báo không nhận mail" gõ
    // một phần email cũng ra) — BE thật exact-match, nới ở mock cho dễ test.
    if (recipientRef) {
      const needle = recipientRef.toLowerCase()
      list = list.filter((d) => d.recipient_ref.toLowerCase().includes(needle))
    }
    if (eventKey) list = list.filter((d) => d.event_key === eventKey)
    if (status) list = list.filter((d) => d.status === status)
    list.sort((a, b) =>
      (b.sent_at ?? b.created_at).localeCompare(a.sent_at ?? a.created_at),
    )

    const total = list.length
    const slice = list.slice((page - 1) * limit, (page - 1) * limit + limit)
    return okRaw({ data: slice, meta: { page, limit, total } })
  }),
]
