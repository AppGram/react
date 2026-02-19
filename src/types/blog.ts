/**
 * Blog/Resources Types
 */

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  post_count?: number
}

export interface BlogPost {
  id: string
  project_id: string
  category_id?: string | null
  title: string
  slug: string
  content: string
  excerpt?: string | null
  meta_description?: string | null
  og_image_url?: string | null
  author_name?: string | null
  published_at: string
  is_featured: boolean
  tags: string[]
  view_count: number
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    slug: string
    color?: string | null
  }
}

export interface BlogPostsResponse {
  data: BlogPost[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface BlogFilters {
  category_slug?: string
  tag?: string
  search?: string
  is_featured?: boolean
  page?: number
  per_page?: number
}
