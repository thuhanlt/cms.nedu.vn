import type { ContentStatus } from '@shared/types'

export type ArticleType = 'blog' | 'homepage'

export interface ArticleSeo {
  seoTitle?: string
  seoDesc?: string
  ogTitle?: string
  ogDesc?: string
}

export interface Article {
  id: string
  type: ArticleType
  title: string
  slug?: string
  excerpt?: string
  body?: string
  coverUrl?: string
  tags: string[]
  publishedDate?: string
  status: ContentStatus
  seo: ArticleSeo
  updatedAt: string
}
