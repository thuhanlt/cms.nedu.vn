interface SoonBadgeProps {
  label?: string
  className?: string
}

export function SoonBadge({ label = 'Sắp ra', className = '' }: SoonBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FEF3C7] text-[#B45309] ${className}`}
    >
      {label}
    </span>
  )
}
