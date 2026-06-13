export type CourseType = 'retreat' | 'online' | 'offline' | 'hybrid'
export type CourseFormat = '' | 'offline' | 'online' | 'hybrid'

export interface Badge {
  value: string
  auto: boolean
}

export interface Outcome {
  icon: string
  title: string
  desc: string
}

export interface CurriculumModule {
  title: string
  meta: string
  /** Mỗi dòng = 1 bullet. UI tách bằng \n. */
  topics: string
}

export interface Instructor {
  name: string
  title: string
  avatarUrl: string
  /** Ngăn cách bằng dấu phẩy. */
  tags: string
  intro: string
  education: string
  career: string
  awards: string
}

export interface CourseReview {
  name: string
  cohort: string
  text: string
  avatarUrl: string
}

export interface CourseFaq {
  q: string
  a: string
}

export type PromoTab = 'discount' | 'gift'

export interface PromoData {
  enabled: boolean
  startDate: string
  endDate: string
  tab: PromoTab
  /** Tab "discount" */
  priceOriginal: string
  priceFinal: string
  bonusCourse: string
  discountDesc: string
  /** Tab "gift" */
  giftTitle: string
  /** Ngăn cách bằng | */
  merchList: string
  giftDesc: string
}

export interface PriceData {
  label: string
  /** Auto-derive label từ tên khoá khi true. */
  labelAuto: boolean
  price: string
  note: string
  urgency: string
  features: string[]
  promo: PromoData
}

export interface CourseContent {
  /** 01 — Banner */
  heroDesktop: string
  heroMobile: string
  badges: { b1: Badge; b2: Badge; b3: string }
  /** 02 — Hero */
  subTitle: string
  type: CourseType
  format: CourseFormat
  startDate: string
  endDate: string
  /** 03 — Test widget */
  testWidgetEnabled: boolean
  /** 04 — Outcomes */
  outcomesTitle: string
  outcomesSub: string
  outcomes: Outcome[]
  /** 05 — Curriculum */
  curriculumTitle: string
  curriculumSub: string
  curriculum: CurriculumModule[]
  /** 06 — Instructors */
  instructorsTitle: string
  instructorsSub: string
  instructors: Instructor[]
  /** 07 — Reviews */
  reviewsSub: string
  reviews: CourseReview[]
  /** 08 — Price + Promo */
  pricing: PriceData
  /** 09 — Q&A */
  qaTitle: string
  qa: CourseFaq[]
}

export interface Course {
  id: string
  slug?: string
  name: string
  published: boolean
  content: CourseContent
  updatedAt: string
}

export const MERCH_PRESETS = [
  'Áo thun N·Edu',
  'Túi tote canvas',
  'Sổ tay hành trình',
  'Sticker bộ 6',
  'Postcard cảm hứng',
  'Bookmark N·Edu',
  'Pin cài áo',
  'Ly giữ nhiệt',
]
