import { useEffect } from 'react'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

/** Run app-wide initialization once on mount. */
export function AppInit() {
  const initialize = useAuthStore((s) => s.initialize)
  useEffect(() => {
    void initialize()
  }, [initialize])
  return null
}
