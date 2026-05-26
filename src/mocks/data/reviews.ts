import type { Review } from '@modules/reviews/types/review'

export const reviews: Review[] = [
  { id: 'r-1', student: 'Minh Anh', cohort: 'K3', course: 'Cuộc Sống Của Bạn', rating: 5, month: '2026-04', featured: true, status: 'published' },
  { id: 'r-2', student: 'Thanh Tùng', cohort: 'K2', course: 'Thương Hiệu Của Bạn', rating: 5, month: '2026-03', featured: true, status: 'published' },
  { id: 'r-3', student: 'Hà Linh', cohort: 'K3', course: 'Là Chính Mình', rating: 4, month: '2026-04', featured: false, status: 'published' },
  { id: 'r-4', student: 'Quang Huy', cohort: 'K1', course: 'Cuộc Sống Của Bạn', rating: 5, month: '2026-02', featured: false, status: 'published' },
  { id: 'r-5', student: 'Phương Mai', cohort: 'K2', course: 'Là Chính Mình', rating: 4, month: '2026-03', featured: false, status: 'draft' },
]
