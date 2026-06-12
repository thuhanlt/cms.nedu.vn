// Modal "Gửi thử cho tôi" — POST /cms/email-templates/:id/test-send.
// Prefill email user đang đăng nhập; chọn trigger (optional) để render đúng
// bộ sample vars; 429 (ThrottlerGuard 5/phút) → toast hướng dẫn chờ.
import { useEffect, useState } from 'react'
import { Modal } from '@shared/components/Modal'
import { toast } from '@shared/stores/useToastStore'
import { ApiError } from '@shared/config/api-client'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { useTestSendTemplate } from '../hooks/useEmailTemplates'
import type { TriggerCatalogItem } from '../types/email-template'

interface TestSendModalProps {
  open: boolean
  onClose: () => void
  templateId: string
  catalog: TriggerCatalogItem[]
}

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

// Cùng regex validate email với BE templates.service.ts
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function TestSendModal({ open, onClose, templateId, catalog }: TestSendModalProps) {
  const user = useAuthStore((s) => s.user)
  const testSend = useTestSendTemplate()

  const [to, setTo] = useState('')
  const [eventKey, setEventKey] = useState('')
  const [toError, setToError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTo(user?.email ?? '')
      setEventKey('')
      setToError(null)
    }
  }, [open, user])

  const onSubmit = async () => {
    const email = to.trim()
    if (!EMAIL_RE.test(email)) {
      setToError('Email không hợp lệ')
      return
    }
    try {
      const result = await testSend.mutateAsync({
        id: templateId,
        body: { to: email, ...(eventKey ? { event_key: eventKey } : {}) },
      })
      toast.success(`Đã gửi email thử tới ${email} (subject có prefix [TEST])`)
      if (result.missing_vars.length > 0) {
        toast.warn(`Biến thiếu giá trị, render rỗng: ${result.missing_vars.join(', ')}`)
      }
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        toast.error('Gửi thử tối đa 5 lần/phút — thử lại sau 1 phút')
      } else {
        toast.error(err instanceof Error ? err.message : 'Gửi thử thất bại')
      }
    }
  }

  const busy = testSend.isPending

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Gửi thử cho tôi"
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-md border border-[#D1D5DB] text-sm hover:bg-[#F7F8FA] disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={() => void onSubmit()}
            disabled={busy}
            className="px-4 py-2 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Đang gửi...' : 'Gửi thử'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Gửi <b>bản đã lưu gần nhất</b> của mẫu này với data mẫu — kiểm tra hiển thị thật trong
          hộp thư trước khi gắn vào workflow.
        </p>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">
            Gửi tới email <span className="text-[#DC2626]">*</span>
          </label>
          <input
            type="email"
            className={`${inputClass} ${toError ? 'border-[#DC2626]' : ''}`}
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              if (toError && EMAIL_RE.test(e.target.value.trim())) setToError(null)
            }}
            placeholder="ban@nedu.vn"
          />
          {toError && <p className="text-xs text-[#DC2626] mt-1">{toError}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">
            Render theo trigger (tuỳ chọn)
          </label>
          <select className={inputClass} value={eventKey} onChange={(e) => setEventKey(e.target.value)}>
            <option value="">Gộp biến mọi trigger</option>
            {catalog.map((t) => (
              <option key={t.event_key} value={t.event_key}>
                {t.label} ({t.audience_label})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            Chọn trigger để thấy đúng biến nào sẽ thiếu khi workflow chạy thật.
          </p>
        </div>
      </div>
    </Modal>
  )
}
