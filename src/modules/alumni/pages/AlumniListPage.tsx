import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { DataTable, type ColumnDef } from '@shared/components/DataTable'
import { StatusPill } from '@shared/components/StatusPill'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { toast } from '@shared/stores/useToastStore'
import { AlumniFormModal } from '../components/AlumniFormModal'
import { useAlumniList, useDeleteAlumni } from '../hooks/useAlumni'
import type { Alumni, AlumniType } from '../types/alumni'

const TYPE_BADGE: Record<AlumniType, { icon: string; label: string; bg: string; text: string }> = {
  spotlight: { icon: '⭐', label: 'Spotlight', bg: '#FEF3C7', text: '#B45309' },
  event: { icon: '📅', label: 'Event', bg: '#E0EFF5', text: '#1F5374' },
  job: { icon: '💼', label: 'Job', bg: '#DCFCE7', text: '#15803D' },
}

function TypeBadge({ type }: { type: AlumniType }) {
  const c = TYPE_BADGE[type]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {c.icon} {c.label}
    </span>
  )
}

function safeDate(iso: string): string {
  try {
    return format(new Date(iso), 'dd/MM/yyyy')
  } catch {
    return '—'
  }
}

export function AlumniListPage() {
  const { data, isLoading, isError, refetch } = useAlumniList()
  const list = data?.data ?? []

  const [editing, setEditing] = useState<Alumni | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const remove = useDeleteAlumni()

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (a: Alumni) => {
    setEditing(a)
    setModalOpen(true)
  }

  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá mục alumni')
      setConfirmId(null)
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  const columns: ColumnDef<Alumni>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Tiêu đề',
        render: (a) => (
          <div>
            <button onClick={() => openEdit(a)} className="text-sm font-medium text-[#111827] hover:text-[#2D6A8C] text-left line-clamp-1">
              {a.title}
            </button>
            {a.quote && <div className="text-xs text-[#6B7280] mt-0.5 line-clamp-1 italic">"{a.quote}"</div>}
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Loại',
        width: '130px',
        render: (a) => <TypeBadge type={a.type} />,
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: '110px',
        render: (a) => <StatusPill status={a.status} />,
      },
      {
        key: 'updated',
        header: 'Cập nhật',
        width: '110px',
        render: (a) => <span className="text-xs text-[#6B7280]">{safeDate(a.updatedAt)}</span>,
      },
      {
        key: 'actions',
        header: '',
        width: '120px',
        render: (a) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEdit(a)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
            >
              <Pencil size={12} /> Sửa
            </button>
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
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Alumni
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {list.length} mục · hiển thị trên alumni.nedu.vn — spotlight, event, tin tuyển dụng
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
        >
          <Plus size={16} /> Thêm mục
        </button>
      </header>

      <DataTable
        data={list}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        rowKey={(a) => a.id}
        emptyTitle="Chưa có mục alumni"
        emptyDescription="Bấm 'Thêm mục' để bắt đầu đăng spotlight, event hoặc tin tuyển dụng."
      />

      <AlumniFormModal open={modalOpen} onClose={() => setModalOpen(false)} item={editing} />
      <ConfirmDialog
        open={!!confirmId}
        title="Xoá mục alumni?"
        message="Mục sẽ bị xoá vĩnh viễn. Hành động không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
