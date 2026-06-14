// Grid chọn trigger cho panel phải "Chọn sự kiện bắt đầu" (mirror panel
// "Choose a starter" của Google Workspace Flows — grid 2 cột card).
// Data từ GET /cms/flows/trigger-catalog.
// Audience KHOÁ theo trigger (chốt an toàn NLH-NEDU-FLOWS-001 §2):
// chọn trigger là hệ thống tự biết gửi ai — không nhập người nhận tự do.
import { AlertCircle, Zap } from 'lucide-react'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import type { TriggerCatalogItem } from '../types/flow'

// (triggerClause sống ở builder-steps.ts — file này chỉ export component
// để react-refresh hoạt động đúng.)

interface TriggerPickerProps {
  catalog: TriggerCatalogItem[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  /** event_key đang chọn — '' = chưa chọn */
  value: string
  onChange: (eventKey: string) => void
}

export function TriggerPicker({ catalog, isLoading, isError, onRetry, value, onChange }: TriggerPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Skeleton height={104} />
        <Skeleton height={104} />
        <Skeleton height={104} />
        <Skeleton height={104} />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertCircle size={22} />}
        title="Không tải được danh sách sự kiện"
        description="Có thể do mất mạng hoặc server đang gặp sự cố."
        action={
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
          >
            Thử lại
          </button>
        }
      />
    )
  }

  if (catalog.length === 0) {
    return (
      <EmptyState
        icon={<Zap size={22} />}
        title="Chưa có sự kiện nào"
        description="Danh sách sự kiện sẽ xuất hiện khi hệ thống khai báo."
      />
    )
  }

  return (
    <div role="radiogroup" aria-label="Chọn sự kiện bắt đầu" className="grid grid-cols-2 gap-3">
      {catalog.map((t) => {
        const selected = t.event_key === value
        return (
          <button
            key={t.event_key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(t.event_key)}
            className={`flex flex-col items-start gap-2.5 rounded-xl border p-3.5 text-left transition ${
              selected
                ? 'border-[#A8C7FA] bg-[#E8F0FE] ring-1 ring-[#A8C7FA]'
                : 'border-[#E5E7EB] bg-white hover:border-[#A8C7FA] hover:bg-[#F8FAFD]'
            }`}
          >
            <span className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
              <Zap size={16} />
            </span>
            <span className="text-[13px] font-medium text-[#111827] leading-snug">{t.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E0EFF5] text-[#1F5374]">
              → gửi cho {t.audience_label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
