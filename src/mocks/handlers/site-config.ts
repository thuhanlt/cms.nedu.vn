import { http } from 'msw'
import { ok, forbidden } from '../config'
import { siteConfig } from '../data/site-config'
import { MOCK_USERS, DEFAULT_MOCK_UID } from '../data/users'
import type { SiteConfig } from '@modules/settings/types/site-config'

// Mirror BE: GET + PATCH /cms/site-config đều admin-only (@CmsAdminOnly).
function requireAdmin(): Response | null {
  const uid =
    typeof window !== 'undefined'
      ? localStorage.getItem('mock_uid') ?? DEFAULT_MOCK_UID
      : DEFAULT_MOCK_UID
  const user = MOCK_USERS[uid]
  if (!user || user.role !== 'admin') {
    return forbidden('Chỉ Quản trị viên cập nhật được thông tin doanh nghiệp')
  }
  return null
}

export const siteConfigHandlers = [
  http.get('*/api/cms/site-config', () => {
    const gate = requireAdmin()
    if (gate) return gate
    return ok(siteConfig.current as unknown as Record<string, unknown>)
  }),

  http.patch('*/api/cms/site-config', async ({ request }) => {
    const gate = requireAdmin()
    if (gate) return gate
    const patch = (await request.json().catch(() => ({}))) as Partial<SiteConfig>
    siteConfig.current = { ...siteConfig.current, ...patch }
    return ok(siteConfig.current as unknown as Record<string, unknown>)
  }),
]
