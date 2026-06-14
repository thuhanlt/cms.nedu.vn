import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  limit: number
  total: number
  onPage: (page: number) => void
}

// Pager đơn giản: "X–Y / N" + prev/next. Ẩn khi chỉ 1 trang.
export function Pagination({ page, limit, total, onPage }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (total === 0) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between gap-3 mt-3 px-1">
      <span className="text-xs text-[#6B7280]">
        {from}–{to} / {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
          className="p-1.5 rounded-md border border-[#E5E7EB] text-[#374151] hover:border-[#2D6A8C] disabled:opacity-40 disabled:hover:border-[#E5E7EB]"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs text-[#6B7280] tabular-nums px-1">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
          className="p-1.5 rounded-md border border-[#E5E7EB] text-[#374151] hover:border-[#2D6A8C] disabled:opacity-40 disabled:hover:border-[#E5E7EB]"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
