import { http } from 'msw'
import { ok, notFound, okRaw, badRequest } from '../config'
import { courses, courseRuns, blankCourseContent, type CourseRow } from '../data/courses'
import { nowIso, newId, slugify } from '../data/_helpers'
import type { CourseRun, CourseRunDraft } from '@modules/courses/types/course'

// ─────────────────────────────────────────────────────────────────────────────
// /cms/courses + /cms/courses/:id/runs — mirror BE CourseCmsResponse contract.
// metadata = CourseEditableContent inline; PATCH deep-merge metadata.
// ─────────────────────────────────────────────────────────────────────────────

interface CoursePatchBody {
  name?: string
  slug?: string
  short_label?: string
  tagline?: string
  description?: string
  cover_image_url?: string
  learning_type?: CourseRow['learning_type']
  delivery?: CourseRow['delivery']
  is_public?: boolean
  metadata?: CourseRow['metadata']
}

export const coursesHandlers = [
  // ── LIST ───────────────────────────────────────────────────────────────────
  http.get('*/api/cms/courses', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const q = url.searchParams.get('q')?.toLowerCase()
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    let list = [...courses]
    if (status && status !== 'all') list = list.filter((c) => c.status === status)
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))

    const total = list.length
    const start = (page - 1) * limit
    const slice = list.slice(start, start + limit)
    return okRaw({ data: slice, meta: { page, limit, total } })
  }),

  // ── DETAIL ─────────────────────────────────────────────────────────────────
  http.get('*/api/cms/courses/:id', ({ params }) => {
    const c = courses.find((x) => x.id === params.id)
    if (!c) return notFound('Không tìm thấy khoá học')
    return ok(c as unknown as Record<string, unknown>)
  }),

  // ── CREATE ─────────────────────────────────────────────────────────────────
  http.post('*/api/cms/courses', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { name?: string; slug?: string }
    const name = body.name ?? 'Khoá học mới'
    const slug = body.slug ? slugify(body.slug) : slugify(name)
    const newC: CourseRow = {
      id: newId('co'),
      code: 'NEW',
      slug,
      name,
      short_label: '',
      tagline: '',
      description: '',
      delivery_mode: 'online',
      learning_format: 'cohort',
      learning_type: 'cohort',
      delivery: 'online',
      segment: 'adult',
      status: 'draft',
      is_public: false,
      display_order: courses.length,
      cover_image_url: '',
      og_image_url: '',
      metadata: { ...blankCourseContent(), hero: { ...blankCourseContent().hero, title: name }, card: { ...blankCourseContent().card, name } },
      created_at: nowIso(),
      updated_at: nowIso(),
      archived_at: null,
    }
    courses.unshift(newC)
    return ok(newC as unknown as Record<string, unknown>, { status: 201 })
  }),

  // ── PATCH ──────────────────────────────────────────────────────────────────
  http.patch('*/api/cms/courses/:id', async ({ params, request }) => {
    const idx = courses.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy khoá học')
    const patch = (await request.json().catch(() => ({}))) as CoursePatchBody
    const cur = courses[idx]
    const merged: CourseRow = {
      ...cur,
      name: patch.name ?? cur.name,
      slug: patch.slug !== undefined ? slugify(patch.slug) : cur.slug,
      short_label: patch.short_label ?? cur.short_label,
      tagline: patch.tagline ?? cur.tagline,
      description: patch.description ?? cur.description,
      cover_image_url: patch.cover_image_url ?? cur.cover_image_url,
      learning_type: patch.learning_type ?? cur.learning_type,
      delivery: patch.delivery ?? cur.delivery,
      is_public: patch.is_public ?? cur.is_public,
      status: patch.is_public === undefined ? cur.status : patch.is_public ? 'published' : 'draft',
      metadata: patch.metadata ? { ...cur.metadata, ...patch.metadata } : cur.metadata,
      updated_at: nowIso(),
    }
    courses[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  // ── DELETE ─────────────────────────────────────────────────────────────────
  http.delete('*/api/cms/courses/:id', ({ params }) => {
    const idx = courses.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy khoá học')
    courses.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),

  // ── RUNS: LIST ─────────────────────────────────────────────────────────────
  http.get('*/api/cms/courses/:courseId/runs', ({ params }) => {
    const list = courseRuns.filter((r) => r.course_id === params.courseId)
    return okRaw({ data: list })
  }),

  // ── RUNS: CREATE ───────────────────────────────────────────────────────────
  http.post('*/api/cms/courses/:courseId/runs', async ({ params, request }) => {
    const courseId = String(params.courseId)
    const course = courses.find((c) => c.id === courseId)
    if (!course) return notFound('Không tìm thấy khoá học')
    const body = (await request.json().catch(() => ({}))) as Partial<CourseRunDraft>
    if (!body.label || !body.label.trim()) return badRequest('Tên đợt khai giảng bắt buộc')

    const existing = courseRuns.filter((r) => r.course_id === courseId)
    const runNo = existing.length + 1
    const run: CourseRun = {
      id: newId('run'),
      course_id: courseId,
      code: `${course.code}-R${runNo}`,
      run_no: runNo,
      label: body.label,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      enrollment_open_at: body.enrollment_open_at ?? null,
      enrollment_close_at: body.enrollment_close_at ?? null,
      delivery_mode: body.delivery_mode ?? 'offline',
      venue: body.venue ?? '',
      capacity: body.capacity ?? null,
      enrolled_count: 0,
      status: body.status ?? 'planned',
      base_price_vnd: body.base_price_vnd ?? 0,
      currency: body.currency ?? 'VND',
      deposit_type: body.deposit_type ?? 'none',
      deposit_value: body.deposit_value ?? 0,
      balance_due_days: body.balance_due_days ?? 0,
      metadata: {},
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    courseRuns.push(run)
    return ok(run as unknown as Record<string, unknown>, { status: 201 })
  }),

  // ── RUNS: PATCH ────────────────────────────────────────────────────────────
  http.patch('*/api/cms/courses/:courseId/runs/:runId', async ({ params, request }) => {
    const idx = courseRuns.findIndex(
      (r) => r.id === params.runId && r.course_id === params.courseId,
    )
    if (idx === -1) return notFound('Không tìm thấy đợt khai giảng')
    const patch = (await request.json().catch(() => ({}))) as Partial<CourseRunDraft>
    const merged: CourseRun = { ...courseRuns[idx], ...patch, updated_at: nowIso() }
    courseRuns[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  // ── RUNS: DELETE (soft → cancelled) ──────────────────────────────────────────
  http.delete('*/api/cms/courses/:courseId/runs/:runId', ({ params }) => {
    const idx = courseRuns.findIndex(
      (r) => r.id === params.runId && r.course_id === params.courseId,
    )
    if (idx === -1) return notFound('Không tìm thấy đợt khai giảng')
    courseRuns[idx] = { ...courseRuns[idx], status: 'cancelled', updated_at: nowIso() }
    return new Response(null, { status: 204 })
  }),
]
