import { ImageIcon, Sparkles, BookOpen, User, MessageSquare, HelpCircle, Wallet } from 'lucide-react'

export type ChallengeSectionKey =
  | 'banner'
  | 'outcomes'
  | 'curriculum'
  | 'instructor'
  | 'reviews'
  | 'faqs'
  | 'price'

export const SECTIONS: Array<{ key: ChallengeSectionKey; label: string; icon: typeof ImageIcon }> = [
  { key: 'banner', label: 'Banner & Thông tin', icon: ImageIcon },
  { key: 'outcomes', label: 'Sau 30 ngày', icon: Sparkles },
  { key: 'curriculum', label: 'Chương trình', icon: BookOpen },
  { key: 'instructor', label: 'Người đồng hành', icon: User },
  { key: 'reviews', label: 'Học viên nói gì', icon: MessageSquare },
  { key: 'faqs', label: 'FAQ', icon: HelpCircle },
  { key: 'price', label: 'Giá & Quyền lợi', icon: Wallet },
]

interface Props {
  current: ChallengeSectionKey
  onChange: (key: ChallengeSectionKey) => void
}

export function ChallengeSectionNav({ current, onChange }: Props) {
  return (
    <aside className="w-[220px] shrink-0 border-r border-[#E5E7EB] bg-white overflow-y-auto">
      <div className="px-4 py-3 text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
        Trang đích
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
              <Icon size={15} />
              <span className="flex-1">{s.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
