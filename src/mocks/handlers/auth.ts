import { http } from 'msw'
import { ok, unauthorized, resolveMockUidFromRequest } from '../config'
import { MOCK_USERS, DEFAULT_MOCK_UID } from '../data/users'

// Mock handler cho /api/cms/me — endpoint thật ở nedu-backend src/modules/cms/cms.controller.ts.
// Đồng thời giữ /api/auth/me cho backward compat (nếu nơi khác trong CMS portal còn gọi).
const meHandler = ({ request }: { request: Request }) => {
  const uid = resolveMockUidFromRequest(request) ?? DEFAULT_MOCK_UID
  const user = MOCK_USERS[uid]
  if (!user) return unauthorized('Mock user not found')
  return ok(user)
}

export const authHandlers = [
  http.get('*/api/cms/me', meHandler),
  http.get('*/api/auth/me', meHandler),
]
