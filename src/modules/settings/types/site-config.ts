// Site config (tên DN + MST + cờ ẩn/hiện) — endpoint riêng /cms/site-config
// (tách khỏi /site-settings hero). snake_case khớp BE nedu-backend public shape;
// không map camelCase vì đây là config phẳng, đọc thẳng từ API.
export interface SiteConfig {
  company_name: string
  tax_id: string
  address: string
  // false → nedu.vn footer ẩn block tên DN + MST + địa chỉ.
  is_visible: boolean
}
