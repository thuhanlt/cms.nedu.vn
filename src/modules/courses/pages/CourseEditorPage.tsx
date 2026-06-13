import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Monitor, Smartphone, Maximize2, Minimize2 } from 'lucide-react'
import { useCourse, useUpdateCourse } from '../hooks/useCourses'
import { CourseSectionNav, type CourseSectionKey } from '../components/CourseSectionNav'
import { CoursePreview } from '../components/preview/CoursePreview'
import { HeroBgSection } from '../components/editor/HeroBgSection'
import { HeroSection } from '../components/editor/HeroSection'
import { TestWidgetSection } from '../components/editor/TestWidgetSection'
import { OutcomesSection } from '../components/editor/OutcomesSection'
import { CurriculumSection } from '../components/editor/CurriculumSection'
import { InstructorsSection } from '../components/editor/InstructorsSection'
import { ReviewsSection } from '../components/editor/ReviewsSection'
import { PriceSection } from '../components/editor/PriceSection'
import { QASection } from '../components/editor/QASection'
import { SaveButton, type SaveState } from '@shared/components/SaveButton'
import { Skeleton } from '@shared/components/Skeleton'
import { toast } from '@shared/stores/useToastStore'
import type { Course, CourseContent } from '../types/course'

const LABEL: Record<CourseSectionKey, string> = {
  'hero-bg': 'Ảnh bìa khoá học',
  'hero': 'Phần Hero',
  'test-widget': 'Test widget cá nhân hoá',
  'outcomes': 'Bạn sẽ học được gì',
  'curriculum': 'Chương trình học',
  'instructors': 'Người dẫn đường',
  'reviews': 'Học viên nói gì',
  'price': 'Học phí & Lịch khai giảng',
  'qa': 'Câu hỏi thường gặp',
}

export function CourseEditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data: original, isLoading } = useCourse(id)
  const update = useUpdateCourse()

  const [draft, setDraft] = useState<Course | null>(null)
  const [section, setSection] = useState<CourseSectionKey>('hero-bg')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [fullscreen, setFullscreen] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (original && !draft) setDraft(original)
  }, [original, draft])

  const dirty = useMemo(() => {
    if (!draft || !original) return false
    return JSON.stringify(draft) !== JSON.stringify(original)
  }, [draft, original])

  const onChange = (patch: Partial<Course>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    if (saveState === 'saved') setSaveState('idle')
  }
  const onContentChange = (patch: Partial<CourseContent>) => {
    setDraft((d) => (d ? { ...d, content: { ...d.content, ...patch } } : d))
    if (saveState === 'saved') setSaveState('idle')
  }

  const onSave = async () => {
    if (!draft || !id) return
    if (!draft.name.trim()) {
      toast.error('Tên khoá học không được để trống')
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
        <Link to="/dashboard/courses" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827]">
          <ArrowLeft size={14} />
          Danh sách
        </Link>
        <div className="h-6 w-px bg-[#E5E7EB] mx-1" />
        <div className="text-sm font-medium text-[#111827] truncate max-w-[200px]">{draft.name || 'Khoá học mới'}</div>
        {dirty && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">Chưa lưu</span>}

        <div className="flex-1" />

        {/* Published toggle */}
        <label className="inline-flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border border-[#E5E7EB] bg-white">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => onChange({ published: e.target.checked })}
            className="accent-[#2D6A8C]"
          />
          <span className="text-[11px] text-[#374151]">{draft.published ? 'Đã đăng' : 'Nháp'}</span>
        </label>

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
            <CourseSectionNav current={section} onChange={setSection} />

            <div className="w-[500px] shrink-0 border-r border-[#E5E7EB] bg-white overflow-y-auto">
              <div className="px-5 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
                <h3 className="text-sm font-semibold text-[#111827]">{LABEL[section]}</h3>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Chỉnh sửa nội dung — xem trước cập nhật ngay bên phải.</p>
              </div>
              <div className="p-5">
                <SectionEditor section={section} draft={draft} onChange={onChange} onContentChange={onContentChange} />
              </div>
            </div>
          </>
        )}

        <div className="flex-1 min-w-0 overflow-y-auto bg-[#E5E7EB]/40 py-6">
          <CoursePreview draft={draft} device={device} highlight={section} />
        </div>
      </div>
    </div>
  )
}

function SectionEditor({
  section,
  draft,
  onChange,
  onContentChange,
}: {
  section: CourseSectionKey
  draft: Course
  onChange: (p: Partial<Course>) => void
  onContentChange: (p: Partial<CourseContent>) => void
}) {
  switch (section) {
    case 'hero-bg':
      return <HeroBgSection draft={draft} onContentChange={onContentChange} />
    case 'hero':
      return <HeroSection draft={draft} onChange={onChange} onContentChange={onContentChange} />
    case 'test-widget':
      return <TestWidgetSection content={draft.content} onContentChange={onContentChange} />
    case 'outcomes':
      return <OutcomesSection content={draft.content} onContentChange={onContentChange} />
    case 'curriculum':
      return <CurriculumSection content={draft.content} onContentChange={onContentChange} />
    case 'instructors':
      return <InstructorsSection content={draft.content} onContentChange={onContentChange} />
    case 'reviews':
      return <ReviewsSection content={draft.content} onContentChange={onContentChange} />
    case 'price':
      return <PriceSection draft={draft} onContentChange={onContentChange} />
    case 'qa':
      return <QASection content={draft.content} onContentChange={onContentChange} />
  }
}
