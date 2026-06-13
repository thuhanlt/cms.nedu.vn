import { RepeaterList } from '@shared/components/RepeaterList'
import type { CourseContent, CurriculumModule } from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  content: CourseContent
  onContentChange: (patch: Partial<CourseContent>) => void
}

export function CurriculumSection({ content, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionNote>
        Chia chương trình thành ngày / module. Mỗi item có tiêu đề, meta, và danh sách nội dung học (mỗi dòng = 1 bullet).
      </SectionNote>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tiêu đề section">
          <input
            className={inputClass}
            value={content.curriculumTitle}
            onChange={(e) => onContentChange({ curriculumTitle: e.target.value })}
          />
        </Field>
        <Field label="Mô tả ngắn dưới tiêu đề">
          <input
            className={inputClass}
            value={content.curriculumSub}
            onChange={(e) => onContentChange({ curriculumSub: e.target.value })}
          />
        </Field>
      </div>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Module / Ngày học</div>
        <RepeaterList<CurriculumModule>
          items={content.curriculum}
          onChange={(curriculum) => onContentChange({ curriculum })}
          createItem={() => ({
            title: `Ngày ${content.curriculum.length + 1} — Tiêu đề`,
            meta: `Ngày ${content.curriculum.length + 1} · Full day`,
            topics: '',
          })}
          addLabel="Thêm ngày / module"
          itemLabel={(i) => `Module ${String(i + 1).padStart(2, '0')}`}
          renderItem={(week, _i, patch) => (
            <div className="space-y-2">
              <input
                className={inputClass}
                value={week.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Ngày 1 — Nhận Diện Bản Thân"
              />
              <input
                className={inputClass}
                value={week.meta}
                onChange={(e) => patch({ meta: e.target.value })}
                placeholder="Ngày 1 · Full day"
              />
              <textarea
                className={textareaClass}
                value={week.topics}
                onChange={(e) => patch({ topics: e.target.value })}
                placeholder={'Mỗi dòng = 1 bullet:\nNội dung 1\nNội dung 2\nNội dung 3'}
                rows={5}
              />
              <p className="text-[11px] text-[#9CA3AF]">Mỗi dòng tự thành 1 bullet ✓ trong preview.</p>
            </div>
          )}
        />
      </div>
    </div>
  )
}
