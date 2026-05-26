import { http } from 'msw'
import { ok, forbidden } from '../config'
import { settings } from '../data/settings'
import { MOCK_USERS, DEFAULT_MOCK_UID } from '../data/users'
import { nowIso } from '../data/_helpers'
import type { SiteSettings } from '@modules/settings/types/settings'

function requireAdmin(): Response | null {
  const uid = typeof window !== 'undefined' ? localStorage.getItem('mock_uid') ?? DEFAULT_MOCK_UID : DEFAULT_MOCK_UID
  const user = MOCK_USERS[uid]
  if (!user || user.role !== 'admin') return forbidden('Chỉ Quản trị viên cập nhật được cài đặt site')
  return null
}

export const settingsHandlers = [
  http.get('*/api/site-settings', () => {
    return ok(settings.current as unknown as Record<string, unknown>)
  }),

  http.patch('*/api/site-settings', async ({ request }) => {
    const gate = requireAdmin()
    if (gate) return gate
    const patch = (await request.json().catch(() => ({}))) as Partial<SiteSettings>
    settings.current = { ...settings.current, ...patch, updatedAt: nowIso() }
    return ok(settings.current as unknown as Record<string, unknown>)
  }),
]
