import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { DataTable, type ColumnDef } from '@shared/components/DataTable'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { toast } from '@shared/stores/useToastStore'
import { ApiError } from '@shared/config/api-client'
import { useDeleteEmailTemplate, useEmailTemplates } from '../hooks/useEmailTemplates'
import type { EmailTemplateListItem } from '../types/email-template'

function fmtUpdatedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EmailTemplateListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useEmailTemplates(search || undefined)
  const list = data ?? []

  const remove = useDeleteEmailTemplate()

  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá mẫu email')
      setConfirmId(null)
    } catch (err) {
      // 409 = template đang được workflow dùng — surface message từ BE
      // (liệt kê tên workflow) thay vì toast chung chung.
      if (err instanceof ApiError && err.status === 409) {
        toast.error(err.message)
      } else {
        toast.error(err instanceof Error ? err.message : 'Xoá thất bại')
      }
      setConfirmId(null)
    }
  }

  const columns: ColumnDef<EmailTemplateListItem>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Tên',
        render: (t) => (
          <Link
            to={`/dashboard/email-templates/${t.id}/edit`}
            className="text-sm font-medium text-[#111827] hover:text-[#2D6A8C] line-clamp-1"
          >
            {t.name}
          </Link>
        ),
      },
      {
        key: 'subject',
        header: 'Subject',
        render: (t) => (
          <span className="text-sm text-[#374151] line-clamp-1" title={t.subject}>
            {t.subject}
          </span>
        ),
      },
      {
        key: 'updated_at',
        header: 'Cập nhật',
        width: '150px',
        render: (t) => <span className="text-sm text-[#374151]">{fmtUpdatedAt(t.updated_at)}</span>,
      },
      {
        key: 'actions',
        header: '',
        width: '120px',
        render: (t) => (
          <div className="flex items-center gap-1">
            <Link
              to={`/dashboard/email-templates/${t.id}/edit`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
            >
              <Pencil size={12} /> Sửa
            </Link>
            <button
              onClick={() => setConfirmId(t.id)}
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
            Mẫu email
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {list.length} mẫu · nội dung cho workflow tự động hoá (chèn {'{{biến}}'}, preview, gửi thử)
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/email-templates/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
        >
          <Plus size={16} />
          Mẫu mới
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mẫu email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C]"
          />
        </div>
      </div>

      <DataTable
        data={list}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        rowKey={(t) => t.id}
        emptyTitle={search ? 'Không có mẫu phù hợp' : 'Chưa có mẫu email'}
        emptyDescription={
          search ? 'Thử đổi từ khoá tìm kiếm.' : 'Bấm "Mẫu mới" để soạn mẫu đầu tiên cho workflow.'
        }
      />

      <ConfirmDialog
        open={!!confirmId}
        title="Xoá mẫu email?"
        message="Mẫu sẽ bị xoá vĩnh viễn. Mẫu đang được workflow dùng sẽ không xoá được — gỡ khỏi workflow trước."
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
