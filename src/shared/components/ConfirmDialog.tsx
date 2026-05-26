import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onClose: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  confirmLabel = 'Xoá',
  cancelLabel = 'Huỷ',
  variant = 'danger',
  onConfirm,
  onClose,
  loading = false,
}: ConfirmDialogProps) {
  const confirmClass =
    variant === 'danger'
      ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
      : 'bg-[#2D6A8C] hover:bg-[#1F5374] text-white'

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      size="sm"
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-[#D1D5DB] text-sm hover:bg-[#F7F8FA] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-[#374151] leading-relaxed pt-1">{message}</p>
      </div>
    </Modal>
  )
}
