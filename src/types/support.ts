/**
 * Support Types
 */

export type SupportRequestStatus =
  | 'new'
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'

export type SupportRequestPriority = 'low' | 'medium' | 'high' | 'critical'

export type SupportRequestCategory =
  | 'bug_report'
  | 'feature_request'
  | 'general_inquiry'
  | 'billing'
  | 'account'

export interface SupportAttachment {
  url: string
  name: string
  size: number
  mime_type?: string
}

export interface SupportMessage {
  id: string
  support_request_id: string
  author_type: 'user' | 'team_member'
  author_user_id?: string | null
  author_email?: string | null
  author_name?: string | null
  content: string
  is_internal: boolean
  attachments?: SupportAttachment[]
  created_at: string
}

export interface SupportRequest {
  id: string
  project_id: string
  subject: string
  description: string
  status: SupportRequestStatus
  priority?: SupportRequestPriority | null
  category?: SupportRequestCategory | null
  user_email: string
  user_name?: string | null
  assignee_id?: string | null
  message_count: number
  created_at: string
  updated_at: string
  resolved_at?: string | null
  messages?: SupportMessage[]
  attachments?: SupportAttachment[]
}

export interface SupportRequestInput {
  subject: string
  description: string
  user_email: string
  user_name?: string
  external_user_id?: string
  category?: SupportRequestCategory
  attachments?: File[]
}

export interface SupportRequestsResponse {
  data: SupportRequest[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
