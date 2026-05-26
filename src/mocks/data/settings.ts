import type { SiteSettings } from '@modules/settings/types/settings'
import { nowIso } from './_helpers'

export const settings: { current: SiteSettings } = {
  current: {
    students: '500+',
    cohorts: '12',
    avgRating: '4.8/5',
    courseTypes: '4 chương trình lớn',
    headline: 'Giáo dục cho người trưởng thành',
    subheadline: 'Để bạn tự thiết kế cuộc sống của chính mình.',
    ctaLabel: 'Khám phá chương trình',
    ctaUrl: 'https://nedu.vn/thu-thach',
    ytPlaylist: 'https://www.youtube.com/playlist?list=PLxxx',
    updatedAt: nowIso(),
  },
}
