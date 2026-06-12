// Types cho module "Lịch sử gửi" (delivery history — nhóm "Tự động hoá").
// snake_case theo API contract nedu-backend:
//   - GET /cms/notification-settings/deliveries (notification-dispatch/repository.ts listDeliveries)
//   - GET /cms/flows/runs            (flows/flows.service.ts listRuns)
// 2 endpoint trả SẴN { data, meta } → gọi qua api.getRaw (không unwrap thêm).

// ── Email đã gửi (delivery log) ─────────────────────────────────────────────
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped'

/** 1 row GET /cms/notification-settings/deliveries — mirror listDeliveries DTO. */
export interface EmailDelivery {
  id: string
  event_id: string
  event_key: string
  channel: string // 'email' | 'telegram' | 'in_app'
  audience: string | null
  recipient_ref: string
  status: DeliveryStatus
  provider_message_id: string | null
  error: string | null
  created_at: string
  sent_at: string | null
}

export interface DeliveriesQuery {
  recipient_ref?: string
  event_key?: string
  status?: DeliveryStatus
  page?: number
  limit?: number
}

// ── Lượt chạy (workflow runs) ───────────────────────────────────────────────
export type RunStatus = 'running' | 'completed' | 'failed' | 'cancelled'

/** 1 row GET /cms/flows/runs — mirror listRuns DTO. */
export interface WorkflowRun {
  id: string
  workflow_id: string
  workflow_name: string
  subject_ref: string
  event_key: string
  current_step: number
  step_count: number
  status: RunStatus
  error: string | null
  created_at: string
  updated_at: string
}

export interface RunsQuery {
  subject_ref?: string
  workflow_id?: string
  status?: RunStatus
  page?: number
  limit?: number
}

// ── Catalog mốc ngày (date anchor) — chỉ module này consume read-only ───────
// Shape mirror BE DateAnchorCatalogItem (trigger-catalog.ts DATE_ANCHOR_CATALOG).
// event_key anchor = 'anchor.course_start' / 'anchor.deposit_due'.
export interface AnchorCatalogItem {
  anchor_key: string
  event_key: string
  label: string
  audience_label: string
  recipient_context_key: string
  context_vars: { key: string; label: string; sample: string }[]
}

// Số dòng / trang mặc định cho cả 2 tab.
export const DELIVERIES_PAGE_LIMIT = 20
