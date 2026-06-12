// Panel "Chèn biến" — load từ trigger-catalog, group theo trigger.
// Click biến → chèn {{key}} vào editor tại cursor; nút copy → clipboard
// (để dán vào Subject). Sample value hiện ngay dưới label + tooltip.
import { AlertCircle, Copy, Variable } from 'lucide-react'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import { toast } from '@shared/stores/useToastStore'
import type { TriggerCatalogItem } from '../types/email-template'

interface VariablePickerProps {
  catalog: TriggerCatalogItem[]
  isLoading: boolean
  isError: boolean
  onInsert: (key: string) => void
}

async function copyVar(key: string) {
  try {
    await navigator.clipboard.writeText(`{{${key}}}`)
    toast.success(`Đã copy {{${key}}} — dán vào Subject hoặc nội dung`)
  } catch (err) {
    // Clipboard có thể bị chặn (permission/context) — báo rõ thay vì im lặng
    console.error('[email-templates] copy variable failed', err)
    toast.error('Không copy được — trình duyệt chặn clipboard')
  }
}

export function VariablePicker({ catalog, isLoading, isError, onInsert }: VariablePickerProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertCircle size={22} />}
        title="Không tải được danh sách biến"
        description="Có thể do mất mạng hoặc server đang gặp sự cố."
      />
    )
  }

  if (catalog.length === 0) {
    return (
      <EmptyState
        icon={<Variable size={22} />}
        title="Chưa có trigger nào"
        description="Catalog trigger trống — biến template sẽ xuất hiện khi BE khai báo trigger."
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-[#6B7280] leading-relaxed">
        Click biến để chèn vào <b>nội dung</b> tại vị trí con trỏ. Bấm{' '}
        <Copy size={10} className="inline -mt-0.5" /> để copy — dán vào <b>Subject</b>.
      </p>
      {catalog.map((trigger) => (
        <div key={trigger.event_key}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-semibold text-[#111827]">{trigger.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E0EFF5] text-[#1F5374]">
              {trigger.audience_label}
            </span>
          </div>
          <ul className="space-y-1">
            {trigger.context_vars.map((v) => (
              <li key={`${trigger.event_key}-${v.key}`} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onInsert(v.key)}
                  title={`${v.label} — ví dụ: ${v.sample}`}
                  className="flex-1 min-w-0 text-left px-2 py-1.5 rounded-md border border-[#E5E7EB] hover:border-[#2D6A8C] hover:bg-[#F0F7FA] transition group"
                >
                  <span className="block font-mono text-[11px] text-[#1F5374] group-hover:text-[#17435E] truncate">
                    {'{{'}{v.key}{'}}'}
                  </span>
                  <span className="block text-[10px] text-[#6B7280] truncate">
                    {v.label} · vd: {v.sample}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void copyVar(v.key)}
                  title={`Copy {{${v.key}}} vào clipboard`}
                  className="shrink-0 p-1.5 rounded text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1F5374]"
                >
                  <Copy size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
