import { http } from 'msw'
import { ok, notFound, okRaw } from '../config'
import { lessons } from '../data/lessons'
import { newId } from '../data/_helpers'
import type { Lesson } from '@modules/lessons/types/lesson'

export const lessonsHandlers = [
  http.get('*/api/lessons', ({ request }) => {
    const url = new URL(request.url)
    const course = url.searchParams.get('course')
    let list = [...lessons]
    if (course && course !== 'all') list = list.filter((l) => l.course === course)
    list.sort((a, b) => a.course.localeCompare(b.course) || a.orderIndex - b.orderIndex)
    return okRaw({ data: list, meta: { page: 1, limit: list.length, total: list.length } })
  }),

  http.post('*/api/lessons', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<Lesson>
    const newL: Lesson = {
      id: newId('l'),
      course: body.course ?? 'Khoá học',
      title: body.title ?? 'Bài học mới',
      cohort: body.cohort ?? '',
      videoUrl: body.videoUrl ?? '',
      status: body.status ?? 'draft',
      orderIndex: body.orderIndex ?? lessons.filter((x) => x.course === body.course).length + 1,
    }
    lessons.push(newL)
    return ok(newL as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/lessons/:id', async ({ params, request }) => {
    const idx = lessons.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy bài học')
    const patch = (await request.json().catch(() => ({}))) as Partial<Lesson>
    const merged: Lesson = { ...lessons[idx], ...patch }
    lessons[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/lessons/:id', ({ params }) => {
    const idx = lessons.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy bài học')
    lessons.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),
]
