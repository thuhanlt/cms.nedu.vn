import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Paginated } from '@shared/types'
import type {
  AnchorCatalogItem,
  DeliveriesQuery,
  EmailDelivery,
  RunsQuery,
  WorkflowRun,
} from '../types/email-delivery'

/** Item trigger-catalog (event trigger) — chỉ cần map event_key → label ở đây.
 *  Shape mirror BE WorkflowTriggerCatalogItem; module không import cross-module. */
export interface TriggerCatalogItem {
  event_key: string
  label: string
  audience_label: string
  recipient_context_key: string
  context_vars: { key: string; label: string; sample: string }[]
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') usp.set(k, String(v))
  }
  const s = usp.toString()
  return s ? `?${s}` : ''
}

// Tab "Email đã gửi" — delivery log. Endpoint trả { data, meta } sẵn → getRaw.
export function useEmailDeliveries(params: DeliveriesQuery) {
  return useQuery({
    queryKey: ['email-deliveries', 'deliveries', params],
    queryFn: () =>
      api.getRaw<Paginated<EmailDelivery>>(
        `/cms/notification-settings/deliveries${buildQuery({
          recipient_ref: params.recipient_ref,
          event_key: params.event_key,
          status: params.status,
          page: params.page,
          limit: params.limit,
        })}`,
      ),
    staleTime: 30 * 1000,
  })
}

// Tab "Lượt chạy" — workflow runs. Endpoint trả { data, meta } sẵn → getRaw.
export function useWorkflowRuns(params: RunsQuery) {
  return useQuery({
    queryKey: ['email-deliveries', 'runs', params],
    queryFn: () =>
      api.getRaw<Paginated<WorkflowRun>>(
        `/cms/flows/runs${buildQuery({
          subject_ref: params.subject_ref,
          workflow_id: params.workflow_id,
          status: params.status,
          page: params.page,
          limit: params.limit,
        })}`,
      ),
    staleTime: 30 * 1000,
  })
}

/**
 * Catalog event trigger — label tiếng Việt cho event_key. Query key TRÙNG hook
 * flows/email-templates → share cache, không gọi endpoint 2 lần.
 */
export function useTriggerCatalog() {
  return useQuery({
    queryKey: ['flows', 'trigger-catalog'],
    queryFn: () => api.get<TriggerCatalogItem[]>('/cms/flows/trigger-catalog'),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Catalog mốc ngày — label cho anchor event_key (anchor.course_start, ...).
 * Query key trùng hook builder (nếu có) để share cache.
 */
export function useAnchorCatalog() {
  return useQuery({
    queryKey: ['flows', 'anchor-catalog'],
    queryFn: () => api.get<AnchorCatalogItem[]>('/cms/flows/anchor-catalog'),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * List flow (tên + id) cho dropdown lọc theo flow ở tab Lượt chạy.
 * Query key trùng list hook flows → share cache.
 */
export interface WorkflowOption {
  id: string
  name: string
}
export function useWorkflowOptions() {
  return useQuery({
    queryKey: ['flows', 'list'],
    queryFn: () => api.get<WorkflowOption[]>('/cms/flows'),
    staleTime: 60 * 1000,
  })
}
