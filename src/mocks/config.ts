import { HttpResponse, type JsonBodyType } from 'msw'
import { MOCK_USERS, DEFAULT_MOCK_UID } from './data/users'

export const MOCK_UID_KEY = 'mock_uid'

export function unauthorized(message = 'Unauthorized') {
  return HttpResponse.json({ statusCode: 401, message, error: 'Unauthorized' }, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return HttpResponse.json({ statusCode: 403, message, error: 'Forbidden' }, { status: 403 })
}

export function notFound(message = 'Not found') {
  return HttpResponse.json({ statusCode: 404, message, error: 'Not Found' }, { status: 404 })
}

export function badRequest(message: string | string[] = 'Bad request') {
  return HttpResponse.json({ statusCode: 400, message, error: 'Bad Request' }, { status: 400 })
}

export function serverError(message = 'Internal Server Error') {
  return HttpResponse.json({ statusCode: 500, message, error: 'Internal Server Error' }, { status: 500 })
}

export function ok<T extends JsonBodyType>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data }, init)
}

export function okRaw<T extends JsonBodyType>(body: T, init?: ResponseInit) {
  return HttpResponse.json(body, init)
}

export function created<T extends JsonBodyType>(data: T) {
  return HttpResponse.json({ data }, { status: 201 })
}

export function noContent() {
  return new HttpResponse(null, { status: 204 })
}

export function getCurrentMockUserId(): string {
  if (typeof window === 'undefined') return DEFAULT_MOCK_UID
  return localStorage.getItem(MOCK_UID_KEY) ?? DEFAULT_MOCK_UID
}

export function getCurrentMockUser() {
  return MOCK_USERS[getCurrentMockUserId()] ?? null
}

/**
 * Resolve current mock user id từ request.
 * Ưu tiên Bearer token (`mock_access_<uid>`) → SSE query token → fallback localStorage.
 * Trả null nếu không xác định được — handler nên unauthorized().
 */
export function resolveMockUidFromRequest(request: Request): string | null {
  const auth = request.headers.get('Authorization') ?? ''
  const bearer = /^Bearer\s+mock_access_(.+)$/.exec(auth)
  if (bearer) return bearer[1]

  const url = new URL(request.url)
  const tokenParam = url.searchParams.get('token')
  if (tokenParam) {
    const m = /^mock_access_(.+)$/.exec(tokenParam)
    if (m) return m[1]
  }

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(MOCK_UID_KEY)
  }
  return null
}
