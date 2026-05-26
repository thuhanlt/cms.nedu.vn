import { Check, AlertCircle, Loader2, Save } from 'lucide-react'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface SaveButtonProps {
  state: SaveState
  onClick: () => void
  savedAt?: Date | null
  errorMessage?: string
  label?: string
  className?: string
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export function SaveButton({ state, onClick, savedAt, errorMessage, label = 'Lưu & Cập nhật', className = '' }: SaveButtonProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={onClick}
        disabled={state === 'saving'}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {state === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {state === 'saving' ? 'Đang lưu...' : label}
      </button>

      {state === 'saved' && savedAt && (
        <span className="inline-flex items-center gap-1 text-xs text-[#15803D]">
          <Check size={14} />
          Đã lưu lúc {fmtTime(savedAt)}
        </span>
      )}
      {state === 'error' && (
        <span className="inline-flex items-center gap-1 text-xs text-[#DC2626]">
          <AlertCircle size={14} />
          {errorMessage ?? 'Lưu thất bại'}
        </span>
      )}
    </div>
  )
}
