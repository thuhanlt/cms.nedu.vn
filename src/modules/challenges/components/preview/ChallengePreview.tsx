import { useState, type ReactNode } from 'react'
import { ChevronDown, Check, Star } from 'lucide-react'
import type { Challenge } from '../../types/challenge'
import type { ChallengeSectionKey } from '../ChallengeSectionNav'
import { Countdown } from './Countdown'

interface Props {
  draft: Challenge
  device: 'desktop' | 'mobile'
  highlight: ChallengeSectionKey
}

function SectionFrame({
  id,
  highlight,
  children,
  className = '',
}: {
  id: ChallengeSectionKey
  highlight: ChallengeSectionKey
  children: ReactNode
  className?: string
}) {
  const active = id === highlight
  return (
    <div
      className={`relative ${className} ${active ? 'outline outline-2 outline-offset-4 outline-[#F5B419] rounded-lg' : ''}`}
    >
      {active && (
        <span className="absolute -top-7 left-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5B419] text-[#1F2937]">
          ✏ Đang chỉnh sửa
        </span>
      )}
      {children}
    </div>
  )
}

export function ChallengePreview({ draft, device, highlight }: Props) {
  const isMobile = device === 'mobile'
  const c = draft.content

  const containerWidth = isMobile ? 'max-w-[390px]' : 'max-w-[1100px]'

  return (
    <div className={`mx-auto ${containerWidth} bg-white text-[#111827]`}>
      {/* HERO */}
      <SectionFrame id="banner" highlight={highlight}>
        <div
          className="relative overflow-hidden"
          style={{
            background: c.heroImg
              ? `url(${isMobile && c.heroImgMobile ? c.heroImgMobile : c.heroImg}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1A4D6B 0%, #2D6A8C 50%, #4ECDC4 100%)',
            color: 'white',
            padding: isMobile ? '40px 20px 56px' : '64px 56px 80px',
            minHeight: isMobile ? 440 : 500,
          }}
        >
          {/* overlay khi có ảnh */}
          {c.heroImg && <div className="absolute inset-0 bg-black/35" />}
          <div className="relative max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-90 mb-3">Hành trình của bạn</div>
            <h1
              className={`font-semibold leading-tight mb-5 ${isMobile ? 'text-3xl' : 'text-5xl'}`}
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {draft.name || 'Tên thử thách'}
            </h1>
            {draft.startDate && (
              <p className="text-sm opacity-95 mb-4">
                Khai giảng: <strong>{draft.startDate}</strong> · {draft.status === 'open' ? 'Đang mở' : draft.status === 'upcoming' ? 'Sắp mở' : 'Đã đóng'}
              </p>
            )}
            {c.countdown.enabled && <Countdown startDate={draft.startDate ?? ''} />}
            <div className="mt-7">
              <button className="px-6 py-2.5 rounded-lg bg-[#4ECDC4] text-[#0A2540] font-semibold hover:opacity-90">
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </SectionFrame>

      {/* OUTCOMES */}
      <SectionFrame id="outcomes" highlight={highlight} className="mt-10">
        <section className={isMobile ? 'px-5' : 'px-14'}>
          <header className="text-center mb-7">
            <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              Sau 30 ngày bạn sẽ
            </h2>
            <p className="text-[#6B7280] text-sm mt-1.5">{c.subs.outcomes}</p>
          </header>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {c.outcomes.length === 0 && <EmptyHint text="Chưa có mục nào — thêm ở khung Editor bên trái" />}
            {c.outcomes.map((o, i) => (
              <div key={i} className="rounded-xl border border-[#E5E7EB] p-4">
                <div className="text-2xl mb-1.5">{o.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{o.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionFrame>

      {/* CURRICULUM */}
      <SectionFrame id="curriculum" highlight={highlight} className="mt-12">
        <section className={isMobile ? 'px-5' : 'px-14'}>
          <header className="text-center mb-6">
            <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              Lộ trình từng tuần
            </h2>
            <p className="text-[#6B7280] text-sm mt-1.5">{c.subs.curriculum}</p>
          </header>
          <div className="space-y-3">
            {c.curriculum.length === 0 && <EmptyHint text="Chưa có tuần nào — thêm ở Editor" />}
            {c.curriculum.map((w, i) => (
              <div key={i} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="bg-[#F7F8FA] px-4 py-2.5 flex items-center justify-between">
                  <span className="text-sm font-semibold">{w.title}</span>
                  <span className="text-xs text-[#6B7280]">{w.topics.filter(Boolean).length} nội dung</span>
                </div>
                <ul className="px-4 py-3 space-y-1.5">
                  {w.topics.filter(Boolean).length === 0 ? (
                    <li className="text-xs text-[#9CA3AF] italic">Chưa có nội dung tuần này</li>
                  ) : (
                    w.topics.filter(Boolean).map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs">
                        <Check size={13} className="text-[#15803D] mt-0.5 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </SectionFrame>

      {/* INSTRUCTOR */}
      <SectionFrame id="instructor" highlight={highlight} className="mt-12">
        <section className={isMobile ? 'px-5' : 'px-14'}>
          <header className="text-center mb-6">
            <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              Người đồng hành
            </h2>
            <p className="text-[#6B7280] text-sm mt-1.5">{c.subs.instructor}</p>
          </header>
          <div className={`rounded-2xl border border-[#E5E7EB] p-5 ${isMobile ? '' : 'flex gap-6'}`}>
            <div className={`shrink-0 ${isMobile ? 'mx-auto mb-4' : ''}`}>
              <div className="w-24 h-24 rounded-full bg-[#E0EFF5] overflow-hidden flex items-center justify-center">
                {c.instructor.avatarUrl ? (
                  <img src={c.instructor.avatarUrl} alt={c.instructor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-[#1F5374] font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {c.instructor.avatarLetter || c.instructor.name.charAt(0) || 'N'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">{c.instructor.name || 'Tên người dẫn đường'}</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{c.instructor.title}</p>
              {c.instructor.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.instructor.tags.filter(Boolean).map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-[#E0EFF5] text-[10px] text-[#1F5374]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-[#374151] mt-3 leading-relaxed">{c.instructor.bio}</p>
              {c.instructor.highlights.filter(Boolean).length > 0 && (
                <ul className="mt-3 space-y-1">
                  {c.instructor.highlights.filter(Boolean).map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#374151]">
                      <Check size={13} className="text-[#15803D] mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </SectionFrame>

      {/* REVIEWS */}
      <SectionFrame id="reviews" highlight={highlight} className="mt-12">
        <section className={isMobile ? 'px-5' : 'px-14'}>
          <header className="text-center mb-6">
            <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              Học viên nói gì
            </h2>
          </header>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {c.reviews.length === 0 && <EmptyHint text="Chưa có review nào" />}
            {c.reviews.map((r, i) => (
              <div key={i} className="rounded-xl bg-[#F7F8FA] p-4">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={12} className="fill-[#F5B419] text-[#F5B419]" />
                  ))}
                </div>
                <p className="text-xs text-[#374151] italic leading-relaxed mb-3">"{r.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E0EFF5] flex items-center justify-center text-xs font-semibold text-[#1F5374] overflow-hidden">
                    {r.avatarUrl ? (
                      <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      r.avatarLetter || r.name.charAt(0) || 'A'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{r.name}</div>
                    <div className="text-[10px] text-[#6B7280] truncate">{r.role}{r.topic ? ` · ${r.topic}` : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </SectionFrame>

      {/* FAQ */}
      <SectionFrame id="faqs" highlight={highlight} className="mt-12">
        <section className={isMobile ? 'px-5' : 'px-14'}>
          <header className="text-center mb-6">
            <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              Câu hỏi thường gặp
            </h2>
          </header>
          <div className="space-y-2 max-w-2xl mx-auto">
            {c.faqs.length === 0 && <EmptyHint text="Chưa có câu hỏi nào" />}
            {c.faqs.map((f, i) => (
              <FaqRow key={i} faq={f} />
            ))}
          </div>
        </section>
      </SectionFrame>

      {/* PRICE */}
      <SectionFrame id="price" highlight={highlight} className="mt-12 mb-10">
        <section className={isMobile ? 'px-5' : 'px-14'}>
          <header className="text-center mb-6">
            <h2 className={`font-semibold ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              Học phí
            </h2>
          </header>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} max-w-3xl mx-auto`}>
            {c.plans.monthly.price && (
              <div className="rounded-2xl border border-[#E5E7EB] p-5 bg-white">
                <h3 className="text-sm font-medium text-[#6B7280] mb-2">Gói tháng</h3>
                <div className="text-3xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {c.plans.monthly.price}<span className="text-sm text-[#6B7280] font-normal"> / tháng</span>
                </div>
                <BenefitsRow items={c.plans.monthly.benefits} />
                <button className="mt-4 w-full px-4 py-2 rounded-lg border border-[#2D6A8C] text-[#1F5374] text-sm font-medium hover:bg-[#E0EFF5]">
                  Chọn gói tháng
                </button>
              </div>
            )}
            {c.plans.yearly.price && (
              <div className="rounded-2xl border-2 border-[#2D6A8C] p-5 bg-[#1A4D6B] text-white relative">
                {c.plans.yearly.saving && (
                  <span className="absolute -top-2 right-4 px-2 py-0.5 rounded-full bg-[#4ECDC4] text-[#0A2540] text-[10px] font-semibold">
                    {c.plans.yearly.saving}
                  </span>
                )}
                <h3 className="text-sm font-medium opacity-80 mb-2">Gói năm</h3>
                <div className="text-3xl font-semibold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {c.plans.yearly.price}<span className="text-sm opacity-80 font-normal"> / năm</span>
                </div>
                {c.plans.yearly.note && <p className="text-xs opacity-80 mb-4">{c.plans.yearly.note}</p>}
                <BenefitsRow items={c.plans.yearly.benefits} dark />
                <button className="mt-4 w-full px-4 py-2 rounded-lg bg-[#4ECDC4] text-[#0A2540] text-sm font-semibold hover:opacity-90">
                  Chọn gói năm
                </button>
              </div>
            )}
            {!c.plans.monthly.price && !c.plans.yearly.price && (
              <div className="col-span-full">
                <EmptyHint text="Đặt giá ở khung Editor để hiển thị bảng giá" />
              </div>
            )}
          </div>
        </section>
      </SectionFrame>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="text-center text-xs text-[#9CA3AF] italic py-8 border border-dashed border-[#D1D5DB] rounded-lg">
      {text}
    </div>
  )
}

function BenefitsRow({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const filtered = items.filter(Boolean)
  if (filtered.length === 0) return <p className="text-xs opacity-70 italic">Chưa có quyền lợi nào</p>
  return (
    <ul className="space-y-1.5">
      {filtered.map((b, i) => (
        <li key={i} className="flex items-start gap-2 text-xs">
          <Check size={13} className={dark ? 'text-[#4ECDC4] mt-0.5' : 'text-[#15803D] mt-0.5'} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

function FaqRow({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-[#111827]">{faq.q}</span>
        <ChevronDown size={16} className={`text-[#6B7280] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && faq.a && (
        <div className="px-4 pb-3 text-xs text-[#374151] leading-relaxed">{faq.a}</div>
      )}
    </div>
  )
}
