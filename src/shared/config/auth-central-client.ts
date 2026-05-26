import { env } from './env'
import { tokenStorage, type TokenPair } from './token-storage'

const base = () => env.VITE_AUTH_CENTRAL_URL.replace(/\/$/, '')

/**
 * Redirect đến trang Google OAuth của IAM Central Auth (iam.nedu.vn).
 * Sau khi user consent, IAM redirect về /auth-callback#access_token=...&refresh_token=...
 */
export function redirectToGoogleLogin(returnTo: string = '/auth-callback') {
  const url = new URL(`${base()}/auth/oauth/google`)
  const absolute = new URL(returnTo, window.location.origin).toString()
  url.searchParams.set('return_to', absolute)
  window.location.assign(url.toString())
}

/**
 * Dedupe in-flight refresh. Trả về access mới hoặc null nếu fail.
 */
let inflight: Promise<string | null> | null = null
export function refreshTokens(): Promise<string | null> {
  if (inflight) return inflight
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return Promise.resolve(null)

  inflight = (async () => {
    try {
      const res = await fetch(`${base()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      })
      if (!res.ok) {
        tokenStorage.clear()
        return null
      }
      const body = (await res.json()) as Partial<TokenPair>
      if (!body.access_token || !body.refresh_token) {
        tokenStorage.clear()
        return null
      }
      tokenStorage.set({ access_token: body.access_token, refresh_token: body.refresh_token })
      return body.access_token
    } catch {
      tokenStorage.clear()
      return null
    } finally {
      inflight = null
    }
  })()
  return inflight
}

export async function logout(): Promise<void> {
  const access = tokenStorage.getAccess()
  try {
    if (access) {
      await fetch(`${base()}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${access}` },
      })
    }
  } catch {
    /* swallow — vẫn clear local */
  } finally {
    tokenStorage.clear()
  }
}
