import type { ContentStatus } from '@shared/types'

export type AlumniType = 'spotlight' | 'event' | 'job'

export interface Alumni {
  id: string
  title: string
  quote?: string
  type: AlumniType
  status: ContentStatus
  updatedAt: string
}
