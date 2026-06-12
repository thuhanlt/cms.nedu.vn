// Preview email: thay {{biến}} bằng sample value từ trigger-catalog.
// BẮT BUỘC render body_html trong <iframe sandbox=""> (không allow-scripts,
// origin riêng) — chặn stored-XSS cms_admin → admin, KHÔNG dùng
// dangerouslySetInnerHTML vào DOM page (NLH-NEDU-EMAIL-WORKFLOW-001 §8).
import { useDeferredValue, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { buildSampleContext, renderEmailTemplate } from '../template-render'
import type { TriggerCatalogItem } from '../types/email-template'

interface TemplatePreviewProps {
  subject: string
  bodyHtml: string
  catalog: TriggerCatalogItem[]
}

// Khung HTML tối giản mô phỏng email client — font hệ, không load resource ngoài.
function buildSrcDoc(bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111827;margin:16px;word-break:break-word}
h1,h2,h3{line-height:1.3}
blockquote{border-left:4px solid #D1D5DB;padding-left:12px;margin-left:0;font-style:italic;color:#374151}
ul,ol{padding-left:20px}
a{color:#2D6A8C}
</style></head><body>${bodyHtml}</body></html>`
}

export function TemplatePreview({ subject, bodyHtml, catalog }: TemplatePreviewProps) {
  // Defer để gõ trong editor không giật — preview cập nhật trễ 1 nhịp render
  const deferredSubject = useDeferredValue(subject)
  const deferredBody = useDeferredValue(bodyHtml)

  const rendered = useMemo(() => {
    const ctx = buildSampleContext(catalog)
    return renderEmailTemplate({ subject: deferredSubject, body_html: deferredBody }, ctx)
  }, [deferredSubject, deferredBody, catalog])

  const srcDoc = useMemo(() => buildSrcDoc(rendered.html), [rendered.html])

  return (
    <div>
      {rendered.missing_vars.length > 0 && (
        <div className="mb-2 flex items-start gap-1.5 rounded-md border border-[#FCE8C3] bg-[#FFFBEB] px-2.5 py-1.5 text-[11px] text-[#7C5E10] leading-relaxed">
          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
          <span>
            Biến không có sample (sẽ render rỗng):{' '}
            <span className="font-mono">{rendered.missing_vars.join(', ')}</span>
          </span>
        </div>
      )}

      <div className="rounded-md border border-[#E5E7EB] overflow-hidden bg-white">
        <div className="px-3 py-2 border-b border-[#E5E7EB] bg-[#F7F8FA]">
          <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Subject</div>
          <div className="text-xs font-medium text-[#111827] truncate" title={rendered.subject}>
            {rendered.subject || <span className="text-[#9CA3AF] font-normal">(chưa có subject)</span>}
          </div>
        </div>
        <iframe
          title="Xem trước email"
          sandbox=""
          srcDoc={srcDoc}
          className="w-full h-[420px] bg-white"
        />
      </div>
      <p className="text-[10px] text-[#9CA3AF] mt-1.5">
        Preview thay {'{{biến}}'} bằng giá trị mẫu (chị Lan, Là Chính Mình...) — đúng cách backend render.
      </p>
    </div>
  )
}
