import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type {
  NotificationChannel,
  NotificationEvent,
  NotificationRecipient,
} from '../types/notification'

const RECIPIENTS_KEY = ['notifications', 'recipients'] as const

export function useNotificationEvents() {
  return useQuery({
    queryKey: ['notifications', 'events'],
    queryFn: () =>
      api.get<NotificationEvent[]>('/cms/notification-settings/events'),
  })
}

export function useNotificationRecipients() {
  return useQuery({
    queryKey: RECIPIENTS_KEY,
    queryFn: () =>
      api.get<NotificationRecipient[]>('/cms/notification-settings/recipients'),
  })
}

export interface CreateRecipientBody {
  event_key: string
  channel: NotificationChannel
  address: string
  label?: string
}

export function useCreateRecipient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateRecipientBody) =>
      api.post<NotificationRecipient>(
        '/cms/notification-settings/recipients',
        body,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECIPIENTS_KEY }),
  })
}

export function useUpdateRecipient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: { label?: string; enabled?: boolean }
    }) =>
      api.patch<NotificationRecipient>(
        `/cms/notification-settings/recipients/${id}`,
        patch,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECIPIENTS_KEY }),
  })
}

export function useDeleteRecipient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/cms/notification-settings/recipients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECIPIENTS_KEY }),
  })
}
