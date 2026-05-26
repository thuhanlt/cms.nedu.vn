import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useArticle, useUpdateArticle } from '../hooks/useArticles'
import { RichTextEditor } from '../components/RichTextEditor'
import { SeoFields } from '../components/SeoFields'
import { ImageUpload } from '@shared/components/ImageUpload'
import { SaveButton, type SaveState } from '@shared/components/SaveButton'
import { Skeleton } from '@shared/components/Skeleton'
import { SoonBadge } from '@shared/components/SoonBadge'
import { toast } from '@shared/stores/useToastStore'
import type { Article, ArticleSeo } from '../types/article'

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data: original, isLoading } = useArticle(id)
  const update = useUpdateArticle()

  const [draft, setDraft] = useState<Article | null>(null)
  const [tagsRaw, setTagsRaw] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (original && !draft) {
      setDraft(original)
      setTagsRaw(original.tags.join(', '))
      setSlugTouched(!!original.slug)
    }
  }, [original, draft])

  const dirty = useMemo(() => {
    if (!draft || !original) return false
    if (tagsRaw !== original.tags.join(', ')) return true
    return JSON.stringify({ ...draft, tags: original.tags }) !== JSON.stringify({ ...original, tags: original.tags })
  }, [draft, original, tagsRaw])

  if (isLoading || !draft) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-3">
        <Skeleton height={28} width={240} />
        <Skeleton height={420} />
      </div>
    )
  }

  const onChange = (patch: Partial<Article>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    if (saveState === 'saved') setSaveState('idle')
  }
  const onTitleChange = (title: string) => {
    onChange({ title })
    if (!slugTouched) onChange({ slug: slugify(title) })
    if (titleError && title.trim()) setTitleError(null)
  }
  const onSeoChange = (patch: Partial<ArticleSeo>) => {
    setDraft((d) => (d ? { ...d, seo: { ...d.seo, ...patch } } : d))
    if (saveState === 'saved') setSaveState('idle')
  }

  const onSave = async () => {
    if (!draft || !id) return
    if (!draft.title.trim()) {
      setTitleError('Tiêu đề bắt buộc')
      toast.error('Tiêu đề không được để trống')
      return
    }
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    setSaveState('saving')
    try {
      const saved = await update.mutateAsync({ id, patch: { ...draft, tags } })
      setDraft(saved)
      setTagsRaw(saved.tags.join(', '))
      setSavedAt(new Date())
      setSaveState('saved')
      toast.success('Đã lưu bài viết')
    } catch {
      setSaveState('error')
      toast.error('Lưu thất bại — thử lại')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
          <Link
            to="/dashboard/articles"
            className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827]"
          >
            <ArrowLeft size={14} />
            Danh sách
          </Link>
          <div className="h-6 w-px bg-[#E5E7EB]" />
          <div className="text-sm font-medium text-[#111827] truncate flex-1 min-w-0">{draft.title || 'Bài viết mới'}</div>
          {dirty && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">Chưa lưu</span>}
          <button
            disabled
            title="Sắp ra mắt"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E7EB] text-xs text-[#6B7280] opacity-60 cursor-not-allowed"
          >
            <Sparkles size={13} />
            Viết bài với AI
            <SoonBadge />
          </button>
          <SaveButton state={saveState} onClick={onSave} savedAt={savedAt} label="Lưu bài viết" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main column */}
        <div className="space-y-5">
          <Section title="Thông tin cơ bản">
            <div className="grid grid-cols-[140px_1fr] gap-3">
              <label className="text-xs font-medium text-[#374151] pt-2">Loại</label>
              <select
                className={inputClass}
                value={draft.type}
                onChange={(e) => onChange({ type: e.target.value as Article['type'] })}
              >
                <option value="blog">Blog</option>
                <option value="homepage">Homepage</option>
              </select>

              <label className="text-xs font-medium text-[#374151] pt-2">
                Tiêu đề <span className="text-[#DC2626]">*</span>
              </label>
              <div>
                <input
                  className={`${inputClass} ${titleError ? 'border-[#DC2626]' : ''}`}
                  value={draft.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Tiêu đề bài viết"
                />
                {titleError && <p className="text-xs text-[#DC2626] mt-1">{titleError}</p>}
              </div>

              <label className="text-xs font-medium text-[#374151] pt-2">Đường dẫn</label>
              <div>
                <div className="flex items-center">
                  <span className="text-xs text-[#9CA3AF] px-2 py-2 bg-[#F7F8FA] border border-r-0 border-[#D1D5DB] rounded-l-md">
                    nedu.vn/blog/
                  </span>
                  <input
                    className={`${inputClass} rounded-l-none`}
                    value={draft.slug ?? ''}
                    onChange={(e) => {
                      setSlugTouched(true)
                      onChange({ slug: e.target.value })
                    }}
                    placeholder="duong-dan-bai-viet"
                  />
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Tự sinh từ tiêu đề — bạn có thể sửa.</p>
              </div>

              <label className="text-xs font-medium text-[#374151] pt-2">Mô tả ngắn</label>
              <textarea
                className={`${inputClass} resize-y min-h-[64px]`}
                value={draft.excerpt ?? ''}
                onChange={(e) => onChange({ excerpt: e.target.value })}
                placeholder="1-2 câu giới thiệu, hiển thị ở list bài viết"
              />
            </div>
          </Section>

          <Section title="Nội dung">
            <RichTextEditor
              value={draft.body ?? ''}
              onChange={(html) => onChange({ body: html })}
              placeholder="Bắt đầu viết bài..."
            />
          </Section>

          <Section title="SEO & Chia sẻ mạng xã hội">
            <SeoFields value={draft.seo} onChange={onSeoChange} />
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Section title="Ảnh bìa">
            <ImageUpload
              ratio="square"
              value={draft.coverUrl || null}
              onChange={(url) => onChange({ coverUrl: url ?? '' })}
              hint="Click hoặc kéo-thả ảnh. Hiển thị ở list bài viết + khi chia sẻ MXH."
            />
          </Section>

          <Section title="Xuất bản">
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Trạng thái</label>
            <select
              className={inputClass}
              value={draft.status}
              onChange={(e) => onChange({ status: e.target.value as Article['status'] })}
            >
              <option value="draft">Nháp</option>
              <option value="published">Đã đăng</option>
            </select>

            <label className="block text-xs font-medium text-[#374151] mb-1.5 mt-4">Ngày đăng</label>
            <input
              type="date"
              className={inputClass}
              value={draft.publishedDate ?? ''}
              onChange={(e) => onChange({ publishedDate: e.target.value })}
            />
          </Section>

          <Section title="Tags">
            <input
              className={inputClass}
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="phát triển bản thân, sự nghiệp"
            />
            <p className="text-[11px] text-[#9CA3AF] mt-1.5">Ngăn cách bằng dấu phẩy.</p>
          </Section>
        </div>
      </div>
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
