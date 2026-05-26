import { env } from './env'
import { tokenStorage } from './token-storage'
import { refreshTokens } from './auth-central-client'

const API_BASE = `${env.VITE_API_URL.replace(/\/$/, '')}/api`

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type Listener = () => void
const authExpiredListeners = new Set<Listener>()
export function onAuthExpired(fn: Listener): () => void {
  authExpiredListeners.add(fn)
  return () => authExpiredListeners.delete(fn)
}
function notifyAuthExpired() {
  authExpiredListeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* listener should not throw */
    }
  })
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface RequestOptions {
  signal?: AbortSignal
  headers?: Record<string, string>
  rawResponse?: boolean
}

async function buildHeaders(extra?: Record<string, string>, hasBody = false): Promise<HeadersInit> {
  const headers: Record<string, string> = { Accept: 'application/json', ...(extra ?? {}) }
  const access = tokenStorage.getAccess()
  if (access) headers.Authorization = `Bearer ${access}`
  if (hasBody && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  return headers
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  unwrap = true,
  options: RequestOptions = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const exec = async (retry: boolean): Promise<T> => {
    const headers = await buildHeaders(options.headers, !!body && !isFormData)
    const res = await fetch(url, {
      method,
      headers,
      body: body == null ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: options.signal,
    })

    if (res.status === 401 && retry) {
      const newAccess = await refreshTokens()
      if (newAccess) return exec(false)
      notifyAuthExpired()
      throw new ApiError(401, 'Phiên đăng nhập đã hết hạn', 'AUTH_EXPIRED')
    }

    const parsed = await parseBody(res)
    if (!res.ok) {
      const err = (parsed ?? {}) as { statusCode?: number; message?: string | string[]; error?: string }
      const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message ?? `HTTP ${res.status}`
      throw new ApiError(res.status, msg, err.error, parsed)
    }

    if (!unwrap) return parsed as T
    if (parsed && typeof parsed === 'object' && 'data' in (parsed as Record<string, unknown>)) {
      return (parsed as { data: T }).data
    }
    return parsed as T
  }

  return exec(true)
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, true, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body, true, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, body, true, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, body, true, options),
  delete: (path: string, options?: RequestOptions) => request<void>('DELETE', path, undefined, true, options),
  /** Trả nguyên envelope { data, meta } cho list paginated */
  getRaw: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, false, options),
  postRaw: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body, false, options),
}
