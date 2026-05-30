import { useEffect, useState } from 'react'
import { Modal } from '@shared/components/Modal'
import { toast } from '@shared/stores/useToastStore'
import { useCreateRecipient } from '../hooks/useNotificationConfig'
import type {
  NotificationChannel,
  NotificationEvent,
} from '../types/notification'

interface Props {
  open: boolean
  onClose: () => void
  events: NotificationEvent[]
}

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

interface Draft {
  event_key: string
  channel: NotificationChannel
  address: string
  label: string
}

const empty = (events: NotificationEvent[]): Draft => ({
  event_key: events[0]?.key ?? '*',
  channel: 'telegram',
  address: '',
  label: '',
})

export function RecipientFormModal({ open, onClose, events }: Props) {
  const create = useCreateRecipient()
  const [draft, setDraft] = useState<Draft>(empty(events))
  const [addrError, setAddrError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(empty(events))
      setAddrError(null)
    }
  }, [open, events])

  const onSubmit = async () => {
    if (!draft.address.trim()) {
      setAddrError(
        draft.channel === 'telegram' ? 'Nhập chat_id / group_id' : 'Nhập email',
      )
      return
    }
    try {
      await create.mutateAsync({
        event_key: draft.event_key,
        channel: draft.channel,
        address: draft.address.trim(),
        label: draft.label.trim() || undefined,
      })
      toast.success('Đã thêm người nhận')
      onClose()
    } catch (err) {
      // Surface message cụ thể từ BE (vd validate format telegram/email) thay
      // vì toast chung chung.
      toast.error(err instanceof Error ? err.message : 'Thêm thất bại')
    }
  }

  const busy = create.isPending

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Thêm người nhận thông báo"
      size="md"
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
            onClick={onSubmit}
            disabled={busy}
            className="px-4 py-2 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Đang lưu...' : 'Thêm'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Sự kiện</label>
          <select
            className={inputClass}
            value={draft.event_key}
            onChange={(e) => setDraft({ ...draft, event_key: e.target.value })}
          >
            {events.map((ev) => (
              <option key={ev.key} value={ev.key}>
                {ev.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Kênh</label>
          <select
            className={inputClass}
            value={draft.channel}
            onChange={(e) =>
              setDraft({ ...draft, channel: e.target.value as NotificationChannel })
            }
          >
            <option value="telegram">Telegram</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">
            {draft.channel === 'telegram' ? 'Chat ID / Group ID' : 'Email'}{' '}
            <span className="text-[#DC2626]">*</span>
          </label>
          <input
            className={`${inputClass} ${addrError ? 'border-[#DC2626]' : ''}`}
            value={draft.address}
            onChange={(e) => {
              setDraft({ ...draft, address: e.target.value })
              if (addrError && e.target.value.trim()) setAddrError(null)
            }}
            placeholder={
              draft.channel === 'telegram'
                ? 'VD: 1080713491 (cá nhân) hoặc -1001234567890 (group)'
                : 'VD: founder@nedu.vn'
            }
          />
          {addrError && <p className="text-xs text-[#DC2626] mt-1">{addrError}</p>}
          {draft.channel === 'telegram' && (
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Lấy chat_id qua @userinfobot. Group phải đã add bot.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Nhãn (tuỳ chọn)</label>
          <input
            className={inputClass}
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="VD: Sơn (founder), Group ops"
          />
        </div>
      </div>
    </Modal>
  )
}
