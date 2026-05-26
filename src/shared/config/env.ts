function readString(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function readOptionalString(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function readBool(raw: unknown, fallback: boolean): boolean {
  if (typeof raw !== 'string') return fallback
  const v = raw.trim().toLowerCase()
  if (v === 'true' || v === '1' || v === 'yes') return true
  if (v === 'false' || v === '0' || v === 'no') return false
  return fallback
}

const rawApi = import.meta.env.VITE_API_URL
const rawAuth = import.meta.env.VITE_AUTH_CENTRAL_URL
const rawMock = import.meta.env.VITE_ENABLE_MOCKING

/**
 * Defensive defaults: nếu env var không được set trên Vercel/CF, ưu tiên mock mode
 * để tránh trang trắng do API call vào URL rỗng.
 */
const enableMocking = readBool(rawMock, true)

export const env = {
  VITE_API_URL: readString(rawApi, 'http://localhost:8080'),
  VITE_AUTH_CENTRAL_URL: readString(rawAuth, 'https://iam.nedu.vn'),
  VITE_ENABLE_MOCKING: enableMocking,
  VITE_GA4_ID: readOptionalString(import.meta.env.VITE_GA4_ID),
  VITE_CLARITY_ID: readOptionalString(import.meta.env.VITE_CLARITY_ID),
} as const

export const IS_MOCK = env.VITE_ENABLE_MOCKING

/** Cảnh báo dev nếu env thiếu — chỉ log, không throw. */
if (import.meta.env.DEV) {
  if (!rawApi) console.warn('[env] VITE_API_URL chưa set — fallback localhost:8080')
  if (!rawAuth) console.warn('[env] VITE_AUTH_CENTRAL_URL chưa set — fallback iam.nedu.vn')
  if (rawMock === undefined) console.warn('[env] VITE_ENABLE_MOCKING chưa set — mặc định true (mock)')
}
