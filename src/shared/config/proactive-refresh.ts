/**
 * Proactive token refresh — schedule rotation TRƯỚC khi access token expire.
 *
 * Vấn đề trước (chỉ reactive 401 retry):
 *   - User click action ngay lúc token expire → extra round-trip refresh +
 *     latency spike
 *   - Tab idle 15+ phút → 1-2 calls fail trước khi reactive kick in
 *
 * Giải pháp (buffer 60s):
 *   - Khi mint token (callback/refresh response), parse JWT.exp
 *   - Schedule setTimeout fire ở `exp - 60s`
 *   - Timer fire → gọi refreshTokens() (dedupe sẵn qua inflight singleton)
 *   - Logout / refresh fail → clear timer
 *
 * Multi-tab: mỗi tab schedule độc lập; race trên localStorage refresh_token
 * rotation worst case = 1 tab dùng token cũ → 401 → reactive refresh recover.
 *
 * Port từ ops.nedu.vn (cùng pattern, cùng auth-central rotate-and-revoke).
 */
import { tokenStorage } from './token-storage'

const REFRESH_BUFFER_MS = 60 * 1000 // 60s trước expire

let scheduledTimer: ReturnType<typeof setTimeout> | null = null
let refreshFn: (() => Promise<string | null>) | null = null

/**
 * Set the refresh function (avoid circular import auth-central-client → proactive-refresh).
 * Gọi 1 lần ở bootstrap (main.tsx).
 */
export function setRefreshFn(fn: () => Promise<string | null>): void {
  refreshFn = fn
}

/**
 * Decode JWT exp claim (unix seconds → ms timestamp).
 * Trả null nếu malformed / no exp.
 */
function getTokenExpiryMs(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    )
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

/**
 * Schedule proactive refresh dựa trên access token hiện tại trong storage.
 * Idempotent — cancel scheduled timer cũ trước khi schedule mới.
 *
 * Nếu token đã expire hoặc near expire (< buffer), fire refresh ngay.
 * No-op nếu không có access token (mock mode không set nlh_access_token).
 */
export function scheduleProactiveRefresh(): void {
  cancelProactiveRefresh()

  const token = tokenStorage.getAccess()
  if (!token) return

  const expiryMs = getTokenExpiryMs(token)
  if (expiryMs === null) {
    // Token không decode được exp (vd mock token) → bỏ qua, reactive 401 vẫn cover.
    return
  }

  const now = Date.now()
  const fireAt = expiryMs - REFRESH_BUFFER_MS
  const delayMs = Math.max(0, fireAt - now)

  scheduledTimer = setTimeout(() => {
    scheduledTimer = null
    if (!refreshFn) {
      // Chỉ xảy ra nếu timer armed trước khi bootstrap inject refreshFn — bug thật.
      console.warn('[proactive-refresh] refreshFn not set — skipping')
      return
    }
    void refreshFn().then((newAccess) => {
      // refreshTokens() đã update tokenStorage + return new access. Re-schedule
      // dựa trên token mới (TTL reset → next fire ~14m sau cho TTL 15m).
      // Nếu refresh fail (returns null) → tokenStorage cleared → no schedule.
      if (newAccess) {
        scheduleProactiveRefresh()
      }
    })
  }, delayMs)
}

/**
 * Cancel scheduled timer. Gọi khi logout hoặc refresh fail (storage cleared).
 */
export function cancelProactiveRefresh(): void {
  if (scheduledTimer !== null) {
    clearTimeout(scheduledTimer)
    scheduledTimer = null
  }
}
