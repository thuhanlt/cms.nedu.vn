import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { useToastStore, type ToastKind } from '@shared/stores/useToastStore'

const STYLE: Record<ToastKind, { bg: string; text: string; Icon: typeof CheckCircle2 }> = {
  success: { bg: '#DCFCE7', text: '#15803D', Icon: CheckCircle2 },
  info: { bg: '#E0EFF5', text: '#1F5374', Icon: Info },
  warn: { bg: '#FEF3C7', text: '#B45309', Icon: AlertTriangle },
  error: { bg: '#FEE2E2', text: '#DC2626', Icon: XCircle },
}

export function Toaster() {
  const items = useToastStore((s) => s.items)
  const dismiss = useToastStore((s) => s.dismiss)

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)]">
      {items.map((t) => {
        const cfg = STYLE[t.kind]
        const { Icon } = cfg
        return (
          <div
            key={t.id}
            role="status"
            className="flex items-start gap-2 px-3 py-2.5 rounded-lg shadow-md border border-white/40 animate-[slideIn_0.2s_ease-out]"
            style={{ background: cfg.bg, color: cfg.text }}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-current opacity-60 hover:opacity-100"
              aria-label="Đóng"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
