import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen, Video, VideoOff, AlertCircle } from 'lucide-react'
import { StatusPill } from '@shared/components/StatusPill'
import { ConfirmDialog } from '@shared/components/ConfirmDialog'
import { EmptyState } from '@shared/components/EmptyState'
import { Skeleton } from '@shared/components/Skeleton'
import { toast } from '@shared/stores/useToastStore'
import { LessonFormModal } from '../components/LessonFormModal'
import { useDeleteLesson, useLessons } from '../hooks/useLessons'
import type { Lesson } from '../types/lesson'

export function LessonListPage() {
  const { data, isLoading, isError, refetch } = useLessons()
  const list = data?.data ?? []

  const [editing, setEditing] = useState<Lesson | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const remove = useDeleteLesson()

  const groups = useMemo(() => {
    const map = new Map<string, Lesson[]>()
    list.forEach((l) => {
      const arr = map.get(l.course) ?? []
      arr.push(l)
      map.set(l.course, arr)
    })
    // sort each group by orderIndex
    map.forEach((arr) => arr.sort((a, b) => a.orderIndex - b.orderIndex))
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [list])

  const knownCourses = useMemo(() => Array.from(new Set(list.map((l) => l.course))), [list])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (l: Lesson) => {
    setEditing(l)
    setModalOpen(true)
  }
  const onDelete = async () => {
    if (!confirmId) return
    try {
      await remove.mutateAsync(confirmId)
      toast.success('Đã xoá bài học')
      setConfirmId(null)
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Bài học
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {list.length} bài học · gom nhóm theo khoá học · hiển thị trên learn.nedu.vn
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
        >
          <Plus size={16} />
          Bài học mới
        </button>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được bài học"
            description="Có thể do mất mạng hoặc server đang gặp sự cố."
            action={
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
              >
                Thử lại
              </button>
            }
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<BookOpen size={22} />}
            title="Chưa có bài học"
            description="Bấm 'Bài học mới' để thêm bài đầu tiên — sẽ tự gom theo khoá."
          />
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([course, items]) => (
            <section key={course} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <header className="px-5 py-3 border-b border-[#E5E7EB] bg-[#F7F8FA] flex items-center gap-2">
                <span className="text-base">📚</span>
                <h3 className="text-sm font-semibold text-[#111827]">{course}</h3>
                <span className="text-xs text-[#6B7280] ml-1">· {items.length} bài</span>
              </header>
              <ul>
                {items.map((l, idx) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 px-5 py-3 border-t first:border-t-0 border-[#E5E7EB] hover:bg-[#F7F8FA] transition"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#E0EFF5] text-[#1F5374] text-xs font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#111827] truncate">{l.title}</div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#6B7280]">
                        {l.cohort && <span>Cohort {l.cohort}</span>}
                        {l.videoUrl ? (
                          <span className="inline-flex items-center gap-1 text-[#15803D]">
                            <Video size={11} />
                            Có video
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#9CA3AF]">
                            <VideoOff size={11} />
                            Chưa có video
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusPill status={l.status} />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(l)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#1F5374] hover:bg-[#E0EFF5]"
                      >
                        <Pencil size={12} /> Sửa
                      </button>
                      <button
                        onClick={() => setConfirmId(l.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#DC2626] hover:bg-[#FEE2E2]"
                      >
                        <Trash2 size={12} /> Xoá
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <LessonFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        lesson={editing}
        knownCourses={knownCourses}
      />

      <ConfirmDialog
        open={!!confirmId}
        title="Xoá bài học?"
        message="Bài học sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        loading={remove.isPending}
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
