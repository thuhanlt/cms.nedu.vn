import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { SiteSettings } from '../types/settings'

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<SiteSettings>('/site-settings'),
  })
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<SiteSettings>) => api.patch<SiteSettings>('/site-settings', patch),
    onSuccess: (data) => {
      qc.setQueryData(['site-settings'], data)
    },
  })
}
