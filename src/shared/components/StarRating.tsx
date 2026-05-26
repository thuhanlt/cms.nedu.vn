import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  size?: number
  readOnly?: boolean
  max?: number
  className?: string
}

export function StarRating({ value, onChange, size = 18, readOnly = false, max = 5, className = '' }: StarRatingProps) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(i + 1)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            aria-label={`${i + 1} sao`}
          >
            <Star
              size={size}
              className={filled ? 'fill-[#F5B419] text-[#F5B419]' : 'text-[#D1D5DB]'}
            />
          </button>
        )
      })}
    </div>
  )
}
