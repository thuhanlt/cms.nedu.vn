import type { ReactNode } from 'react'

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
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
