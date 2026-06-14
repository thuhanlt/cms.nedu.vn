import type { SiteConfig } from '@modules/settings/types/site-config'

// Seed khớp giá trị footer nedu.vn đang hiển thị + seed migration BE.
export const siteConfig: { current: SiteConfig } = {
  current: {
    company_name: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ NHILE',
    tax_id: '0317268736',
    address:
      'Lô 3, khu B2-7, Khu đô thị phức hợp Halla Jade Residence, Phường Hải Châu, TP Đà Nẵng, Việt Nam',
    is_visible: true,
  },
}
