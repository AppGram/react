/**
 * Help Center Types
 */

export type ArticleType = 'guide' | 'faq' | 'tutorial'
export type FlowDisplayType = 'list' | 'accordion' | 'decision_tree' | 'wizard'

export interface HelpArticle {
  id: string
  flow_id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  article_type: ArticleType
  is_published: boolean
  sort_order: number
  published_at?: string | null
  created_at: string
  updated_at: string
}

export interface HelpFlow {
  id: string
  collection_id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  color?: string | null
  display_type: FlowDisplayType
  sort_order: number
  created_at: string
  updated_at: string
  articles?: HelpArticle[]
}

export interface HelpCollection {
  id: string
  project_id: string
  name: string
  version: string
  description?: string | null
  is_live: boolean
  created_at: string
  updated_at: string
  flows?: HelpFlow[]
}

export interface HelpCenterData {
  collection: HelpCollection | null
  flows: HelpFlow[]
}

export interface HelpArticlesResponse {
  data: HelpArticle[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
