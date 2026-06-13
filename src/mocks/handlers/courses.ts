import { http } from 'msw'
import { ok, notFound, okRaw } from '../config'
import { courses, blankCourseContent } from '../data/courses'
import { nowIso, newId, slugify } from '../data/_helpers'
import type { Course } from '@modules/courses/types/course'

export const coursesHandlers = [
  http.get('*/api/courses', ({ request }) => {
    const url = new URL(request.url)
    const published = url.searchParams.get('published')
    const q = url.searchParams.get('q')?.toLowerCase()
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    let list = [...courses]
    if (published === 'published') list = list.filter((c) => c.published)
    else if (published === 'draft') list = list.filter((c) => !c.published)
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))

    const total = list.length
    const slice = list.slice((page - 1) * limit, (page - 1) * limit + limit)
    return okRaw({ data: slice, meta: { page, limit, total } })
  }),

  http.get('*/api/courses/:id', ({ params }) => {
    const c = courses.find((x) => x.id === params.id)
    if (!c) return notFound('Không tìm thấy khoá học')
    return ok(c as unknown as Record<string, unknown>)
  }),

  http.post('*/api/courses', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<Course>
    const name = body.name ?? 'Khoá học mới'
    const newC: Course = {
      id: newId('co'),
      slug: slugify(name),
      name,
      published: false,
      content: body.content ?? blankCourseContent(),
      updatedAt: nowIso(),
    }
    courses.unshift(newC)
    return ok(newC as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/courses/:id', async ({ params, request }) => {
    const idx = courses.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy khoá học')
    const patch = (await request.json().catch(() => ({}))) as Partial<Course>
    const merged: Course = {
      ...courses[idx],
      ...patch,
      content: patch.content ? { ...courses[idx].content, ...patch.content } : courses[idx].content,
      slug: patch.name ? slugify(patch.name) : courses[idx].slug,
      updatedAt: nowIso(),
    }
    courses[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/courses/:id', ({ params }) => {
    const idx = courses.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy khoá học')
    courses.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),
]
