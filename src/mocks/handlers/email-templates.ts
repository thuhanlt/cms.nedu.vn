// Mock handlers cho Mẫu email + trigger-catalog — khớp contract nedu-backend
// src/modules/email-workflow/ (templates.controller.ts + workflows.controller.ts):
//   - list = projection nhẹ KHÔNG body_html, filter ?q= theo tên
//   - DELETE 409 khi template còn được workflow tham chiếu
//   - test-send: render với sample context (missing_vars tính THẬT), 5 lần/phút
// Auth-aware: thiếu token → 401; role != admin → 403 (TrustMatrix admin+cms_admin).
import { http } from 'msw'
import {
  ok,
  notFound,
  badRequest,
  forbidden,
  unauthorized,
  conflict,
  tooManyRequests,
  resolveMockUidFromRequest,
} from '../config'
import { MOCK_USERS } from '../data/users'
import {
  EMAIL_TEMPLATES_SEED,
  EMAIL_TRIGGER_CATALOG,
  TEMPLATE_WORKFLOW_USAGE,
} from '../data/email-templates'
import {
  buildSampleContext,
  renderEmailTemplate,
  extractTemplateVars,
} from '@modules/email-templates/template-render'
import type { EmailTemplate } from '@modules/email-templates/types/email-template'

let templates: EmailTemplate[] = EMAIL_TEMPLATES_SEED.map((t) => ({ ...t }))

/** Cho handlers/flows.ts check "Mẫu email không tồn tại" trên store SỐNG
 *  (template tạo trong phiên dùng được ngay trong flow — như BE). */
export function mockTemplateIdExists(id: string): boolean {
  return templates.some((t) => t.id === id)
}

function requireAdmin(request: Request): Response | null {
  const uid = resolveMockUidFromRequest(request)
  if (!uid) return unauthorized()
  const user = MOCK_USERS[uid]
  if (!user) return unauthorized('Mock user not found')
  if (user.role !== 'admin') return forbidden('Chỉ Quản trị viên truy cập được Mẫu email')
  return null
}

// Throttle test-send 5 lần/phút — giả lập ThrottlerGuard BE
let testSendTimes: number[] = []

const SUBJECT_MAX = 300

export const emailTemplatesHandlers = [
  http.get('*/api/cms/flows/trigger-catalog', ({ request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    return ok(EMAIL_TRIGGER_CATALOG as unknown as Record<string, unknown>[])
  }),

  http.get('*/api/cms/email-templates', ({ request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase()
    const list = templates
      .filter((t) => (q ? t.name.toLowerCase().includes(q) : true))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      // List = projection nhẹ, KHÔNG body_html/variables (match BE)
      .map(({ id, name, subject, updated_at }) => ({ id, name, subject, updated_at }))
    return ok(list)
  }),

  http.get('*/api/cms/email-templates/:id', ({ params, request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const t = templates.find((x) => x.id === params.id)
    if (!t) return notFound('Mẫu email không tồn tại')
    return ok(t as unknown as Record<string, unknown>)
  }),

  http.post('*/api/cms/email-templates', async ({ request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const body = (await request.json().catch(() => ({}))) as Partial<EmailTemplate>
    const errors: string[] = []
    if (!body.name?.trim()) errors.push('name should not be empty')
    if (!body.subject?.trim()) errors.push('subject should not be empty')
    if ((body.subject ?? '').length > SUBJECT_MAX) {
      errors.push(`subject must be shorter than or equal to ${SUBJECT_MAX} characters`)
    }
    if (!body.body_html?.trim()) errors.push('body_html should not be empty')
    if (errors.length) return badRequest(errors)

    const ts = new Date().toISOString()
    const row: EmailTemplate = {
      id: crypto.randomUUID(),
      name: body.name!.trim(),
      subject: body.subject!,
      body_html: body.body_html!,
      variables: extractTemplateVars({ subject: body.subject!, body_html: body.body_html! }),
      created_at: ts,
      updated_at: ts,
    }
    templates.unshift(row)
    return ok(row as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/cms/email-templates/:id', async ({ params, request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const idx = templates.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Mẫu email không tồn tại')
    const patch = (await request.json().catch(() => ({}))) as Partial<EmailTemplate>
    if (patch.subject !== undefined && patch.subject.length > SUBJECT_MAX) {
      return badRequest(`subject must be shorter than or equal to ${SUBJECT_MAX} characters`)
    }
    const merged: EmailTemplate = {
      ...templates[idx],
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(patch.subject !== undefined ? { subject: patch.subject } : {}),
      ...(patch.body_html !== undefined ? { body_html: patch.body_html } : {}),
      updated_at: new Date().toISOString(),
    }
    merged.variables = extractTemplateVars({ subject: merged.subject, body_html: merged.body_html })
    templates[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/cms/email-templates/:id', ({ params, request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const id = String(params.id)
    const usedBy = TEMPLATE_WORKFLOW_USAGE[id]
    if (usedBy?.length) {
      return conflict(
        `Mẫu đang được dùng bởi workflow: ${usedBy.join(', ')} — gỡ khỏi workflow trước khi xoá`,
      )
    }
    const idx = templates.findIndex((x) => x.id === id)
    if (idx === -1) return notFound('Mẫu email không tồn tại')
    templates.splice(idx, 1)
    return ok({ ok: true })
  }),

  http.post('*/api/cms/email-templates/:id/test-send', async ({ params, request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate

    const now = Date.now()
    testSendTimes = testSendTimes.filter((t) => now - t < 60_000)
    if (testSendTimes.length >= 5) return tooManyRequests()

    const t = templates.find((x) => x.id === params.id)
    if (!t) return notFound('Mẫu email không tồn tại')

    const body = (await request.json().catch(() => ({}))) as { to?: string; event_key?: string }
    const to = (body.to ?? '').trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return badRequest('email người nhận không hợp lệ')
    }
    if (body.event_key && !EMAIL_TRIGGER_CATALOG.some((c) => c.event_key === body.event_key)) {
      return badRequest(`event_key không có trong trigger catalog: ${body.event_key}`)
    }

    testSendTimes.push(now)
    // missing_vars tính THẬT bằng đúng render engine (port từ BE)
    const rendered = renderEmailTemplate(
      { subject: t.subject, body_html: t.body_html },
      buildSampleContext(EMAIL_TRIGGER_CATALOG, body.event_key),
    )
    return ok({
      message_id: `mock-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      missing_vars: rendered.missing_vars,
    })
  }),
]
