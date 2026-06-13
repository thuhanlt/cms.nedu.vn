import { ImageUpload } from '@shared/components/ImageUpload'
import { RepeaterList } from '@shared/components/RepeaterList'
import type { CourseContent, Instructor } from '../../types/course'
import { Field, inputClass, SectionNote, textareaClass } from './Field'

interface Props {
  content: CourseContent
  onContentChange: (patch: Partial<CourseContent>) => void
}

const PRESETS: Array<{ key: string; label: string; data: () => Instructor }> = [
  {
    key: 'nhi',
    label: 'Nhi Lê — Founder NhiLe Holdings',
    data: () => ({
      name: 'Nhi Lê',
      title: 'Coach · Facilitator · Founder NhiLe Holdings',
      avatarUrl: '',
      tags: 'ICF Certified Coach, Applied Psychology, Business Sustainability',
      intro: 'Nhi Lê là người dẫn dắt hành trình tìm về chính mình cho hàng nghìn học viên trẻ trên khắp Việt Nam.',
      education: 'Applied Psychology + Business Sustainability + ICF Certified Coaching, 10+ năm coaching cá nhân hoá.',
      career: '- YouTube Nhi Le · 500K+ subscribers\n- NhiLe Team · 6 platform giáo dục\n- NhiLe Foundation · 100+ học bổng nữ founder\n- Ms Nhi podcast · top 10 podcast giáo dục VN',
      awards: '2025-04 | HER Courage Awards 2025\n2025-08 | YouTube global blog appearance',
    }),
  },
  {
    key: 'alex',
    label: 'Alex Low — Phong Thuỷ Practitioner',
    data: () => ({
      name: 'Alex Low',
      title: 'Phong Thuỷ Practitioner · Dahann I-Ching Consultancy',
      avatarUrl: '',
      tags: 'Phong Thuỷ, Tư vấn doanh nghiệp, Diễn giả quốc tế',
      intro: 'Hơn 20 năm thực hành Phong Thuỷ và Kinh Dịch ứng dụng cho doanh nghiệp châu Á.',
      education: '',
      career: '',
      awards: '',
    }),
  },
  {
    key: 'denise',
    label: 'Denise Wong — Speaker · Spice & Nice',
    data: () => ({
      name: 'Denise Wong',
      title: 'Speaker · Talkshow Host · Spice & Nice',
      avatarUrl: '',
      tags: 'Tâm lý học, Sáng tạo nội dung, Truyền cảm hứng',
      intro: '',
      education: '',
      career: '- Sip and Share\n- Growth is a Bit of a B*tch\n- Spice & Nice channel',
      awards: '',
    }),
  },
  {
    key: 'melvin',
    label: 'Melvin Soh — Business Coach',
    data: () => ({
      name: 'Melvin Soh',
      title: 'Business Coach · Speaker',
      avatarUrl: '',
      tags: 'Business Strategy, Leadership, Public Speaking',
      intro: '',
      education: '',
      career: '',
      awards: '',
    }),
  },
]

export function InstructorsSection({ content, onContentChange }: Props) {
  const addPreset = (key: string) => {
    if (key === '__blank') {
      onContentChange({
        instructors: [
          ...content.instructors,
          { name: '', title: '', avatarUrl: '', tags: '', intro: '', education: '', career: '', awards: '' },
        ],
      })
      return
    }
    const p = PRESETS.find((x) => x.key === key)
    if (!p) return
    onContentChange({ instructors: [...content.instructors, p.data()] })
  }

  return (
    <div className="space-y-4">
      <SectionNote>
        Mỗi giảng viên: avatar, tên, chức danh, tags. Bên dưới là học vấn, sự nghiệp, thành tích.
      </SectionNote>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tiêu đề section">
          <input
            className={inputClass}
            value={content.instructorsTitle}
            onChange={(e) => onContentChange({ instructorsTitle: e.target.value })}
          />
        </Field>
        <Field label="Mô tả ngắn">
          <input
            className={inputClass}
            value={content.instructorsSub}
            onChange={(e) => onContentChange({ instructorsSub: e.target.value })}
          />
        </Field>
      </div>

      <div className="bg-[#E0EFF5] border border-[#B8D4E0] rounded-lg p-3">
        <label className="block text-xs font-semibold text-[#1F5374] mb-1.5">⚡ Chọn người dẫn đường có sẵn</label>
        <select
          className={inputClass}
          value=""
          onChange={(e) => {
            if (e.target.value) {
              addPreset(e.target.value)
              e.target.value = ''
            }
          }}
        >
          <option value="">— Chọn để tự động fill —</option>
          {PRESETS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
          <option value="__blank">— Thêm trắng —</option>
        </select>
      </div>

      <div>
        <div className="text-xs font-medium text-[#374151] mb-1.5">Danh sách giảng viên</div>
        <RepeaterList<Instructor>
          items={content.instructors}
          onChange={(instructors) => onContentChange({ instructors })}
          createItem={() => ({ name: '', title: '', avatarUrl: '', tags: '', intro: '', education: '', career: '', awards: '' })}
          addLabel="Thêm giảng viên trắng"
          itemLabel={(i) => `Giảng viên ${i + 1}`}
          renderItem={(inst, _i, patch) => (
            <div className="space-y-2">
              <div className="flex gap-3 items-start">
                <div className="w-16 shrink-0">
                  <ImageUpload
                    ratio="avatar"
                    kind="instructor-avatar"
                    value={inst.avatarUrl || null}
                    onChange={(url) => patch({ avatarUrl: url ?? '' })}
                    fallbackLetter={inst.name.charAt(0).toUpperCase() || 'N'}
                  />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    className={inputClass}
                    value={inst.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="Họ tên"
                  />
                  <input
                    className={inputClass}
                    value={inst.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="Chức danh"
                  />
                  <input
                    className={`${inputClass} col-span-2`}
                    value={inst.tags}
                    onChange={(e) => patch({ tags: e.target.value })}
                    placeholder="Tags ngăn cách dấu phẩy"
                  />
                </div>
              </div>
              <textarea
                className={textareaClass}
                value={inst.intro}
                onChange={(e) => patch({ intro: e.target.value })}
                placeholder="Giới thiệu ngắn (1-2 câu)"
              />
              <details className="bg-white rounded border border-[#E5E7EB] p-2">
                <summary className="text-xs font-medium text-[#374151] cursor-pointer">Học vấn · Sự nghiệp · Thành tích</summary>
                <div className="mt-2 space-y-2">
                  <Field label="Học vấn">
                    <textarea
                      className={textareaClass}
                      value={inst.education}
                      onChange={(e) => patch({ education: e.target.value })}
                      placeholder="Bằng cấp, trường, ngành học..."
                    />
                  </Field>
                  <Field label="Sự nghiệp & dự án" hint="Mỗi dòng bắt đầu bằng dấu - sẽ thành bullet.">
                    <textarea
                      className={textareaClass}
                      value={inst.career}
                      onChange={(e) => patch({ career: e.target.value })}
                      placeholder="- Dự án 1\n- Dự án 2"
                    />
                  </Field>
                  <Field label="Thành tích & giải thưởng" hint="Format: YYYY-MM | Mô tả">
                    <textarea
                      className={textareaClass}
                      value={inst.awards}
                      onChange={(e) => patch({ awards: e.target.value })}
                      placeholder="2025-04 | Tên giải thưởng"
                    />
                  </Field>
                </div>
              </details>
            </div>
          )}
        />
      </div>
    </div>
  )
}
