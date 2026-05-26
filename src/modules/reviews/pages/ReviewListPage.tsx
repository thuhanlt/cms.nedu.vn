import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { DataTable, type ColumnDef } from '@shared/components/DataTable'
import { StatusPill } from '@shared/components/StatusPill'
import { StarRating } from '@shared/components/StarRating'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { toast } from '@shared/stores/useToastStore'
import { ReviewFormModal } from '../components/ReviewFormModal'
import { useDeleteReview, useReviews } from '../hooks/useReviews'
import type { Review } from '../types/review'

export function ReviewListPage() {
  const { data, isLoading, isError, refetch } = useReviews()
  const list = data?.data ?? []

  const [editing, setEditing] = useState<Review | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const remove = useDeleteReview()

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (r: Review) => {
    setEditing(r)
    setModalOpen(true)
  }

  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá đánh giá')
      setConfirmId(null)
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  const columns: ColumnDef<Review>[] = useMemo(
    () => [
      {
        key: 'student',
        header: 'Học viên',
        render: (r) => (
          <div className="flex items-center gap-2">
            <button onClick={() => openEdit(r)} className="text-sm font-medium text-[#111827] hover:text-[#2D6A8C]">
              {r.student}
            </button>
            {r.featured && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FEF3C7] text-[#B45309]">
                <Star size={9} className="fill-current" /> Featured
              </span>
            )}
            {r.cohort && <span className="text-xs text-[#6B7280]">· {r.cohort}</span>}
          </div>
        ),
      },
      {
        key: 'course',
        header: 'Khoá học',
        width: '200px',
        render: (r) => <span className="text-sm text-[#374151]">{r.course ?? '—'}</span>,
      },
      {
        key: 'rating',
        header: 'Số sao',
        width: '140px',
        render: (r) => <StarRating value={r.rating} readOnly size={14} />,
      },
      {
        key: 'month',
        header: 'Tháng',
        width: '90px',
        render: (r) => <span className="text-xs text-[#6B7280]">{r.month || '—'}</span>,
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: '110px',
        render: (r) => <StatusPill status={r.status} />,
      },
      {
        key: 'actions',
        header: '',
        width: '120px',
        render: (r) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEdit(r)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
            >
              <Pencil size={12} /> Sửa
            </button>
            <button
              onClick={() => setConfirmId(r.id)}
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
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Đánh giá học viên
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {list.length} đánh giá · Featured = hiển thị nổi bật ở trang chủ
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
        >
          <Plus size={16} /> Thêm đánh giá
        </button>
      </header>

      <DataTable
        data={list}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        rowKey={(r) => r.id}
        emptyTitle="Chưa có đánh giá"
        emptyDescription="Bấm 'Thêm đánh giá' để bắt đầu."
      />

      <ReviewFormModal open={modalOpen} onClose={() => setModalOpen(false)} item={editing} />
      <ConfirmDialog
        open={!!confirmId}
        title="Xoá đánh giá?"
        message="Đánh giá sẽ bị xoá vĩnh viễn. Hành động không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
