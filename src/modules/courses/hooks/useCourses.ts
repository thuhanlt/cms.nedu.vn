import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Paginated } from '@shared/types'
import {
  emptyCourseContent,
  type Course,
  type CourseEditableContent,
  type CourseLearningType,
  type CourseDelivery,
  type CourseStatus,
} from '../types/course'

// ─────────────────────────────────────────────────────────────────────────────
// BE contract: /cms/courses. Response snake_case (CourseCmsResponse). FE giữ
// shape Course (flat, content) → adapter bridge BE.metadata ↔ Course.content.
// MSW intercept ở dev (mocks/handlers/courses.ts).
// ─────────────────────────────────────────────────────────────────────────────

interface CourseCmsResponse {
  id: string
  code: string
  slug: string
  name: string
  short_label: string | null
  tagline: string | null
  description: string | null
  delivery_mode: string
  learning_format: string
  learning_type: CourseLearningType
  delivery: CourseDelivery
  segment: string
  status: CourseStatus
  is_public: boolean
  display_order: number
  cover_image_url: string | null
  og_image_url: string | null
  metadata: Partial<CourseEditableContent> | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

// ── BE → FE ──────────────────────────────────────────────────────────────────
function metadataToContent(md: Partial<CourseEditableContent> | null): CourseEditableContent {
  const base = emptyCourseContent()
  if (!md) return base
  return {
    content_published: md.content_published ?? base.content_published,
    test_widget_enabled: md.test_widget_enabled ?? base.test_widget_enabled,
    hero: { ...base.hero, ...(md.hero ?? {}) },
    card: { ...base.card, ...(md.card ?? {}) },
    sidebar: { ...base.sidebar, ...(md.sidebar ?? {}) },
    outcomes: md.outcomes ?? base.outcomes,
    curriculum: md.curriculum ?? base.curriculum,
    instructor: { ...base.instructor, ...(md.instructor ?? {}) },
    co_instructors: md.co_instructors ?? base.co_instructors,
    reviews: { ...base.reviews, ...(md.reviews ?? {}) },
  }
}

function beToFe(be: CourseCmsResponse): Course {
  return {
    id: be.id,
    code: be.code,
    slug: be.slug,
    name: be.name,
    short_label: be.short_label ?? '',
    tagline: be.tagline ?? '',
    description: be.description ?? '',
    learning_type: be.learning_type,
    delivery: be.delivery,
    cover_image_url: be.cover_image_url ?? '',
    status: be.status,
    is_public: be.is_public,
    published: be.is_public,
    content: metadataToContent(be.metadata),
    updatedAt: be.updated_at,
  }
}

// ── FE → BE (PATCH partial) ──────────────────────────────────────────────────
interface CoursePatchPayload {
  name?: string
  slug?: string
  short_label?: string
  tagline?: string
  description?: string
  cover_image_url?: string
  learning_type?: CourseLearningType
  delivery?: CourseDelivery
  is_public?: boolean
  metadata?: CourseEditableContent
}

function feToBe(patch: Partial<Course>): CoursePatchPayload {
  const out: CoursePatchPayload = {}
  if (patch.name !== undefined) out.name = patch.name
  if (patch.slug !== undefined) out.slug = patch.slug
  if (patch.short_label !== undefined) out.short_label = patch.short_label
  if (patch.tagline !== undefined) out.tagline = patch.tagline
  if (patch.description !== undefined) out.description = patch.description
  if (patch.cover_image_url !== undefined) out.cover_image_url = patch.cover_image_url
  if (patch.learning_type !== undefined) out.learning_type = patch.learning_type
  if (patch.delivery !== undefined) out.delivery = patch.delivery
  if (patch.is_public !== undefined) out.is_public = patch.is_public
  if (patch.published !== undefined) out.is_public = patch.published
  if (patch.content !== undefined) out.metadata = patch.content
  return out
}

// ── Query params ─────────────────────────────────────────────────────────────
export interface CoursesQuery {
  status?: CourseStatus | 'all'
  q?: string
  page?: number
  limit?: number
}

function buildQuery(params?: CoursesQuery): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  if (params.status && params.status !== 'all') usp.set('status', params.status)
  if (params.q) usp.set('q', params.q)
  if (params.page) usp.set('page', String(params.page))
  if (params.limit) usp.set('limit', String(params.limit))
  const s = usp.toString()
  return s ? `?${s}` : ''
}

// ── Hooks ────────────────────────────────────────────────────────────────────
export function useCourses(params?: CoursesQuery) {
  return useQuery({
    queryKey: ['courses', 'list', params ?? {}],
    queryFn: async (): Promise<Paginated<Course>> => {
      const res = await api.getRaw<{
        data: CourseCmsResponse[]
        meta: { page: number; limit: number; total: number }
      }>(`/cms/courses${buildQuery(params)}`)
      return { data: res.data.map(beToFe), meta: res.meta }
    },
  })
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ['courses', 'detail', id],
    queryFn: async (): Promise<Course> => {
      const be = await api.get<CourseCmsResponse>(`/cms/courses/${id}`)
      return beToFe(be)
    },
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload?: Partial<Course>): Promise<Course> => {
      const body: { name: string; slug?: string } = {
        name: payload?.name ?? 'Khoá học mới',
        ...(payload?.slug ? { slug: payload.slug } : {}),
      }
      const be = await api.post<CourseCmsResponse>('/cms/courses', body)
      return beToFe(be)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'list'] }),
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Course> }): Promise<Course> => {
      const be = await api.patch<CourseCmsResponse>(`/cms/courses/${id}`, feToBe(patch))
      return beToFe(be)
    },
    onSuccess: (data) => {
      qc.setQueryData(['courses', 'detail', data.id], data)
      qc.invalidateQueries({ queryKey: ['courses', 'list'] })
    },
  })
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/courses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'list'] }),
  })
}
