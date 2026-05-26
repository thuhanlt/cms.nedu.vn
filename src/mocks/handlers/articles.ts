import { http } from 'msw'
import { ok, notFound, okRaw } from '../config'
import { articles } from '../data/articles'
import { nowIso, newId, slugify } from '../data/_helpers'
import type { Article } from '@modules/articles/types/article'

export const articlesHandlers = [
  http.get('*/api/articles', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const q = url.searchParams.get('q')?.toLowerCase()
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    let list = [...articles]
    if (type && type !== 'all') list = list.filter((a) => a.type === type)
    if (q) list = list.filter((a) => a.title.toLowerCase().includes(q))

    const total = list.length
    const slice = list.slice((page - 1) * limit, (page - 1) * limit + limit)
    return okRaw({ data: slice, meta: { page, limit, total } })
  }),

  http.get('*/api/articles/:id', ({ params }) => {
    const a = articles.find((x) => x.id === params.id)
    if (!a) return notFound('Không tìm thấy bài viết')
    return ok(a as unknown as Record<string, unknown>)
  }),

  http.post('*/api/articles', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<Article>
    const newA: Article = {
      id: newId('a'),
      type: body.type ?? 'blog',
      title: body.title ?? 'Bài viết mới',
      slug: body.title ? slugify(body.title) : '',
      excerpt: body.excerpt ?? '',
      body: body.body ?? '',
      coverUrl: body.coverUrl ?? '',
      tags: body.tags ?? [],
      publishedDate: body.publishedDate,
      status: body.status ?? 'draft',
      seo: body.seo ?? {},
      updatedAt: nowIso(),
    }
    articles.unshift(newA)
    return ok(newA as unknown as Record<string, unknown>, { status: 201 })
  }),

  http.patch('*/api/articles/:id', async ({ params, request }) => {
    const idx = articles.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy bài viết')
    const patch = (await request.json().catch(() => ({}))) as Partial<Article>
    const merged: Article = {
      ...articles[idx],
      ...patch,
      seo: patch.seo ? { ...articles[idx].seo, ...patch.seo } : articles[idx].seo,
      slug: patch.slug ?? (patch.title ? slugify(patch.title) : articles[idx].slug),
      updatedAt: nowIso(),
    }
    articles[idx] = merged
    return ok(merged as unknown as Record<string, unknown>)
  }),

  http.delete('*/api/articles/:id', ({ params }) => {
    const idx = articles.findIndex((x) => x.id === params.id)
    if (idx === -1) return notFound('Không tìm thấy bài viết')
    articles.splice(idx, 1)
    return new Response(null, { status: 204 })
  }),
]
