import type { SiteConfig } from '@modules/settings/types/site-config'

// Seed khớp giá trị footer nedu.vn đang hiển thị + seed migration BE.
export const siteConfig: { current: SiteConfig } = {
  current: {
    company_name: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ NHILE',
    tax_id: '0317268736',
    is_visible: true,
  },
}
