// Tab "Lượt chạy" — workflow runs. Filter email người nhận (debounce) +
// workflow + trạng thái. Khi vào từ kebab "Lịch sử" của 1 workflow →
// pre-filter workflow_id (page điều khiển qua prop).
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Inbox, Search } from 'lucide-react'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import {
  useAnchorCatalog,
  useTriggerCatalog,
  useWorkflowOptions,
  useWorkflowRuns,
} from '../hooks/useEmailDeliveries'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { DELIVERIES_PAGE_LIMIT, type RunStatus } from '../types/email-delivery'
import { RunStatusPill } from './DeliveryStatusPill'
import { Pagination } from './Pagination'
import { buildEventLabelMap, formatTime } from './format'

const STATUS_OPTIONS: { value: '' | RunStatus; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'running', label: 'Đang chạy' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'failed', label: 'Lỗi' },
  { value: 'cancelled', label: 'Đã huỷ' },
]

const selectClass =
  'px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#374151] focus:outline-none focus:border-[#2D6A8C]'

interface RunsTabProps {
  /** workflow_id pre-filter từ query param (vào từ kebab "Lịch sử"). */
  initialWorkflowId?: string
}

export function RunsTab({ initialWorkflowId }: RunsTabProps) {
  const [emailInput, setEmailInput] = useState('')
  const [workflowId, setWorkflowId] = useState(initialWorkflowId ?? '')
  const [status, setStatus] = useState<'' | RunStatus>('')
  const [page, setPage] = useState(1)

  // Khi điều hướng từ kebab với workflow_id khác → đồng bộ lại pre-filter.
  useEffect(() => {
    setWorkflowId(initialWorkflowId ?? '')
    setPage(1)
  }, [initialWorkflowId])

  const debouncedEmail = useDebouncedValue(emailInput.trim())
  const resetPage = () => setPage(1)

  const workflowsQ = useWorkflowOptions()
  const triggersQ = useTriggerCatalog()
  const anchorsQ = useAnchorCatalog()
  const eventLabels = useMemo(
    () => buildEventLabelMap(triggersQ.data ?? [], anchorsQ.data ?? []),
    [triggersQ.data, anchorsQ.data],
  )

  const { data, isLoading, isError, refetch, isFetching } = useWorkflowRuns({
    subject_ref: debouncedEmail || undefined,
    workflow_id: workflowId || undefined,
    status: status || undefined,
    page,
    limit: DELIVERIES_PAGE_LIMIT,
  })

  const rows = data?.data ?? []
  const meta = data?.meta ?? { page, limit: DELIVERIES_PAGE_LIMIT, total: 0 }
  const hasFilter = !!(debouncedEmail || workflowId || status)

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
          value={workflowId}
          onChange={(e) => {
            setWorkflowId(e.target.value)
            resetPage()
          }}
          aria-label="Lọc theo luồng"
          className={`${selectClass} max-w-[220px]`}
        >
          <option value="">Tất cả luồng</option>
          {(workflowsQ.data ?? []).map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | RunStatus)
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-[#F3F4F6]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="flex-1" height={14} />
                <Skeleton width={120} height={14} />
                <Skeleton width={70} height={14} />
                <Skeleton width={70} height={20} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được lượt chạy"
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
            title={hasFilter ? 'Không có lượt chạy phù hợp' : 'Chưa có lượt chạy nào'}
            description={
              hasFilter
                ? 'Thử đổi email, luồng hoặc trạng thái đang lọc.'
                : 'Khi sự kiện xảy ra và luồng đang bật, mỗi lượt chạy sẽ hiện ở đây.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#6B7280] border-b border-[#E5E7EB] bg-[#FAFBFC]">
                  <th className="font-medium px-4 py-2.5">Người nhận</th>
                  <th className="font-medium px-4 py-2.5">Luồng</th>
                  <th className="font-medium px-4 py-2.5">Sự kiện</th>
                  <th className="font-medium px-4 py-2.5">Tiến độ</th>
                  <th className="font-medium px-4 py-2.5">Trạng thái</th>
                  <th className="font-medium px-4 py-2.5">Thời gian</th>
                  <th className="font-medium px-4 py-2.5">Lý do lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAFBFC]">
                    <td className="px-4 py-3 text-[#111827] break-all max-w-[200px]">
                      {r.subject_ref}
                    </td>
                    <td className="px-4 py-3 text-[#374151] max-w-[180px] truncate" title={r.workflow_name}>
                      {r.workflow_name}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      {eventLabels.get(r.event_key) ?? r.event_key}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] tabular-nums whitespace-nowrap">
                      {r.current_step}/{r.step_count}
                    </td>
                    <td className="px-4 py-3">
                      <RunStatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap tabular-nums">
                      {formatTime(r.created_at)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF] max-w-[240px]">
                      {r.status === 'failed' ? (
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
