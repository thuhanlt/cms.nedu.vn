import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Monitor, Smartphone, Maximize2, Minimize2 } from 'lucide-react'
import { useChallenge, useUpdateChallenge } from '../hooks/useChallenges'
import { ChallengeSectionNav, type ChallengeSectionKey } from '../components/ChallengeSectionNav'
import { ChallengePreview } from '../components/preview/ChallengePreview'
import { BannerSection } from '../components/editor/BannerSection'
import { OutcomesSection } from '../components/editor/OutcomesSection'
import { CurriculumSection } from '../components/editor/CurriculumSection'
import { InstructorSection } from '../components/editor/InstructorSection'
import { ReviewsSection } from '../components/editor/ReviewsSection'
import { FaqSection } from '../components/editor/FaqSection'
import { PriceSection } from '../components/editor/PriceSection'
import { SaveButton, type SaveState } from '@shared/components/SaveButton'
import { Skeleton } from '@shared/components/Skeleton'
import { toast } from '@shared/stores/useToastStore'
import type { Challenge, ChallengeContent } from '../types/challenge'

export function ChallengeEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: original, isLoading } = useChallenge(id)
  const update = useUpdateChallenge()

  const [draft, setDraft] = useState<Challenge | null>(null)
  const [section, setSection] = useState<ChallengeSectionKey>('banner')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [fullscreen, setFullscreen] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  // Bootstrap draft từ server
  useEffect(() => {
    if (original && !draft) setDraft(original)
  }, [original, draft])

  // Mất focus / dirty tracking đơn giản
  const dirty = useMemo(() => {
    if (!draft || !original) return false
    return JSON.stringify(draft) !== JSON.stringify(original)
  }, [draft, original])

  const onChange = (patch: Partial<Challenge>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    if (saveState === 'saved') setSaveState('idle')
  }
  const onContentChange = (patch: Partial<ChallengeContent>) => {
    setDraft((d) => (d ? { ...d, content: { ...d.content, ...patch } } : d))
    if (saveState === 'saved') setSaveState('idle')
  }

  const onSave = async () => {
    if (!draft || !id) return
    if (!draft.name.trim()) {
      toast.error('Tên thử thách không được để trống')
      return
    }
    setSaveState('saving')
    try {
      const saved = await update.mutateAsync({ id, patch: draft })
      setDraft(saved)
      setSavedAt(new Date())
      setSaveState('saved')
      toast.success('Đã lưu thay đổi')
    } catch {
      setSaveState('error')
      toast.error('Lưu thất bại — thử lại')
    }
  }

  if (isLoading || !draft) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton height={28} width={240} />
        <Skeleton height={400} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA]">
      {/* TOOLBAR */}
      <header className="shrink-0 h-14 bg-white border-b border-[#E5E7EB] flex items-center gap-3 px-4">
        <Link
          to="/dashboard/challenges"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827]"
        >
          <ArrowLeft size={14} />
          Danh sách
        </Link>

        <div className="h-6 w-px bg-[#E5E7EB] mx-1" />

        <div className="text-sm font-medium text-[#111827] truncate max-w-[200px]">{draft.name || 'Thử thách mới'}</div>
        {dirty && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">Chưa lưu</span>}

        <div className="flex-1" />

        {/* Khai giảng + countdown */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#E5E7EB] bg-white">
          <label className="text-[11px] text-[#6B7280] whitespace-nowrap">Khai giảng:</label>
          <input
            value={draft.startDate ?? ''}
            onChange={(e) => onChange({ startDate: e.target.value })}
            placeholder="dd/mm/yyyy"
            className="w-[110px] text-sm bg-transparent focus:outline-none"
          />
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.content.countdown.enabled}
              onChange={(e) => onContentChange({ countdown: { enabled: e.target.checked } })}
              className="accent-[#2D6A8C]"
            />
            <span className="text-[11px] text-[#374151]">Đếm ngược</span>
          </label>
        </div>

        {/* Device toggle */}
        <div className="inline-flex rounded-md border border-[#E5E7EB] bg-white p-0.5">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-2 py-1 rounded ${device === 'desktop' ? 'bg-[#E0EFF5] text-[#1F5374]' : 'text-[#6B7280] hover:text-[#111827]'}`}
            title="Máy tính"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-2 py-1 rounded ${device === 'mobile' ? 'bg-[#E0EFF5] text-[#1F5374]' : 'text-[#6B7280] hover:text-[#111827]'}`}
            title="Điện thoại"
          >
            <Smartphone size={14} />
          </button>
        </div>

        {/* Fullscreen */}
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="p-1.5 rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
          title={fullscreen ? 'Thoát toàn màn hình' : 'Phóng to xem trước'}
        >
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        <SaveButton state={saveState} onClick={onSave} savedAt={savedAt} />
      </header>

      {/* BODY: 3-pane */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {!fullscreen && (
          <>
            <ChallengeSectionNav current={section} onChange={setSection} />

            <div className="w-[480px] shrink-0 border-r border-[#E5E7EB] bg-white overflow-y-auto">
              <div className="px-5 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
                <h3 className="text-sm font-semibold text-[#111827]">
                  {labelOfSection(section)}
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Chỉnh sửa nội dung — xem trước cập nhật ngay bên phải.</p>
              </div>
              <div className="p-5">
                <SectionEditor
                  section={section}
                  draft={draft}
                  onChange={onChange}
                  onContentChange={onContentChange}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex-1 min-w-0 overflow-y-auto bg-[#E5E7EB]/40 py-6">
          <ChallengePreview draft={draft} device={device} highlight={section} />
        </div>
      </div>

      {/* Block đóng tab nếu chưa lưu */}
      {dirty && <BeforeUnloadGuard />}
      {/* Hint giữ navigation */}
      <NavWarnIfDirty dirty={dirty} onSaveSuccess={() => navigate('/dashboard/challenges')} />
    </div>
  )
}

function labelOfSection(s: ChallengeSectionKey): string {
  const m: Record<ChallengeSectionKey, string> = {
    banner: 'Banner & Thông tin',
    outcomes: 'Sau 30 ngày',
    curriculum: 'Chương trình',
    instructor: 'Người đồng hành',
    reviews: 'Học viên nói gì',
    faqs: 'FAQ',
    price: 'Giá & Quyền lợi',
  }
  return m[s]
}

function SectionEditor({
  section,
  draft,
  onChange,
  onContentChange,
}: {
  section: ChallengeSectionKey
  draft: Challenge
  onChange: (p: Partial<Challenge>) => void
  onContentChange: (p: Partial<ChallengeContent>) => void
}) {
  switch (section) {
    case 'banner':
      return <BannerSection draft={draft} onChange={onChange} onContentChange={onContentChange} />
    case 'outcomes':
      return <OutcomesSection content={draft.content} onContentChange={onContentChange} />
    case 'curriculum':
      return <CurriculumSection content={draft.content} onContentChange={onContentChange} />
    case 'instructor':
      return <InstructorSection content={draft.content} onContentChange={onContentChange} />
    case 'reviews':
      return <ReviewsSection content={draft.content} onContentChange={onContentChange} />
    case 'faqs':
      return <FaqSection content={draft.content} onContentChange={onContentChange} />
    case 'price':
      return <PriceSection draft={draft} onChange={onChange} onContentChange={onContentChange} />
  }
}

function BeforeUnloadGuard() {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])
  return null
}

// no-op placeholder hook hook (avoid lint unused) — reserved for future router block
function NavWarnIfDirty(_props: { dirty: boolean; onSaveSuccess: () => void }) {
  return null
}
