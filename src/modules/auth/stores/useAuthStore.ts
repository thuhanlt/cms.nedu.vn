import { create } from 'zustand'
import { api } from '@shared/config/api-client'
import { IS_MOCK } from '@shared/config/env'
import { tokenStorage, type TokenPair } from '@shared/config/token-storage'
import { redirectToGoogleLogin, logout as authCentralLogout } from '@shared/config/auth-central-client'
import { onAuthExpired } from '@shared/config/api-client'
import type { AuthUser } from '@shared/types'

const DEFAULT_MOCK_UID = 'admin-1'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  loginWithGoogle: () => void
  acceptTokens: (tokens: TokenPair) => Promise<void>
  switchMockUser: (uid: string) => Promise<void>
  logout: () => Promise<void>
}

async function fetchMe(): Promise<AuthUser | null> {
  try {
    return await api.get<AuthUser>('/auth/me')
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  onAuthExpired(() => {
    tokenStorage.clear()
    set({ user: null, isLoading: false })
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  })

  return {
    user: null,
    isLoading: true,
    initialized: false,

    initialize: async () => {
      if (get().initialized) return
      set({ isLoading: true })

      if (IS_MOCK) {
        if (typeof window !== 'undefined' && !localStorage.getItem('mock_uid')) {
          localStorage.setItem('mock_uid', DEFAULT_MOCK_UID)
        }
        const user = await fetchMe()
        set({ user, isLoading: false, initialized: true })
        return
      }

      const access = tokenStorage.getAccess()
      if (!access) {
        set({ user: null, isLoading: false, initialized: true })
        return
      }
      const user = await fetchMe()
      set({ user, isLoading: false, initialized: true })
    },

    loginWithGoogle: () => {
      if (IS_MOCK) {
        // Trong mock: bypass Google, set mock_uid + reload sang dashboard
        if (typeof window !== 'undefined') {
          if (!localStorage.getItem('mock_uid')) localStorage.setItem('mock_uid', DEFAULT_MOCK_UID)
          window.location.assign('/dashboard/overview')
        }
        return
      }
      redirectToGoogleLogin('/auth-callback')
    },

    acceptTokens: async (tokens) => {
      tokenStorage.set(tokens)
      set({ isLoading: true })
      const user = await fetchMe()
      set({ user, isLoading: false, initialized: true })
    },

    switchMockUser: async (uid) => {
      if (typeof window !== 'undefined') localStorage.setItem('mock_uid', uid)
      set({ isLoading: true })
      const user = await fetchMe()
      set({ user, isLoading: false })
    },

    logout: async () => {
      if (!IS_MOCK) {
        await authCentralLogout()
      } else {
        if (typeof window !== 'undefined') localStorage.removeItem('mock_uid')
      }
      tokenStorage.clear()
      set({ user: null, isLoading: false })
      if (typeof window !== 'undefined') window.location.assign('/login')
    },
  }
})
