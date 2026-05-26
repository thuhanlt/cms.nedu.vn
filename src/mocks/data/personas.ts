import type { Persona } from '@modules/test-config/types/persona'

export const personas: Persona[] = [
  {
    id: 'p-1',
    name: 'Người đang lạc hướng',
    icon: '🧭',
    instruction: 'Cảm thấy mơ hồ về định hướng sự nghiệp, không biết bước tiếp theo nên là gì.',
    status: 'published',
    problems: [
      { id: 'pp-1-1', title: 'Không biết mình muốn gì', description: 'Mỗi khi tự hỏi, đầu trống rỗng.', courseSlug: 'cuoc-song-cua-ban', urgency: 'Quan trọng — cần làm trong 30 ngày' },
      { id: 'pp-1-2', title: 'Sự nghiệp ổn nhưng không vui', description: 'Lương ok nhưng sáng nào đi làm cũng nặng nề.', courseSlug: 'cuoc-song-cua-ban', urgency: 'Khẩn cấp' },
      { id: 'pp-1-3', title: 'Mệt vì so sánh với bạn bè', description: 'Mở Facebook thấy ai cũng "lên đỉnh".', courseSlug: 'la-chinh-minh', urgency: 'Có thể chờ' },
    ],
  },
  {
    id: 'p-2',
    name: 'Người muốn xây thương hiệu',
    icon: '✨',
    instruction: 'Có kỹ năng nhưng chưa biết cách giới thiệu bản thân với thị trường.',
    status: 'published',
    problems: [
      { id: 'pp-2-1', title: 'Không biết bắt đầu từ đâu', description: 'Lập profile mà cảm giác giả tạo.', courseSlug: 'thuong-hieu-cua-ban', urgency: 'Quan trọng' },
      { id: 'pp-2-2', title: 'Sợ bị đánh giá khi đăng bài', description: 'Viết xong xoá, xoá xong viết.', courseSlug: 'la-chinh-minh', urgency: 'Bình thường' },
    ],
  },
  {
    id: 'p-3',
    name: 'Người muốn sống đúng với mình',
    icon: '🌱',
    instruction: 'Đang đeo nhiều "mặt nạ" cho công việc, gia đình, xã hội.',
    status: 'draft',
    problems: [
      { id: 'pp-3-1', title: 'Mệt vì phải làm vừa lòng người khác', description: '', courseSlug: 'la-chinh-minh', urgency: 'Khẩn cấp' },
    ],
  },
]
