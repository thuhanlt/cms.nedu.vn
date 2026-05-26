import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Challenge, ChallengeContent, ChallengeStatus } from '../types/challenge'
import type { Paginated } from '@shared/types'

// ── BE shape (mirror nedu-backend src/modules/cms/challenges/challenges.types.ts) ──
// Endpoint: /api/cms/challenges. FE giữ shape Challenge (camelCase, flat) để
// editor/preview component không phải đổi — adapter ở đây bridge BE ↔ FE.

interface BeInstructorInline {
  name: string
  avatar_letter?: string
  avatar_url?: string
  title?: string
  bio?: string
  tags?: string[]
  highlights?: string[]
}
interface BeReviewInline {
  name: string
  role?: string
  topic?: string
  text: string
  avatar_letter?: string
  avatar_url?: string
}
interface BePlan {
  price?: string
  saving?: string
  note?: string
  benefits?: string[]
}
interface BeChallengeMetadata {
  content_published?: boolean
  cms_status?: ChallengeStatus
  start_date?: string | null
  countdown?: { enabled: boolean }
  hero_img?: string
  hero_img_mobile?: string
  subs?: { outcomes?: string; curriculum?: string; instructor?: string }
  outcomes?: Array<{ icon?: string; title: string; desc?: string }>
  curriculum?: Array<{ week: number; title: string; topics: string[] }>
  faqs?: Array<{ q: string; a: string }>
  instructor_id?: string | null
  instructor_inline?: BeInstructorInline
  reviews?: BeReviewInline[]
  plans?: { monthly?: BePlan; yearly?: BePlan }
  [key: string]: unknown
}
interface BeChallenge {
  id: string
  code: string
  slug: string
  name: string
  short_label: string
  tagline: string | null
  description: string | null
  delivery_mode: string
  learning_format: string
  segment: string
  status: string
  is_public: boolean
  display_order: number
  cover_image_url: string | null
  metadata: BeChallengeMetadata
  created_at: string
  updated_at: string
  archived_at: string | null
}

// ── BE → FE ──────────────────────────────────────────────────────────────────
function beToContent(md: BeChallengeMetadata): ChallengeContent {
  const inline = md.instructor_inline ?? ({} as BeInstructorInline)
  return {
    countdown: md.countdown ?? { enabled: false },
    heroImg: md.hero_img ?? '',
    heroImgMobile: md.hero_img_mobile ?? '',
    subs: {
      outcomes: md.subs?.outcomes ?? '',
      curriculum: md.subs?.curriculum ?? '',
      instructor: md.subs?.instructor ?? '',
    },
    outcomes: (md.outcomes ?? []).map((o) => ({
      icon: o.icon ?? '',
      title: o.title,
      desc: o.desc ?? '',
    })),
    curriculum: (md.curriculum ?? []).map((w) => ({
      title: w.title,
      topics: w.topics ?? [],
    })),
    instructor: {
      name: inline.name ?? '',
      avatarLetter: inline.avatar_letter ?? '',
      avatarUrl: inline.avatar_url ?? '',
      title: inline.title ?? '',
      bio: inline.bio ?? '',
      tags: inline.tags ?? [],
      highlights: inline.highlights ?? [],
    },
    reviews: (md.reviews ?? []).map((r) => ({
      avatarLetter: r.avatar_letter ?? '',
      avatarUrl: r.avatar_url ?? '',
      name: r.name,
      role: r.role ?? '',
      topic: r.topic ?? '',
      text: r.text,
    })),
    faqs: md.faqs ?? [],
    plans: {
      monthly: {
        price: md.plans?.monthly?.price ?? '',
        saving: md.plans?.monthly?.saving,
        note: md.plans?.monthly?.note,
        benefits: md.plans?.monthly?.benefits ?? [],
      },
      yearly: {
        price: md.plans?.yearly?.price ?? '',
        saving: md.plans?.yearly?.saving,
        note: md.plans?.yearly?.note,
        benefits: md.plans?.yearly?.benefits ?? [],
      },
    },
  }
}

function beToFe(be: BeChallenge): Challenge {
  const md = be.metadata ?? ({} as BeChallengeMetadata)
  return {
    id: be.id,
    slug: be.slug,
    name: be.name,
    status: md.cms_status ?? 'upcoming',
    published: !!md.content_published,
    startDate: md.start_date ?? undefined,
    priceMonthly: md.plans?.monthly?.price ?? undefined,
    priceYearly: md.plans?.yearly?.price ?? undefined,
    content: beToContent(md),
    updatedAt: be.updated_at,
  }
}

// ── FE → BE (PATCH partial) ──────────────────────────────────────────────────
// Gom field FE thành { name?, slug?, metadata?: Partial<BeChallengeMetadata> }.
// BE deep-merge metadata → an toàn khi gửi partial.
interface BePatchPayload {
  name?: string
  slug?: string
  metadata?: Partial<BeChallengeMetadata>
}

function contentToMetadata(c: ChallengeContent): Partial<BeChallengeMetadata> {
  return {
    countdown: c.countdown,
    hero_img: c.heroImg,
    hero_img_mobile: c.heroImgMobile,
    subs: c.subs,
    outcomes: c.outcomes,
    curriculum: c.curriculum.map((w, idx) => ({
      week: idx + 1,
      title: w.title,
      topics: w.topics,
    })),
    instructor_inline: {
      name: c.instructor.name,
      avatar_letter: c.instructor.avatarLetter,
      avatar_url: c.instructor.avatarUrl,
      title: c.instructor.title,
      bio: c.instructor.bio,
      tags: c.instructor.tags,
      highlights: c.instructor.highlights,
    },
    reviews: c.reviews.map((r) => ({
      avatar_letter: r.avatarLetter,
      avatar_url: r.avatarUrl,
      name: r.name,
      role: r.role,
      topic: r.topic,
      text: r.text,
    })),
    faqs: c.faqs,
    plans: {
      monthly: {
        price: c.plans.monthly.price,
        saving: c.plans.monthly.saving,
        note: c.plans.monthly.note,
        benefits: c.plans.monthly.benefits,
      },
      yearly: {
        price: c.plans.yearly.price,
        saving: c.plans.yearly.saving,
        note: c.plans.yearly.note,
        benefits: c.plans.yearly.benefits,
      },
    },
  }
}

function feToBe(patch: Partial<Challenge>): BePatchPayload {
  const md: Partial<BeChallengeMetadata> = {}
  if (patch.status !== undefined) md.cms_status = patch.status
  if (patch.published !== undefined) md.content_published = patch.published
  if (patch.startDate !== undefined) md.start_date = patch.startDate || null
  // priceMonthly/Yearly nếu user set riêng (không qua content.plans) — chỉ patch plans.X.price.
  if (patch.priceMonthly !== undefined) {
    md.plans = { ...(md.plans ?? {}), monthly: { ...(md.plans?.monthly ?? {}), price: patch.priceMonthly } }
  }
  if (patch.priceYearly !== undefined) {
    md.plans = { ...(md.plans ?? {}), yearly: { ...(md.plans?.yearly ?? {}), price: patch.priceYearly } }
  }
  if (patch.content) {
    Object.assign(md, contentToMetadata(patch.content))
  }
  const out: BePatchPayload = {}
  if (patch.name !== undefined) out.name = patch.name
  if (patch.slug !== undefined) out.slug = patch.slug
  if (Object.keys(md).length > 0) out.metadata = md
  return out
}

// ── Query params: FE `status` → BE `cms_status` ─────────────────────────────
export interface ChallengesQuery {
  status?: ChallengeStatus | 'all'
  q?: string
  page?: number
  limit?: number
}

function buildQuery(params: ChallengesQuery | undefined): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  // BE filter param là cms_status (xem BE challenges.service.ts).
  if (params.status && params.status !== 'all') usp.set('cms_status', params.status)
  if (params.q) usp.set('q', params.q)
  if (params.page) usp.set('page', String(params.page))
  if (params.limit) usp.set('limit', String(params.limit))
  const s = usp.toString()
  return s ? `?${s}` : ''
}

// ── Hooks ────────────────────────────────────────────────────────────────────
export function useChallenges(params?: ChallengesQuery) {
  return useQuery({
    queryKey: ['challenges', 'list', params ?? {}],
    queryFn: async (): Promise<Paginated<Challenge>> => {
      const res = await api.getRaw<{ data: BeChallenge[]; meta: { page: number; limit: number; total: number } }>(
        `/cms/challenges${buildQuery(params)}`,
      )
      return {
        data: res.data.map(beToFe),
        meta: res.meta,
      }
    },
  })
}

export function useChallenge(id: string | undefined) {
  return useQuery({
    queryKey: ['challenges', 'detail', id],
    queryFn: async (): Promise<Challenge> => {
      const be = await api.get<BeChallenge>(`/cms/challenges/${id}`)
      return beToFe(be)
    },
    enabled: !!id,
  })
}

export function useCreateChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload?: Partial<Challenge>): Promise<Challenge> => {
      // POST chỉ cần name + slug optional. Field khác BE seed default.
      const body: { name: string; slug?: string } = {
        name: payload?.name ?? 'Thử thách mới',
        ...(payload?.slug ? { slug: payload.slug } : {}),
      }
      const be = await api.post<BeChallenge>('/cms/challenges', body)
      return beToFe(be)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges', 'list'] })
    },
  })
}

export function useUpdateChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Challenge> }): Promise<Challenge> => {
      const body = feToBe(patch)
      const be = await api.patch<BeChallenge>(`/cms/challenges/${id}`, body)
      return beToFe(be)
    },
    onSuccess: (data) => {
      qc.setQueryData(['challenges', 'detail', data.id], data)
      qc.invalidateQueries({ queryKey: ['challenges', 'list'] })
    },
  })
}

export function useDeleteChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/challenges/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges', 'list'] })
    },
  })
}
