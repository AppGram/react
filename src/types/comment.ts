/**
 * Comment Types
 */

export interface CommentAuthor {
  name: string
  avatar_url?: string | null
}

export interface Comment {
  id: string
  wish_id: string
  parent_id?: string | null
  author_type: 'user' | 'team_member' | 'anonymous'
  author_user_id?: string | null
  author_name: string
  author_avatar_url?: string | null
  content: string
  is_official: boolean
  is_deleted: boolean
  reply_count: number
  created_at: string
  updated_at: string
  replies?: Comment[]
}

export interface CommentCreateInput {
  wish_id: string
  content: string
  author_name?: string
  author_email?: string
  parent_id?: string
}

export interface CommentsResponse {
  data: Comment[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
