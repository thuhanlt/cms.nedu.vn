// Tab "Email đã gửi" — delivery log. Phục vụ "khách báo không nhận mail":
// filter theo email người nhận (debounce) + trạng thái + sự kiện, xem lý do.
import { useMemo, useState } from 'react'
import { AlertCircle, Inbox, Search } from 'lucide-react'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import {
  useAnchorCatalog,
  useEmailDeliveries,
  useTriggerCatalog,
} from '../hooks/useEmailDeliveries'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { DELIVERIES_PAGE_LIMIT, type DeliveryStatus } from '../types/email-delivery'
import { DeliveryStatusPill } from './DeliveryStatusPill'
import { Pagination } from './Pagination'
import { buildEventLabelMap, channelLabel, formatTime } from './format'

const STATUS_OPTIONS: { value: '' | DeliveryStatus; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'sent', label: 'Đã gửi' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'skipped', label: 'Bỏ qua' },
  { value: 'pending', label: 'Đang chờ' },
]

const selectClass =
  'px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#374151] focus:outline-none focus:border-[#2D6A8C]'

export function DeliveriesTab() {
  const [emailInput, setEmailInput] = useState('')
  const [status, setStatus] = useState<'' | DeliveryStatus>('')
  const [eventKey, setEventKey] = useState('')
  const [page, setPage] = useState(1)

  const debouncedEmail = useDebouncedValue(emailInput.trim())

  // page về 1 khi đổi filter — tránh kẹt ở trang trống của kết quả cũ.
  const resetPage = () => setPage(1)

  const triggersQ = useTriggerCatalog()
  const anchorsQ = useAnchorCatalog()
  const eventLabels = useMemo(
    () => buildEventLabelMap(triggersQ.data ?? [], anchorsQ.data ?? []),
    [triggersQ.data, anchorsQ.data],
  )

  // Dropdown sự kiện = union trigger + anchor catalog (label tiếng Việt).
  const eventOptions = useMemo(() => {
    const seen = new Set<string>()
    const out: { value: string; label: string }[] = []
    for (const t of [...(triggersQ.data ?? []), ...(anchorsQ.data ?? [])]) {
      if (seen.has(t.event_key)) continue
      seen.add(t.event_key)
      out.push({ value: t.event_key, label: t.label })
    }
    return out
  }, [triggersQ.data, anchorsQ.data])

  const { data, isLoading, isError, refetch, isFetching } = useEmailDeliveries({
    recipient_ref: debouncedEmail || undefined,
    status: status || undefined,
    event_key: eventKey || undefined,
    page,
    limit: DELIVERIES_PAGE_LIMIT,
  })

  const rows = data?.data ?? []
  const meta = data?.meta ?? { page, limit: DELIVERIES_PAGE_LIMIT, total: 0 }
  const hasFilter = !!(debouncedEmail || status || eventKey)

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value)
              resetPage()
            }}
            placeholder="Tìm theo email người nhận..."
            aria-label="Tìm theo email người nhận"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | DeliveryStatus)
            resetPage()
          }}
          aria-label="Lọc theo trạng thái"
          className={selectClass}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={eventKey}
          onChange={(e) => {
            setEventKey(e.target.value)
            resetPage()
          }}
          aria-label="Lọc theo sự kiện"
          className={selectClass}
        >
          <option value="">Tất cả sự kiện</option>
          {eventOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-[#F3F4F6]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="flex-1" height={14} />
                <Skeleton width={120} height={14} />
                <Skeleton width={80} height={14} />
                <Skeleton width={70} height={20} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được lịch sử gửi"
            description="Có thể do mất mạng hoặc server đang gặp sự cố."
            action={
              <button
                onClick={() => void refetch()}
                className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
              >
                Thử lại
              </button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Inbox size={22} />}
            title={hasFilter ? 'Không có email phù hợp' : 'Chưa có email nào được gửi'}
            description={
              hasFilter
                ? 'Thử đổi email, trạng thái hoặc sự kiện đang lọc.'
                : 'Khi luồng chạy và gửi email, lịch sử sẽ hiện ở đây.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#6B7280] border-b border-[#E5E7EB] bg-[#FAFBFC]">
                  <th className="font-medium px-4 py-2.5">Người nhận</th>
                  <th className="font-medium px-4 py-2.5">Sự kiện</th>
                  <th className="font-medium px-4 py-2.5">Kênh</th>
                  <th className="font-medium px-4 py-2.5">Thời gian</th>
                  <th className="font-medium px-4 py-2.5">Trạng thái</th>
                  <th className="font-medium px-4 py-2.5">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAFBFC]">
                    <td className="px-4 py-3 text-[#111827] break-all max-w-[220px]">
                      {r.recipient_ref}
                    </td>
                    <td className="px-4 py-3 text-[#374151]">
                      {eventLabels.get(r.event_key) ?? r.event_key}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{channelLabel(r.channel)}</td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap tabular-nums">
                      {formatTime(r.sent_at ?? r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <DeliveryStatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF] max-w-[260px]">
                      {r.status === 'failed' || r.status === 'skipped' ? (
                        <span className="text-[#B91C1C] line-clamp-2" title={r.error ?? undefined}>
                          {r.error || '—'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && !isError && (
        <Pagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          onPage={(p) => setPage(p)}
        />
      )}
      {isFetching && !isLoading && (
        <p className="text-[11px] text-[#9CA3AF] mt-1 px-1">Đang cập nhật…</p>
      )}
    </div>
  )
}
