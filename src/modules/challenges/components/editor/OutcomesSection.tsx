import { RepeaterList } from '@shared/components/RepeaterList'
import type { ChallengeContent, Outcome } from '../../types/challenge'
import { Field, inputClass, textareaClass } from './Field'

interface Props {
  content: ChallengeContent
  onContentChange: (patch: Partial<ChallengeContent>) => void
}

export function OutcomesSection({ content, onContentChange }: Props) {
  const update = (outcomes: Outcome[]) => onContentChange({ outcomes })

  return (
    <div className="space-y-4">
      <Field label="Ghi chú dưới tiêu đề">
        <input
          className={inputClass}
          value={content.subs.outcomes}
          onChange={(e) => onContentChange({ subs: { ...content.subs, outcomes: e.target.value } })}
        />
      </Field>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Danh sách điều bạn đạt được</div>
        <RepeaterList<Outcome>
          items={content.outcomes}
          onChange={update}
          createItem={() => ({ icon: '✨', title: 'Mục mới', desc: 'Mô tả ngắn' })}
          addLabel="Thêm mục"
          itemLabel={(i) => `Mục ${i + 1}`}
          renderItem={(item, _i, patch) => (
            <div className="grid grid-cols-[60px_1fr] gap-2">
              <input
                className={inputClass}
                value={item.icon}
                onChange={(e) => patch({ icon: e.target.value })}
                placeholder="🌱"
              />
              <input
                className={inputClass}
                value={item.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Tiêu đề"
              />
              <textarea
                className={`${textareaClass} col-span-2`}
                value={item.desc}
                onChange={(e) => patch({ desc: e.target.value })}
                placeholder="Mô tả ngắn (1-2 câu)"
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}
