import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { SiteConfig } from '../types/site-config'

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: () => api.get<SiteConfig>('/cms/site-config'),
  })
}

export function useUpdateSiteConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<SiteConfig>) =>
      api.patch<SiteConfig>('/cms/site-config', patch),
    onSuccess: (data) => {
      qc.setQueryData(['site-config'], data)
    },
  })
}
