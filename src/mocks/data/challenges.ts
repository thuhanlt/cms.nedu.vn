import type { Challenge, ChallengeContent } from '@modules/challenges/types/challenge'
import { nowIso } from './_helpers'

export function blankContent(): ChallengeContent {
  return {
    countdown: { enabled: true },
    heroImg: '',
    heroImgMobile: '',
    subs: {
      outcomes: 'Bạn sẽ đạt được gì sau hành trình này',
      curriculum: 'Lộ trình từng tuần được thiết kế chi tiết',
      instructor: 'Học cùng người đồng hành tận tâm',
    },
    outcomes: [
      { icon: '🌱', title: 'Tự nhận thức rõ hơn', desc: 'Hiểu giá trị, điểm mạnh và mong muốn thật sự của bản thân.' },
      { icon: '🎯', title: 'Định hướng rõ ràng', desc: 'Có lộ trình cụ thể cho 12 tháng tới.' },
      { icon: '💪', title: 'Thói quen mới', desc: 'Hình thành 1-2 thói quen tích cực kéo dài.' },
      { icon: '🤝', title: 'Cộng đồng đồng hành', desc: 'Kết nối với những người cùng tần số.' },
      { icon: '📚', title: 'Kiến thức nền tảng', desc: 'Khung tư duy ứng dụng được vào công việc.' },
      { icon: '✨', title: 'Tự tin chia sẻ', desc: 'Trình bày câu chuyện cá nhân một cách rõ ràng.' },
    ],
    curriculum: [
      { title: 'Tuần 1: Khởi động', topics: ['Workshop khai mạc', 'Xác định mục tiêu cá nhân', 'Bài tập nhật ký 5 phút mỗi ngày'] },
      { title: 'Tuần 2: Tự khám phá', topics: ['Bài trắc nghiệm tính cách', 'Thảo luận nhóm 1:1', 'Bài tập phản chiếu'] },
      { title: 'Tuần 3: Kết nối', topics: ['Buổi networking offline', 'Chia sẻ tiến trình tuần', 'Mentor 1:1'] },
      { title: 'Tuần 4: Hành động', topics: ['Lên kế hoạch 90 ngày tiếp', 'Demo Day', 'Cam kết cộng đồng'] },
    ],
    instructor: {
      name: 'NhiLe',
      avatarLetter: 'N',
      avatarUrl: '',
      title: 'Founder NhiLe Holdings · Người dẫn đường',
      bio: 'Hơn 8 năm xây dựng sản phẩm phần mềm và đào tạo người trẻ trưởng thành. Tin rằng giáo dục là di sản dài 300 năm.',
      tags: ['Mindfulness', 'Coaching', 'Product'],
      highlights: [
        'Founder NhiLe Holdings (6 platforms)',
        'Mentor cho 500+ học viên',
        'Diễn giả tại 30+ workshop',
      ],
    },
    reviews: [
      { avatarLetter: 'M', avatarUrl: '', name: 'Minh Anh', role: 'Marketing Lead', topic: 'Cuộc sống', text: 'Sau 30 ngày mình thật sự nhìn lại được mình muốn gì. Lộ trình rất rõ.' },
      { avatarLetter: 'T', avatarUrl: '', name: 'Thanh Tùng', role: 'Founder startup', topic: 'Thương hiệu', text: 'Cộng đồng học viên là phần mình thích nhất. Bài bản và ấm áp.' },
      { avatarLetter: 'H', avatarUrl: '', name: 'Hà Linh', role: 'Product Manager', topic: 'Là chính mình', text: 'Mình áp dụng được ngay vào công việc, không lý thuyết suông.' },
    ],
    faqs: [
      { q: 'Tôi không có nhiều thời gian thì có theo được không?', a: 'Chương trình thiết kế cho người đi làm, mỗi tuần khoảng 3-4 giờ. Có thể xem lại bất cứ lúc nào.' },
      { q: 'Tôi có cần kiến thức nền không?', a: 'Không. Chương trình bắt đầu từ căn bản, ai cũng tham gia được.' },
      { q: 'Hoàn tiền nếu không phù hợp?', a: 'Trong 7 ngày đầu, bạn có thể hoàn tiền 100% không cần giải thích.' },
    ],
    plans: {
      monthly: {
        price: '299.000đ',
        benefits: [
          'Truy cập toàn bộ video trong tháng',
          'Tham gia cộng đồng riêng',
          'Bài tập có chấm bởi mentor',
        ],
      },
      yearly: {
        price: '2.490.000đ',
        saving: 'Tiết kiệm 1.098.000đ',
        note: 'Trả 1 lần · dùng cả năm',
        benefits: [
          'Tất cả quyền lợi gói tháng',
          'Mentor 1:1 4 buổi/năm',
          'Ưu tiên đăng ký workshop offline',
          'Quà tặng sách giấy gửi tận nhà',
        ],
      },
    },
  }
}

export const challenges: Challenge[] = [
  {
    id: 'ch-cuoc-song',
    slug: 'cuoc-song-cua-ban',
    name: 'Cuộc Sống Của Bạn',
    status: 'open',
    published: true,
    startDate: '15/03/2026',
    priceMonthly: '299.000đ',
    priceYearly: '2.490.000đ',
    content: blankContent(),
    updatedAt: nowIso(),
  },
  {
    id: 'ch-thuong-hieu',
    slug: 'thuong-hieu-cua-ban',
    name: 'Thương Hiệu Của Bạn',
    status: 'upcoming',
    published: true,
    startDate: '01/04/2026',
    priceMonthly: '349.000đ',
    priceYearly: '2.890.000đ',
    content: { ...blankContent(), subs: { outcomes: 'Xây dựng thương hiệu cá nhân thật sự', curriculum: '4 tuần dựng nền tảng thương hiệu', instructor: 'Mentor brand chuyên nghiệp' } },
    updatedAt: nowIso(),
  },
  {
    id: 'ch-chinh-minh',
    slug: 'la-chinh-minh',
    name: 'Là Chính Mình',
    status: 'open',
    published: true,
    startDate: '20/03/2026',
    priceMonthly: '299.000đ',
    priceYearly: '2.490.000đ',
    content: blankContent(),
    updatedAt: nowIso(),
  },
  {
    id: 'ch-smvh',
    slug: 'suc-manh-vo-han',
    name: 'Sức Mạnh Vô Hạn',
    status: 'closed',
    published: false,
    startDate: '01/12/2025',
    priceMonthly: '399.000đ',
    priceYearly: '3.290.000đ',
    content: blankContent(),
    updatedAt: nowIso(),
  },
]
