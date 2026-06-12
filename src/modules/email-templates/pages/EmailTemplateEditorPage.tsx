import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Editor } from '@tiptap/react'
import { AlertCircle, ArrowLeft, Send } from 'lucide-react'
import { SaveButton, type SaveState } from '@shared/components/SaveButton'
import { Skeleton } from '@shared/components/Skeleton'
import { EmptyState } from '@shared/components/EmptyState'
import { toast } from '@shared/stores/useToastStore'
import {
  useCreateEmailTemplate,
  useEmailTemplate,
  useTriggerCatalog,
  useUpdateEmailTemplate,
} from '../hooks/useEmailTemplates'
import { TemplateRichTextEditor } from '../components/TemplateRichTextEditor'
import { VariablePicker } from '../components/VariablePicker'
import { TemplatePreview } from '../components/TemplatePreview'
import { TestSendModal } from '../components/TestSendModal'

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

const SUBJECT_MAX = 300

interface TemplateDraft {
  name: string
  subject: string
  body_html: string
}

const EMPTY_DRAFT: TemplateDraft = { name: '', subject: '', body_html: '' }

// Route: /dashboard/email-templates/new (tạo) + /:id/edit (sửa) — cùng page.
export function EmailTemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id
  const navigate = useNavigate()

  const detailQ = useEmailTemplate(id)
  const catalogQ = useTriggerCatalog()
  const catalog = catalogQ.data ?? []

  const create = useCreateEmailTemplate()
  const update = useUpdateEmailTemplate()

  const [draft, setDraft] = useState<TemplateDraft | null>(isNew ? { ...EMPTY_DRAFT } : null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [subjectError, setSubjectError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [testSendOpen, setTestSendOpen] = useState(false)

  const editorRef = useRef<Editor | null>(null)

  // Init draft từ server khi edit (1 lần — sau đó user own draft)
  useEffect(() => {
    if (!isNew && detailQ.data && !draft) {
      setDraft({
        name: detailQ.data.name,
        subject: detailQ.data.subject,
        body_html: detailQ.data.body_html,
      })
    }
  }, [isNew, detailQ.data, draft])

  const dirty = useMemo(() => {
    if (!draft) return false
    if (isNew) return !!(draft.name || draft.subject || draft.body_html)
    if (!detailQ.data) return false
    return (
      draft.name !== detailQ.data.name ||
      draft.subject !== detailQ.data.subject ||
      draft.body_html !== detailQ.data.body_html
    )
  }, [draft, isNew, detailQ.data])

  if (!isNew && detailQ.isError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Không tải được mẫu email"
            description="Mẫu không tồn tại hoặc server đang gặp sự cố."
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void detailQ.refetch()}
                  className="px-3 py-1.5 rounded-md bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
                >
                  Thử lại
                </button>
                <Link
                  to="/dashboard/email-templates"
                  className="px-3 py-1.5 rounded-md border border-[#D1D5DB] text-xs hover:bg-[#F7F8FA]"
                >
                  Về danh sách
                </Link>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-3">
        <Skeleton height={28} width={240} />
        <Skeleton height={420} />
      </div>
    )
  }

  const onChange = (patch: Partial<TemplateDraft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    if (saveState === 'saved') setSaveState('idle')
  }

  const onInsertVar = (key: string) => {
    const editor = editorRef.current
    if (!editor) return
    editor.chain().focus().insertContent(`{{${key}}}`).run()
  }

  const validate = (): boolean => {
    let ok = true
    if (!draft.name.trim()) {
      setNameError('Tên mẫu bắt buộc')
      ok = false
    }
    if (!draft.subject.trim()) {
      setSubjectError('Subject bắt buộc')
      ok = false
    } else if (draft.subject.length > SUBJECT_MAX) {
      setSubjectError(`Subject tối đa ${SUBJECT_MAX} ký tự`)
      ok = false
    }
    if (!ok) toast.error('Điền đủ Tên mẫu + Subject trước khi lưu')
    return ok
  }

  const onSave = async () => {
    if (!validate()) return
    const body = {
      name: draft.name.trim(),
      subject: draft.subject,
      // BE yêu cầu body_html không rỗng — editor trống vẫn trả '<p></p>'
      body_html: draft.body_html || '<p></p>',
    }
    setSaveState('saving')
    try {
      if (isNew) {
        const created = await create.mutateAsync(body)
        // Cùng component cho /new và /:id/edit — state giữ nguyên qua navigate,
        // set saved trước khi đổi route để toolbar hiện "Đã lưu lúc HH:MM".
        setDraft({ name: created.name, subject: created.subject, body_html: created.body_html })
        setSavedAt(new Date())
        setSaveState('saved')
        toast.success('Đã tạo mẫu email')
        navigate(`/dashboard/email-templates/${created.id}/edit`, { replace: true })
        return
      }
      const saved = await update.mutateAsync({ id: id!, patch: body })
      setDraft({ name: saved.name, subject: saved.subject, body_html: saved.body_html })
      setSavedAt(new Date())
      setSaveState('saved')
      toast.success('Đã lưu mẫu email')
    } catch (err) {
      setSaveState('error')
      toast.error(err instanceof Error ? err.message : 'Lưu thất bại — thử lại')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <Link
            to="/dashboard/email-templates"
            className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827]"
          >
            <ArrowLeft size={14} />
            Danh sách
          </Link>
          <div className="h-6 w-px bg-[#E5E7EB]" />
          <div className="text-sm font-medium text-[#111827] truncate flex-1 min-w-0">
            {draft.name || 'Mẫu email mới'}
          </div>
          {dirty && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">Chưa lưu</span>
          )}
          <button
            onClick={() => setTestSendOpen(true)}
            disabled={isNew}
            title={isNew ? 'Lưu mẫu trước rồi mới gửi thử được' : 'Gửi email thử với data mẫu'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D1D5DB] text-xs text-[#1F5374] hover:bg-[#F0F7FA] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={13} />
            Gửi thử cho tôi
          </button>
          <SaveButton state={saveState} onClick={() => void onSave()} savedAt={savedAt} label="Lưu mẫu" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Main column */}
        <div className="space-y-5 min-w-0">
          <Section title="Thông tin mẫu">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Tên mẫu <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  className={`${inputClass} ${nameError ? 'border-[#DC2626]' : ''}`}
                  value={draft.name}
                  onChange={(e) => {
                    onChange({ name: e.target.value })
                    if (nameError && e.target.value.trim()) setNameError(null)
                  }}
                  placeholder="VD: Cảm ơn sau mua"
                  maxLength={128}
                />
                {nameError && <p className="text-xs text-[#DC2626] mt-1">{nameError}</p>}
                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  Tên nội bộ để chọn trong workflow — người nhận không thấy.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#374151]">
                    Subject <span className="text-[#DC2626]">*</span>
                  </label>
                  <span
                    className={`text-[10px] ${draft.subject.length > SUBJECT_MAX ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`}
                  >
                    {draft.subject.length}/{SUBJECT_MAX}
                  </span>
                </div>
                <input
                  className={`${inputClass} ${subjectError ? 'border-[#DC2626]' : ''}`}
                  value={draft.subject}
                  onChange={(e) => {
                    onChange({ subject: e.target.value })
                    if (subjectError && e.target.value.trim() && e.target.value.length <= SUBJECT_MAX) {
                      setSubjectError(null)
                    }
                  }}
                  placeholder="VD: Cảm ơn {{buyer_name}} đã đăng ký {{product_name}}"
                  maxLength={SUBJECT_MAX}
                />
                {subjectError && <p className="text-xs text-[#DC2626] mt-1">{subjectError}</p>}
                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  Hỗ trợ {'{{biến}}'} — dùng nút copy ở panel "Chèn biến" rồi dán vào đây.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Nội dung">
            <TemplateRichTextEditor
              value={draft.body_html}
              onChange={(html) => onChange({ body_html: html })}
              onEditorReady={(editor) => {
                editorRef.current = editor
              }}
              placeholder="Soạn nội dung email... Click biến ở panel bên phải để chèn."
            />
          </Section>

          <Section title="Xem trước (data mẫu)">
            <TemplatePreview subject={draft.subject} bodyHtml={draft.body_html} catalog={catalog} />
          </Section>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <Section title="Chèn biến">
            <VariablePicker
              catalog={catalog}
              isLoading={catalogQ.isLoading}
              isError={catalogQ.isError}
              onInsert={onInsertVar}
            />
          </Section>
        </div>
      </div>

      {id && (
        <TestSendModal
          open={testSendOpen}
          onClose={() => setTestSendOpen(false)}
          templateId={id}
          catalog={catalog}
        />
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <header className="px-5 py-3 border-b border-[#E5E7EB]">
        <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}
