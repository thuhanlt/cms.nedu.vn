import type { AuthUser } from '@shared/types'

export const MOCK_USERS: Record<string, AuthUser> = {
  'admin-1': {
    id: 'admin-1',
    name: 'NhiLe Admin',
    email: 'admin@nedu.vn',
    role: 'admin',
  },
  'editor-1': {
    id: 'editor-1',
    name: 'Biên tập viên Nedu',
    email: 'editor@nedu.vn',
    role: 'editor',
  },
}

export const DEFAULT_MOCK_UID = 'admin-1'
