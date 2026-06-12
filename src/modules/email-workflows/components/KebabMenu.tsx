// Menu ⋮ (kebab) kiểu Google Flows — dùng chung cho row card ở list page và
// card trên canvas builder. Đóng khi click ra ngoài / Escape.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'

export interface KebabItem {
  key: string
  label: string
  icon?: ReactNode
  /** badge phải (vd <SoonBadge/>) — vẫn hiện khi disabled */
  badge?: ReactNode
  onSelect?: () => void
  disabled?: boolean
  danger?: boolean
}

interface KebabMenuProps {
  /** 'divider' = đường ngăn cách giữa nhóm item */
  items: (KebabItem | 'divider')[]
  /** aria-label cho nút ⋮ */
  label: string
  className?: string
}

export function KebabMenu({ items, label, className = '' }: KebabMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    // stopPropagation: kebab nằm trong row/card clickable — bấm menu không được
    // kích hoạt click chọn row/card bên dưới.
    <div
      ref={ref}
      className={`relative shrink-0 ${className}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-full text-[#6B7280] hover:bg-black/5 hover:text-[#111827]"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-30 w-48 bg-white rounded-lg border border-[#E5E7EB] shadow-lg p-1"
        >
          {items.map((it, i) =>
            it === 'divider' ? (
              <div key={`divider-${i}`} className="my-1 h-px bg-[#E5E7EB]" />
            ) : (
              <button
                key={it.key}
                role="menuitem"
                type="button"
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false)
                  it.onSelect?.()
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-[13px] disabled:opacity-40 disabled:cursor-not-allowed ${
                  it.danger
                    ? 'text-[#DC2626] hover:bg-[#FEE2E2] disabled:hover:bg-transparent'
                    : 'text-[#111827] hover:bg-[#F7F8FA] disabled:hover:bg-transparent'
                }`}
              >
                {it.icon && <span className="shrink-0 text-current">{it.icon}</span>}
                <span className="flex-1 min-w-0 truncate">{it.label}</span>
                {it.badge}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
