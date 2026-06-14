import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Skeleton } from '@shared/components/Skeleton'
import { SaveButton, type SaveState } from '@shared/components/SaveButton'
import { toast } from '@shared/stores/useToastStore'
import { useSiteSettings, useUpdateSiteSettings } from '../hooks/useSiteSettings'
import { useSiteConfig, useUpdateSiteConfig } from '../hooks/useSiteConfig'
import type { SiteSettings } from '../types/settings'
import type { SiteConfig } from '../types/site-config'

const inputClass =
  'w-full px-3 py-2 rounded-md border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#2D6A8C] focus:ring-1 focus:ring-[#2D6A8C]/20'

const textareaClass = `${inputClass} resize-y min-h-[72px]`

function safeDate(iso?: string): string {
  if (!iso) return '—'
  try {
    return format(new Date(iso), "HH:mm 'ngày' dd/MM/yyyy")
  } catch {
    return '—'
  }
}

export function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Cài đặt site
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Nội dung hiển thị trên nedu.vn. Mỗi mục dưới đây tải và lưu độc lập.
        </p>
      </header>

      <div className="space-y-5">
        <HeroSettingsSection />
        <CompanyInfoSection />
      </div>
    </div>
  )
}

// Thống kê & Hero + CTA/Playlist — chung 1 SiteSettings, lưu chung. Tách thành
// component tự-chứa: lỗi tải mục này KHÔNG chặn mục "Thông tin doanh nghiệp"
// (vd backend chưa có endpoint /site-settings → mục này báo lỗi cục bộ, các
// mục khác vẫn dùng được).
function HeroSettingsSection() {
  const { data: original, isLoading, isError, refetch } = useSiteSettings()
  const update = useUpdateSiteSettings()
  const [draft, setDraft] = useState<SiteSettings | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (original && !draft) setDraft(original)
  }, [original, draft])

  const dirty = useMemo(() => {
    if (!draft || !original) return false
    return JSON.stringify(draft) !== JSON.stringify(original)
  }, [draft, original])

  const onChange = (patch: Partial<SiteSettings>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    if (saveState === 'saved') setSaveState('idle')
  }

  const onSave = async () => {
    if (!draft) return
    setSaveState('saving')
    try {
      const saved = await update.mutateAsync(draft)
      setDraft(saved)
      setSavedAt(new Date())
      setSaveState('saved')
      toast.success('Đã lưu cài đặt site')
    } catch {
      setSaveState('error')
      toast.error('Lưu thất bại — kiểm tra quyền admin')
    }
  }

  if (isError) {
    return (
      <Section title="Thống kê & Hero" description="Số liệu hiển thị ở hero trang chủ + nội dung headline.">
        <div className="px-3 py-3 rounded-md bg-[#FEF2F2] text-[#B91C1C] text-sm flex items-center justify-between gap-3">
          <span>Chưa tải được mục này (backend chưa có endpoint cài đặt Hero).</span>
          <button
            onClick={() => refetch()}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-xs font-medium"
          >
            Thử lại
          </button>
        </div>
      </Section>
    )
  }

  if (isLoading || !draft) {
    return (
      <Section title="Thống kê & Hero" description="Số liệu hiển thị ở hero trang chủ + nội dung headline.">
        <Skeleton height={200} />
      </Section>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-[#9CA3AF]">Cập nhật lần cuối: {safeDate(draft.updatedAt)}</span>
        {dirty && <span className="text-xs text-[#B45309]">· Chưa lưu</span>}
        <SaveButton state={saveState} onClick={onSave} savedAt={savedAt} label="Lưu cài đặt" />
      </div>

        {/* Thống kê & Hero */}
        <Section title="Thống kê & Hero" description="Số liệu hiển thị ở hero trang chủ + nội dung headline.">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Số học viên" hint="VD: 500+">
              <input
                className={inputClass}
                value={draft.students}
                onChange={(e) => onChange({ students: e.target.value })}
              />
            </Field>
            <Field label="Số cohort" hint="VD: 12">
              <input
                className={inputClass}
                value={draft.cohorts}
                onChange={(e) => onChange({ cohorts: e.target.value })}
              />
            </Field>
            <Field label="Đánh giá trung bình" hint="VD: 4.8/5">
              <input
                className={inputClass}
                value={draft.avgRating}
                onChange={(e) => onChange({ avgRating: e.target.value })}
              />
            </Field>
            <Field label="Loại hình khoá học" hint="VD: 4 chương trình lớn">
              <input
                className={inputClass}
                value={draft.courseTypes}
                onChange={(e) => onChange({ courseTypes: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Tiêu đề Hero (headline)" className="mt-4">
            <input
              className={inputClass}
              value={draft.headline}
              onChange={(e) => onChange({ headline: e.target.value })}
              placeholder="VD: Giáo dục cho người trưởng thành"
            />
          </Field>

          <Field label="Phụ đề Hero (subheadline)" className="mt-4">
            <textarea
              className={textareaClass}
              value={draft.subheadline}
              onChange={(e) => onChange({ subheadline: e.target.value })}
              placeholder="Câu sub dưới headline"
            />
          </Field>
        </Section>

        {/* CTA & Playlist */}
        <Section title="CTA & Playlist" description="Nút call-to-action chính + playlist review.">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nhãn nút CTA" hint="VD: Khám phá chương trình">
              <input
                className={inputClass}
                value={draft.ctaLabel}
                onChange={(e) => onChange({ ctaLabel: e.target.value })}
              />
            </Field>
            <Field label="URL nút CTA" hint="Link nút CTA dẫn đến">
              <input
                className={inputClass}
                value={draft.ctaUrl}
                onChange={(e) => onChange({ ctaUrl: e.target.value })}
                placeholder="https://nedu.vn/thu-thach"
              />
            </Field>
          </div>

          <Field label="YouTube Playlist Review" hint="Link playlist video đánh giá học viên" className="mt-4">
            <input
              className={inputClass}
              value={draft.ytPlaylist}
              onChange={(e) => onChange({ ytPlaylist: e.target.value })}
              placeholder="https://www.youtube.com/playlist?list=..."
            />
          </Field>
        </Section>
    </div>
  )
}

// Thông tin doanh nghiệp (tên DN + MST + cờ ẩn/hiện) hiển thị ở footer nedu.vn.
// State + save tách riêng khỏi Hero settings (endpoint /cms/site-config khác).
function CompanyInfoSection() {
  const { data: original, isLoading, isError } = useSiteConfig()
  const update = useUpdateSiteConfig()
  const [draft, setDraft] = useState<SiteConfig | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (original && !draft) setDraft(original)
  }, [original, draft])

  const dirty = useMemo(() => {
    if (!draft || !original) return false
    return JSON.stringify(draft) !== JSON.stringify(original)
  }, [draft, original])

  const onChange = (patch: Partial<SiteConfig>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    if (saveState === 'saved') setSaveState('idle')
  }

  const onSave = async () => {
    if (!draft) return
    setSaveState('saving')
    try {
      const saved = await update.mutateAsync(draft)
      setDraft(saved)
      setSavedAt(new Date())
      setSaveState('saved')
      toast.success('Đã lưu thông tin doanh nghiệp')
    } catch {
      setSaveState('error')
      toast.error('Lưu thất bại — kiểm tra quyền admin')
    }
  }

  return (
    <Section
      title="Thông tin doanh nghiệp"
      description="Tên doanh nghiệp + mã số thuế hiển thị ở chân trang nedu.vn. Tắt công tắc để ẩn."
    >
      {isError && (
        <div className="mb-4 px-3 py-2 rounded-md bg-[#FEE2E2] text-[#B91C1C] text-xs">
          Không tải được thông tin doanh nghiệp — kiểm tra quyền admin.
        </div>
      )}

      {isLoading || !draft ? (
        <Skeleton height={140} />
      ) : (
        <>
          {dirty && (
            <div className="mb-4 px-3 py-2 rounded-md bg-[#FEF3C7] text-[#B45309] text-xs">
              Có thay đổi chưa lưu — đừng quên bấm "Lưu thông tin".
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <Field label="Tên doanh nghiệp" hint="VD: CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ NHILE">
              <input
                className={inputClass}
                value={draft.company_name}
                onChange={(e) => onChange({ company_name: e.target.value })}
              />
            </Field>
            <Field label="Mã số thuế" hint="VD: 0317268736">
              <input
                className={inputClass}
                value={draft.tax_id}
                onChange={(e) => onChange({ tax_id: e.target.value })}
              />
            </Field>
            <Field label="Địa chỉ" hint="Địa chỉ trụ sở hiển thị ở footer">
              <textarea
                className={textareaClass}
                value={draft.address}
                onChange={(e) => onChange({ address: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-md border border-[#E5E7EB] px-3 py-2.5">
            <div>
              <div className="text-xs font-medium text-[#374151]">Hiển thị trên website</div>
              <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                {draft.is_visible
                  ? 'Tên DN + MST + địa chỉ đang hiển thị ở footer nedu.vn'
                  : 'Đang ẩn — footer nedu.vn không hiện tên DN + MST + địa chỉ'}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.is_visible}
              onClick={() => onChange({ is_visible: !draft.is_visible })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                draft.is_visible ? 'bg-[#2D6A8C]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  draft.is_visible ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <SaveButton state={saveState} onClick={onSave} savedAt={savedAt} label="Lưu thông tin" />
          </div>
        </>
      )}
    </Section>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <header className="px-5 py-3 border-b border-[#E5E7EB]">
        <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
        {description && <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  className = '',
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs font-medium text-[#374151] mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-[#9CA3AF] mt-1">{hint}</div>}
    </label>
  )
}
