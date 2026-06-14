import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Monitor, Smartphone, Maximize2, Minimize2 } from 'lucide-react'
import { useCourse, useUpdateCourse } from '../hooks/useCourses'
import { useCourseRuns } from '../hooks/useCourseRuns'
import { CourseSectionNav, navToHighlight, type CourseSectionKey } from '../components/CourseSectionNav'
import { CourseRealPreview } from '../preview/CourseRealPreview'
import { CardSection } from '../components/editor/CardSection'
import { HeroSection } from '../components/editor/HeroSection'
import { TestWidgetSection } from '../components/editor/TestWidgetSection'
import { OutcomesSection } from '../components/editor/OutcomesSection'
import { CurriculumSection } from '../components/editor/CurriculumSection'
import { InstructorsSection } from '../components/editor/InstructorsSection'
import { ReviewsSection } from '../components/editor/ReviewsSection'
import { PricingSidebarSection } from '../components/editor/PricingSidebarSection'
import { RunsSection } from '../components/editor/RunsSection'
import { SaveButton, type SaveState } from '@shared/components/SaveButton'
import { Skeleton } from '@shared/components/Skeleton'
import { toast } from '@shared/stores/useToastStore'
import type { Course, CourseEditableContent, CourseRun } from '../types/course'
import type { CourseContent, CourseStatus as PreviewStatus } from '../preview/courseContent.schema'

const LABEL: Record<CourseSectionKey, string> = {
  card: 'Card listing',
  hero: 'Phần Hero',
  test: 'Test widget cá nhân hoá',
  outcomes: 'Bạn sẽ học được gì',
  curriculum: 'Chương trình học',
  instructors: 'Người dẫn đường',
  reviews: 'Học viên nói gì',
  pricing: 'Giá & Quyền lợi',
  runs: 'Lịch khai giảng',
}

// ─────────────────────────────────────────────────────────────────────────────
// draftToCourseContent — build CourseContent (render contract) từ Course + run.
//   - card/hero/sidebar/outcomes/instructor/co_instructors/reviews: map thẳng.
//   - curriculum[].week → Module.num (pad 2), duration_label → Module.meta.
//   - commerce: lấy từ run đang chọn (run sắp tới gần nhất) → giá / suất / ngày.
//     Không có run → commerce rỗng (giá 0, không suất).
// ─────────────────────────────────────────────────────────────────────────────
// run.status (BE enum) → nedu.vn CourseStatus ('open'|'closed'|'coming_soon').
function runStatusToCommerce(run: CourseRun | undefined): PreviewStatus {
  if (!run) return 'coming_soon'
  switch (run.status) {
    case 'enrollment_open':
      return 'open'
    case 'enrollment_closed':
    case 'completed':
    case 'cancelled':
      return 'closed'
    case 'planned':
    case 'running':
    default:
      return 'coming_soon'
  }
}

/** Chọn run feed sidebar: ưu tiên run còn hiệu lực sớm nhất (open/scheduled), fallback run đầu. */
function pickActiveRun(runs: CourseRun[]): CourseRun | undefined {
  if (runs.length === 0) return undefined
  const upcoming = runs
    .filter((r) => r.status !== 'cancelled' && r.status !== 'completed')
    .sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''))
  return upcoming[0] ?? runs[0]
}

export function draftToCourseContent(course: Course, run?: CourseRun): CourseContent {
  const c = course.content
  return {
    slug: course.slug,
    code: course.code,
    test_widget_enabled: c.test_widget_enabled,
    card: c.card,
    hero: {
      ...c.hero,
      title: c.hero.title || course.name,
    },
    commerce: {
      base_price_vnd_net: run?.base_price_vnd ?? 0,
      seats_total: run?.capacity ?? null,
      seats_remaining:
        run && run.capacity != null ? Math.max(0, run.capacity - run.enrolled_count) : null,
      start_date: run?.start_date ?? null,
      registration_deadline: run?.enrollment_close_at ?? null,
      status: runStatusToCommerce(run),
    },
    sidebar: c.sidebar,
    // Editor lưu avatar dưới key `avatar_url` (CMS metadata DTO); preview render
    // theo key `photo_url` → bắc cầu avatar_url → photo_url tại đây.
    instructor: { ...c.instructor, photo_url: c.instructor.avatar_url },
    co_instructors: c.co_instructors.map((ci) => ({
      ...ci,
      photo_url: ci.avatar_url,
    })),
    outcomes: c.outcomes,
    modules: c.curriculum.map((m) => ({
      num: String(m.week).padStart(2, '0'),
      title: m.title,
      meta: m.duration_label,
      topics: m.topics,
    })),
    // Review avatar: key contract avatar_url → key render author_photo_url.
    reviews: {
      ...c.reviews,
      items: c.reviews.items.map((r) => ({
        ...r,
        author_photo_url: r.avatar_url,
      })),
    },
  }
}

export function CourseEditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data: original, isLoading } = useCourse(id)
  const { data: runs } = useCourseRuns(id)
  const update = useUpdateCourse()

  const [draft, setDraft] = useState<Course | null>(null)
  const [section, setSection] = useState<CourseSectionKey>('card')
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

  const activeRun = useMemo(() => pickActiveRun(runs ?? []), [runs])

  const previewContent = useMemo(
    () => (draft ? draftToCourseContent(draft, activeRun) : null),
    [draft, activeRun],
  )

  const onChange = (patch: Partial<Course>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    if (saveState === 'saved') setSaveState('idle')
  }
  const onContentChange = (patch: Partial<CourseEditableContent>) => {
    setDraft((d) => (d ? { ...d, content: { ...d.content, ...patch } } : d))
    if (saveState === 'saved') setSaveState('idle')
  }

  const onTogglePublish = (next: boolean) => {
    setDraft((d) =>
      d
        ? { ...d, published: next, is_public: next, content: { ...d.content, content_published: next } }
        : d,
    )
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

  if (isLoading || !draft || !previewContent) {
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
            onChange={(e) => onTogglePublish(e.target.checked)}
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
                <SectionEditor
                  section={section}
                  draft={draft}
                  courseId={id ?? ''}
                  onChange={onChange}
                  onContentChange={onContentChange}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex-1 min-w-0 overflow-y-auto bg-[#E5E7EB]/40 py-6">
          <CourseRealPreview content={previewContent} device={device} highlight={navToHighlight(section)} />
        </div>
      </div>
    </div>
  )
}

function SectionEditor({
  section,
  draft,
  courseId,
  onChange,
  onContentChange,
}: {
  section: CourseSectionKey
  draft: Course
  courseId: string
  onChange: (p: Partial<Course>) => void
  onContentChange: (p: Partial<CourseEditableContent>) => void
}) {
  switch (section) {
    case 'card':
      return <CardSection draft={draft} onChange={onChange} onContentChange={onContentChange} />
    case 'hero':
      return <HeroSection draft={draft} onChange={onChange} onContentChange={onContentChange} />
    case 'test':
      return <TestWidgetSection content={draft.content} onContentChange={onContentChange} />
    case 'outcomes':
      return <OutcomesSection content={draft.content} onContentChange={onContentChange} />
    case 'curriculum':
      return <CurriculumSection content={draft.content} onContentChange={onContentChange} />
    case 'instructors':
      return <InstructorsSection content={draft.content} onContentChange={onContentChange} />
    case 'reviews':
      return <ReviewsSection content={draft.content} onContentChange={onContentChange} />
    case 'pricing':
      return <PricingSidebarSection content={draft.content} onContentChange={onContentChange} />
    case 'runs':
      return <RunsSection courseId={courseId} />
  }
}
