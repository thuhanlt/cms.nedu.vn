import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type {
  CreateWorkflowBody,
  EmailTemplateOption,
  EmailWorkflow,
  TriggerCatalogItem,
  UpdateWorkflowBody,
} from '../types/flow'

const LIST_KEY = ['flows', 'list'] as const

export function useFlows() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => api.get<EmailWorkflow[]>('/cms/flows'),
  })
}

export function useFlow(id: string | undefined) {
  return useQuery({
    queryKey: ['flows', 'detail', id],
    queryFn: () => api.get<EmailWorkflow>(`/cms/flows/${id}`),
    enabled: !!id,
  })
}

/**
 * Catalog trigger — label tiếng Việt + audience + biến available.
 * Query key TRÙNG với hook bên module email-deliveries → share cache,
 * không gọi endpoint 2 lần khi cả 2 module cùng mount.
 */
export function useFlowTriggerCatalog() {
  return useQuery({
    queryKey: ['flows', 'trigger-catalog'],
    queryFn: () => api.get<TriggerCatalogItem[]>('/cms/flows/trigger-catalog'),
    staleTime: 5 * 60 * 1000, // catalog đổi khi deploy BE, không cần refetch dày
  })
}

/**
 * List mẫu email (projection nhẹ id/name/subject) cho node send_email.
 * Query key trùng list hook của module email-templates → share cache.
 */
export function useEmailTemplateOptions() {
  return useQuery({
    queryKey: ['email-templates', 'list', { q: '' }],
    queryFn: () => api.get<EmailTemplateOption[]>('/cms/email-templates'),
  })
}

export function useCreateFlow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWorkflowBody) => api.post<EmailWorkflow>('/cms/flows', body),
    onSuccess: (created) => {
      qc.setQueryData(['flows', 'detail', created.id], created)
      qc.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}

export function useUpdateFlow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateWorkflowBody }) =>
      api.patch<EmailWorkflow>(`/cms/flows/${id}`, patch),
    onSuccess: (saved) => {
      qc.setQueryData(['flows', 'detail', saved.id], saved)
      qc.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}

export function useDeleteFlow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/flows/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  })
}
