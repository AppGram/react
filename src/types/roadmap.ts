/**
 * Roadmap Types
 */

import type { Wish } from './wish'

export type RoadmapVisibility = 'public' | 'private' | 'voters_only'

export interface Roadmap {
  id: string
  project_id: string
  name: string
  description?: string | null
  visibility: RoadmapVisibility
  show_vote_counts: boolean
  show_comments: boolean
  is_default: boolean
  created_at: string
  updated_at: string
  columns?: RoadmapColumn[]
}

export interface RoadmapColumn {
  id: string
  roadmap_id: string
  name: string
  color: string
  sort_order: number
  wip_limit?: number | null
  created_at: string
  updated_at: string
  items?: RoadmapItem[]
}

export interface RoadmapItem {
  id: string
  roadmap_id: string
  column_id: string
  wish_id?: string | null
  title: string
  description?: string | null
  sort_order: number
  color?: string | null
  target_date?: string | null
  created_at: string
  updated_at: string
  wish?: Wish | null
}

export interface RoadmapData {
  roadmap: Roadmap | null
  columns: RoadmapColumn[]
  total_items: number
  customization?: {
    use_custom: boolean
    customization_data: any
  } | null
}
