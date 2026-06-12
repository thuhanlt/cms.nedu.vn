import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type {
  CreateWorkflowBody,
  EmailTemplateOption,
  EmailWorkflow,
  TriggerCatalogItem,
  UpdateWorkflowBody,
} from '../types/email-workflow'

const LIST_KEY = ['email-workflows', 'list'] as const

export function useEmailWorkflows() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => api.get<EmailWorkflow[]>('/cms/email-workflows'),
  })
}

export function useEmailWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: ['email-workflows', 'detail', id],
    queryFn: () => api.get<EmailWorkflow>(`/cms/email-workflows/${id}`),
    enabled: !!id,
  })
}

/**
 * Catalog trigger — label tiếng Việt + audience + biến available.
 * Query key TRÙNG với hook bên module email-templates → share cache,
 * không gọi endpoint 2 lần khi cả 2 module cùng mount.
 */
export function useWorkflowTriggerCatalog() {
  return useQuery({
    queryKey: ['email-workflows', 'trigger-catalog'],
    queryFn: () => api.get<TriggerCatalogItem[]>('/cms/email-workflows/trigger-catalog'),
    staleTime: 5 * 60 * 1000, // catalog đổi khi deploy BE, không cần refetch dày
  })
}

/**
 * List mẫu email (projection nhẹ id/name/subject) cho select trong step
 * send_email. Query key trùng list hook của module email-templates → share cache.
 */
export function useEmailTemplateOptions() {
  return useQuery({
    queryKey: ['email-templates', 'list', { q: '' }],
    queryFn: () => api.get<EmailTemplateOption[]>('/cms/email-templates'),
  })
}

export function useCreateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWorkflowBody) => api.post<EmailWorkflow>('/cms/email-workflows', body),
    onSuccess: (created) => {
      qc.setQueryData(['email-workflows', 'detail', created.id], created)
      qc.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}

export function useUpdateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateWorkflowBody }) =>
      api.patch<EmailWorkflow>(`/cms/email-workflows/${id}`, patch),
    onSuccess: (saved) => {
      qc.setQueryData(['email-workflows', 'detail', saved.id], saved)
      qc.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}

export function useDeleteWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/email-workflows/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  })
}
