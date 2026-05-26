import { http } from 'msw'
import { ok, notFound, forbidden, badRequest } from '../config'
import { personas } from '../data/personas'
import { MOCK_USERS, DEFAULT_MOCK_UID } from '../data/users'
import { newId } from '../data/_helpers'
import type { Persona } from '@modules/test-config/types/persona'
import { MAX_PERSONAS, MAX_PROBLEMS_PER_PERSONA } from '@modules/test-config/types/persona'

function requireAdmin(): Response | null {
  const uid = typeof window !== 'undefined' ? localStorage.getItem('mock_uid') ?? DEFAULT_MOCK_UID : DEFAULT_MOCK_UID
  const user = MOCK_USERS[uid]
  if (!user || user.role !== 'admin') return forbidden('Chỉ Quản trị viên truy cập được Test Config')
  return null
}

export const personasHandlers = [
  http.get('*/api/personas', () => {
    const gate = requireAdmin()
    if (gate) return gate
    return ok(personas as unknown as Record<string, unknown>[])
  }),

  http.post('*/api/personas', async ({ request }) => {
    const gate = requireAdmin()
    if (gate) return gate
    if (personas.length >= MAX_PERSONAS) {
      return badRequest(`Đã đạt giới hạn ${MAX_PERSONAS} persona`)
    }
    const body = (await request.json().catch(() => ({}))) as Partial<Persona>
    const newP: Persona = {
      id: newId('p'),
      name: body.name ?? 'Persona mới',
      icon: body.icon ?? '🧩',
      instruction: body.instruction ?? '',
      status: body.status ?? 'draft',
      problems: (body.problems ?? []).slice(0, MAX_PROBLEMS_PER_PERSONA),
    }
    personas.push(newP)
    return ok(newP as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/personas/:id', async ({ params, request }) => {
    const gate = requireAdmin()
    if (gate) return gate
    const idx = personas.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy persona')
    const patch = (await request.json().catch(() => ({}))) as Partial<Persona>
    if (patch.problems && patch.problems.length > MAX_PROBLEMS_PER_PERSONA) {
      return badRequest(`Mỗi persona tối đa ${MAX_PROBLEMS_PER_PERSONA} vấn đề`)
    }
    const merged: Persona = { ...personas[idx], ...patch }
    personas[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/personas/:id', ({ params }) => {
    const gate = requireAdmin()
    if (gate) return gate
    const idx = personas.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy persona')
    personas.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),

  http.post('*/api/personas/publish-all', () => {
    const gate = requireAdmin()
    if (gate) return gate
    let published = 0
    personas.forEach((p) => {
      if (p.status !== 'published') {
        p.status = 'published'
        published += 1
      }
    })
    return ok({ published } as unknown as Record<string, unknown>)
  }),
]
