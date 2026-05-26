export type ChallengeStatus = 'open' | 'upcoming' | 'closed'

export interface Outcome {
  icon: string
  title: string
  desc: string
}

export interface CurriculumWeek {
  title: string
  topics: string[]
}

export interface Instructor {
  name: string
  avatarLetter: string
  avatarUrl: string
  title: string
  bio: string
  tags: string[]
  highlights: string[]
}

export interface ChallengeReview {
  avatarLetter: string
  avatarUrl: string
  name: string
  role: string
  topic: string
  text: string
}

export interface ChallengeFaq {
  q: string
  a: string
}

export interface Plan {
  price: string
  saving?: string
  note?: string
  benefits: string[]
}

export interface ChallengeContent {
  countdown: { enabled: boolean }
  heroImg: string
  heroImgMobile: string
  subs: { outcomes: string; curriculum: string; instructor: string }
  outcomes: Outcome[]
  curriculum: CurriculumWeek[]
  instructor: Instructor
  reviews: ChallengeReview[]
  faqs: ChallengeFaq[]
  plans: { monthly: Plan; yearly: Plan }
}

export interface Challenge {
  id: string
  slug?: string
  name: string
  status: ChallengeStatus
  published: boolean
  startDate?: string
  priceMonthly?: string
  priceYearly?: string
  content: ChallengeContent
  updatedAt: string
}
