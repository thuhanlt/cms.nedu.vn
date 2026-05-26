import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const acceptTokens = useAuthStore((s) => s.acceptTokens)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (!access_token || !refresh_token) {
      setError('Không tìm thấy token trong callback')
      const t = setTimeout(() => navigate('/login', { replace: true }), 1500)
      return () => clearTimeout(t)
    }

    acceptTokens({ access_token, refresh_token })
      .then(() => navigate('/dashboard/overview', { replace: true }))
      .catch(() => {
        setError('Xác thực thất bại')
        setTimeout(() => navigate('/login', { replace: true }), 1500)
      })
  }, [acceptTokens, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#1A4D6B] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#6B7280]">{error ?? 'Đang đăng nhập...'}</p>
      </div>
    </div>
  )
}
