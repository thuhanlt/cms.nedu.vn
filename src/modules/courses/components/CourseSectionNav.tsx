import {
  ImageIcon,
  Sparkles,
  TestTube,
  Target,
  BookOpen,
  Users,
  MessageSquare,
  Wallet,
  HelpCircle,
} from 'lucide-react'

export type CourseSectionKey =
  | 'hero-bg'
  | 'hero'
  | 'test-widget'
  | 'outcomes'
  | 'curriculum'
  | 'instructors'
  | 'reviews'
  | 'price'
  | 'qa'

export const SECTIONS: Array<{ key: CourseSectionKey; num: string; label: string; icon: typeof ImageIcon }> = [
  { key: 'hero-bg', num: '01', label: 'Ảnh bìa', icon: ImageIcon },
  { key: 'hero', num: '02', label: 'Hero', icon: Sparkles },
  { key: 'test-widget', num: '03', label: 'Test widget', icon: TestTube },
  { key: 'outcomes', num: '04', label: 'Bạn sẽ học được gì', icon: Target },
  { key: 'curriculum', num: '05', label: 'Chương trình học', icon: BookOpen },
  { key: 'instructors', num: '06', label: 'Người dẫn đường', icon: Users },
  { key: 'reviews', num: '07', label: 'Học viên nói gì', icon: MessageSquare },
  { key: 'price', num: '08', label: 'Học phí & Lịch', icon: Wallet },
  { key: 'qa', num: '09', label: 'Q&A', icon: HelpCircle },
]

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
