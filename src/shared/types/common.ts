export type ContentStatus = 'published' | 'draft'

export type UserRole = 'editor' | 'admin'

// Shape khớp với nedu-backend GET /api/cms/me (snake_case outbound — xem
// nedu-backend/src/modules/cms/cms.controller.ts CmsMeDto).
export interface AuthUser {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  role: UserRole
}

export interface Paginated<T> {
  data: T[]
  meta: { page: number; limit: number; total: number }
}

export interface Envelope<T> {
  data: T
}

export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error: string
}
