import type { Alumni } from '@modules/alumni/types/alumni'
import { nowIso } from './_helpers'

export const alumni: Alumni[] = [
  {
    id: 'al-1',
    title: 'Hà Linh — Từ PM mệt mỏi đến Founder agency 5 người',
    quote: '"Sau 6 tháng học, mình không còn tự hỏi mình hợp với gì nữa — mình đã làm điều đó."',
    type: 'spotlight',
    status: 'published',
    updatedAt: nowIso(),
  },
  {
    id: 'al-2',
    title: 'Networking Night · TP.HCM · 20/06/2026',
    quote: 'Buổi gặp mặt offline cho alumni 4 cohort gần nhất.',
    type: 'event',
    status: 'published',
    updatedAt: nowIso(),
  },
  {
    id: 'al-3',
    title: 'TUYỂN: Content Manager · Nedu',
    quote: 'Cộng đồng alumni có kinh nghiệm content + marketing được ưu tiên.',
    type: 'job',
    status: 'draft',
    updatedAt: nowIso(),
  },
  {
    id: 'al-4',
    title: 'Minh Anh — Hành trình từ marketing junior đến brand lead',
    quote: '"Nedu giúp mình nhận ra mình không phải đợi đủ kinh nghiệm mới làm điều mình thích."',
    type: 'spotlight',
    status: 'published',
    updatedAt: nowIso(),
  },
]
