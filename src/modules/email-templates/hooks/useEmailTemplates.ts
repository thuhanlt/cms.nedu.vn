import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type {
  CreateEmailTemplateBody,
  EmailTemplate,
  EmailTemplateListItem,
  TestSendResult,
  TriggerCatalogItem,
  UpdateEmailTemplateBody,
} from '../types/email-template'

const LIST_KEY = ['email-templates', 'list'] as const

export function useEmailTemplates(q?: string) {
  return useQuery({
    queryKey: ['email-templates', 'list', { q: q ?? '' }],
    queryFn: () =>
      api.get<EmailTemplateListItem[]>(
        `/cms/email-templates${q ? `?q=${encodeURIComponent(q)}` : ''}`,
      ),
  })
}

export function useEmailTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['email-templates', 'detail', id],
    queryFn: () => api.get<EmailTemplate>(`/cms/email-templates/${id}`),
    enabled: !!id,
  })
}

/** Catalog trigger + biến available — đổ variable picker & sample preview. */
export function useTriggerCatalog() {
  return useQuery({
    queryKey: ['email-workflows', 'trigger-catalog'],
    queryFn: () => api.get<TriggerCatalogItem[]>('/cms/email-workflows/trigger-catalog'),
    staleTime: 5 * 60 * 1000, // catalog đổi khi deploy BE, không cần refetch dày
  })
}

export function useCreateEmailTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEmailTemplateBody) =>
      api.post<EmailTemplate>('/cms/email-templates', body),
    onSuccess: (created) => {
      qc.setQueryData(['email-templates', 'detail', created.id], created)
      qc.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}

export function useUpdateEmailTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateEmailTemplateBody }) =>
      api.patch<EmailTemplate>(`/cms/email-templates/${id}`, patch),
    onSuccess: (saved) => {
      qc.setQueryData(['email-templates', 'detail', saved.id], saved)
      qc.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}

export function useDeleteEmailTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/email-templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  })
}

export interface TestSendBody {
  to: string
  event_key?: string
}

export function useTestSendTemplate() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TestSendBody }) =>
      api.post<TestSendResult>(`/cms/email-templates/${id}/test-send`, body),
  })
}
