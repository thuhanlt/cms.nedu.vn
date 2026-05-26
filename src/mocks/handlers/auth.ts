import { http } from 'msw'
import { ok, unauthorized } from '../config'
import { MOCK_USERS, DEFAULT_MOCK_UID } from '../data/users'

export const authHandlers = [
  http.get('*/api/auth/me', () => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('mock_uid') ?? DEFAULT_MOCK_UID : DEFAULT_MOCK_UID
    const user = MOCK_USERS[uid]
    if (!user) return unauthorized('Mock user not found')
    return ok(user)
  }),
]
