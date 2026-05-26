export type ContentStatus = 'published' | 'draft'

export type UserRole = 'editor' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
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
