// ─────────────────────────────────────────────────────────────────────────────
// CMS Course types — ăn khớp CourseCmsResponse (BE) + shape gần CourseContent
// (render contract của CourseRealPreview).
//
// Sub-types nội dung (Hero, Outcome, Instructor, Reviews, Sidebar, CourseCard)
// REUSE thẳng từ ../preview/courseContent.schema để không drift khỏi nedu.vn.
// Riêng curriculum CMS dùng naming BE (week / duration_label) — preview Module
// dùng num / meta nên cần mapper (xem CourseEditorPage.draftToCourseContent).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CourseCard,
  Hero,
  Sidebar,
  Outcome,
  Instructor,
  Reviews,
} from '../preview/courseContent.schema'

export type {
  CourseCard,
  Hero,
  HeroBadge,
  HeroBadgeVariant,
  HeroMeta,
  Sidebar,
  Outcome,
  OutcomeIcon,
  Instructor,
  CareerBullet,
  Achievement,
  Reviews,
  Review,
} from '../preview/courseContent.schema'

export type CourseLearningType = 'cohort' | 'on_demand' | 'coaching'
export type CourseDelivery = 'online' | 'offline' | 'hybrid'
export type CourseStatus = 'draft' | 'published' | 'archived'

/** Curriculum item — naming BE (week + duration_label). Preview cần map num/meta. */
export interface CurriculumItem {
  week: number
  title: string
  duration_label: string
  topics: string[]
}

/**
 * CourseEditableContent — nội dung khoá lưu trong cột `metadata` (jsonb) phía BE.
 * Shape khớp CourseCmsResponse.metadata (snake_case). Map gần CourseContent —
 * curriculum khác naming, còn lại 1:1.
 */
export interface CourseEditableContent {
  content_published: boolean
  test_widget_enabled: boolean
  hero: Hero
  card: CourseCard
  sidebar: Sidebar
  outcomes: Outcome[]
  curriculum: CurriculumItem[]
  instructor: Instructor
  co_instructors: Instructor[]
  reviews: Reviews
}

/** CMS Course — flat view của CourseCmsResponse mà editor/list dùng. */
export interface Course {
  id: string
  code: string
  slug: string
  name: string
  short_label: string
  tagline: string
  description: string
  learning_type: CourseLearningType
  delivery: CourseDelivery
  cover_image_url: string
  status: CourseStatus
  is_public: boolean
  /** Derive từ is_public — convenience cho UI list/toolbar. */
  published: boolean
  content: CourseEditableContent
  updatedAt: string
}

// ─── Course runs (đa run / cohort) ───────────────────────────────────────────

// Run status — KHỚP BE course-runs-cms.dto.ts RUN_STATUSES (@IsIn). Default 'planned'.
export type RunStatus =
  | 'planned'
  | 'enrollment_open'
  | 'enrollment_closed'
  | 'running'
  | 'completed'
  | 'cancelled'
export type RunDeliveryMode = 'online' | 'offline' | 'hybrid'
export type DepositType = 'none' | 'fixed' | 'percent'

/** CourseRun — khớp CourseRunCmsResponse (snake_case, flat). */
export interface CourseRun {
  id: string
  course_id: string
  code: string
  run_no: number
  label: string
  start_date: string | null
  end_date: string | null
  enrollment_open_at: string | null
  enrollment_close_at: string | null
  delivery_mode: RunDeliveryMode
  venue: string
  capacity: number | null
  enrolled_count: number
  status: RunStatus
  base_price_vnd: number
  currency: string
  deposit_type: DepositType
  deposit_value: number
  balance_due_days: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type CourseRunDraft = Pick<
  CourseRun,
  | 'label'
  | 'start_date'
  | 'end_date'
  | 'enrollment_open_at'
  | 'enrollment_close_at'
  | 'delivery_mode'
  | 'venue'
  | 'capacity'
  | 'status'
  | 'base_price_vnd'
  | 'currency'
  | 'deposit_type'
  | 'deposit_value'
  | 'balance_due_days'
>

// ─── Factory: content rỗng (dùng khi BE metadata thiếu field) ─────────────────

export function emptyCourseContent(): CourseEditableContent {
  return {
    content_published: false,
    test_widget_enabled: true,
    hero: { title: '', subtitle: '', badges: [], meta: [] },
    card: {
      name: '',
      type_label: '',
      type_tag: 'khoa-hoc-theo-nhom',
      format_label: '',
      schedule_label: '',
      short_description: '',
      image: '',
      instructor_short: '',
    },
    sidebar: { price_label: '', checklist: [] },
    outcomes: [],
    curriculum: [],
    instructor: { name: '', title: '', initial: '', tags: [], bio: '' },
    co_instructors: [],
    reviews: { rating_overall: 5, rating_count: 0, items: [] },
  }
}

export const LEARNING_TYPE_LABEL: Record<CourseLearningType, string> = {
  cohort: 'Theo nhóm',
  on_demand: 'Tự học',
  coaching: 'Cố vấn 1:1',
}

export const STATUS_LABEL: Record<CourseStatus, string> = {
  draft: 'Nháp',
  published: 'Đã đăng',
  archived: 'Đã lưu trữ',
}
