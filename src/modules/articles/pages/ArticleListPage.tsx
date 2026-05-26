import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { DataTable, type ColumnDef } from '@shared/components/DataTable'
import { StatusPill } from '@shared/components/StatusPill'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { toast } from '@shared/stores/useToastStore'
import { useArticles, useCreateArticle, useDeleteArticle } from '../hooks/useArticles'
import type { Article, ArticleType } from '../types/article'

type Filter = ArticleType | 'all'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'blog', label: 'Blog' },
  { key: 'homepage', label: 'Homepage' },
]

function TypeBadge({ type }: { type: ArticleType }) {
  return type === 'blog' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#E0EFF5] text-[#1F5374]">
      ✍️ Blog
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#FEF3C7] text-[#B45309]">
      🏠 Homepage
    </span>
  )
}

export function ArticleListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useArticles({ type: filter, q: search || undefined })
  const list = data?.data ?? []
  const total = data?.meta?.total ?? list.length

  const create = useCreateArticle()
  const remove = useDeleteArticle()

  const onCreate = async () => {
    try {
      const created = await create.mutateAsync({ title: 'Bài viết mới', type: 'blog' })
      toast.success('Đã tạo bản nháp mới')
      navigate(`/dashboard/articles/${created.id}/edit`)
    } catch {
      toast.error('Không tạo được bài viết')
    }
  }

  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá bài viết')
      setConfirmId(null)
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  const columns: ColumnDef<Article>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Bài viết',
        render: (a) => (
          <div>
            <Link
              to={`/dashboard/articles/${a.id}/edit`}
              className="text-sm font-medium text-[#111827] hover:text-[#2D6A8C] line-clamp-1"
            >
              {a.title}
            </Link>
            {a.slug && <div className="text-xs text-[#9CA3AF] mt-0.5">/{a.slug}</div>}
            {a.excerpt && <div className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{a.excerpt}</div>}
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Loại',
        width: '120px',
        render: (a) => <TypeBadge type={a.type} />,
      },
      {
        key: 'date',
        header: 'Ngày đăng',
        width: '120px',
        render: (a) => <span className="text-sm text-[#374151]">{a.publishedDate ?? '—'}</span>,
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: '110px',
        render: (a) => <StatusPill status={a.status} />,
      },
      {
        key: 'actions',
        header: '',
        width: '120px',
        render: (a) => (
          <div className="flex items-center gap-1">
            <Link
              to={`/dashboard/articles/${a.id}/edit`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
            >
              <Pencil size={12} /> Sửa
            </Link>
            <button
              onClick={() => setConfirmId(a.id)}
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
            Bài viết
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {total} bài viết · Blog ở nedu.vn/blog · Homepage cho trang chủ
          </p>
        </div>
        <button
          onClick={onCreate}
          disabled={create.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium disabled:opacity-60"
        >
          <Plus size={16} />
          {create.isPending ? 'Đang tạo...' : 'Bài viết mới'}
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài viết..."
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
        rowKey={(a) => a.id}
        emptyTitle={search || filter !== 'all' ? 'Không có bài viết phù hợp' : 'Chưa có bài viết'}
        emptyDescription={search || filter !== 'all' ? 'Thử đổi từ khoá hoặc bộ lọc.' : 'Bấm "Bài viết mới" để bắt đầu.'}
      />

      <ConfirmDialog
        open={!!confirmId}
        title="Xoá bài viết?"
        message="Bài viết sẽ bị xoá vĩnh viễn và không thể hoàn tác. Tiếp tục?"
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
