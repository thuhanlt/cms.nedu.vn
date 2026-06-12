// Types cho module "Workflow" (email workflow builder — nhóm "Tự động hoá").
// snake_case theo API contract nedu-backend src/modules/email-workflow/
// (workflows.controller.ts + workflow.types.ts) — giữ nguyên khi vào FE.

export type WorkflowStatus = 'draft' | 'enabled' | 'disabled'

export interface SendEmailStep {
  type: 'send_email'
  template_id: string
}

export interface DelayStep {
  type: 'delay'
  /** FE hiển thị giờ/ngày nhưng LƯU thống nhất bằng giờ (1..2160 = 90 ngày) */
  hours: number
}

export type WorkflowStep = SendEmailStep | DelayStep

/**
 * Builder hiện chỉ SỬA được event trigger. date_anchor (luồng theo mốc ngày —
 * BE đã hỗ trợ, tạo qua API) mở lên builder = read-only banner, UI chọn mốc
 * thêm ở PR sau. Union để load workflow date_anchor không vỡ/không ghi đè.
 */
export type WorkflowTrigger =
  | { type: 'event'; event_key: string }
  | { type: 'date_anchor'; anchor_key: string; offset_days: number }

export interface EmailWorkflow {
  id: string
  name: string
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
  status: WorkflowStatus
  created_at: string
  updated_at: string
}

export interface CreateWorkflowBody {
  name: string
  trigger: WorkflowTrigger
  steps?: WorkflowStep[]
}

export interface UpdateWorkflowBody {
  name?: string
  trigger?: WorkflowTrigger
  steps?: WorkflowStep[]
  status?: WorkflowStatus
}

// Mirror BE workflow.types.ts (zod schema)
export const WORKFLOW_MAX_STEPS = 20
export const DELAY_HOURS_MIN = 1
export const DELAY_HOURS_MAX = 2160 // 90 ngày
export const WORKFLOW_NAME_MAX = 128

// ── Contract của resource khác mà builder consume (read-only) ───────────────
// Shape mirror module email-templates (không import cross-module — boundary FE).

/** 1 biến template trong trigger catalog. */
export interface TriggerVar {
  key: string
  label: string
  sample: string
}

/** Entry GET /cms/email-workflows/trigger-catalog. */
export interface TriggerCatalogItem {
  event_key: string
  label: string
  audience_label: string
  recipient_context_key: string
  context_vars: TriggerVar[]
}

/** Projection nhẹ GET /cms/email-templates — đổ select "chọn mẫu" trong step. */
export interface EmailTemplateOption {
  id: string
  name: string
  subject: string
  updated_at: string
}
