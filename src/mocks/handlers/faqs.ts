import { http } from 'msw'
import { ok, notFound, okRaw } from '../config'
import { faqs } from '../data/faqs'
import { newId } from '../data/_helpers'
import type { Faq } from '@modules/faqs/types/faq'

export const faqsHandlers = [
  http.get('*/api/faqs', () => {
    const sorted = [...faqs].sort(
      (a, b) => a.category.localeCompare(b.category) || a.orderIndex - b.orderIndex,
    )
    return okRaw({ data: sorted, meta: { page: 1, limit: sorted.length, total: sorted.length } })
  }),

  http.post('*/api/faqs', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<Faq>
    const newF: Faq = {
      id: newId('f'),
      category: body.category ?? 'Chung',
      question: body.question ?? 'Câu hỏi mới',
      answer: body.answer ?? '',
      status: body.status ?? 'draft',
      orderIndex: body.orderIndex ?? faqs.filter((x) => x.category === body.category).length + 1,
    }
    faqs.push(newF)
    return ok(newF as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/faqs/:id', async ({ params, request }) => {
    const idx = faqs.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy FAQ')
    const patch = (await request.json().catch(() => ({}))) as Partial<Faq>
    const merged: Faq = { ...faqs[idx], ...patch }
    faqs[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/faqs/:id', ({ params }) => {
    const idx = faqs.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy FAQ')
    faqs.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),
]
