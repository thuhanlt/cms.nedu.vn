import type { ContentStatus } from '@shared/types'

export interface Lesson {
  id: string
  course: string
  title: string
  cohort?: string
  videoUrl?: string
  status: ContentStatus
  orderIndex: number
}
