import type { ContentStatus } from '@shared/types'

export interface PersonaProblem {
  id?: string
  title: string
  description?: string
  courseSlug?: string
  urgency?: string
}

export interface Persona {
  id: string
  name: string
  icon?: string
  instruction?: string
  status: ContentStatus
  problems: PersonaProblem[]
}

export const MAX_PERSONAS = 9
export const MAX_PROBLEMS_PER_PERSONA = 8
