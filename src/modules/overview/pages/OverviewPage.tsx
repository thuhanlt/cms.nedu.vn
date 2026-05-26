import { Trophy, FileText, BookOpen, Award, Star, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

interface StatCard {
  label: string
  to: string
  icon: typeof Trophy
  color: string
}

const CARDS: StatCard[] = [
  { label: 'Thử thách', to: '/dashboard/challenges', icon: Trophy, color: '#F5B419' },
  { label: 'Bài viết', to: '/dashboard/articles', icon: FileText, color: '#2D6A8C' },
  { label: 'Bài học', to: '/dashboard/lessons', icon: BookOpen, color: '#15803D' },
  { label: 'Alumni', to: '/dashboard/alumni', icon: Award, color: '#B45309' },
  { label: 'Đánh giá', to: '/dashboard/reviews', icon: Star, color: '#EA580C' },
  { label: 'FAQ', to: '/dashboard/faqs', icon: HelpCircle, color: '#6B7280' },
]

export function OverviewPage() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Xin chào, {user?.name ?? 'bạn'}
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Trang quản trị nội dung Nedu — chọn nội dung cần biên tập ở menu bên trái.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((c) => {
          const Icon = c.icon
          return (
            <Link
              key={c.label}
              to={c.to}
              className="group bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${c.color}1A`, color: c.color }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#111827] group-hover:text-[#1F5374]">
                    {c.label}
                  </div>
                  <div className="text-xs text-[#6B7280]">Quản lý nội dung</div>
                </div>
              </div>
            </Link>
          )
        })}
      </section>

      <p className="text-xs text-[#9CA3AF] mt-8">
        Đang chạy ở chế độ data giả (MSW mock). Khi backend sẵn sàng, đổi <code className="px-1 py-0.5 bg-[#E5E7EB] rounded">VITE_ENABLE_MOCKING=false</code> trong file <code>.env</code>.
      </p>
    </div>
  )
}
