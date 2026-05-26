import type { ContentStatus } from '@shared/types'

export interface Faq {
  id: string
  category: string
  question: string
  answer?: string
  status: ContentStatus
  orderIndex: number
}
