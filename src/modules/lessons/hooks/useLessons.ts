import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Lesson } from '../types/lesson'
import type { Paginated } from '@shared/types'

export function useLessons(course?: string) {
  return useQuery({
    queryKey: ['lessons', 'list', { course: course ?? 'all' }],
    queryFn: () => {
      const q = course && course !== 'all' ? `?course=${encodeURIComponent(course)}` : ''
      return api.getRaw<Paginated<Lesson>>(`/lessons${q}`)
    },
  })
}

export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Lesson>) => api.post<Lesson>('/lessons', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons', 'list'] }),
  })
}

export function useUpdateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Lesson> }) =>
      api.patch<Lesson>(`/lessons/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons', 'list'] }),
  })
}

export function useDeleteLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lessons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons', 'list'] }),
  })
}
