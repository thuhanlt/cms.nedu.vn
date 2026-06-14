// ─────────────────────────────────────────────────────────────────────────────
// CourseRealPreview — port standalone của nedu.vn `CourseDetailClient`.
//
// Render Y HỆT trang chi tiết khoá học THẬT của nedu.vn (CSS `.mockup-root` bê
// nguyên), để team nội dung CMS xem trước đúng như trang thật. Bước này chỉ là
// component preview — chưa wire vào editor.
//
// KHÁC nedu.vn CourseDetailClient:
//   - Bỏ Next.js deps: 'use client', next/dynamic, next/link, useRouter, next/image.
//   - Modal (Consultation/Login), SiteFooter, addToCart: bỏ / stub. Mọi nút CTA
//     onClick = no-op (preview, không điều hướng / mua).
//   - Props nhận `content: CourseContent` thẳng (không CourseDetailMerged).
//     Commerce/sidebar lấy từ content như nedu.vn.
//   - Thêm `device` (desktop/mobile) + `highlight` (section đang sửa) cho CMS.
//
// Section keys (highlight) — khớp với editor sau:
//   hero · test · outcomes · curriculum · instructors · reviews · pricing
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type ReactNode } from 'react'
import type {
  CourseContent,
  OutcomeIcon,
} from './courseContent.schema'
import './CourseRealPreview.css'

const PER_PAGE = 3

export type CourseRealPreviewSection =
  | 'hero'
  | 'test'
  | 'outcomes'
  | 'curriculum'
  | 'instructors'
  | 'reviews'
  | 'pricing'

interface Props {
  content: CourseContent
  device?: 'desktop' | 'mobile'
  highlight?: CourseRealPreviewSection
}

// ─── Helpers ────────────────────────────────────────────────────────────────
// Giá: bê đúng logic từ CourseDetailClient.formatPrice — display_price_override
// nguyên văn nếu có, ngược lại format base_price_vnd_net (NET) theo vi-VN + '₫'.
// (Trang thật KHÔNG tự cộng VAT ở sidebar — comment schema chỉ mô tả ý định;
// giữ y hệt để pixel/value match.)
function formatPrice(content: CourseContent): string {
  const c = content.commerce
  if (c.display_price_override) return c.display_price_override
  return `${c.base_price_vnd_net.toLocaleString('vi-VN')}₫`
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${m[3]} / ${m[2]} / ${m[1]}`
}

// ─── Section wrapper — highlight outline + nhãn "Đang chỉnh sửa" ─────────────
function Section({
  id,
  highlight,
  children,
}: {
  id: CourseRealPreviewSection
  highlight: CourseRealPreviewSection | undefined
  children: ReactNode
}) {
  const active = id === highlight
  return (
    <div className={`crp-section${active ? ' crp-active' : ''}`}>
      {active && <span className="crp-edit-label">✏ Đang chỉnh sửa</span>}
      {children}
    </div>
  )
}

// ─── Outcome icon SVG (map OutcomeIcon enum → inline SVG) ───────────────────
function OutcomeIconSvg({ kind }: { kind: OutcomeIcon }) {
  switch (kind) {
    case 'check':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    case 'chart':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M3 3v18h18" />
          <path d="m7 14 4-4 4 4 5-5" />
        </svg>
      )
    case 'clock':
      return (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'target':
      return (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
  }
}

function StarSvg() {
  return (
    <svg viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </svg>
  )
}

// ─── Avatar (instructor / co-instructor) — img khi có photo_url, else initial ─
// onError: ảnh hỏng (404/link chết) → ẩn img, fallback ô chữ-cái-đầu.
function InstructorAvatar({
  photoUrl,
  initial,
  name,
}: {
  photoUrl?: string
  initial: string
  name: string
}) {
  const [hasError, setHasError] = useState(false)
  if (photoUrl && !hasError) {
    return (
      <img
        className="instructor-avatar instructor-avatar--img"
        src={photoUrl}
        alt={name}
        onError={() => setHasError(true)}
      />
    )
  }
  return <div className="instructor-avatar">{initial}</div>
}

// ─── Review avatar — img khi có author_photo_url, else ô chữ-cái-đầu của tên ──
function ReviewAvatar({ photoUrl, author }: { photoUrl?: string; author: string }) {
  const [hasError, setHasError] = useState(false)
  const initial = author.charAt(0).toUpperCase() || '?'
  if (photoUrl && !hasError) {
    return (
      <img
        className="review-avatar review-avatar--img"
        src={photoUrl}
        alt={author}
        onError={() => setHasError(true)}
      />
    )
  }
  return <div className="review-avatar">{initial}</div>
}

// Test widget steps — shared across all detail pages (giống nedu.vn).
const TEST_STEPS = [
  'Chọn giai đoạn cuộc sống',
  'Trả lời 4 bộ câu hỏi MaxDiff',
  'Nhận kết quả cá nhân hoá',
  'Đăng ký khoá phù hợp nhất',
]

// no-op cho mọi nút CTA trong preview.
const noop = () => {}

// ─── Main component ─────────────────────────────────────────────────────────
export function CourseRealPreview({ content, device = 'desktop', highlight }: Props) {
  const [openModule, setOpenModule] = useState(0)
  const [reviewPage, setReviewPage] = useState(1)

  const c = content
  const isMobile = device === 'mobile'

  const reviews = c.reviews
  const totalReviewPages = reviews ? Math.ceil(reviews.items.length / PER_PAGE) : 0
  const reviewSlice =
    reviews?.items.slice((reviewPage - 1) * PER_PAGE, reviewPage * PER_PAGE) ?? []

  const seatsRemaining = c.commerce.seats_remaining
  const deadlineFmt = formatDate(c.commerce.registration_deadline)

  return (
    <div className={`course-real-preview${isMobile ? ' preview-mobile' : ''}`}>
      <div className="mockup-root">
        {/* ─── NAV ─────────────────────────────────────────────────────── */}
        <nav className="nav">
          <div className="nav-inner">
            <a className="logo" href="#" onClick={(e) => e.preventDefault()}>
              nedu<span style={{ color: '#E8A020' }}>.vn</span>
            </a>
            <div className="breadcrumb">
              <a href="#" onClick={(e) => e.preventDefault()}>Khoá học</a>
              {'  →  '}
              <span className="current">{c.card.name}</span>
            </div>
            <div className="nav-actions">
              <button className="btn btn-ghost" type="button" onClick={noop}>
                Tư vấn
              </button>
              <button className="btn btn-cta btn-cta-white" type="button" onClick={noop}>
                Đăng ký ngay
              </button>
            </div>
          </div>
        </nav>

        {/* ─── HERO ────────────────────────────────────────────────────── */}
        <Section id="hero" highlight={highlight}>
          <section className="hero">
            <div className="hero-inner">
              <div className="hero-badges">
                {c.hero.badges.map((b, i) => (
                  <span key={i} className={`badge badge-${b.variant}`}>
                    {b.variant === 'open' && (
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#E8A020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
                        <circle cx="12" cy="12" r="6" />
                      </svg>
                    )}
                    {b.label}
                  </span>
                ))}
              </div>
              <h1 className="hero-title">{c.hero.title}</h1>
              <p className="hero-sub">{c.hero.subtitle}</p>
              <div className="hero-meta">
                {c.hero.meta.map((m, i) => (
                  <div key={i} className="meta-item">
                    <span className="meta-label">{m.label}</span>
                    <span className="meta-value">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Section>

        {/* ─── MAIN ────────────────────────────────────────────────────── */}
        <main className="main">
          {/* LEFT COLUMN */}
          <div className="left">
            {/* A. TEST WIDGET — shared, hardcoded. Gate theo content.test_widget_enabled
                (undefined/true = hiện; false = ẩn). */}
            {c.test_widget_enabled !== false && (
            <Section id="test" highlight={highlight}>
              <div className="test-widget">
                <h2 className="test-title">Khoá này có thực sự phù hợp với bạn không?</h2>
                <p className="test-body">
                  Làm bài test 5 phút để N-Edu hiểu bạn đang ở đâu trong cuộc sống — và
                  gợi ý khoá học phù hợp nhất với bạn lúc này. Kết quả được cá nhân hoá
                  theo tâm lý học hành vi.
                </p>
                <div className="test-steps">
                  {TEST_STEPS.map((step, i) => (
                    <div key={i} className="test-step">
                      <span className="step-icon">{i + 1}</span>
                      <span className="step-text">{step}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-cta btn-cta-white btn-full"
                  type="button"
                  onClick={noop}
                >
                  Làm bài test miễn phí — 5 phút
                </button>
                <p className="test-note">
                  <span className="icon-outline" style={{ verticalAlign: -4, marginRight: 4 }}>
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  Kết quả chỉ dùng để cá nhân hoá lộ trình · Không spam · Không bán dữ liệu
                </p>
              </div>
            </Section>
            )}

            {/* B. OUTCOMES (conditional) */}
            {c.outcomes && c.outcomes.length > 0 && (
              <Section id="outcomes" highlight={highlight}>
                <div className="card">
                  <h2 className="card-heading">Bạn sẽ học được gì</h2>
                  <p className="card-sub">
                    {c.outcomes.length} năng lực cốt lõi sau khi hoàn thành khoá học.
                  </p>
                  <div className="outcomes">
                    {c.outcomes.map((o, i) => (
                      <div key={i} className="outcome">
                        <div className="outcome-icon">
                          <OutcomeIconSvg kind={o.icon} />
                        </div>
                        <div>
                          <h3 className="outcome-title">{o.title}</h3>
                          <p className="outcome-desc">{o.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* C. MODULES (conditional) */}
            {c.modules && c.modules.length > 0 && (
              <Section id="curriculum" highlight={highlight}>
                <div className="card">
                  <h2 className="card-heading">Chương trình học</h2>
                  <p className="card-sub">
                    {c.modules.length} module — từng bước có chủ đích.
                  </p>
                  {c.modules.map((m, i) => {
                    const isOpen = openModule === i
                    return (
                      <div
                        key={i}
                        className={`module${isOpen ? ' open' : ''}`}
                        onClick={() => setOpenModule(isOpen ? -1 : i)}
                      >
                        <div className="module-head">
                          <span className="module-num">{m.num}</span>
                          <div className="module-info">
                            <h3 className="module-title">{m.title}</h3>
                            <p className="module-meta">{m.meta}</p>
                          </div>
                          <svg className="module-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                        <div className="module-body">
                          <ul className="module-topics">
                            {m.topics.map((t, j) => <li key={j}>{t}</li>)}
                          </ul>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* D. INSTRUCTOR (always present) */}
            <Section id="instructors" highlight={highlight}>
              <div className="card">
                <h2 className="card-heading">Người dẫn đường</h2>
                <p className="card-sub">Đồng hành cùng bạn qua từng buổi học.</p>
                <div className="instructor">
                  <InstructorAvatar
                    photoUrl={c.instructor.photo_url}
                    initial={c.instructor.initial}
                    name={c.instructor.name}
                  />
                  <div>
                    <h3 className="instructor-name">{c.instructor.name}</h3>
                    <p className="instructor-title">{c.instructor.title}</p>

                    {c.instructor.tags.length > 0 && (
                      <div className="instructor-tags">
                        {c.instructor.tags.map((t) => (
                          <span key={t} className="instructor-tag">{t}</span>
                        ))}
                      </div>
                    )}

                    <p className="instructor-bio">{c.instructor.bio}</p>

                    {c.instructor.education && (
                      <>
                        <h4 className="instructor-subhead">Học vấn</h4>
                        <p className="instructor-bio">{c.instructor.education}</p>
                      </>
                    )}

                    {c.instructor.career_intro && (
                      <>
                        <h4 className="instructor-subhead">Sự nghiệp và các dự án nổi bật</h4>
                        <p className="instructor-bio">{c.instructor.career_intro}</p>
                      </>
                    )}

                    {c.instructor.career_bullets && c.instructor.career_bullets.length > 0 && (
                      <ul className="instructor-list">
                        {c.instructor.career_bullets.map((b, i) => (
                          <li key={i}>
                            <strong>{b.label}:</strong> {b.desc}
                          </li>
                        ))}
                      </ul>
                    )}

                    {c.instructor.achievements && c.instructor.achievements.length > 0 && (
                      <>
                        <h4 className="instructor-subhead">Thành tích và giải thưởng</h4>
                        {c.instructor.achievements.map((a, i) => (
                          <div key={i} className="achievement-row">
                            <span className="achievement-date">{a.date}</span>
                            <span className="achievement-text">{a.text}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Co-instructors — render cùng card, divider phía trên. */}
                {c.co_instructors && c.co_instructors.length > 0 && (
                  <>
                    {c.co_instructors.map((ci, idx) => (
                      <div key={idx} className="instructor instructor--co">
                        <InstructorAvatar
                          photoUrl={ci.photo_url}
                          initial={ci.initial}
                          name={ci.name}
                        />
                        <div>
                          <h3 className="instructor-name">{ci.name}</h3>
                          <p className="instructor-title">{ci.title}</p>

                          {ci.tags.length > 0 && (
                            <div className="instructor-tags">
                              {ci.tags.map((t) => (
                                <span key={t} className="instructor-tag">{t}</span>
                              ))}
                            </div>
                          )}

                          {ci.bio && <p className="instructor-bio">{ci.bio}</p>}

                          {ci.education && (
                            <>
                              <h4 className="instructor-subhead">Học vấn & Chuyên môn</h4>
                              <p className="instructor-bio">{ci.education}</p>
                            </>
                          )}

                          {ci.career_intro && (
                            <>
                              <h4 className="instructor-subhead">Sự nghiệp & Dự án nổi bật</h4>
                              <p className="instructor-bio">{ci.career_intro}</p>
                            </>
                          )}

                          {ci.career_bullets && ci.career_bullets.length > 0 && (
                            <ul className="instructor-list">
                              {ci.career_bullets.map((b, i) => (
                                <li key={i}>
                                  <strong>{b.label}:</strong> {b.desc}
                                </li>
                              ))}
                            </ul>
                          )}

                          {ci.achievements && ci.achievements.length > 0 && (
                            <>
                              <h4 className="instructor-subhead">Thành tích & Giải thưởng</h4>
                              {ci.achievements.map((a, i) => (
                                <div key={i} className="achievement-row">
                                  <span className="achievement-date">{a.date}</span>
                                  <span className="achievement-text">{a.text}</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Section>

            {/* E. REVIEWS (conditional) */}
            {reviews && reviews.items.length > 0 && (
              <Section id="reviews" highlight={highlight}>
                <div className="card">
                  <h2 className="card-heading">Học viên nói gì?</h2>

                  <div className="rating-overall">
                    <span className="rating-num">{reviews.rating_overall.toFixed(1)}</span>
                    <div>
                      <div className="rating-stars" aria-label={`${reviews.rating_overall}/5`}>
                        {Array.from({ length: 5 }).map((_, i) => <StarSvg key={i} />)}
                      </div>
                      <p className="rating-text">Trên {reviews.rating_count} phản hồi học viên</p>
                    </div>
                  </div>

                  <div className="reviews">
                    {reviewSlice.map((r, i) => (
                      <div key={`${reviewPage}-${i}`} className="review">
                        <div className="review-head">
                          <ReviewAvatar photoUrl={r.author_photo_url} author={r.author} />
                          <div className="review-head-text">
                            <div className="review-stars" aria-hidden="true">
                              {Array.from({ length: r.rating }).map((_, j) => <StarSvg key={j} />)}
                            </div>
                            <p className="review-meta">
                              {r.author}
                              {' — '}
                              {r.role ?? c.card.name}
                              {r.cohort ? ` — ${r.cohort}` : ''}
                            </p>
                          </div>
                        </div>
                        <p className="review-text">&ldquo;{r.body}&rdquo;</p>
                      </div>
                    ))}
                  </div>

                  {totalReviewPages > 1 && (
                    <div className="reviews-pagination">
                      {Array.from({ length: totalReviewPages }).map((_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            type="button"
                            className={`page-btn${page === reviewPage ? ' active' : ''}`}
                            onClick={() => setReviewPage(page)}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Section>
            )}
          </div>

          {/* RIGHT SIDEBAR — pricing */}
          <Section id="pricing" highlight={highlight}>
            <aside className="sidebar">
              <div className="sidebar-head">
                <div className="price">{formatPrice(c)}</div>
                <div className="price-label">{c.sidebar.price_label}</div>
              </div>
              <div className="sidebar-body">
                {(seatsRemaining != null || deadlineFmt) && (
                  <div className="seats-badge" style={{ marginTop: 0, marginBottom: 18 }}>
                    {seatsRemaining != null && (
                      <>Còn <strong>{seatsRemaining} suất</strong></>
                    )}
                    {seatsRemaining != null && deadlineFmt && ' · '}
                    {deadlineFmt && (
                      <>Đóng đăng ký {deadlineFmt}</>
                    )}
                  </div>
                )}

                {c.hero.meta.map((m, i) => (
                  <div key={i} className="info-row">
                    <span className="info-label">{m.label}</span>
                    <span className="info-value">{m.value}</span>
                  </div>
                ))}

                <ul className="checklist">
                  {c.sidebar.checklist.map((item, i) => (
                    <li key={i}>
                      <span className="check-icon">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="btn btn-cta btn-cta-white btn-full"
                  type="button"
                  onClick={noop}
                  style={{ marginTop: 20 }}
                >
                  Đăng ký ngay
                </button>
                <button
                  className="btn btn-ghost btn-full"
                  type="button"
                  onClick={noop}
                  style={{ border: '1.5px solid #E8A020', color: '#E8A020', background: 'transparent' }}
                >
                  Tư vấn miễn phí trước
                </button>
              </div>
            </aside>
          </Section>
        </main>
      </div>
    </div>
  )
}

export default CourseRealPreview
