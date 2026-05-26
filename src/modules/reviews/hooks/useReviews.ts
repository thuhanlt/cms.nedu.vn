import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Review } from '../types/review'
import type { Paginated } from '@shared/types'

export function useReviews() {
  return useQuery({
    queryKey: ['reviews', 'list'],
    queryFn: () => api.getRaw<Paginated<Review>>('/reviews'),
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Review>) => api.post<Review>('/reviews', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'list'] }),
  })
}

export function useUpdateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Review> }) =>
      api.patch<Review>(`/reviews/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'list'] }),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'list'] }),
  })
}
