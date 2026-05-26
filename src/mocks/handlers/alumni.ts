import { http } from 'msw'
import { ok, notFound, okRaw } from '../config'
import { alumni } from '../data/alumni'
import { nowIso, newId } from '../data/_helpers'
import type { Alumni } from '@modules/alumni/types/alumni'

export const alumniHandlers = [
  http.get('*/api/alumni', () => {
    return okRaw({ data: alumni, meta: { page: 1, limit: alumni.length, total: alumni.length } })
  }),

  http.post('*/api/alumni', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<Alumni>
    const newA: Alumni = {
      id: newId('al'),
      title: body.title ?? 'Mục alumni mới',
      quote: body.quote ?? '',
      type: body.type ?? 'spotlight',
      status: body.status ?? 'draft',
      updatedAt: nowIso(),
    }
    alumni.unshift(newA)
    return ok(newA as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/alumni/:id', async ({ params, request }) => {
    const idx = alumni.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy mục alumni')
    const patch = (await request.json().catch(() => ({}))) as Partial<Alumni>
    const merged: Alumni = { ...alumni[idx], ...patch, updatedAt: nowIso() }
    alumni[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/alumni/:id', ({ params }) => {
    const idx = alumni.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy mục alumni')
    alumni.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),
]
