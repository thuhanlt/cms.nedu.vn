import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil } from 'lucide-react'
import { DataTable, type ColumnDef } from '@shared/components/DataTable'
import { StatusPill } from '@shared/components/StatusPill'
import { toast } from '@shared/stores/useToastStore'
import { useChallenges, useCreateChallenge } from '../hooks/useChallenges'
import type { Challenge, ChallengeStatus } from '../types/challenge'

type Filter = ChallengeStatus | 'all'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'open', label: 'Đang mở' },
  { key: 'upcoming', label: 'Sắp mở' },
  { key: 'closed', label: 'Đã đóng' },
]

export function ChallengeListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const { data, isLoading, isError, refetch } = useChallenges({ status: filter, q: search || undefined })
  const list = data?.data ?? []
  const total = data?.meta?.total ?? list.length

  const create = useCreateChallenge()
  const onCreate = async () => {
    try {
      const created = await create.mutateAsync({ name: 'Thử thách mới' })
      toast.success('Đã tạo thử thách mới')
      navigate(`/dashboard/challenges/${created.id}/edit`)
    } catch {
      toast.error('Không tạo được thử thách')
    }
  }

  const columns: ColumnDef<Challenge>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Thử thách',
        render: (c) => (
          <div>
            <Link
              to={`/dashboard/challenges/${c.id}/edit`}
              className="text-sm font-medium text-[#111827] hover:text-[#2D6A8C]"
            >
              {c.name}
            </Link>
            {c.published ? (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#DCFCE7] text-[#15803D]">
                Đã đăng
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F3F4F6] text-[#6B7280]">
                Nháp
              </span>
            )}
            {c.slug && <div className="text-xs text-[#9CA3AF] mt-0.5">nedu.vn/thu-thach/{c.slug}</div>}
          </div>
        ),
      },
      {
        key: 'price',
        header: 'Học phí',
        width: '180px',
        render: (c) => (
          <div className="text-xs text-[#374151]">
            <div>{c.priceMonthly || '—'} <span className="text-[#9CA3AF]">/tháng</span></div>
            <div className="text-[#6B7280]">{c.priceYearly || '—'} <span className="text-[#9CA3AF]">/năm</span></div>
          </div>
        ),
      },
      {
        key: 'startDate',
        header: 'Khai giảng',
        width: '120px',
        render: (c) => <span className="text-sm text-[#374151]">{c.startDate || '—'}</span>,
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: '120px',
        render: (c) => <StatusPill status={c.status} />,
      },
      {
        key: 'actions',
        header: '',
        width: '80px',
        render: (c) => (
          <Link
            to={`/dashboard/challenges/${c.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
          >
            <Pencil size={13} />
            Sửa
          </Link>
        ),
      },
    ],
    [],
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Thử thách
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {total} thử thách · nedu.vn/thu-thach
          </p>
        </div>
        <button
          onClick={onCreate}
          disabled={create.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium disabled:opacity-60"
        >
          <Plus size={16} />
          {create.isPending ? 'Đang tạo...' : 'Thử thách mới'}
        </button>
      </header>

      {/* Tools row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm thử thách..."
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
        emptyTitle={search || filter !== 'all' ? 'Không có thử thách phù hợp' : 'Chưa có thử thách'}
        emptyDescription={
          search || filter !== 'all' ? 'Thử đổi từ khoá hoặc bộ lọc khác.' : 'Bấm "Thử thách mới" để bắt đầu.'
        }
      />
    </div>
  )
}
