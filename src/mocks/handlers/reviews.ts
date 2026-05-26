import { http } from 'msw'
import { ok, notFound, okRaw } from '../config'
import { reviews } from '../data/reviews'
import { newId } from '../data/_helpers'
import type { Review } from '@modules/reviews/types/review'

export const reviewsHandlers = [
  http.get('*/api/reviews', () => {
    return okRaw({ data: reviews, meta: { page: 1, limit: reviews.length, total: reviews.length } })
  }),

  http.post('*/api/reviews', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<Review>
    const newR: Review = {
      id: newId('r'),
      student: body.student ?? 'Học viên mới',
      cohort: body.cohort ?? '',
      course: body.course ?? '',
      rating: body.rating ?? 5,
      month: body.month ?? '',
      featured: body.featured ?? false,
      status: body.status ?? 'draft',
    }
    reviews.unshift(newR)
    return ok(newR as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/reviews/:id', async ({ params, request }) => {
    const idx = reviews.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy đánh giá')
    const patch = (await request.json().catch(() => ({}))) as Partial<Review>
    const merged: Review = { ...reviews[idx], ...patch }
    reviews[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/reviews/:id', ({ params }) => {
    const idx = reviews.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy đánh giá')
    reviews.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),
]
