import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { DataTable, type ColumnDef } from '@shared/components/DataTable'
import { StatusPill } from '@shared/components/StatusPill'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { toast } from '@shared/stores/useToastStore'
import { useCourses, useCreateCourse, useDeleteCourse } from '../hooks/useCourses'
import type { Course } from '../types/course'

type Filter = 'all' | 'published' | 'draft'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'published', label: 'Đã đăng' },
  { key: 'draft', label: 'Nháp' },
]

const TYPE_LABEL: Record<string, string> = {
  retreat: 'Retreat',
  online: 'Online',
  offline: 'Offline',
  hybrid: 'Hybrid',
}

export function CourseListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useCourses({ published: filter, q: search || undefined })
  const list = data?.data ?? []
  const total = data?.meta?.total ?? list.length

  const create = useCreateCourse()
  const remove = useDeleteCourse()

  const onCreate = async () => {
    try {
      const created = await create.mutateAsync({ name: 'Khoá học mới' })
      toast.success('Đã tạo khoá học mới')
      navigate(`/dashboard/courses/${created.id}/edit`)
    } catch {
      toast.error('Không tạo được khoá học')
    }
  }

  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá khoá học')
      setConfirmId(null)
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  const columns: ColumnDef<Course>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Khoá học',
        render: (c) => (
          <div>
            <Link
              to={`/dashboard/courses/${c.id}/edit`}
              className="text-sm font-medium text-[#111827] hover:text-[#2D6A8C]"
            >
              {c.name}
            </Link>
            {c.content.subTitle && (
              <div className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{c.content.subTitle}</div>
            )}
            {c.slug && <div className="text-xs text-[#9CA3AF] mt-0.5">nedu.vn/khoa-hoc/{c.slug}</div>}
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Loại',
        width: '110px',
        render: (c) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FEF3C7] text-[#B45309]">
            {TYPE_LABEL[c.content.type] ?? c.content.type}
          </span>
        ),
      },
      {
        key: 'price',
        header: 'Học phí',
        width: '160px',
        render: (c) => <span className="text-sm text-[#374151]">{c.content.pricing.price || '—'}</span>,
      },
      {
        key: 'startDate',
        header: 'Khai giảng',
        width: '120px',
        render: (c) => {
          const d = c.content.startDate
          if (!d) return <span className="text-sm text-[#9CA3AF]">—</span>
          // YYYY-MM-DD → DD/MM/YYYY
          const parts = d.split('-')
          const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d
          return <span className="text-sm text-[#374151]">{formatted}</span>
        },
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: '110px',
        render: (c) => <StatusPill status={c.published ? 'published' : 'draft'} />,
      },
      {
        key: 'actions',
        header: '',
        width: '120px',
        render: (c) => (
          <div className="flex items-center gap-1">
            <Link
              to={`/dashboard/courses/${c.id}/edit`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
            >
              <Pencil size={12} /> Sửa
            </Link>
            <button
              onClick={() => setConfirmId(c.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#DC2626] hover:bg-[#FEE2E2]"
            >
              <Trash2 size={12} /> Xoá
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Khoá học
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {total} khoá học · nedu.vn/khoa-hoc
          </p>
        </div>
        <button
          onClick={onCreate}
          disabled={create.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium disabled:opacity-60"
        >
          <Plus size={16} />
          {create.isPending ? 'Đang tạo...' : 'Khoá học mới'}
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khoá học..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filter === f.key
                  ? 'bg-[#1A4D6B] text-white'
                  : 'bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#2D6A8C]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        data={list}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        rowKey={(c) => c.id}
        emptyTitle={search || filter !== 'all' ? 'Không có khoá học phù hợp' : 'Chưa có khoá học'}
        emptyDescription={
          search || filter !== 'all' ? 'Thử đổi từ khoá hoặc bộ lọc khác.' : 'Bấm "Khoá học mới" để bắt đầu.'
        }
      />

      <ConfirmDialog
        open={!!confirmId}
        title="Xoá khoá học?"
        message="Khoá học sẽ bị xoá vĩnh viễn và không thể hoàn tác. Tiếp tục?"
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
