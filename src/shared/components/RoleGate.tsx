import type { ReactNode } from 'react'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import type { UserRole } from '@shared/types'

interface RoleGateProps {
  allow: UserRole | UserRole[]
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGate({ allow, fallback = null, children }: RoleGateProps) {
  const user = useAuthStore((s) => s.user)
  const allowed = Array.isArray(allow) ? allow : [allow]
  if (!user || !allowed.includes(user.role)) return <>{fallback}</>
  return <>{children}</>
}
