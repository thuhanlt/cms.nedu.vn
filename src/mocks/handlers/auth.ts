import { http } from 'msw'
import { ok, unauthorized, resolveMockUidFromRequest } from '../config'
import { MOCK_USERS, DEFAULT_MOCK_UID } from '../data/users'

export const authHandlers = [
  http.get('*/api/auth/me', ({ request }) => {
    const uid = resolveMockUidFromRequest(request) ?? DEFAULT_MOCK_UID
    const user = MOCK_USERS[uid]
    if (!user) return unauthorized('Mock user not found')
    return ok(user)
  }),
]
