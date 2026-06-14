// ─────────────────────────────────────────────────────────────────────────────
// CourseContent schema — render contract cho CourseRealPreview.
//
// COPY VERBATIM (chỉ giữ type) từ nedu.vn `lib/content/schema.ts`. Đây là shape
// trang chi tiết khoá học THẬT của nedu.vn. CourseRealPreview render theo shape
// này để CMS hiển thị trước đúng như trang thật.
//
// KHÔNG sửa shape này lệch khỏi nedu.vn — nếu nedu.vn đổi schema thì sync lại.
// ─────────────────────────────────────────────────────────────────────────────

/** Icon cho mỗi "outcome" ở section "Bạn sẽ học được gì". Map sang SVG ở component. */
export type OutcomeIcon =
  | 'check'
  | 'chart'
  | 'clock'
  | 'users'
  | 'heart'
  | 'target'

/** Loại khoá — filter ở trang listing nedu.vn. */
export type CourseTypeTag =
  | 'khoa-hoc-theo-nhom'
  | 'tu-hoc-theo-lo-trinh'
  | 'khoa-hoc-chuyen-sau'
  | 'co-van-ca-nhan'
  | 'khoa-hoc-thuc-chien'

/** Variant badge ở hero — 3 màu fixed. */
export type HeroBadgeVariant = 'amber' | 'open' | 'red'

/** Trạng thái enrollment. */
export type CourseStatus = 'open' | 'closed' | 'coming_soon'

// ─── Sub-shapes ──────────────────────────────────────────────────────────────

export interface Outcome {
  icon: OutcomeIcon
  title: string
  desc: string
}

export interface Module {
  num: string
  title: string
  meta: string
  topics: string[]
}

export interface Achievement {
  date: string
  text: string
}

export interface CareerBullet {
  label: string
  desc: string
}

export interface Instructor {
  name: string
  title: string
  initial: string
  /** URL ảnh đại diện — KEY CONTRACT (CMS metadata DTO). Editor ghi field này;
   *  nedu.vn `beDetailToContent` map sang `photo_url` để render. */
  avatar_url?: string
  /** URL ảnh đại diện — KEY RENDER (preview/nedu.vn dùng để hiện `<img>`).
   *  Mapper draftToCourseContent bắc cầu avatar_url → photo_url. */
  photo_url?: string
  tags: string[]
  bio: string
  education?: string
  career_intro?: string
  career_bullets?: CareerBullet[]
  achievements?: Achievement[]
}

export interface Review {
  author: string
  /** URL ảnh — KEY CONTRACT (CMS metadata DTO). Editor ghi field này. */
  avatar_url?: string
  /** URL ảnh — KEY RENDER. Mapper bắc cầu avatar_url → author_photo_url. */
  author_photo_url?: string
  role?: string
  cohort?: string
  rating: number
  title?: string
  body: string
}

export interface Reviews {
  rating_overall: number
  rating_count: number
  items: Review[]
}

// ─── Card (homepage + listing) ───────────────────────────────────────────────

export interface CourseCard {
  name: string
  type_label: string
  type_tag: CourseTypeTag
  format_label: string
  schedule_label: string
  short_description: string
  image: string
  instructor_short: string
}

// ─── Hero (detail page banner) ───────────────────────────────────────────────

export interface HeroBadge {
  label: string
  variant: HeroBadgeVariant
}

export interface HeroMeta {
  label: string
  value: string
}

export interface Hero {
  title: string
  subtitle: string
  badges: HeroBadge[]
  meta: HeroMeta[]
}

// ─── Commerce ────────────────────────────────────────────────────────────────

export interface Commerce {
  /** Giá NET (chưa thuế) theo VND. UI tự cộng VAT để hiển thị giá gross. */
  base_price_vnd_net: number
  /** Override hiển thị giá (ngoại tệ / custom string). Khi có → dùng nguyên văn. */
  display_price_override?: string
  seats_total: number | null
  seats_remaining: number | null
  start_date: string | null
  registration_deadline: string | null
  status: CourseStatus
}

// ─── Sidebar (right column trên detail page) ─────────────────────────────────

export interface Sidebar {
  price_label: string
  checklist: string[]
}

// ─── Top-level CourseContent ─────────────────────────────────────────────────

export interface CourseContent {
  slug: string
  code: string

  /** Bật/tắt block Test widget cá nhân hoá. Default (undefined) = hiển thị. */
  test_widget_enabled?: boolean

  card: CourseCard
  hero: Hero
  commerce: Commerce
  sidebar: Sidebar

  instructor: Instructor

  co_instructors?: Instructor[]

  outcomes?: Outcome[]
  modules?: Module[]
  reviews?: Reviews
}
