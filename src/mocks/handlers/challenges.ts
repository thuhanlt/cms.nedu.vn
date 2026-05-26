import { http } from 'msw'
import { ok, notFound, okRaw } from '../config'
import { challenges, blankContent } from '../data/challenges'
import { nowIso, newId, slugify } from '../data/_helpers'
import type { Challenge } from '@modules/challenges/types/challenge'

export const challengesHandlers = [
  http.get('*/api/challenges', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const q = url.searchParams.get('q')?.toLowerCase()
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    let list = [...challenges]
    if (status && status !== 'all') list = list.filter((c) => c.status === status)
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))

    const total = list.length
    const start = (page - 1) * limit
    const slice = list.slice(start, start + limit)
    return okRaw({ data: slice, meta: { page, limit, total } })
  }),

  http.get('*/api/challenges/:id', ({ params }) => {
    const c = challenges.find((x) => x.id === params.id)
    if (!c) return notFound('Không tìm thấy thử thách')
    return ok(c as unknown as Record<string, unknown>)
  }),

  http.post('*/api/challenges', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<Challenge>
    const newCh: Challenge = {
      id: newId('ch'),
      slug: body.name ? slugify(body.name) : 'thu-thach-moi',
      name: body.name ?? 'Thử thách mới',
      status: 'upcoming',
      published: false,
      startDate: '',
      priceMonthly: '',
      priceYearly: '',
      content: blankContent(),
      updatedAt: nowIso(),
    }
    challenges.unshift(newCh)
    return ok(newCh as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/challenges/:id', async ({ params, request }) => {
    const idx = challenges.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy thử thách')
    const patch = (await request.json().catch(() => ({}))) as Partial<Challenge>
    const merged: Challenge = {
      ...challenges[idx],
      ...patch,
      content: patch.content ? { ...challenges[idx].content, ...patch.content } : challenges[idx].content,
      slug: patch.name ? slugify(patch.name) : challenges[idx].slug,
      updatedAt: nowIso(),
    }
    challenges[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/challenges/:id', ({ params }) => {
    const idx = challenges.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy thử thách')
    challenges.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),
]
