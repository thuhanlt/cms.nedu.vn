import type { Faq } from '@modules/faqs/types/faq'

export const faqs: Faq[] = [
  // Chung
  { id: 'f-1', category: 'Chung', question: 'Nedu là gì?', answer: 'Nedu là nền tảng giáo dục cho người trưởng thành thuộc NhiLe Holdings.', status: 'published', orderIndex: 1 },
  { id: 'f-2', category: 'Chung', question: 'Tôi học ở đâu?', answer: 'Toàn bộ chương trình diễn ra trên learn.nedu.vn (online) + một số buổi offline.', status: 'published', orderIndex: 2 },
  // Học phí
  { id: 'f-3', category: 'Học phí', question: 'Tôi có thể trả góp không?', answer: 'Có, hỗ trợ trả góp 0% qua thẻ tín dụng các ngân hàng đối tác.', status: 'published', orderIndex: 1 },
  { id: 'f-4', category: 'Học phí', question: 'Hoàn tiền nếu không hài lòng?', answer: 'Trong 7 ngày đầu, hoàn 100% không cần giải thích.', status: 'published', orderIndex: 2 },
  // Kỹ thuật
  { id: 'f-5', category: 'Kỹ thuật', question: 'Tôi không thấy email kích hoạt?', answer: 'Kiểm tra hộp Spam, hoặc liên hệ support@nedu.vn để được hỗ trợ trong vòng 24h.', status: 'draft', orderIndex: 1 },
]
