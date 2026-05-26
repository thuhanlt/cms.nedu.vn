import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Faq } from '../types/faq'
import type { Paginated } from '@shared/types'

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs', 'list'],
    queryFn: () => api.getRaw<Paginated<Faq>>('/faqs'),
  })
}

export function useCreateFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Faq>) => api.post<Faq>('/faqs', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faqs', 'list'] }),
  })
}

export function useUpdateFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Faq> }) =>
      api.patch<Faq>(`/faqs/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faqs', 'list'] }),
  })
}

export function useDeleteFaq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/faqs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faqs', 'list'] }),
  })
}
