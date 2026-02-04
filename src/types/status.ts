/**
 * Status Page Types
 *
 * Types for status page API responses.
 */

export type StatusType =
  | 'operational'
  | 'maintenance'
  | 'degraded_performance'
  | 'partial_outage'
  | 'major_outage'
  | 'incident'

export type StatusState = 'active' | 'resolved'

export interface StatusPage {
  id: string
  project_id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StatusUpdate {
  id: string
  status_page_id: string
  title: string
  description: string
  status_type: StatusType
  state: StatusState
  is_public: boolean
  affected_services: string[]
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface StatusPageService {
  id: string
  status_page_id: string
  name: string
  description: string | null
  group_name: string | null
  color: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StatusPageOverview {
  status_page: StatusPage
  current_status: StatusType
  active_updates: StatusUpdate[]
  recent_updates: StatusUpdate[]
  status_breakdown: Record<string, number>
  services_status: Record<string, StatusType>
  services: StatusPageService[]
  total_updates: number
  active_count: number
  resolved_count: number
}
