import { api } from './api-client'

// Upload ảnh CMS lên R2 qua backend → trả public URL (cdn.nedu.vn/cms/...).
// Thay cho cách cũ nhúng base64 vào content: field BE cap @MaxLength(2000) nên
// PHẢI là URL, không nhận base64 (base64 ảnh thật ~chục-trăm KB → 400/413).

export type CmsImageKind =
  | 'challenge-banner'
  | 'challenge-banner-mobile'
  | 'instructor-avatar'
  | 'review-avatar'
  | 'article-cover'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024 // 5MB — khớp cap CmsMediaController phía BE

/**
 * uploadCmsImage — gửi 1 file ảnh lên POST /api/cms/media?kind=... (multipart).
 * @returns public URL của ảnh đã upload.
 * @throws Error (message tiếng Việt) nếu sai định dạng / quá lớn / BE lỗi.
 */
export async function uploadCmsImage(file: File, kind: CmsImageKind): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Định dạng không hỗ trợ — chỉ nhận JPG, PNG, WebP, GIF.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Ảnh quá lớn (tối đa 5MB). Hãy nén hoặc giảm kích thước.')
  }

  const form = new FormData()
  form.append('file', file)

  // api-client tự nhận biết FormData → không set Content-Type (browser tự thêm
  // multipart boundary) + tự gắn Authorization + unwrap envelope { data }.
  const res = await api.post<{ url: string; key: string }>(
    `/cms/media?kind=${encodeURIComponent(kind)}`,
    form,
  )
  return res.url
}
