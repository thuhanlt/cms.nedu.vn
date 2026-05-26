import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Alumni } from '../types/alumni'
import type { Paginated } from '@shared/types'

export function useAlumniList() {
  return useQuery({
    queryKey: ['alumni', 'list'],
    queryFn: () => api.getRaw<Paginated<Alumni>>('/alumni'),
  })
}

export function useCreateAlumni() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Alumni>) => api.post<Alumni>('/alumni', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumni', 'list'] }),
  })
}

export function useUpdateAlumni() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Alumni> }) =>
      api.patch<Alumni>(`/alumni/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumni', 'list'] }),
  })
}

export function useDeleteAlumni() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/alumni/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumni', 'list'] }),
  })
}
