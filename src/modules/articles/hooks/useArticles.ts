import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Article, ArticleType } from '../types/article'
import type { Paginated } from '@shared/types'

export interface ArticlesQuery {
  type?: ArticleType | 'all'
  q?: string
  page?: number
  limit?: number
}

function buildQuery(params?: ArticlesQuery): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  if (params.type && params.type !== 'all') usp.set('type', params.type)
  if (params.q) usp.set('q', params.q)
  if (params.page) usp.set('page', String(params.page))
  if (params.limit) usp.set('limit', String(params.limit))
  const s = usp.toString()
  return s ? `?${s}` : ''
}

export function useArticles(params?: ArticlesQuery) {
  return useQuery({
    queryKey: ['articles', 'list', params ?? {}],
    queryFn: () => api.getRaw<Paginated<Article>>(`/articles${buildQuery(params)}`),
  })
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ['articles', 'detail', id],
    queryFn: () => api.get<Article>(`/articles/${id}`),
    enabled: !!id,
  })
}

export function useCreateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: Partial<Article>) => api.post<Article>('/articles', payload ?? {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articles', 'list'] }),
  })
}

export function useUpdateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Article> }) =>
      api.patch<Article>(`/articles/${id}`, patch),
    onSuccess: (data) => {
      qc.setQueryData(['articles', 'detail', data.id], data)
      qc.invalidateQueries({ queryKey: ['articles', 'list'] })
    },
  })
}

export function useDeleteArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/articles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articles', 'list'] }),
  })
}
