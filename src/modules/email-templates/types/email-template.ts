// Types cho module "Mẫu email" (Email Workflow Builder — nhóm "Tự động hoá").
// snake_case theo API contract nedu-backend (src/modules/email-workflow/
// templates.controller.ts + trigger-catalog.ts) — giữ nguyên khi vào FE.

/** Item ở list — BE projection nhẹ, KHÔNG có body_html/variables. */
export interface EmailTemplateListItem {
  id: string
  name: string
  subject: string
  updated_at: string
}

/** Full DTO từ GET /cms/email-templates/:id (và POST/PATCH response). */
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body_html: string
  /** biến {{var}} đang dùng trong subject + body — BE extract sẵn */
  variables: string[]
  created_at: string
  updated_at: string
}

export interface CreateEmailTemplateBody {
  name: string
  subject: string
  body_html: string
}

export type UpdateEmailTemplateBody = Partial<CreateEmailTemplateBody>

/** 1 biến template trong catalog — sample dùng cho preview + test-send. */
export interface TriggerVar {
  key: string
  label: string
  sample: string
}

/** Entry GET /cms/flows/trigger-catalog — audience khoá theo trigger. */
export interface TriggerCatalogItem {
  event_key: string
  label: string
  audience_label: string
  recipient_context_key: string
  context_vars: TriggerVar[]
}

/** Response POST /cms/email-templates/:id/test-send. */
export interface TestSendResult {
  message_id: string
  missing_vars: string[]
}
