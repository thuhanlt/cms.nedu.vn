import { useMemo, useState } from 'react'
import { Plus, Trash2, Send, Mail, Bell, AlertCircle } from 'lucide-react'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import { toast } from '@shared/stores/useToastStore'
import { RecipientFormModal } from '../components/RecipientFormModal'
import {
  useDeleteRecipient,
  useNotificationEvents,
  useNotificationRecipients,
  useUpdateRecipient,
} from '../hooks/useNotificationConfig'
import type { NotificationRecipient } from '../types/notification'

export function NotificationConfigPage() {
  const eventsQ = useNotificationEvents()
  const recipientsQ = useNotificationRecipients()
  const events = eventsQ.data ?? []
  const recipients = recipientsQ.data ?? []
  const isLoading = eventsQ.isLoading || recipientsQ.isLoading
  const isError = eventsQ.isError || recipientsQ.isError

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const update = useUpdateRecipient()
  const remove = useDeleteRecipient()

  const labelOf = (key: string) =>
    events.find((e) => e.key === key)?.label ?? key

  const groups = useMemo(() => {
    const map = new Map<string, NotificationRecipient[]>()
    recipients.forEach((r) => {
      const arr = map.get(r.event_key) ?? []
      arr.push(r)
      map.set(r.event_key, arr)
    })
    return Array.from(map.entries())
  }, [recipients])

  const onToggle = async (r: NotificationRecipient) => {
    try {
      await update.mutateAsync({ id: r.id, patch: { enabled: !r.enabled } })
    } catch {
      toast.error('Cập nhật thất bại')
    }
  }

  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá người nhận')
      setConfirmId(null)
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1
            className="text-2xl font-semibold text-[#111827]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Thông báo
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {recipients.length} người/nhóm nhận · cấu hình Telegram &amp; Email theo sự kiện (thay env)
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
        >
          <Plus size={16} /> Thêm người nhận
        </button>
      </header>

      <div className="mb-5 rounded-lg border border-[#FCE8C3] bg-[#FFFBEB] px-4 py-3 text-[13px] text-[#7C5E10] leading-relaxed">
        💡 <b>Telegram</b>: dán <code>chat_id</code> cá nhân (số dương) hoặc{' '}
        <code>group_id</code> (số âm, vd <code>-100…</code>) — lấy qua{' '}
        <b>@userinfobot</b>, group phải đã add bot. Người nhận gắn sự kiện{' '}
        <b>“Tất cả thông báo”</b> sẽ nhận mọi event.
      </div>

      {!isLoading &&
        !isError &&
        !recipients.some((r) => r.channel === 'telegram' && r.enabled) && (
          <div className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C] leading-relaxed">
            ⚠️ <b>Chưa có người nhận Telegram nào đang bật</b> — thông báo Telegram
            sẽ <b>KHÔNG được gửi</b> cho tới khi thêm chat_id (founder / group).
          </div>
        )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton height={56} />
          <Skeleton height={56} />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được cấu hình"
            description="Có thể do mất mạng hoặc server đang gặp sự cố."
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<Bell size={22} />}
            title="Chưa có người nhận"
            description="Bấm 'Thêm người nhận' để cấu hình ai/nhóm nhận thông báo Telegram/Email."
          />
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([eventKey, items]) => (
            <section
              key={eventKey}
              className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
            >
              <header className="px-5 py-3 border-b border-[#E5E7EB] bg-[#F7F8FA] flex items-center gap-2">
                <Bell size={15} className="text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">{labelOf(eventKey)}</h3>
                <span className="text-xs text-[#6B7280] ml-1">· {items.length} người nhận</span>
              </header>
              <ul>
                {items.map((r) => (
                  <li
                    key={r.id}
                    className="border-t first:border-t-0 border-[#E5E7EB] px-5 py-3 flex items-center gap-3"
                  >
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${
                        r.channel === 'telegram'
                          ? 'bg-[#E0EFF5] text-[#1F5374]'
                          : 'bg-[#EDE9FE] text-[#5B21B6]'
                      }`}
                    >
                      {r.channel === 'telegram' ? <Send size={11} /> : <Mail size={11} />}
                      {r.channel}
                    </span>
                    <span className="font-mono text-xs text-[#111827] truncate flex-1 min-w-0">
                      {r.address}
                    </span>
                    {r.label && (
                      <span className="text-xs text-[#6B7280] truncate max-w-[160px]">
                        {r.label}
                      </span>
                    )}
                    <label className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] shrink-0 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={r.enabled}
                        onChange={() => onToggle(r)}
                        className="accent-[#2D6A8C]"
                      />
                      {r.enabled ? 'Bật' : 'Tắt'}
                    </label>
                    <button
                      onClick={() => setConfirmId(r.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#DC2626] hover:bg-[#FEE2E2] shrink-0"
                    >
                      <Trash2 size={12} /> Xoá
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <RecipientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        events={events}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="Xoá người nhận?"
        message="Người/nhóm này sẽ không còn nhận thông báo cho sự kiện đã gắn."
        confirmLabel="Xoá"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
