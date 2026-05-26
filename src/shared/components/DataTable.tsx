import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'
import { SkeletonRow } from './Skeleton'

export interface ColumnDef<T> {
  key: string
  header: ReactNode
  width?: string
  className?: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[] | undefined
  columns: ColumnDef<T>[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  isError = false,
  onRetry,
  rowKey,
  onRowClick,
  emptyTitle = 'Chưa có dữ liệu',
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#F7F8FA] text-[#6B7280] text-xs uppercase tracking-wider">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`text-left font-medium px-4 py-3 ${c.className ?? ''}`}
                style={{ width: c.width }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <>
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <SkeletonRow columns={columns.length} />
                </td>
              </tr>
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <SkeletonRow columns={columns.length} />
                </td>
              </tr>
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <SkeletonRow columns={columns.length} />
                </td>
              </tr>
            </>
          ) : isError ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={<AlertCircle size={22} />}
                  title="Không tải được dữ liệu"
                  description="Có thể do mất mạng hoặc server đang gặp sự cố."
                  action={
                    onRetry && (
                      <button
                        onClick={onRetry}
                        className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
                      >
                        Thử lại
                      </button>
                    )
                  }
                />
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-t border-[#E5E7EB] ${onRowClick ? 'cursor-pointer hover:bg-[#F7F8FA]' : ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle ${c.className ?? ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
