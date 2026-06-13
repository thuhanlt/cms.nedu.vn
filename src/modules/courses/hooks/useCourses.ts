import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Course } from '../types/course'
import type { Paginated } from '@shared/types'

export interface CoursesQuery {
  published?: 'published' | 'draft' | 'all'
  q?: string
  page?: number
  limit?: number
}

function buildQuery(params?: CoursesQuery): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  if (params.published && params.published !== 'all') usp.set('published', params.published)
  if (params.q) usp.set('q', params.q)
  if (params.page) usp.set('page', String(params.page))
  if (params.limit) usp.set('limit', String(params.limit))
  const s = usp.toString()
  return s ? `?${s}` : ''
}

export function useCourses(params?: CoursesQuery) {
  return useQuery({
    queryKey: ['courses', 'list', params ?? {}],
    queryFn: () => api.getRaw<Paginated<Course>>(`/courses${buildQuery(params)}`),
  })
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ['courses', 'detail', id],
    queryFn: () => api.get<Course>(`/courses/${id}`),
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: Partial<Course>) => api.post<Course>('/courses', payload ?? {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'list'] }),
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Course> }) =>
      api.patch<Course>(`/courses/${id}`, patch),
    onSuccess: (data) => {
      qc.setQueryData(['courses', 'detail', data.id], data)
      qc.invalidateQueries({ queryKey: ['courses', 'list'] })
    },
  })
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'list'] }),
  })
}
