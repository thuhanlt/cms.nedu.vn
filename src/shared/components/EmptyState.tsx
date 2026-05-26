import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#F7F8FA] text-[#9CA3AF] flex items-center justify-center mb-3">
        {icon ?? <Inbox size={22} />}
      </div>
      <h3 className="text-sm font-medium text-[#111827]">{title}</h3>
      {description && <p className="text-xs text-[#6B7280] mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
