import { Plus, X } from 'lucide-react'
import { RepeaterList } from '@shared/components/RepeaterList'
import type { CourseEditableContent, CurriculumItem } from '../../types/course'
import { inputClass, SectionNote } from './Field'

interface Props {
  content: CourseEditableContent
  onContentChange: (patch: Partial<CourseEditableContent>) => void
}

export function CurriculumSection({ content, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionNote>
        Chia chương trình thành module / ngày. Mỗi item có số tuần, tiêu đề, thời lượng, và danh sách nội dung học.
      </SectionNote>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Module / Ngày học</div>
        <RepeaterList<CurriculumItem>
          items={content.curriculum}
          onChange={(curriculum) => onContentChange({ curriculum })}
          createItem={() => ({
            week: content.curriculum.length + 1,
            title: `Module ${content.curriculum.length + 1}`,
            duration_label: 'Full day',
            topics: [],
          })}
          addLabel="Thêm module / ngày"
          itemLabel={(i) => `Module ${String(i + 1).padStart(2, '0')}`}
          renderItem={(mod, _i, patch) => (
            <div className="space-y-2">
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={mod.week}
                  onChange={(e) => patch({ week: Number(e.target.value) || 1 })}
                  placeholder="Tuần"
                  title="Số tuần / thứ tự"
                />
                <input
                  className={inputClass}
                  value={mod.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Ngày 1 · Mở lòng và quan sát"
                />
              </div>
              <input
                className={inputClass}
                value={mod.duration_label}
                onChange={(e) => patch({ duration_label: e.target.value })}
                placeholder="Sáng + chiều · 6h"
              />

              <div className="rounded border border-[#E5E7EB] bg-white p-2">
                <div className="text-[11px] font-medium text-[#6B7280] mb-1.5">Nội dung học</div>
                <div className="space-y-1.5">
                  {mod.topics.map((t, ti) => (
                    <div key={ti} className="flex items-center gap-1.5">
                      <input
                        className={inputClass}
                        value={t}
                        onChange={(e) =>
                          patch({ topics: mod.topics.map((v, idx) => (idx === ti ? e.target.value : v)) })
                        }
                        placeholder="Nội dung bài học"
                      />
                      <button
                        type="button"
                        onClick={() => patch({ topics: mod.topics.filter((_, idx) => idx !== ti) })}
                        className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded shrink-0"
                        aria-label="Xoá nội dung"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => patch({ topics: [...mod.topics, ''] })}
                    className="inline-flex items-center gap-1 text-xs text-[#2D6A8C] hover:text-[#1F5374]"
                  >
                    <Plus size={12} /> Thêm nội dung
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  )
}
