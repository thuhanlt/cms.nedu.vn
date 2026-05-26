import { useAuthStore } from '../stores/useAuthStore'
import { IS_MOCK } from '@shared/config/env'

export function LoginPage() {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const switchMockUser = useAuthStore((s) => s.switchMockUser)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A4D6B] text-white font-bold text-xl mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            N
          </div>
          <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Nedu CMS
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">cms.nedu.vn — Trang quản trị nội dung</p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F7F8FA] text-[#111827] font-medium transition"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.95v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.04l3.02-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .95 4.96L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {IS_MOCK ? 'Vào CMS (mock)' : 'Đăng nhập với Google'}
        </button>

        {IS_MOCK && (
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280] mb-2">Chế độ thử (data giả) — đổi vai trò:</p>
            <div className="flex gap-2">
              <button
                onClick={() => switchMockUser('admin-1')}
                className="flex-1 text-xs px-3 py-2 rounded border border-[#D1D5DB] hover:bg-[#F7F8FA]"
              >
                Quản trị viên
              </button>
              <button
                onClick={() => switchMockUser('editor-1')}
                className="flex-1 text-xs px-3 py-2 rounded border border-[#D1D5DB] hover:bg-[#F7F8FA]"
              >
                Biên tập viên
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-[#9CA3AF] text-center mt-6">
          Chỉ tài khoản đã được cấp quyền ở IAM (iam.nedu.vn) mới truy cập được.
        </p>
      </div>
    </div>
  )
}
