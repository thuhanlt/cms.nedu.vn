import { Plus, X } from 'lucide-react'
import { RepeaterList } from '@shared/components/RepeaterList'
import type { ChallengeContent, CurriculumWeek } from '../../types/challenge'
import { Field, inputClass } from './Field'

interface Props {
  content: ChallengeContent
  onContentChange: (patch: Partial<ChallengeContent>) => void
}

export function CurriculumSection({ content, onContentChange }: Props) {
  const update = (curriculum: CurriculumWeek[]) => onContentChange({ curriculum })

  return (
    <div className="space-y-4">
      <Field label="Ghi chú dưới tiêu đề">
        <input
          className={inputClass}
          value={content.subs.curriculum}
          onChange={(e) => onContentChange({ subs: { ...content.subs, curriculum: e.target.value } })}
        />
      </Field>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Danh sách tuần học</div>
        <RepeaterList<CurriculumWeek>
          items={content.curriculum}
          onChange={update}
          createItem={() => ({ title: `Tuần ${content.curriculum.length + 1}`, topics: [] })}
          addLabel="Thêm tuần"
          itemLabel={(i) => `Tuần ${i + 1}`}
          renderItem={(week, _i, patch) => (
            <div className="space-y-2">
              <input
                className={inputClass}
                value={week.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Tên tuần (VD: Tuần 1: Khởi động)"
              />
              <TopicsList
                topics={week.topics}
                onChange={(topics) => patch({ topics })}
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}

function TopicsList({ topics, onChange }: { topics: string[]; onChange: (t: string[]) => void }) {
  const update = (i: number, val: string) => onChange(topics.map((t, idx) => (idx === i ? val : t)))
  const remove = (i: number) => onChange(topics.filter((_, idx) => idx !== i))
  const add = () => onChange([...topics, ''])

  return (
    <div className="space-y-1.5 pl-3 border-l-2 border-[#E5E7EB]">
      {topics.length === 0 && (
        <div className="text-xs text-[#9CA3AF] italic">Chưa có nội dung — bấm "Thêm nội dung" để bắt đầu.</div>
      )}
      {topics.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={inputClass}
            value={t}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Nội dung tuần này"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded"
            aria-label="Xoá nội dung"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1 text-xs text-[#2D6A8C] hover:text-[#1F5374]"
      >
        <Plus size={12} />
        Thêm nội dung
      </button>
    </div>
  )
}
