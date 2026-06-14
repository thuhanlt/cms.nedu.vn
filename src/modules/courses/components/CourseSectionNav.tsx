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
  PanelLeftClose,
  PanelLeftOpen,
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
  /** Thu gọn về chỉ-icon. Width do parent điều khiển. */
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function CourseSectionNav({ current, onChange, collapsed = false, onToggleCollapse }: Props) {
  return (
    <aside className="h-full w-full bg-white overflow-y-auto overflow-x-hidden">
      <div
        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3 border-b border-[#E5E7EB]`}
      >
        {!collapsed && (
          <span className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold whitespace-nowrap">
            Trang khoá học
          </span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827] transition shrink-0"
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        )}
      </div>
      <nav className="py-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          const active = current === s.key
          return (
            <button
              key={s.key}
              onClick={() => onChange(s.key)}
              title={collapsed ? `${s.num} · ${s.label}` : undefined}
              className={`w-full flex items-center py-2.5 text-sm text-left transition border-l-2 ${
                collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'
              } ${
                active
                  ? 'bg-[#E0EFF5] text-[#1F5374] border-[#2D6A8C] font-medium'
                  : 'text-[#374151] hover:bg-[#F7F8FA] border-transparent'
              }`}
            >
              {!collapsed && (
                <span className="text-[10px] font-semibold text-[#9CA3AF] tabular-nums shrink-0">{s.num}</span>
              )}
              <Icon size={collapsed ? 16 : 14} className="shrink-0" />
              {!collapsed && <span className="flex-1 whitespace-nowrap">{s.label}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
