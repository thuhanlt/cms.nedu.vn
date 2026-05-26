import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Persona } from '../types/persona'

export function usePersonas() {
  return useQuery({
    queryKey: ['personas', 'list'],
    queryFn: () => api.get<Persona[]>('/personas'),
  })
}

export function useCreatePersona() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Persona>) => api.post<Persona>('/personas', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personas', 'list'] }),
  })
}

export function useUpdatePersona() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Persona> }) =>
      api.patch<Persona>(`/personas/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personas', 'list'] }),
  })
}

export function useDeletePersona() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/personas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personas', 'list'] }),
  })
}

export function usePublishAllPersonas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<{ published: number }>('/personas/publish-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personas', 'list'] }),
  })
}
