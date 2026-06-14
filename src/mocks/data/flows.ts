// Seed mock cho module Flows — khớp contract nedu-backend
// src/modules/flows/flows.controller.ts.
// template_id tham chiếu EMAIL_TEMPLATES_SEED (data/email-templates.ts).
import type { EmailWorkflow } from '@modules/flows/types/flow'

// id template trong EMAIL_TEMPLATES_SEED
const TPL_THANK_YOU = '3f9a1c20-5b7e-4d2a-9c41-8e6f0a2b1d34' // "Cảm ơn sau mua"
const TPL_WEEK_ONE_TIPS = '9b5e3a72-4c8d-4f16-a0e9-2d7b6c1f4a58' // "Mẹo học tuần đầu"

export const FLOWS_SEED: EmailWorkflow[] = [
  {
    id: 'a7c41f88-2e5b-4d09-9f63-1b8e4a2c7d50',
    name: 'Chăm sóc sau mua',
    trigger: { type: 'event', event_key: 'payment.paid' },
    steps: [
      { type: 'send_email', template_id: TPL_THANK_YOU },
      { type: 'delay', hours: 72 }, // FE hiển thị "Đợi 3 ngày"
      { type: 'send_email', template_id: TPL_WEEK_ONE_TIPS },
    ],
    status: 'enabled',
    created_at: '2026-06-10T02:00:00.000Z',
    updated_at: '2026-06-11T09:30:00.000Z',
  },
  {
    id: 'c3d92b14-6f7a-4e28-8a05-5d1c9e3f6b72',
    name: 'Welcome học viên',
    trigger: { type: 'event', event_key: 'enrollment.confirmed' },
    steps: [{ type: 'send_email', template_id: TPL_WEEK_ONE_TIPS }],
    status: 'draft',
    created_at: '2026-06-11T04:10:00.000Z',
    updated_at: '2026-06-11T04:10:00.000Z',
  },
]
