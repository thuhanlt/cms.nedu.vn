// Seed mock cho module Mẫu email. Catalog mirror 1:1 nedu-backend
// src/modules/email-workflow/trigger-catalog.ts — 4 trigger: payment.paid +
// payment.failed (#198 merged) + enrollment.confirmed + hieucon.report.ready
// (#199) — mock PHẢI khớp contract BE, FE không hardcode danh sách.
import type { EmailTemplate, TriggerCatalogItem } from '@modules/email-templates/types/email-template'
import { extractTemplateVars } from '@modules/email-templates/template-render'

export const EMAIL_TRIGGER_CATALOG: TriggerCatalogItem[] = [
  {
    event_key: 'payment.paid',
    label: 'Thanh toán thành công',
    audience_label: 'Người mua',
    recipient_context_key: 'buyer_email',
    context_vars: [
      { key: 'buyer_name', label: 'Tên người mua', sample: 'Chị Lan' },
      { key: 'buyer_email', label: 'Email người mua', sample: 'lan@gmail.com' },
      { key: 'buyer_phone', label: 'SĐT người mua', sample: '0901234567' },
      { key: 'product_name', label: 'Tên khoá / sản phẩm', sample: 'Là Chính Mình' },
      { key: 'amount_label', label: 'Số tiền', sample: '2.500.000đ' },
      { key: 'order_id_short', label: 'Mã đơn (rút gọn)', sample: 'a1b2c3d4' },
    ],
  },
  {
    event_key: 'payment.failed',
    label: 'Thanh toán thất bại',
    audience_label: 'Người mua',
    recipient_context_key: 'buyer_email',
    context_vars: [
      { key: 'buyer_name', label: 'Tên người mua', sample: 'Chị Lan' },
      { key: 'buyer_email', label: 'Email người mua', sample: 'lan@gmail.com' },
      { key: 'buyer_phone', label: 'SĐT người mua', sample: '0901234567' },
      { key: 'failure_message', label: 'Lý do lỗi', sample: 'Thẻ bị từ chối' },
      { key: 'order_id_short', label: 'Mã đơn (rút gọn)', sample: 'a1b2c3d4' },
    ],
  },
  {
    event_key: 'enrollment.confirmed',
    label: 'Ghi danh thành công',
    audience_label: 'Học viên',
    recipient_context_key: 'student_email',
    context_vars: [
      { key: 'student_name', label: 'Tên học viên', sample: 'Chị Lan' },
      { key: 'student_email', label: 'Email học viên', sample: 'lan@gmail.com' },
      { key: 'course_name', label: 'Tên khoá / sản phẩm', sample: 'Là Chính Mình' },
      { key: 'order_id_short', label: 'Mã đơn (rút gọn)', sample: 'a1b2c3d4' },
    ],
  },
  {
    event_key: 'hieucon.report.ready',
    label: 'Báo cáo Thiên Mệnh sẵn sàng',
    audience_label: 'Phụ huynh',
    recipient_context_key: 'parent_email',
    context_vars: [
      { key: 'parent_name', label: 'Tên phụ huynh', sample: 'Chị Lan' },
      { key: 'parent_email', label: 'Email phụ huynh', sample: 'lan@gmail.com' },
      { key: 'child_name', label: 'Tên bé', sample: 'Bé Bi' },
      { key: 'tier', label: 'Gói báo cáo', sample: 'premium' },
      {
        key: 'report_url',
        label: 'Link xem báo cáo (hệ thống sinh)',
        sample: 'https://report.hieucon.vn/r/abc123',
      },
      { key: 'order_id_short', label: 'Mã đơn (rút gọn)', sample: 'a1b2c3d4' },
    ],
  },
]

function seedTemplate(input: {
  id: string
  name: string
  subject: string
  body_html: string
  created_at: string
  updated_at: string
}): EmailTemplate {
  return {
    ...input,
    variables: extractTemplateVars({ subject: input.subject, body_html: input.body_html }),
  }
}

export const EMAIL_TEMPLATES_SEED: EmailTemplate[] = [
  seedTemplate({
    id: '3f9a1c20-5b7e-4d2a-9c41-8e6f0a2b1d34',
    name: 'Cảm ơn sau mua',
    subject: 'Cảm ơn {{buyer_name}} — Nedu đã nhận thanh toán {{product_name}}',
    body_html:
      '<h2>Cảm ơn {{buyer_name}}!</h2>' +
      '<p>Nedu đã nhận được thanh toán <strong>{{amount_label}}</strong> cho khoá <strong>{{product_name}}</strong>.</p>' +
      '<p>Mã đơn của bạn: <strong>{{order_id_short}}</strong></p>' +
      '<p>Trong vòng 24 giờ bạn sẽ nhận được email hướng dẫn vào học. Nếu cần hỗ trợ, chỉ cần trả lời email này.</p>' +
      '<p>Thân mến,<br>Đội ngũ Nedu</p>',
    created_at: '2026-06-09T08:30:00.000Z',
    updated_at: '2026-06-10T14:05:00.000Z',
  }),
  seedTemplate({
    id: '6c2d8e47-1a3f-4b90-b5d2-7f4e9c0a8b15',
    name: 'Thanh toán thất bại — hướng dẫn',
    subject: 'Thanh toán của {{buyer_name}} chưa thành công — hướng dẫn thử lại',
    body_html:
      '<h2>Thanh toán chưa thành công</h2>' +
      '<p>Chào {{buyer_name}}, giao dịch cho đơn <strong>{{order_id_short}}</strong> chưa được xử lý.</p>' +
      '<p>Lý do từ cổng thanh toán: <em>{{failure_message}}</em></p>' +
      '<h3>Cách thử lại</h3>' +
      '<ul><li>Kiểm tra hạn mức / số dư thẻ</li><li>Thử lại với thẻ khác hoặc chuyển khoản</li><li>Cần hỗ trợ? Trả lời email này, đội ngũ Nedu phản hồi trong giờ làm việc</li></ul>',
    created_at: '2026-06-09T09:00:00.000Z',
    updated_at: '2026-06-09T09:00:00.000Z',
  }),
  seedTemplate({
    id: '9b5e3a72-4c8d-4f16-a0e9-2d7b6c1f4a58',
    name: 'Mẹo học tuần đầu',
    subject: '{{buyer_name}} ơi, 3 mẹo cho tuần học đầu tiên với {{product_name}}',
    body_html:
      '<p>Chào {{buyer_name}},</p>' +
      '<p>Bạn đã bắt đầu hành trình <strong>{{product_name}}</strong> được vài ngày — đây là 3 mẹo giúp tuần đầu hiệu quả:</p>' +
      '<ol><li>Đặt lịch học cố định 30 phút mỗi ngày</li><li>Ghi chú lại 1 điều tâm đắc sau mỗi bài</li><li>Đặt câu hỏi trong cộng đồng học viên — đừng học một mình</li></ol>' +
      '<p>Chúc bạn một tuần học trọn vẹn!<br>Đội ngũ Nedu</p>',
    created_at: '2026-06-10T03:20:00.000Z',
    updated_at: '2026-06-10T03:20:00.000Z',
  }),
]

// Giả lập workflow đang tham chiếu template (BE chặn xoá → 409).
// "Cảm ơn sau mua" đang được workflow "Chăm sóc sau mua" dùng.
export const TEMPLATE_WORKFLOW_USAGE: Record<string, string[]> = {
  '3f9a1c20-5b7e-4d2a-9c41-8e6f0a2b1d34': ['Chăm sóc sau mua'],
}
