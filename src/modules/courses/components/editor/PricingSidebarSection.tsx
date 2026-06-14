import { Plus, X } from 'lucide-react'
import type { CourseEditableContent, Sidebar } from '../../types/course'
import { Field, inputClass, SectionNote } from './Field'

interface Props {
  content: CourseEditableContent
  onContentChange: (patch: Partial<CourseEditableContent>) => void
}

export function PricingSidebarSection({ content, onContentChange }: Props) {
  const sidebar = content.sidebar
  const setSidebar = (patch: Partial<Sidebar>) => onContentChange({ sidebar: { ...sidebar, ...patch } })

  return (
    <div className="space-y-4">
      <SectionNote>
        Card sidebar bên phải trang khoá. Giá hiển thị lấy từ run đang chọn (mục Lịch khai giảng); ở đây chỉ chỉnh nhãn giá + checklist quyền lợi.
      </SectionNote>

      <Field label="Nhãn dưới giá (price_label)">
        <input
          className={inputClass}
          value={sidebar.price_label}
          onChange={(e) => setSidebar({ price_label: e.target.value })}
          placeholder="Bao gồm ăn ở 3.5 ngày + tài liệu + cộng đồng alumni"
        />
      </Field>

      <div className="rounded-lg border border-[#E5E7EB] p-3 bg-white space-y-2">
        <div className="text-sm font-semibold text-[#111827] mb-1">Quyền lợi (✓ checklist)</div>
        {sidebar.checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputClass}
              value={item}
              onChange={(e) =>
                setSidebar({ checklist: sidebar.checklist.map((v, idx) => (idx === i ? e.target.value : v)) })
              }
              placeholder="VD: Toàn bộ tài liệu khoá học"
            />
            <button
              type="button"
              onClick={() => setSidebar({ checklist: sidebar.checklist.filter((_, idx) => idx !== i) })}
              className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded shrink-0"
              aria-label="Xoá"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSidebar({ checklist: [...sidebar.checklist, ''] })}
          className="inline-flex items-center gap-1 text-xs text-[#2D6A8C] hover:text-[#1F5374]"
        >
          <Plus size={12} /> Thêm quyền lợi
        </button>
      </div>
    </div>
  )
}
