import type { ReactNode } from 'react'

export function Field({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs font-medium text-[#374151] mb-1.5">
        {label} {required && <span className="text-[#DC2626]">*</span>}
      </div>
      {children}
      {hint && <div className="text-[11px] text-[#9CA3AF] mt-1">{hint}</div>}
    </label>
  )
}

export const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

export const textareaClass = `${inputClass} resize-y min-h-[80px]`

export function SectionNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 mb-3 rounded-md bg-[#FEF3C7]/40 border border-[#FEF3C7] text-xs text-[#92400E]">
      <span className="text-base leading-none mt-0.5">💡</span>
      <span>{children}</span>
    </div>
  )
}
