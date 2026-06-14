// ─────────────────────────────────────────────────────────────────────────────
// __preview-sample — 1 object CourseContent mẫu để test render CourseRealPreview.
//
// Lấy cảm hứng từ nedu.vn content/courses/la-chinh-minh-05.ts (GOLD STANDARD).
// CHỈ dùng cho dev/storybook-style verify — chưa wire vào app. Khi editor wire
// data thật vào, file này có thể bỏ.
// ─────────────────────────────────────────────────────────────────────────────

import type { CourseContent } from './courseContent.schema'

export const PREVIEW_SAMPLE: CourseContent = {
  slug: 'la-chinh-minh-05',
  code: 'LCM',

  card: {
    name: 'Là Chính Mình',
    type_label: 'Khoá học chuyên sâu',
    type_tag: 'khoa-hoc-chuyen-sau',
    format_label: 'Offline',
    schedule_label: 'Tháng 8/2026',
    short_description:
      'Hành trình 3.5 ngày đánh thức sức mạnh nội tại, gỡ rào cản tâm lý để sống rực rỡ.',
    image: '/LCM.jpg',
    instructor_short: 'NhiLe x Guest Instructors',
  },

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

  commerce: {
    base_price_vnd_net: 68_690_000,
    seats_total: 64,
    seats_remaining: 32,
    start_date: '2026-08-27',
    registration_deadline: '2026-08-20',
    status: 'open',
  },

  outcomes: [
    {
      icon: 'target',
      title: 'Hiểu rõ sức mạnh nội tại',
      desc: 'Nhận diện và đánh thức tiềm năng đang ngủ quên trong chính bạn.',
    },
    {
      icon: 'heart',
      title: 'Gỡ bỏ rào cản tâm lý',
      desc: 'Xác định và xử lý những niềm tin giới hạn đang chặn bạn lại.',
    },
    {
      icon: 'check',
      title: 'Sống đúng với giá trị thật',
      desc: 'Tách rời kỳ vọng người khác và biết điều gì thực sự quan trọng với mình.',
    },
    {
      icon: 'clock',
      title: 'Quyết định không lưỡng lự',
      desc: 'Framework ra quyết định lớn dựa trên la bàn nội tâm rõ ràng.',
    },
    {
      icon: 'users',
      title: 'Cộng đồng alumni đồng hành',
      desc: 'Kết nối với học viên các kỳ trước — hỗ trợ nhau dài hạn sau khoá.',
    },
    {
      icon: 'chart',
      title: 'Roadmap 90 ngày hành động',
      desc: 'Rời retreat với kế hoạch cụ thể, không quay về cuộc sống cũ.',
    },
  ],

  modules: [
    {
      num: '01',
      title: 'Ngày 1 · Mở lòng và quan sát',
      meta: 'Sáng + chiều · 6h',
      topics: [
        'Phá vỡ khoảng cách — nhóm 60 người, vòng tròn chia sẻ đầu tiên',
        'Bài tập quan sát bản thân — bạn đang ở đâu trong cuộc đời?',
        'Bản đồ cảm xúc trong 30 ngày gần nhất',
        'Câu hỏi nền tảng: Điều gì khiến bạn đến đây hôm nay?',
      ],
    },
    {
      num: '02',
      title: 'Ngày 2 · Soi vào bóng tối',
      meta: 'Sáng + chiều + tối · 9h',
      topics: [
        'Khoa học não bộ về niềm tin giới hạn (limiting beliefs)',
        'Truy ngược về nguồn — đâu là gốc của những rào cản hiện tại',
        'Bài tập "ghế nóng" — đối thoại với bản thân qua các vai trò',
        'Đêm yên — viết thư cho phiên bản 5 năm sau của mình',
      ],
    },
    {
      num: '03',
      title: 'Ngày 3 · Tái thiết kế',
      meta: 'Sáng + chiều · 8h',
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
      {
        label: 'Kênh YouTube Nhi Le',
        desc: 'Kênh tiên phong chia sẻ kiến thức tâm lý học bằng tiếng Việt.',
      },
      {
        label: 'Cộng đồng NhiLe Team',
        desc: 'Đào tạo nghề và kỹ năng cần thiết cho giới trẻ.',
      },
    ],
    achievements: [
      {
        date: '2025-04',
        text: 'Vinh danh với giải thưởng HER Courage Awards 2025.',
      },
      {
        date: '2025-08',
        text: 'Người phụ nữ Việt Nam đầu tiên xuất hiện trên blog chính thức của YouTube toàn cầu.',
      },
    ],
  },

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
}
