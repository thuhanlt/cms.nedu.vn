import { Plus, X } from 'lucide-react'
import { ImageUpload } from '@shared/components/ImageUpload'
import type { ChallengeContent, Instructor } from '../../types/challenge'
import { Field, inputClass, textareaClass } from './Field'

interface Props {
  content: ChallengeContent
  onContentChange: (patch: Partial<ChallengeContent>) => void
}

export function InstructorSection({ content, onContentChange }: Props) {
  const i = content.instructor
  const update = (patch: Partial<Instructor>) =>
    onContentChange({ instructor: { ...i, ...patch } })

  return (
    <div className="space-y-4">
      <Field label="Ghi chú dưới tiêu đề">
        <input
          className={inputClass}
          value={content.subs.instructor}
          onChange={(e) => onContentChange({ subs: { ...content.subs, instructor: e.target.value } })}
        />
      </Field>

      <Field label="Ảnh đại diện" hint="Tỉ lệ vuông, ưu tiên 400×400. Trống → hiện chữ cái đầu của tên.">
        <div className="w-32">
          <ImageUpload
            ratio="avatar"
            value={i.avatarUrl || null}
            onChange={(url) => update({ avatarUrl: url ?? '' })}
            fallbackLetter={i.avatarLetter || i.name.charAt(0).toUpperCase() || 'N'}
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Họ tên">
          <input
            className={inputClass}
            value={i.name}
            onChange={(e) => update({ name: e.target.value, avatarLetter: e.target.value.charAt(0).toUpperCase() })}
          />
        </Field>
        <Field label="Chức danh">
          <input
            className={inputClass}
            value={i.title}
            onChange={(e) => update({ title: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Tags">
        <StringList
          items={i.tags}
          onChange={(tags) => update({ tags })}
          placeholder="Thêm tag (VD: Mindfulness)"
        />
      </Field>

      <Field label="Giới thiệu">
        <textarea
          className={textareaClass}
          value={i.bio}
          onChange={(e) => update({ bio: e.target.value })}
          placeholder="Giới thiệu 2-4 câu về người dẫn đường"
        />
      </Field>

      <Field label="Điểm nổi bật">
        <StringList
          items={i.highlights}
          onChange={(highlights) => update({ highlights })}
          placeholder="Thêm điểm nổi bật"
        />
      </Field>
    </div>
  )
}

function StringList({ items, onChange, placeholder }: { items: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      {items.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={inputClass}
            value={t}
            onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded"
            aria-label="Xoá"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="inline-flex items-center gap-1 text-xs text-[#2D6A8C] hover:text-[#1F5374]"
      >
        <Plus size={12} />
        Thêm
      </button>
    </div>
  )
}
