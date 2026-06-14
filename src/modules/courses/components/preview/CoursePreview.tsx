import { useState, type ReactNode } from 'react'
import { ChevronDown, Check, Star, Clock } from 'lucide-react'
import type { Course } from '../../types/course'
import type { CourseSectionKey } from '../CourseSectionNav'
import { badgeAutoValue1, badgeAutoValue2 } from '../editor/HeroBgSection'

interface Props {
  draft: Course
  device: 'desktop' | 'mobile'
  highlight: CourseSectionKey
}

function SectionFrame({
  id,
  highlight,
  children,
  className = '',
}: {
  id: CourseSectionKey
  highlight: CourseSectionKey
  children: ReactNode
  className?: string
}) {
  const active = id === highlight
  return (
    <div className={`relative ${className} ${active ? 'outline outline-2 outline-offset-4 outline-[#F5B419] rounded-lg' : ''}`}>
      {active && (
        <span className="absolute -top-7 left-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5B419] text-[#1F2937] z-10">
          ✏ Đang chỉnh sửa
        </span>
      )}
      {children}
    </div>
  )
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  const months = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  return `${Number(parts[2])} ${months[Number(parts[1])]} ${parts[0]}`
}

const FORMAT_LABEL: Record<string, string> = {
  offline: 'Offline',
  online: 'Online',
  hybrid: 'Hybrid',
}

export function CoursePreview({ draft, device, highlight }: Props) {
  const isMobile = device === 'mobile'
  const c = draft.content
  const containerWidth = isMobile ? 'max-w-[390px]' : 'max-w-[1100px]'

  // Computed badges
  const b1Val = c.badges.b1.auto ? badgeAutoValue1(c.type, draft.name) : c.badges.b1.value
  const b2Val = c.badges.b2.auto ? badgeAutoValue2(draft.name) : c.badges.b2.value
  const allBadges = [b1Val, b2Val, c.badges.b3].filter(Boolean)

  // Computed price label
  const priceLabel = c.pricing.labelAuto ? (draft.name ? `Học phí · ${draft.name}` : 'Học phí') : c.pricing.label

  return (
    <div className={`mx-auto ${containerWidth} bg-white text-[#111827]`}>
      {/* HERO BG + HERO */}
      <SectionFrame id={highlight === 'hero-bg' ? 'hero-bg' : 'hero'} highlight={highlight}>
        <div
          className="relative overflow-hidden text-white"
          style={{
            background: (isMobile && c.heroMobile) || c.heroDesktop
              ? `url(${isMobile && c.heroMobile ? c.heroMobile : c.heroDesktop}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1A4D6B 0%, #2D6A8C 50%, #4ECDC4 100%)',
            padding: isMobile ? '40px 20px 56px' : '64px 56px 80px',
            minHeight: isMobile ? 440 : 520,
          }}
        >
          {((isMobile && c.heroMobile) || c.heroDesktop) && <div className="absolute inset-0 bg-black/45" />}
          <div className="relative max-w-3xl">
            {allBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {allBadges.map((b, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur text-[10px] font-semibold tracking-wider uppercase"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
            <h1 className={`font-semibold leading-tight mb-5 ${isMobile ? 'text-3xl' : 'text-5xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              {draft.name || 'Tên khoá học'}
            </h1>
            {c.subTitle && <p className="text-sm md:text-base opacity-95 leading-relaxed max-w-2xl">{c.subTitle}</p>}

            {(c.format || c.startDate || c.endDate) && (
              <div className={`mt-7 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} max-w-xl`}>
                {c.format && (
                  <div>
                    <div className="text-[10px] tracking-wider opacity-80">HÌNH THỨC</div>
                    <div className="font-semibold mt-0.5">{FORMAT_LABEL[c.format]}</div>
                  </div>
                )}
                {c.startDate && (
                  <div>
                    <div className="text-[10px] tracking-wider opacity-80">KHAI GIẢNG</div>
                    <div className="font-semibold mt-0.5">{fmtDate(c.startDate)}</div>
                  </div>
                )}
                {c.endDate && (
                  <div>
                    <div className="text-[10px] tracking-wider opacity-80">KẾT THÚC</div>
                    <div className="font-semibold mt-0.5">{fmtDate(c.endDate)}</div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-7">
              <button className="px-6 py-2.5 rounded-lg bg-[#4ECDC4] text-[#0A2540] font-semibold hover:opacity-90">
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </SectionFrame>

      {/* MAIN: content + sidebar */}
      <div className={`${isMobile ? '' : 'px-14'} py-10`}>
        <div className={`${isMobile ? '' : 'grid gap-8 grid-cols-[1fr_320px]'}`}>
          {/* LEFT col */}
          <div className={`space-y-10 ${isMobile ? 'px-5' : ''}`}>
            {/* TEST WIDGET */}
            <SectionFrame id="test-widget" highlight={highlight}>
              {c.testWidgetEnabled ? (
                <div className="rounded-2xl border border-[#FEF3C7] bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]/40 p-5">
                  <h3 className="text-lg font-semibold text-[#B45309]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Khoá này có thực sự phù hợp với bạn không?
                  </h3>
                  <p className="text-xs text-[#92400E] mt-1.5">Test miễn phí 5 phút — gợi ý khoá phù hợp với giai đoạn cuộc sống của bạn.</p>
                  <ol className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-[#92400E]">
                    <li className="flex gap-1.5"><span className="font-semibold">1.</span> Chọn giai đoạn cuộc sống</li>
                    <li className="flex gap-1.5"><span className="font-semibold">2.</span> Trả lời 4 bộ câu hỏi MaxDiff</li>
                    <li className="flex gap-1.5"><span className="font-semibold">3.</span> Nhận kết quả cá nhân hoá</li>
                    <li className="flex gap-1.5"><span className="font-semibold">4.</span> Đăng ký khoá phù hợp nhất</li>
                  </ol>
                  <button className="mt-4 px-4 py-2 rounded-lg bg-[#1A4D6B] text-white text-sm font-medium">
                    Làm bài test miễn phí — 5 phút
                  </button>
                </div>
              ) : (
                <EmptyHint text="Test widget đang TẮT — bật ở section 03 nếu muốn hiển thị" />
              )}
            </SectionFrame>

            {/* OUTCOMES */}
            <SectionFrame id="outcomes" highlight={highlight}>
              <section>
                <header className="mb-5">
                  <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    {c.outcomesTitle}
                  </h2>
                  {c.outcomesSub && <p className="text-sm text-[#6B7280] mt-1.5">{c.outcomesSub}</p>}
                </header>
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {c.outcomes.length === 0 && <EmptyHint text="Chưa có outcome — thêm ở Editor" />}
                  {c.outcomes.map((o, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] p-4">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#E0EFF5] text-[#1F5374] flex items-center justify-center text-xl">{o.icon}</div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold mb-1">{o.title}</h3>
                        <p className="text-xs text-[#6B7280] leading-relaxed">{o.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </SectionFrame>

            {/* CURRICULUM */}
            <SectionFrame id="curriculum" highlight={highlight}>
              <section>
                <header className="mb-5">
                  <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    {c.curriculumTitle}
                  </h2>
                  {c.curriculumSub && <p className="text-sm text-[#6B7280] mt-1.5">{c.curriculumSub}</p>}
                </header>
                <div className="space-y-3">
                  {c.curriculum.length === 0 && <EmptyHint text="Chưa có module" />}
                  {c.curriculum.map((w, i) => (
                    <WeekRow key={i} num={String(i + 1).padStart(2, '0')} week={w} defaultOpen={i === 0} />
                  ))}
                </div>
              </section>
            </SectionFrame>

            {/* INSTRUCTORS */}
            <SectionFrame id="instructors" highlight={highlight}>
              <section>
                <header className="mb-5">
                  <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    {c.instructorsTitle}
                  </h2>
                  {c.instructorsSub && <p className="text-sm text-[#6B7280] mt-1.5">{c.instructorsSub}</p>}
                </header>
                <div className="space-y-4">
                  {c.instructors.length === 0 && <EmptyHint text="Chưa có giảng viên" />}
                  {c.instructors.filter((i) => i.name).map((inst, i) => (
                    <div key={i} className="rounded-2xl border border-[#E5E7EB] p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 shrink-0 rounded-full bg-[#E0EFF5] overflow-hidden flex items-center justify-center">
                          {inst.avatarUrl ? (
                            <img src={inst.avatarUrl} alt={inst.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl text-[#1F5374] font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                              {inst.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold">{inst.name}</h3>
                          <p className="text-xs text-[#6B7280] mt-0.5">{inst.title}</p>
                          {inst.tags && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {inst.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t, k) => (
                                <span key={k} className="px-2 py-0.5 rounded-full bg-[#E0EFF5] text-[10px] text-[#1F5374]">{t}</span>
                              ))}
                            </div>
                          )}
                          {inst.intro && <p className="text-sm text-[#374151] mt-3 leading-relaxed">{inst.intro}</p>}
                        </div>
                      </div>
                      <InstSubBlock label="HỌC VẤN" value={inst.education} mode="paragraph" />
                      <InstSubBlock label="SỰ NGHIỆP VÀ CÁC DỰ ÁN NỔI BẬT" value={inst.career} mode="bullets" />
                      <InstSubBlock label="THÀNH TÍCH VÀ GIẢI THƯỞNG" value={inst.awards} mode="awards" />
                    </div>
                  ))}
                </div>
              </section>
            </SectionFrame>

            {/* REVIEWS */}
            <SectionFrame id="reviews" highlight={highlight}>
              <section>
                <header className="mb-5">
                  <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    Học viên nói gì
                  </h2>
                  {c.reviewsSub && <p className="text-sm text-[#6B7280] mt-1.5">{c.reviewsSub}</p>}
                </header>
                {c.reviews.filter((r) => r.name && r.text).length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-semibold">5.0</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} size={14} className="fill-[#F5B419] text-[#F5B419]" />
                      ))}
                    </div>
                    <span className="text-xs text-[#6B7280]">· {c.reviews.filter((r) => r.name && r.text).length} phản hồi học viên</span>
                  </div>
                )}
                <div className="space-y-3">
                  {c.reviews.length === 0 && <EmptyHint text="Chưa có review" />}
                  {c.reviews.filter((r) => r.name && r.text).map((r, i) => (
                    <div key={i} className="rounded-xl border border-[#E5E7EB] p-4">
                      <div className="flex mb-2">
                        {Array.from({ length: 5 }).map((_, k) => (
                          <Star key={k} size={13} className="fill-[#F5B419] text-[#F5B419]" />
                        ))}
                      </div>
                      <p className="text-sm text-[#374151] italic leading-relaxed mb-3">"{r.text}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#E0EFF5] flex items-center justify-center text-xs font-semibold text-[#1F5374] overflow-hidden">
                          {r.avatarUrl ? <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" /> : r.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{r.name}</div>
                          {r.cohort && <div className="text-[10px] text-[#6B7280] truncate">{r.cohort}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </SectionFrame>

            {/* Q&A */}
            <SectionFrame id="qa" highlight={highlight}>
              <section>
                <header className="mb-5">
                  <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    {c.qaTitle}
                  </h2>
                </header>
                <div className="space-y-2">
                  {c.qa.length === 0 && <EmptyHint text="Chưa có câu hỏi" />}
                  {c.qa.map((f, i) => <FaqRow key={i} faq={f} defaultOpen={i === 0} />)}
                </div>
              </section>
            </SectionFrame>
          </div>

          {/* RIGHT col: PRICE CARD */}
          {!isMobile && (
            <SectionFrame id="price" highlight={highlight} className="self-start sticky top-6">
              <PriceCard course={draft} priceLabel={priceLabel} />
            </SectionFrame>
          )}
        </div>

        {/* Mobile: price after content */}
        {isMobile && (
          <div className="px-5 mt-10">
            <SectionFrame id="price" highlight={highlight}>
              <PriceCard course={draft} priceLabel={priceLabel} />
            </SectionFrame>
          </div>
        )}
      </div>
    </div>
  )
}

function PriceCard({ course, priceLabel }: { course: Course; priceLabel: string }) {
  const p = course.content.pricing
  const promo = p.promo
  const useDiscount = promo.enabled && promo.tab === 'discount' && promo.priceFinal
  const headlinePrice = useDiscount ? promo.priceFinal : p.price
  const oldPrice = useDiscount ? promo.priceOriginal || p.price : ''
  const headlineLabel = promo.enabled && promo.tab === 'discount' ? `🎓 Early Bird · ${priceLabel}` : priceLabel
  const merch = promo.merchList ? promo.merchList.split('||').filter(Boolean) : []

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
      <div className="p-5 bg-gradient-to-br from-[#1A4D6B] to-[#2D6A8C] text-white">
        <div className="text-xs opacity-90 mb-1">{headlineLabel}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>{headlinePrice || '—'}</span>
          {oldPrice && <span className="text-sm opacity-70 line-through">{oldPrice}</span>}
        </div>
        {p.note && <p className="text-xs opacity-90 mt-1.5">{p.note}</p>}
        {p.urgency && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            {p.urgency}
          </div>
        )}
      </div>
      <div className="p-5 space-y-3">
        {p.features.filter(Boolean).length > 0 && (
          <ul className="space-y-1.5">
            {p.features.filter(Boolean).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#374151]">
                <Check size={13} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {promo.enabled && (
          <div className="mt-3 p-3 rounded-lg bg-[#FEF3C7]/60 border border-[#FEF3C7] text-xs text-[#92400E]">
            {promo.tab === 'discount' ? (
              <>
                <div className="font-semibold mb-1 flex items-center gap-1"><span>🎓</span> Ưu đãi khoá học</div>
                {promo.bonusCourse && <div>Tặng kèm: <strong>{promo.bonusCourse}</strong></div>}
                {promo.discountDesc && <p className="mt-1">{promo.discountDesc}</p>}
              </>
            ) : (
              <>
                <div className="font-semibold mb-1 flex items-center gap-1"><span>🎁</span> {promo.giftTitle || 'Quà tặng kèm'}</div>
                {merch.length > 0 && (
                  <ul className="space-y-0.5 mt-1">
                    {merch.map((m, i) => <li key={i}>• {m}</li>)}
                  </ul>
                )}
                {promo.giftDesc && <p className="mt-1">{promo.giftDesc}</p>}
              </>
            )}
            {(promo.startDate || promo.endDate) && (
              <p className="mt-2 flex items-center gap-1 text-[10px] opacity-75">
                <Clock size={10} />
                Áp dụng {promo.startDate || '…'} → {promo.endDate || '…'}
              </p>
            )}
          </div>
        )}

        <button className="w-full mt-3 px-4 py-2.5 rounded-lg bg-[#4ECDC4] text-[#0A2540] text-sm font-semibold hover:opacity-90">
          Đăng ký ngay →
        </button>
        <button className="w-full px-4 py-2 rounded-lg border border-[#2D6A8C] text-[#1F5374] text-xs font-medium hover:bg-[#E0EFF5]">
          Tư vấn miễn phí trước
        </button>
      </div>
    </div>
  )
}

function WeekRow({ num, week, defaultOpen }: { num: string; week: { title: string; meta: string; topics: string }; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const topicLines = week.topics.split('\n').map((l) => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean)
  return (
    <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F7F8FA]">
        <span className="text-2xl font-semibold text-[#9CA3AF] tabular-nums" style={{ fontFamily: 'Playfair Display, serif' }}>{num}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#111827] truncate">{week.title || 'Chưa đặt tên'}</div>
          {week.meta && <div className="text-[11px] text-[#6B7280]">{week.meta}</div>}
        </div>
        <ChevronDown size={16} className={`text-[#6B7280] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && topicLines.length > 0 && (
        <ul className="px-4 pb-3 space-y-1.5">
          {topicLines.map((t, j) => (
            <li key={j} className="flex items-start gap-2 text-xs text-[#374151]">
              <Check size={13} className="text-[#15803D] mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function InstSubBlock({ label, value, mode }: { label: string; value: string; mode: 'paragraph' | 'bullets' | 'awards' }) {
  if (!value.trim()) return null
  return (
    <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
      <div className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] mb-1.5">{label}</div>
      {mode === 'paragraph' && <p className="text-xs text-[#374151] leading-relaxed">{value}</p>}
      {mode === 'bullets' && (
        <ul className="space-y-1">
          {value.split('\n').map((l) => l.trim()).filter(Boolean).map((line, i) => {
            const cleaned = line.replace(/^[-*•]\s*/, '')
            const [head, ...rest] = cleaned.split(':')
            const hasColon = rest.length > 0
            return (
              <li key={i} className="flex items-start gap-2 text-xs text-[#374151]">
                <span className="text-[#15803D] mt-0.5">•</span>
                <span>
                  {hasColon ? <><strong>{head}:</strong>{rest.join(':')}</> : cleaned}
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {mode === 'awards' && (
        <div className="space-y-1">
          {value.split('\n').map((l) => l.trim()).filter(Boolean).map((line, i) => {
            const parts = line.split('|').map((p) => p.trim())
            if (parts.length >= 2) {
              return (
                <p key={i} className="text-xs text-[#374151]"><strong>{parts[0]}</strong> — {parts.slice(1).join(' | ')}</p>
              )
            }
            return <p key={i} className="text-xs text-[#374151]">{line}</p>
          })}
        </div>
      )}
    </div>
  )
}

function FaqRow({ faq, defaultOpen }: { faq: { q: string; a: string }; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="text-sm font-medium text-[#111827]">{faq.q}</span>
        <ChevronDown size={16} className={`text-[#6B7280] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && faq.a && <div className="px-4 pb-3 text-xs text-[#374151] leading-relaxed whitespace-pre-line">{faq.a}</div>}
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="text-center text-xs text-[#9CA3AF] italic py-6 border border-dashed border-[#D1D5DB] rounded-lg">
      {text}
    </div>
  )
}
