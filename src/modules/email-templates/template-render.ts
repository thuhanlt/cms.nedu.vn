// Render template email phía FE (preview + mock test-send) — PORT 1:1 từ
// nedu-backend src/modules/email-workflow/template-render.ts để preview khớp
// chính xác behavior BE: thay {{biến}} từ context, substitution thuần, KHÔNG
// eval logic; giá trị biến được escape HTML trước khi chèn vào body; biến
// thiếu → chuỗi rỗng + ghi nhận missing_vars.

import type { TriggerCatalogItem } from './types/email-template'

const VAR_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g

export interface RenderedEmailTemplate {
  subject: string
  html: string
  missing_vars: string[]
}

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export function renderEmailTemplate(
  template: { subject: string; body_html: string },
  context: Record<string, unknown>,
): RenderedEmailTemplate {
  const missing = new Set<string>()
  const resolve = (key: string): string => {
    const value = context[key]
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      missing.add(key)
      return ''
    }
    const str = String(value)
    if (str.trim() === '') {
      missing.add(key)
      return ''
    }
    return str
  }

  // Subject là plain text — strip newline khỏi giá trị biến (giữ 1 dòng).
  const subject = template.subject.replace(VAR_PATTERN, (_, key: string) =>
    resolve(key).replace(/[\r\n]+/g, ' '),
  )
  const html = template.body_html.replace(VAR_PATTERN, (_, key: string) => escapeHtml(resolve(key)))

  return { subject, html, missing_vars: [...missing] }
}

/** Liệt kê biến template đang dùng — khớp extractTemplateVars phía BE. */
export function extractTemplateVars(template: { subject: string; body_html: string }): string[] {
  const vars = new Set<string>()
  for (const source of [template.subject, template.body_html]) {
    for (const match of source.matchAll(VAR_PATTERN)) vars.add(match[1])
  }
  return [...vars]
}

/** Sample context cho preview: theo trigger, hoặc gộp mọi trigger khi chưa chọn. */
export function buildSampleContext(
  catalog: TriggerCatalogItem[],
  eventKey?: string,
): Record<string, string> {
  const items = eventKey ? catalog.filter((t) => t.event_key === eventKey) : catalog
  const ctx: Record<string, string> = {}
  for (const item of items) {
    for (const v of item.context_vars) ctx[v.key] = v.sample
  }
  return ctx
}
