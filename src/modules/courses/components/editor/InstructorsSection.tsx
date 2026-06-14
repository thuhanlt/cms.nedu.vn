import { Plus, X } from 'lucide-react'
import { RepeaterList } from '@shared/components/RepeaterList'
import { ImageUpload } from '@shared/components/ImageUpload'
import type {
  CourseEditableContent,
  Instructor,
  CareerBullet,
  Achievement,
} from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  content: CourseEditableContent
  onContentChange: (patch: Partial<CourseEditableContent>) => void
}

function emptyInstructor(): Instructor {
  return {
    name: '',
    title: '',
    initial: '',
    tags: [],
    bio: '',
    education: '',
    career_intro: '',
    career_bullets: [],
    achievements: [],
  }
}

// ─── Reusable block: chỉnh 1 instructor ──────────────────────────────────────
function InstructorBlock({
  value,
  onChange,
}: {
  value: Instructor
  onChange: (patch: Partial<Instructor>) => void
}) {
  const tagsStr = value.tags.join(', ')

  return (
    <div className="space-y-2">
      <Field label="Ảnh đại diện" hint="Tỉ lệ vuông, ưu tiên 400×400. Trống → hiện chữ cái đầu của tên.">
        <div className="w-32">
          <ImageUpload
            ratio="avatar"
            kind="instructor-avatar"
            value={value.avatar_url || null}
            onChange={(url) => onChange({ avatar_url: url ?? undefined })}
            fallbackLetter={value.initial || value.name.charAt(0).toUpperCase() || 'N'}
          />
        </div>
      </Field>

      <div className="grid grid-cols-[64px_1fr] gap-3 items-start">
        <Field label="Chữ cái">
          <input
            className={`${inputClass} text-center text-lg`}
            value={value.initial}
            maxLength={2}
            onChange={(e) => onChange({ initial: e.target.value })}
            placeholder="N"
          />
        </Field>
        <div className="grid grid-cols-1 gap-2">
          <input
            className={inputClass}
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Họ tên"
          />
          <input
            className={inputClass}
            value={value.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Chức danh"
          />
        </div>
      </div>

      <Field label="Tags" hint="Ngăn cách bằng dấu phẩy.">
        <input
          className={inputClass}
          value={tagsStr}
          onChange={(e) =>
            onChange({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
          }
          placeholder="Tâm lý học, Coaching, Lãnh đạo"
        />
      </Field>

      <Field label="Giới thiệu (bio)">
        <textarea
          className={textareaClass}
          value={value.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Giới thiệu ngắn về giảng viên..."
        />
      </Field>

      <details className="bg-white rounded border border-[#E5E7EB] p-2">
        <summary className="text-xs font-medium text-[#374151] cursor-pointer">
          Học vấn · Sự nghiệp · Thành tích
        </summary>
        <div className="mt-2 space-y-3">
          <Field label="Học vấn">
            <textarea
              className={textareaClass}
              value={value.education ?? ''}
              onChange={(e) => onChange({ education: e.target.value })}
              placeholder="Bằng cấp, trường, ngành học..."
            />
          </Field>

          <Field label="Giới thiệu sự nghiệp">
            <textarea
              className={textareaClass}
              value={value.career_intro ?? ''}
              onChange={(e) => onChange({ career_intro: e.target.value })}
              placeholder="Mô tả tổng quan sự nghiệp..."
            />
          </Field>

          {/* Career bullets */}
          <div className="rounded border border-[#E5E7EB] p-2">
            <div className="text-[11px] font-medium text-[#6B7280] mb-1.5">Sự nghiệp & dự án nổi bật</div>
            <div className="space-y-2">
              {(value.career_bullets ?? []).map((b, bi) => (
                <div key={bi} className="flex items-start gap-1.5">
                  <div className="flex-1 grid grid-cols-1 gap-1.5">
                    <input
                      className={inputClass}
                      value={b.label}
                      onChange={(e) =>
                        onChange({
                          career_bullets: (value.career_bullets ?? []).map((v, idx) =>
                            idx === bi ? { ...v, label: e.target.value } : v,
                          ),
                        })
                      }
                      placeholder="Tiêu đề (VD: Kênh YouTube Nhi Le)"
                    />
                    <input
                      className={inputClass}
                      value={b.desc}
                      onChange={(e) =>
                        onChange({
                          career_bullets: (value.career_bullets ?? []).map((v, idx) =>
                            idx === bi ? { ...v, desc: e.target.value } : v,
                          ),
                        })
                      }
                      placeholder="Mô tả ngắn"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        career_bullets: (value.career_bullets ?? []).filter((_, idx) => idx !== bi),
                      })
                    }
                    className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded shrink-0"
                    aria-label="Xoá"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    career_bullets: [...(value.career_bullets ?? []), { label: '', desc: '' } as CareerBullet],
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-[#2D6A8C] hover:text-[#1F5374]"
              >
                <Plus size={12} /> Thêm dòng sự nghiệp
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded border border-[#E5E7EB] p-2">
            <div className="text-[11px] font-medium text-[#6B7280] mb-1.5">Thành tích & giải thưởng</div>
            <div className="space-y-2">
              {(value.achievements ?? []).map((a, ai) => (
                <div key={ai} className="flex items-center gap-1.5">
                  <input
                    className={`${inputClass} w-28 shrink-0`}
                    value={a.date}
                    onChange={(e) =>
                      onChange({
                        achievements: (value.achievements ?? []).map((v, idx) =>
                          idx === ai ? { ...v, date: e.target.value } : v,
                        ),
                      })
                    }
                    placeholder="2025-04"
                  />
                  <input
                    className={inputClass}
                    value={a.text}
                    onChange={(e) =>
                      onChange({
                        achievements: (value.achievements ?? []).map((v, idx) =>
                          idx === ai ? { ...v, text: e.target.value } : v,
                        ),
                      })
                    }
                    placeholder="Tên giải thưởng"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        achievements: (value.achievements ?? []).filter((_, idx) => idx !== ai),
                      })
                    }
                    className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded shrink-0"
                    aria-label="Xoá"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    achievements: [...(value.achievements ?? []), { date: '', text: '' } as Achievement],
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-[#2D6A8C] hover:text-[#1F5374]"
              >
                <Plus size={12} /> Thêm thành tích
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}

export function InstructorsSection({ content, onContentChange }: Props) {
  const instructor = content.instructor

  return (
    <div className="space-y-5">
      <SectionNote>
        Giảng viên chính + các giảng viên đồng hành. Mỗi người: chữ cái avatar, tên, chức danh, tags, bio và chi tiết.
      </SectionNote>

      <section className="rounded-lg border border-[#E5E7EB] p-3 bg-white">
        <h4 className="text-sm font-semibold text-[#111827] mb-2">Giảng viên chính</h4>
        <InstructorBlock
          value={instructor}
          onChange={(patch) => onContentChange({ instructor: { ...instructor, ...patch } })}
        />
      </section>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Giảng viên đồng hành (co-instructors)</div>
        <RepeaterList<Instructor>
          items={content.co_instructors}
          onChange={(co_instructors) => onContentChange({ co_instructors })}
          createItem={emptyInstructor}
          addLabel="Thêm giảng viên đồng hành"
          itemLabel={(i) => `Giảng viên ${i + 1}`}
          renderItem={(inst, _i, patch) => (
            <InstructorBlock value={inst} onChange={patch} />
          )}
        />
      </div>
    </div>
  )
}
