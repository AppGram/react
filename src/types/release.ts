/**
 * Release / Changelog Types
 */

export type ReleaseItemType = 'feature' | 'improvement' | 'bugfix' | 'other'

export interface ReleaseItem {
  id: string
  release_id: string
  title: string
  description?: string | null
  type: ReleaseItemType
  image_url?: string | null
  sort_order: number
}

export interface ReleaseFeature {
  id: string
  release_id: string
  title: string
  description: string
  image_url?: string | null
  sort_order: number
}

export interface Release {
  id: string
  project_id: string
  title: string
  content: string
  excerpt?: string | null
  cover_image_url?: string | null
  slug: string
  is_published: boolean
  published_at?: string | null
  version?: string | null
  labels: string[]
  wish_ids: string[]
  author_user_id: string
  created_at: string
  updated_at: string
  features?: ReleaseFeature[]
  items?: ReleaseItem[]
}

export interface ReleasesResponse {
  data: Release[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
