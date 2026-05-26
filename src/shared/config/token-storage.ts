const ACCESS_KEY = 'nlh_access_token'
const REFRESH_KEY = 'nlh_refresh_token'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export const tokenStorage = {
  getAccess(): string | null {
    try {
      return localStorage.getItem(ACCESS_KEY)
    } catch {
      return null
    }
  },
  getRefresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY)
    } catch {
      return null
    }
  },
  set(tokens: TokenPair) {
    try {
      localStorage.setItem(ACCESS_KEY, tokens.access_token)
      localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
    } catch {
      /* storage unavailable */
    }
  },
  setAccess(access: string) {
    try {
      localStorage.setItem(ACCESS_KEY, access)
    } catch {
      /* storage unavailable */
    }
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)
    } catch {
      /* storage unavailable */
    }
  },
}
