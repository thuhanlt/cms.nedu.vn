import type { ContentStatus } from '@shared/types'

export interface Review {
  id: string
  student: string
  cohort?: string
  course?: string
  rating: number
  month?: string
  featured: boolean
  status: ContentStatus
}
