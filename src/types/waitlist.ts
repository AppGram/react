/**
 * Waitlist Types
 */

/**
 * Input for joining a waitlist
 */
export interface WaitlistJoinInput {
  /**
   * Email address to add to waitlist
   */
  email: string

  /**
   * Optional name of the user
   */
  name?: string

  /**
   * Optional additional metadata
   */
  metadata?: Record<string, unknown>
}

/**
 * Waitlist count response
 */
export interface WaitlistCount {
  /**
   * Total number of users on the waitlist
   */
  count: number
}

/**
 * Waitlist status response
 */
export interface WaitlistStatus {
  /**
   * Whether the user/email is on the waitlist
   */
  is_on_waitlist: boolean

  /**
   * Position in the waitlist (if available)
   */
  position?: number

  /**
   * When the user joined (if on waitlist)
   */
  joined_at?: string
}

/**
 * Waitlist entry (returned after joining)
 */
export interface WaitlistEntry {
  /**
   * Unique ID of the waitlist entry
   */
  id: string

  /**
   * Email address
   */
  email: string

  /**
   * Name (if provided)
   */
  name?: string

  /**
   * Position in the waitlist
   */
  position?: number

  /**
   * When the user joined
   */
  created_at: string
}
