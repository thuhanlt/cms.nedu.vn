import { NavLink } from 'react-router-dom'
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  GraduationCap,
  Trophy,
  Sparkles,
  FileText,
  BookOpen,
  TestTube,
  Award,
  Star,
  HelpCircle,
  Settings,
  Bell,
  Mail,
  Workflow,
  History,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { useUiStore } from '@shared/stores/useUiStore'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { SoonBadge } from '@shared/components/SoonBadge'

interface NavItem {
  to?: string
  label: string
  icon: typeof LayoutDashboard
  soon?: boolean
  adminOnly?: boolean
  accent?: string
}

const NAV_PROGRAM_CHILDREN: NavItem[] = [
  { label: 'Khoá học', icon: GraduationCap, soon: true },
  { to: '/dashboard/challenges', label: 'Thử thách', icon: Trophy, accent: '#F5B419' },
  { label: 'Workshop', icon: Sparkles, soon: true },
]

const NAV_MAIN: NavItem[] = [
  { to: '/dashboard/overview', label: 'Tổng quan', icon: LayoutDashboard },
]

const NAV_AFTER_PROGRAM: NavItem[] = [
  { to: '/dashboard/articles', label: 'Bài viết', icon: FileText },
  { to: '/dashboard/lessons', label: 'Bài học', icon: BookOpen },
  { to: '/dashboard/test-config', label: 'Test Config', icon: TestTube, adminOnly: true },
  { to: '/dashboard/alumni', label: 'Alumni', icon: Award },
  { to: '/dashboard/reviews', label: 'Đánh giá', icon: Star },
  { to: '/dashboard/faqs', label: 'FAQ', icon: HelpCircle },
  { to: '/dashboard/notifications', label: 'Thông báo', icon: Bell, adminOnly: true },
]

// Nhóm "Tự động hoá" (admin-only).
const NAV_AUTOMATION_CHILDREN: NavItem[] = [
  { to: '/dashboard/email-templates', label: 'Mẫu email', icon: Mail },
  { to: '/dashboard/flows', label: 'Flows', icon: Workflow },
  { to: '/dashboard/flows-history', label: 'Lịch sử gửi', icon: History },
]

const NAV_FOOTER_ITEMS: NavItem[] = [
  { to: '/dashboard/settings', label: 'Cài đặt site', icon: Settings, adminOnly: true },
]

export function Sidebar() {
  const sidebarMini = useUiStore((s) => s.sidebarMini)
  const toggle = useUiStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAdmin = user?.role === 'admin'
  const [programOpen, setProgramOpen] = useState(true)
  const [automationOpen, setAutomationOpen] = useState(true)

  const width = sidebarMini ? 'w-[66px]' : 'w-[272px]'

  return (
    <aside
      className={`${width} shrink-0 h-screen sticky top-0 bg-white border-r border-[#E5E7EB] flex flex-col transition-[width] duration-200`}
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-[#E5E7EB]">
        <div className="w-9 h-9 rounded-lg bg-[#1A4D6B] text-white flex items-center justify-center font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          N
        </div>
        {!sidebarMini && (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#111827] leading-tight">Nedu CMS</div>
            <div className="text-[11px] text-[#6B7280] truncate">cms.nedu.vn</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_MAIN.map((item) => (
          <NavRow key={item.label} item={item} mini={sidebarMini} />
        ))}

        {/* Group: Chương trình */}
        {!sidebarMini ? (
          <div>
            <button
              onClick={() => setProgramOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-[#6B7280] hover:text-[#111827]"
            >
              <span>Chương trình</span>
              {programOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {programOpen && (
              <div>
                {NAV_PROGRAM_CHILDREN.map((item) => (
                  <NavRow key={item.label} item={item} mini={false} indent />
                ))}
              </div>
            )}
          </div>
        ) : (
          NAV_PROGRAM_CHILDREN.map((item) => <NavRow key={item.label} item={item} mini />)
        )}

        {NAV_AFTER_PROGRAM.filter((i) => !i.adminOnly || isAdmin).map((item) => (
          <NavRow key={item.label} item={item} mini={sidebarMini} />
        ))}

        {/* Group: Tự động hoá (admin-only) */}
        {isAdmin &&
          (!sidebarMini ? (
            <div>
              <button
                onClick={() => setAutomationOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-[#6B7280] hover:text-[#111827]"
              >
                <span>Tự động hoá</span>
                {automationOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {automationOpen && (
                <div>
                  {NAV_AUTOMATION_CHILDREN.map((item) => (
                    <NavRow key={item.label} item={item} mini={false} indent />
                  ))}
                </div>
              )}
            </div>
          ) : (
            NAV_AUTOMATION_CHILDREN.map((item) => <NavRow key={item.label} item={item} mini />)
          ))}

        {NAV_FOOTER_ITEMS.filter((i) => !i.adminOnly || isAdmin).map((item) => (
          <NavRow key={item.label} item={item} mini={sidebarMini} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E5E7EB] p-3">
        {!sidebarMini && user && (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#E0EFF5] text-[#1A4D6B] flex items-center justify-center text-sm font-semibold overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || user.email} className="w-full h-full object-cover" />
              ) : (
                // Fallback chữ cái đầu — defensive với name/email undefined
                ((user.name || user.email || 'U').charAt(0).toUpperCase())
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-[#111827] truncate">
                {user.name || user.email || 'Người dùng'}
              </div>
              <div className="text-[10px] text-[#6B7280] capitalize">{user.role === 'admin' ? 'Quản trị viên' : 'Biên tập viên'}</div>
            </div>
          </div>
        )}

        <button
          onClick={() => void logout()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEE2E2] rounded-md transition"
          title="Đăng xuất"
        >
          <LogOut size={16} />
          {!sidebarMini && <span>Đăng xuất</span>}
        </button>

        <button
          onClick={toggle}
          className="w-full mt-2 flex items-center justify-center px-3 py-2 text-[#6B7280] hover:bg-[#F7F8FA] rounded-md transition"
          aria-label={sidebarMini ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {sidebarMini ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}

function NavRow({ item, mini, indent = false }: { item: NavItem; mini: boolean; indent?: boolean }) {
  const Icon = item.icon
  const disabled = item.soon || !item.to

  const content = (
    <>
      <Icon size={16} className="shrink-0" style={item.accent ? { color: item.accent } : undefined} />
      {!mini && (
        <span className="flex-1 truncate text-left">{item.label}</span>
      )}
      {!mini && item.soon && <SoonBadge />}
    </>
  )

  const baseClass = `flex items-center gap-2 px-4 py-2 text-sm transition rounded-none ${indent && !mini ? 'pl-8' : ''}`

  if (disabled) {
    return (
      <div
        className={`${baseClass} text-[#9CA3AF] cursor-not-allowed select-none`}
        title={item.soon ? 'Sắp ra' : undefined}
      >
        {content}
      </div>
    )
  }

  return (
    <NavLink
      to={item.to!}
      className={({ isActive }) =>
        `${baseClass} ${
          isActive
            ? 'bg-[#E0EFF5] text-[#1F5374] font-medium border-l-2 border-[#2D6A8C]'
            : 'text-[#374151] hover:bg-[#F7F8FA] border-l-2 border-transparent'
        }`
      }
      title={mini ? item.label : undefined}
    >
      {content}
    </NavLink>
  )
}
