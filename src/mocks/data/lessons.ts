import type { Lesson } from '@modules/lessons/types/lesson'

export const lessons: Lesson[] = [
  // Cuộc Sống Của Bạn — K1
  { id: 'l-001', course: 'Cuộc Sống Của Bạn', cohort: 'K1', title: 'Buổi 1: Khai mạc & Hành trình 30 ngày', videoUrl: 'https://youtu.be/example1', status: 'published', orderIndex: 1 },
  { id: 'l-002', course: 'Cuộc Sống Của Bạn', cohort: 'K1', title: 'Buổi 2: Xác định giá trị cốt lõi', videoUrl: 'https://youtu.be/example2', status: 'published', orderIndex: 2 },
  { id: 'l-003', course: 'Cuộc Sống Của Bạn', cohort: 'K1', title: 'Buổi 3: Thói quen 5 phút mỗi sáng', status: 'draft', orderIndex: 3 },
  { id: 'l-004', course: 'Cuộc Sống Của Bạn', cohort: 'K1', title: 'Buổi 4: Demo Day', status: 'draft', orderIndex: 4 },
  // Thương Hiệu Của Bạn — K1
  { id: 'l-005', course: 'Thương Hiệu Của Bạn', cohort: 'K1', title: 'Buổi 1: Thương hiệu cá nhân là gì', videoUrl: 'https://youtu.be/example5', status: 'published', orderIndex: 1 },
  { id: 'l-006', course: 'Thương Hiệu Của Bạn', cohort: 'K1', title: 'Buổi 2: Xây nền tảng nội dung', status: 'draft', orderIndex: 2 },
  // Là Chính Mình — K1
  { id: 'l-007', course: 'Là Chính Mình', cohort: 'K1', title: 'Buổi 1: Bóc các lớp mặt nạ', videoUrl: 'https://youtu.be/example7', status: 'published', orderIndex: 1 },
  { id: 'l-008', course: 'Là Chính Mình', cohort: 'K1', title: 'Buổi 2: Bài tập gương phản chiếu', status: 'draft', orderIndex: 2 },
]
