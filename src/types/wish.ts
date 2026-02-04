/**
 * Wish (Feature Request) Types
 */

export type WishStatus =
  | 'pending'
  | 'under_review'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'declined'

export type WishPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon?: string | null
  description?: string | null
  wish_count?: number
}

export interface WishAuthor {
  name: string
  email?: string | null
  avatar_url?: string | null
}

export interface Wish {
  id: string
  project_id: string
  category_id?: string | null
  title: string
  description: string
  status: WishStatus
  priority?: WishPriority | null
  author_type: 'user' | 'anonymous' | 'team_member'
  author_email?: string | null
  author_name?: string | null
  vote_count: number
  comment_count: number
  slug: string
  is_pinned?: boolean
  created_at: string
  updated_at: string
  completed_at?: string | null
  category?: Category | null
  author?: WishAuthor
  has_voted?: boolean
}

export interface WishFilters {
  status?: WishStatus | WishStatus[]
  category_id?: string
  priority?: WishPriority | WishPriority[]
  search?: string
  sort_by?: 'votes' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
  fingerprint?: string
}

export interface WishesResponse {
  data: Wish[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
