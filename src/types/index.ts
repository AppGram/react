/**
 * Type Exports
 */

export * from './wish'
export * from './vote'
export * from './comment'
export * from './roadmap'
export * from './release'
export * from './help'
export * from './support'
export * from './customization'
export * from './survey'
export * from './form'

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
