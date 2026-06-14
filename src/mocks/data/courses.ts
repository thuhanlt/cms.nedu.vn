import type {
  CourseEditableContent,
  CourseLearningType,
  CourseDelivery,
  CourseStatus,
  CourseRun,
} from '@modules/courses/types/course'
import { nowIso } from './_helpers'

// ─────────────────────────────────────────────────────────────────────────────
// Mock cho /cms/courses (CourseCmsResponse) + /cms/courses/:id/runs.
// Shape khớp BE: snake_case, metadata = CourseEditableContent inline.
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseRow {
  id: string
  code: string
  slug: string
  name: string
  short_label: string | null
  tagline: string | null
  description: string | null
  delivery_mode: string
  learning_format: string
  learning_type: CourseLearningType
  delivery: CourseDelivery
  segment: string
  status: CourseStatus
  is_public: boolean
  display_order: number
  cover_image_url: string | null
  og_image_url: string | null
  metadata: CourseEditableContent
  created_at: string
  updated_at: string
  archived_at: string | null
}

export function blankCourseContent(): CourseEditableContent {
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

function laChinhMinhContent(): CourseEditableContent {
  return {
    content_published: true,
    test_widget_enabled: true,
    hero: {
      title: 'Là Chính Mình',
      subtitle:
        'Hành trình 3.5 ngày đánh thức sức mạnh nội tại, giúp bạn gỡ bỏ những rào cản tâm lý để sống một cuộc đời rực rỡ và trọn vẹn nhất.',
      badges: [
        { label: 'Khoá học chuyên sâu', variant: 'amber' },
        { label: 'Khoá 05', variant: 'amber' },
        { label: 'Đang mở đăng ký', variant: 'open' },
      ],
      meta: [
        { label: 'Thời lượng', value: '3.5 ngày' },
        { label: 'Hình thức', value: 'Offline · Retreat' },
        { label: 'Khai giảng', value: '27 / 08 / 2026' },
      ],
    },
    card: {
      name: 'Là Chính Mình',
      type_label: 'Khoá học chuyên sâu',
      type_tag: 'khoa-hoc-chuyen-sau',
      format_label: 'Offline',
      schedule_label: 'Tháng 8/2026',
      short_description:
        'Hành trình 3.5 ngày đánh thức sức mạnh nội tại, gỡ rào cản tâm lý để sống rực rỡ.',
      image: '',
      instructor_short: 'NhiLe x Guest Instructors',
    },
    sidebar: {
      price_label: 'Bao gồm ăn ở 3.5 ngày + tài liệu + cộng đồng alumni LCM',
      checklist: [
        'Ăn ở 3.5 ngày tại retreat venue (Đà Nẵng)',
        'Toàn bộ tài liệu khoá học (worksheet, journal)',
        'Buổi 1:1 với mentor 60 phút trong khoá',
        'Tham gia cộng đồng alumni LCM (Zalo + monthly meetup)',
        'Học lại miễn phí ở khoá LCM kế tiếp',
      ],
    },
    outcomes: [
      { icon: 'target', title: 'Hiểu rõ sức mạnh nội tại', desc: 'Nhận diện và đánh thức tiềm năng đang ngủ quên trong chính bạn.' },
      { icon: 'heart', title: 'Gỡ bỏ rào cản tâm lý', desc: 'Xác định và xử lý những niềm tin giới hạn đang chặn bạn lại.' },
      { icon: 'check', title: 'Sống đúng với giá trị thật', desc: 'Tách rời kỳ vọng người khác và biết điều gì thực sự quan trọng với mình.' },
      { icon: 'clock', title: 'Quyết định không lưỡng lự', desc: 'Framework ra quyết định lớn dựa trên la bàn nội tâm rõ ràng.' },
      { icon: 'users', title: 'Cộng đồng alumni đồng hành', desc: 'Kết nối với học viên các kỳ trước — hỗ trợ nhau dài hạn sau khoá.' },
      { icon: 'chart', title: 'Roadmap 90 ngày hành động', desc: 'Rời retreat với kế hoạch cụ thể, không quay về cuộc sống cũ.' },
    ],
    curriculum: [
      {
        week: 1,
        title: 'Ngày 1 · Mở lòng và quan sát',
        duration_label: 'Sáng + chiều · 6h',
        topics: [
          'Phá vỡ khoảng cách — nhóm 60 người, vòng tròn chia sẻ đầu tiên',
          'Bài tập quan sát bản thân — bạn đang ở đâu trong cuộc đời?',
          'Bản đồ cảm xúc trong 30 ngày gần nhất',
          'Câu hỏi nền tảng: Điều gì khiến bạn đến đây hôm nay?',
        ],
      },
      {
        week: 2,
        title: 'Ngày 2 · Soi vào bóng tối',
        duration_label: 'Sáng + chiều + tối · 9h',
        topics: [
          'Khoa học não bộ về niềm tin giới hạn (limiting beliefs)',
          'Truy ngược về nguồn — đâu là gốc của những rào cản hiện tại',
          'Bài tập "ghế nóng" — đối thoại với bản thân qua các vai trò',
          'Đêm yên — viết thư cho phiên bản 5 năm sau của mình',
        ],
      },
      {
        week: 3,
        title: 'Ngày 3 · Tái thiết kế',
        duration_label: 'Sáng + chiều · 8h',
        topics: [
          'Vision board cho 3 vùng đời (sự nghiệp · quan hệ · sức khoẻ)',
          'Habit design từ khoa học thần kinh',
          'Tài chính lành mạnh — câu chuyện về tiền và giá trị',
          'Buổi 1:1 với mentor — feedback cá nhân hoá',
        ],
      },
    ],
    instructor: {
      name: 'Nhi Le',
      title: 'Doanh nhân · Cố vấn tâm lý',
      initial: 'N',
      tags: ['Tâm lý học', 'Coaching', 'Lãnh đạo', 'Retreat facilitator'],
      bio: 'Nhi Le là cố vấn tâm lý và doanh nhân, đồng hành cùng nhiều người Việt trong hành trình hiểu bản thân, xây dựng nội lực và tạo ra thay đổi bền vững.',
      education:
        'Nhi Le có nền tảng học thuật bài bản trong tâm lý học, coaching và lãnh đạo, với các chứng chỉ chuyên môn từ Kaplan Singapore và Singapore Management University (SMU).',
      career_intro:
        'Sinh ra và lớn lên tại Quảng Nam, hiện là mẹ đơn thân sống và làm việc ở nước ngoài, Nhi Le mang đến góc nhìn rất thực tế về tự lập, kỷ luật cá nhân và trách nhiệm với chính cuộc sống của mình.',
      career_bullets: [
        { label: 'Kênh YouTube Nhi Le', desc: 'Kênh tiên phong chia sẻ kiến thức tâm lý học bằng tiếng Việt.' },
        { label: 'Cộng đồng NhiLe Team', desc: 'Đào tạo nghề và kỹ năng cần thiết cho giới trẻ.' },
      ],
      achievements: [
        { date: '2025-04', text: 'Vinh danh với giải thưởng HER Courage Awards 2025.' },
        { date: '2025-08', text: 'Người phụ nữ Việt Nam đầu tiên xuất hiện trên blog chính thức của YouTube toàn cầu.' },
      ],
    },
    co_instructors: [
      {
        name: 'Alex Low',
        title: 'Phong Thuỷ Practitioner · Dahann I-Ching Consultancy',
        initial: 'A',
        tags: ['Phong Thuỷ', 'Tư vấn doanh nghiệp', 'Diễn giả quốc tế'],
        bio: 'Hơn 20 năm thực hành Phong Thuỷ và Kinh Dịch ứng dụng cho doanh nghiệp châu Á.',
      },
    ],
    reviews: {
      rating_overall: 4.9,
      rating_count: 87,
      items: [
        {
          author: 'Minh Châu',
          role: 'Founder, Studio M',
          cohort: 'LCM 04',
          rating: 5,
          title: 'Một quyết định thay đổi cách tôi sống',
          body: '3.5 ngày này là một trong những quyết định tốt nhất tôi từng làm cho chính mình. Rời retreat tôi không cần ai khác xác nhận mình là ai nữa.',
        },
        {
          author: 'Thanh Hà',
          role: 'Product Manager',
          cohort: 'LCM 03',
          rating: 5,
          title: 'Vượt xa mong đợi',
          body: 'Tôi đến với hy vọng "tìm thấy động lực". Rời đi với một khung tư duy mới về chính mình. Khoá học thật sự sâu, không phải self-help bề mặt.',
        },
        {
          author: 'Đức Anh',
          role: 'Tech Lead',
          cohort: 'LCM 04',
          rating: 5,
          body: 'Chưa bao giờ ngồi yên với chính mình 3 ngày liền. Khó, nhưng đáng. Nhi và team facilitator giữ không gian rất an toàn để mình mở lòng.',
        },
        {
          author: 'Lan Phương',
          role: 'Designer',
          cohort: 'LCM 04',
          rating: 5,
          body: 'Một không gian hiếm hoi để thật sự dừng lại và lắng nghe chính mình.',
        },
      ],
    },
  }
}

export const courses: CourseRow[] = [
  {
    id: 'co-la-chinh-minh-05',
    code: 'LCM',
    slug: 'la-chinh-minh-05',
    name: 'Là Chính Mình K5',
    short_label: 'LCM K5',
    tagline: 'Hành trình 3.5 ngày tìm về chính mình.',
    description: 'Khoá retreat chuyên sâu giúp gỡ rào cản tâm lý và sống có chủ đích.',
    delivery_mode: 'offline',
    learning_format: 'retreat',
    learning_type: 'cohort',
    delivery: 'offline',
    segment: 'adult',
    status: 'published',
    is_public: true,
    display_order: 0,
    cover_image_url: '',
    og_image_url: '',
    metadata: laChinhMinhContent(),
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null,
  },
  {
    id: 'co-cuoc-song-2',
    code: 'CSCB',
    slug: 'cuoc-song-cua-ban-2',
    name: 'Cuộc Sống Của Bạn 2',
    short_label: 'CSCB 2',
    tagline: 'Khoá học 6 tuần thiết kế cuộc sống.',
    description: '',
    delivery_mode: 'online',
    learning_format: 'cohort',
    learning_type: 'cohort',
    delivery: 'online',
    segment: 'adult',
    status: 'draft',
    is_public: false,
    display_order: 1,
    cover_image_url: '',
    og_image_url: '',
    metadata: {
      ...blankCourseContent(),
      hero: { title: 'Cuộc Sống Của Bạn 2', subtitle: 'Khoá học 6 tuần thiết kế cuộc sống.', badges: [], meta: [] },
      card: {
        ...blankCourseContent().card,
        name: 'Cuộc Sống Của Bạn 2',
        type_label: 'Khoá học theo nhóm',
        type_tag: 'khoa-hoc-theo-nhom',
        format_label: 'Online',
        schedule_label: 'Tháng 10/2026',
        short_description: 'Khoá học 6 tuần thiết kế cuộc sống.',
      },
    },
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null,
  },
]

export const courseRuns: CourseRun[] = [
  {
    id: 'run-lcm-05',
    course_id: 'co-la-chinh-minh-05',
    code: 'LCM-R5',
    run_no: 5,
    label: 'Khoá 05 · Đà Nẵng',
    start_date: '2026-08-27',
    end_date: '2026-08-30',
    enrollment_open_at: '2026-06-01',
    enrollment_close_at: '2026-08-20',
    delivery_mode: 'offline',
    venue: 'Retreat venue Đà Nẵng',
    capacity: 64,
    enrolled_count: 32,
    status: 'enrollment_open',
    base_price_vnd: 68_690_000,
    currency: 'VND',
    deposit_type: 'fixed',
    deposit_value: 10_000_000,
    balance_due_days: 14,
    metadata: {},
    created_at: nowIso(),
    updated_at: nowIso(),
  },
]
