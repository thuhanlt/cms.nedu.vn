// Mock handlers cho Flows — khớp contract nedu-backend
// src/modules/flows/flows.controller.ts + flows.service.ts:
//   - POST luôn tạo status 'draft' (bật qua PATCH sau khi soạn xong)
//   - PATCH: trạng thái hiệu lực 'enabled' → validate enable THẬT
//     (≥1 step, ≥1 send_email, template tồn tại) — message giống BE
//   - DELETE 409 khi flow đang bật
//   - trigger/steps validate shape (mirror zod flow.types.ts)
// Auth-aware: thiếu token → 401; role != admin → 403.
// (Endpoint GET trigger-catalog nằm ở handlers/email-templates.ts — chung route.)
import { http } from 'msw'
import {
  ok,
  notFound,
  badRequest,
  forbidden,
  unauthorized,
  conflict,
  resolveMockUidFromRequest,
} from '../config'
import { MOCK_USERS } from '../data/users'
import { FLOWS_SEED } from '../data/flows'
import { EMAIL_TRIGGER_CATALOG } from '../data/email-templates'
import { mockTemplateIdExists } from './email-templates'
import type {
  EmailWorkflow,
  WorkflowStatus,
  WorkflowStep,
  WorkflowTrigger,
} from '@modules/flows/types/flow'

const workflows: EmailWorkflow[] = FLOWS_SEED.map((w) => ({
  ...w,
  trigger: { ...w.trigger },
  steps: w.steps.map((s) => ({ ...s })),
}))

function requireAdmin(request: Request): Response | null {
  const uid = resolveMockUidFromRequest(request)
  if (!uid) return unauthorized()
  const user = MOCK_USERS[uid]
  if (!user) return unauthorized('Mock user not found')
  if (user.role !== 'admin') return forbidden('Chỉ Quản trị viên truy cập được Flows')
  return null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NAME_MAX = 128
const MAX_STEPS = 20
const DELAY_MAX_HOURS = 2160
const STATUSES: WorkflowStatus[] = ['draft', 'enabled', 'disabled']

type ParseResult<T> = { ok: true; value: T } | { ok: false; response: Response }

// Mirror BE parseTrigger (zod + catalog check)
function parseTrigger(value: unknown): ParseResult<WorkflowTrigger> {
  const t = value as Partial<WorkflowTrigger> | null
  if (!t || typeof t !== 'object' || t.type !== 'event' || typeof t.event_key !== 'string' || !t.event_key) {
    return {
      ok: false,
      response: badRequest("trigger không hợp lệ: cần shape { type: 'event', event_key }"),
    }
  }
  if (!EMAIL_TRIGGER_CATALOG.some((c) => c.event_key === t.event_key)) {
    return {
      ok: false,
      response: badRequest(`event_key không có trong trigger catalog: ${t.event_key}`),
    }
  }
  return { ok: true, value: { type: 'event', event_key: t.event_key } }
}

// Mirror BE parseSteps (zod discriminated union, max 20)
function parseSteps(value: unknown): ParseResult<WorkflowStep[]> {
  if (!Array.isArray(value)) {
    return { ok: false, response: badRequest('steps không hợp lệ: phải là mảng') }
  }
  if (value.length > MAX_STEPS) {
    return { ok: false, response: badRequest(`steps không hợp lệ: tối đa ${MAX_STEPS} node`) }
  }
  const out: WorkflowStep[] = []
  for (let i = 0; i < value.length; i++) {
    const s = value[i] as Record<string, unknown> | null
    if (s && s.type === 'send_email') {
      if (typeof s.template_id !== 'string' || !UUID_RE.test(s.template_id)) {
        return {
          ok: false,
          response: badRequest(`steps không hợp lệ: [${i}.template_id] phải là uuid`),
        }
      }
      out.push({ type: 'send_email', template_id: s.template_id })
    } else if (s && s.type === 'delay') {
      const hours = s.hours
      if (typeof hours !== 'number' || !Number.isInteger(hours) || hours < 1 || hours > DELAY_MAX_HOURS) {
        return {
          ok: false,
          response: badRequest(`steps không hợp lệ: [${i}.hours] phải là số nguyên 1..${DELAY_MAX_HOURS}`),
        }
      }
      out.push({ type: 'delay', hours })
    } else {
      return {
        ok: false,
        response: badRequest(`steps không hợp lệ: [${i}.type] phải là send_email | delay`),
      }
    }
  }
  return { ok: true, value: out }
}

// Mirror BE assertEnableable — message GIỐNG BE từng chữ
function assertEnableable(steps: WorkflowStep[]): Response | null {
  if (steps.length === 0) {
    return badRequest('Flow rỗng — thêm node trước khi bật')
  }
  const templateIds = [
    ...new Set(
      steps
        .filter((s): s is Extract<WorkflowStep, { type: 'send_email' }> => s.type === 'send_email')
        .map((s) => s.template_id),
    ),
  ]
  if (templateIds.length === 0) {
    return badRequest('Flow chưa có node gửi email — thêm send_email trước khi bật')
  }
  const missing = templateIds.filter((tid) => !mockTemplateIdExists(tid))
  if (missing.length > 0) {
    return badRequest(`Mẫu email không tồn tại: ${missing.join(', ')}`)
  }
  return null
}

export const flowsHandlers = [
  http.get('*/api/cms/flows', ({ request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const list = [...workflows].sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    return ok(list as unknown as Record<string, unknown>[])
  }),

  http.get('*/api/cms/flows/:id', ({ params, request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    // GET trigger-catalog match handler explicit ở handlers/email-templates.ts
    // TRƯỚC (thứ tự trong handlers/index.ts) — ở đây chỉ còn :id thật.
    const wf = workflows.find((w) => w.id === String(params.id))
    if (!wf) return notFound('Flow không tồn tại')
    return ok(wf as unknown as Record<string, unknown>)
  }),

  http.post('*/api/cms/flows', async ({ request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const body = (await request.json().catch(() => ({}))) as {
      name?: unknown
      trigger?: unknown
      steps?: unknown
    }
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return badRequest('name must be longer than or equal to 1 characters')
    }
    if (body.name.length > NAME_MAX) {
      return badRequest(`name must be shorter than or equal to ${NAME_MAX} characters`)
    }
    const trigger = parseTrigger(body.trigger)
    if (!trigger.ok) return trigger.response
    const steps = parseSteps(body.steps ?? [])
    if (!steps.ok) return steps.response

    const ts = new Date().toISOString()
    const row: EmailWorkflow = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      trigger: trigger.value,
      steps: steps.value,
      status: 'draft', // BE: tạo LUÔN ở draft, bật qua PATCH
      created_at: ts,
      updated_at: ts,
    }
    workflows.unshift(row)
    return ok(row as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/cms/flows/:id', async ({ params, request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const idx = workflows.findIndex((w) => w.id === params.id)
    if (idx === -1) return notFound('Flow không tồn tại')
    const current = workflows[idx]

    const body = (await request.json().catch(() => ({}))) as {
      name?: unknown
      trigger?: unknown
      steps?: unknown
      status?: unknown
    }

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return badRequest('name must be longer than or equal to 1 characters')
      }
      if (body.name.length > NAME_MAX) {
        return badRequest(`name must be shorter than or equal to ${NAME_MAX} characters`)
      }
    }

    let trigger = current.trigger
    if (body.trigger !== undefined) {
      const parsed = parseTrigger(body.trigger)
      if (!parsed.ok) return parsed.response
      trigger = parsed.value
    }

    let steps = current.steps
    if (body.steps !== undefined) {
      const parsed = parseSteps(body.steps)
      if (!parsed.ok) return parsed.response
      steps = parsed.value
    }

    let status = current.status
    if (body.status !== undefined) {
      if (typeof body.status !== 'string' || !STATUSES.includes(body.status as WorkflowStatus)) {
        return badRequest(`status phải là ${STATUSES.join(' | ')}`)
      }
      status = body.status as WorkflowStatus
    }

    // Trạng thái hiệu lực sau update là 'enabled' → workflow phải hợp lệ toàn
    // phần (kể cả khi chỉ sửa steps của workflow đang bật) — mirror BE.
    if (status === 'enabled') {
      const invalid = assertEnableable(steps)
      if (invalid) return invalid
    }

    const merged: EmailWorkflow = {
      ...current,
      ...(body.name !== undefined ? { name: (body.name as string).trim() } : {}),
      trigger,
      steps,
      status,
      updated_at: new Date().toISOString(),
    }
    workflows[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/cms/flows/:id', ({ params, request }) => {
    const gate = requireAdmin(request)
    if (gate) return gate
    const idx = workflows.findIndex((w) => w.id === params.id)
    if (idx === -1) return notFound('Flow không tồn tại')
    if (workflows[idx].status === 'enabled') {
      return conflict('Flow đang bật — tắt (disabled) trước khi xoá')
    }
    workflows.splice(idx, 1)
    return ok({ ok: true })
  }),
]
