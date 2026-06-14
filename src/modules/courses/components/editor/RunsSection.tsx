import { useState } from 'react'
import { Plus, Pencil, Ban, Loader2 } from 'lucide-react'
import { toast } from '@shared/stores/useToastStore'
import { Skeleton } from '@shared/components/Skeleton'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { useCourseRuns, useCreateRun, useUpdateRun, useDeleteRun } from '../../hooks/useCourseRuns'
import type {
  CourseRun,
  CourseRunDraft,
  RunStatus,
  RunDeliveryMode,
  DepositType,
} from '../../types/course'
import { Field, inputClass, SectionNote } from './Field'

interface Props {
  courseId: string
}

// Khớp BE RUN_STATUSES (course-runs-cms.dto.ts). Label tiếng Việt cho UI.
const STATUS_OPTIONS: Array<{ value: RunStatus; label: string }> = [
  { value: 'planned', label: 'Chưa mở' },
  { value: 'enrollment_open', label: 'Đang mở đăng ký' },
  { value: 'enrollment_closed', label: 'Đã đóng đăng ký' },
  { value: 'running', label: 'Đang diễn ra' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
]

const DELIVERY_OPTIONS: Array<{ value: RunDeliveryMode; label: string }> = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
]

const DEPOSIT_OPTIONS: Array<{ value: DepositType; label: string }> = [
  { value: 'none', label: 'Không cọc' },
  { value: 'fixed', label: 'Cọc cố định (VND)' },
  { value: 'percent', label: 'Cọc theo %' },
]

const STATUS_LABEL: Record<RunStatus, string> = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<RunStatus, string>

function emptyDraft(): CourseRunDraft {
  return {
    label: '',
    start_date: null,
    end_date: null,
    enrollment_open_at: null,
    enrollment_close_at: null,
    delivery_mode: 'offline',
    venue: '',
    capacity: null,
    status: 'planned',
    base_price_vnd: 0,
    currency: 'VND',
    deposit_type: 'none',
    deposit_value: 0,
    balance_due_days: 0,
  }
}

function runToDraft(r: CourseRun): CourseRunDraft {
  return {
    label: r.label,
    start_date: r.start_date,
    end_date: r.end_date,
    enrollment_open_at: r.enrollment_open_at,
    enrollment_close_at: r.enrollment_close_at,
    delivery_mode: r.delivery_mode,
    venue: r.venue,
    capacity: r.capacity,
    status: r.status,
    base_price_vnd: r.base_price_vnd,
    currency: r.currency,
    deposit_type: r.deposit_type,
    deposit_value: r.deposit_value,
    balance_due_days: r.balance_due_days,
  }
}

// date input <-> nullable ISO date string (YYYY-MM-DD)
const dateVal = (v: string | null) => v ?? ''
const toDateOrNull = (v: string) => (v ? v : null)

export function RunsSection({ courseId }: Props) {
  const { data: runs, isLoading } = useCourseRuns(courseId)
  const create = useCreateRun(courseId)
  const update = useUpdateRun(courseId)
  const cancel = useDeleteRun(courseId)

  const [editingId, setEditingId] = useState<string | null>(null) // null = không mở form; '' = tạo mới
  const [draft, setDraft] = useState<CourseRunDraft>(emptyDraft())
  const [cancelId, setCancelId] = useState<string | null>(null)

  const formOpen = editingId !== null
  const set = (patch: Partial<CourseRunDraft>) => setDraft((d) => ({ ...d, ...patch }))

  const openCreate = () => {
    setDraft(emptyDraft())
    setEditingId('')
  }
  const openEdit = (r: CourseRun) => {
    setDraft(runToDraft(r))
    setEditingId(r.id)
  }
  const closeForm = () => setEditingId(null)

  const onSubmit = async () => {
    if (!draft.label.trim()) {
      toast.error('Tên đợt khai giảng không được để trống')
      return
    }
    try {
      if (editingId) {
        await update.mutateAsync({ runId: editingId, patch: draft })
        toast.success('Đã cập nhật đợt khai giảng')
      } else {
        await create.mutateAsync(draft)
        toast.success('Đã tạo đợt khai giảng')
      }
      closeForm()
    } catch {
      toast.error('Lưu đợt khai giảng thất bại')
    }
  }

  const onCancelRun = async () => {
    if (!cancelId) return
    try {
      await cancel.mutateAsync(cancelId)
      toast.success('Đã huỷ đợt khai giảng')
      setCancelId(null)
    } catch {
      toast.error('Huỷ thất bại')
    }
  }

  const list = runs ?? []
  const saving = create.isPending || update.isPending

  return (
    <div className="space-y-4">
      <SectionNote>
        Mỗi khoá có thể có nhiều đợt khai giảng (run / cohort). Giá hiển thị ở sidebar trang khoá lấy từ đợt sắp tới gần nhất. Huỷ = đổi trạng thái sang "Đã huỷ" (không xoá cứng).
      </SectionNote>

      {isLoading ? (
        <Skeleton height={120} />
      ) : list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#D1D5DB] p-6 text-center text-sm text-[#6B7280]">
          Chưa có đợt khai giảng nào.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F8FA] text-[11px] uppercase tracking-wide text-[#6B7280]">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Đợt</th>
                <th className="text-left px-3 py-2 font-medium">Khai giảng</th>
                <th className="text-left px-3 py-2 font-medium">Giá</th>
                <th className="text-left px-3 py-2 font-medium">Suất</th>
                <th className="text-left px-3 py-2 font-medium">Trạng thái</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-[#E5E7EB]">
                  <td className="px-3 py-2">
                    <div className="font-medium text-[#111827]">{r.label || r.code}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{r.code}</div>
                  </td>
                  <td className="px-3 py-2 text-[#374151]">{r.start_date ?? '—'}</td>
                  <td className="px-3 py-2 text-[#374151]">
                    {r.base_price_vnd ? r.base_price_vnd.toLocaleString('vi-VN') + 'đ' : '—'}
                  </td>
                  <td className="px-3 py-2 text-[#374151]">
                    {r.enrolled_count}
                    {r.capacity != null ? ` / ${r.capacity}` : ''}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(r)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
                      >
                        <Pencil size={12} /> Sửa
                      </button>
                      {r.status !== 'cancelled' && (
                        <button
                          onClick={() => setCancelId(r.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#DC2626] hover:bg-[#FEE2E2]"
                        >
                          <Ban size={12} /> Huỷ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!formOpen && (
        <button
          onClick={openCreate}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-[#D1D5DB] text-sm text-[#6B7280] hover:border-[#2D6A8C] hover:text-[#2D6A8C] transition"
        >
          <Plus size={14} /> Thêm đợt khai giảng
        </button>
      )}

      {formOpen && (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 space-y-3">
          <div className="text-sm font-semibold text-[#111827]">
            {editingId ? 'Sửa đợt khai giảng' : 'Đợt khai giảng mới'}
          </div>

          <Field label="Tên đợt (label)" required>
            <input
              className={inputClass}
              value={draft.label}
              onChange={(e) => set({ label: e.target.value })}
              placeholder="Khoá 05 · Đà Nẵng"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Khai giảng">
              <input
                type="date"
                className={inputClass}
                value={dateVal(draft.start_date)}
                onChange={(e) => set({ start_date: toDateOrNull(e.target.value) })}
              />
            </Field>
            <Field label="Kết thúc">
              <input
                type="date"
                className={inputClass}
                value={dateVal(draft.end_date)}
                onChange={(e) => set({ end_date: toDateOrNull(e.target.value) })}
              />
            </Field>
            <Field label="Mở đăng ký">
              <input
                type="date"
                className={inputClass}
                value={dateVal(draft.enrollment_open_at)}
                onChange={(e) => set({ enrollment_open_at: toDateOrNull(e.target.value) })}
              />
            </Field>
            <Field label="Đóng đăng ký">
              <input
                type="date"
                className={inputClass}
                value={dateVal(draft.enrollment_close_at)}
                onChange={(e) => set({ enrollment_close_at: toDateOrNull(e.target.value) })}
              />
            </Field>
            <Field label="Hình thức">
              <select
                className={inputClass}
                value={draft.delivery_mode}
                onChange={(e) => set({ delivery_mode: e.target.value as RunDeliveryMode })}
              >
                {DELIVERY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Trạng thái">
              <select
                className={inputClass}
                value={draft.status}
                onChange={(e) => set({ status: e.target.value as RunStatus })}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Địa điểm">
              <input
                className={inputClass}
                value={draft.venue}
                onChange={(e) => set({ venue: e.target.value })}
                placeholder="Retreat venue Đà Nẵng"
              />
            </Field>
            <Field label="Số suất (capacity)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={draft.capacity ?? ''}
                onChange={(e) => set({ capacity: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Giá gốc (VND)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={draft.base_price_vnd}
                onChange={(e) => set({ base_price_vnd: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Tiền tệ">
              <input
                className={inputClass}
                value={draft.currency}
                onChange={(e) => set({ currency: e.target.value })}
                placeholder="VND"
              />
            </Field>
            <Field label="Loại cọc">
              <select
                className={inputClass}
                value={draft.deposit_type}
                onChange={(e) => set({ deposit_type: e.target.value as DepositType })}
              >
                {DEPOSIT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Giá trị cọc">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={draft.deposit_value}
                onChange={(e) => set({ deposit_value: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Hạn thanh toán nốt (ngày)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={draft.balance_due_days}
                onChange={(e) => set({ balance_due_days: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? 'Cập nhật' : 'Tạo đợt'}
            </button>
            <button
              onClick={closeForm}
              className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#374151] hover:bg-[#F7F8FA]"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        title="Huỷ đợt khai giảng?"
        message="Đợt khai giảng sẽ chuyển sang trạng thái Đã huỷ. Bạn có thể mở lại bằng cách sửa trạng thái."
        confirmLabel="Huỷ đợt"
        loading={cancel.isPending}
        onConfirm={onCancelRun}
        onClose={() => setCancelId(null)}
      />
    </div>
  )
}
