import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Challenge, ChallengeStatus } from '../types/challenge'
import type { Paginated } from '@shared/types'

export interface ChallengesQuery {
  status?: ChallengeStatus | 'all'
  q?: string
  page?: number
  limit?: number
}

function buildQuery(params: ChallengesQuery | undefined): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  if (params.status && params.status !== 'all') usp.set('status', params.status)
  if (params.q) usp.set('q', params.q)
  if (params.page) usp.set('page', String(params.page))
  if (params.limit) usp.set('limit', String(params.limit))
  const s = usp.toString()
  return s ? `?${s}` : ''
}

export function useChallenges(params?: ChallengesQuery) {
  return useQuery({
    queryKey: ['challenges', 'list', params ?? {}],
    queryFn: () => api.getRaw<Paginated<Challenge>>(`/challenges${buildQuery(params)}`),
  })
}

export function useChallenge(id: string | undefined) {
  return useQuery({
    queryKey: ['challenges', 'detail', id],
    queryFn: () => api.get<Challenge>(`/challenges/${id}`),
    enabled: !!id,
  })
}

export function useCreateChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: Partial<Challenge>) => api.post<Challenge>('/challenges', payload ?? {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges', 'list'] })
    },
  })
}

export function useUpdateChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Challenge> }) =>
      api.patch<Challenge>(`/challenges/${id}`, patch),
    onSuccess: (data) => {
      qc.setQueryData(['challenges', 'detail', data.id], data)
      qc.invalidateQueries({ queryKey: ['challenges', 'list'] })
    },
  })
}

export function useDeleteChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/challenges/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges', 'list'] })
    },
  })
}
