import {
  LayoutGrid,
  Sparkles,
  TestTube,
  Target,
  BookOpen,
  Users,
  MessageSquare,
  Wallet,
  CalendarDays,
} from 'lucide-react'
import type { CourseRealPreviewSection } from '../preview/CourseRealPreview'

export type CourseSectionKey =
  | 'card'
  | 'hero'
  | 'test'
  | 'outcomes'
  | 'curriculum'
  | 'instructors'
  | 'reviews'
  | 'pricing'
  | 'runs'

export const SECTIONS: Array<{ key: CourseSectionKey; num: string; label: string; icon: typeof LayoutGrid }> = [
  { key: 'card', num: '01', label: 'Ảnh bìa', icon: LayoutGrid },
  { key: 'hero', num: '02', label: 'Hero', icon: Sparkles },
  { key: 'test', num: '03', label: 'Test widget', icon: TestTube },
  { key: 'outcomes', num: '04', label: 'Bạn học được gì', icon: Target },
  { key: 'curriculum', num: '05', label: 'Chương trình học', icon: BookOpen },
  { key: 'instructors', num: '06', label: 'Người dẫn đường', icon: Users },
  { key: 'reviews', num: '07', label: 'Học viên nói gì', icon: MessageSquare },
  { key: 'pricing', num: '08', label: 'Học phí & Quyền lợi', icon: Wallet },
  { key: 'runs', num: '09', label: 'Lịch khai giảng', icon: CalendarDays },
]

/** Map section nav key → preview highlight key. */
export function navToHighlight(key: CourseSectionKey): CourseRealPreviewSection | undefined {
  switch (key) {
    case 'card':
      return 'hero'
    case 'hero':
      return 'hero'
    case 'test':
      return 'test'
    case 'outcomes':
      return 'outcomes'
    case 'curriculum':
      return 'curriculum'
    case 'instructors':
      return 'instructors'
    case 'reviews':
      return 'reviews'
    case 'pricing':
    case 'runs':
      return 'pricing'
  }
}

interface Props {
  current: CourseSectionKey
  onChange: (key: CourseSectionKey) => void
}

export function CourseSectionNav({ current, onChange }: Props) {
  return (
    <aside className="w-[220px] shrink-0 border-r border-[#E5E7EB] bg-white overflow-y-auto">
      <div className="px-4 py-3 text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
        Trang khoá học
      </div>
      <nav className="py-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          const active = current === s.key
          return (
            <button
              key={s.key}
              onClick={() => onChange(s.key)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition border-l-2 ${
                active
                  ? 'bg-[#E0EFF5] text-[#1F5374] border-[#2D6A8C] font-medium'
                  : 'text-[#374151] hover:bg-[#F7F8FA] border-transparent'
              }`}
            >
              <span className="text-[10px] font-semibold text-[#9CA3AF] tabular-nums shrink-0">{s.num}</span>
              <Icon size={14} />
              <span className="flex-1">{s.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
