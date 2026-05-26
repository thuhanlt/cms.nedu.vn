interface SkeletonProps {
  className?: string
  width?: number | string
  height?: number | string
  rounded?: boolean
}

export function Skeleton({ className = '', width, height, rounded = false }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#E5E7EB] ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height }}
    />
  )
}

export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-[#E5E7EB]">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="flex-1" height={14} />
      ))}
    </div>
  )
}
