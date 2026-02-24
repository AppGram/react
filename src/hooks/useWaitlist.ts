/**
 * useWaitlist Hook
 *
 * Manages waitlist operations: join, leave, check status, and get count.
 *
 * @example
 * ```tsx
 * import { useWaitlist } from '@appgram/react'
 *
 * function WaitlistForm() {
 *   const {
 *     count,
 *     isOnWaitlist,
 *     isLoading,
 *     isJoining,
 *     error,
 *     join,
 *     leave,
 *     checkStatus,
 *     refresh,
 *   } = useWaitlist({
 *     email: userEmail, // Optional: auto-check status for this email
 *     onJoinSuccess: (entry) => console.log('Joined!', entry),
 *   })
 *
 *   return (
 *     <div>
 *       <p>{count} people on the waitlist</p>
 *       {isOnWaitlist ? (
 *         <button onClick={() => leave(userEmail)}>Leave Waitlist</button>
 *       ) : (
 *         <button onClick={() => join({ email: userEmail })}>Join Waitlist</button>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { WaitlistJoinInput, WaitlistEntry, WaitlistStatus } from '../types'

export interface UseWaitlistOptions {
  /**
   * Email to auto-check waitlist status for on mount
   */
  email?: string

  /**
   * Whether to fetch the waitlist count on mount
   * @default true
   */
  fetchCountOnMount?: boolean

  /**
   * Callback when successfully joined the waitlist
   */
  onJoinSuccess?: (entry: WaitlistEntry) => void

  /**
   * Callback when join fails
   */
  onJoinError?: (error: string) => void

  /**
   * Callback when successfully left the waitlist
   */
  onLeaveSuccess?: () => void

  /**
   * Callback when leave fails
   */
  onLeaveError?: (error: string) => void
}

export interface UseWaitlistResult {
  /**
   * Total count of users on the waitlist
   */
  count: number | null

  /**
   * Whether the provided email is on the waitlist
   */
  isOnWaitlist: boolean | null

  /**
   * Current user's waitlist status details
   */
  status: WaitlistStatus | null

  /**
   * Loading state for initial data fetch
   */
  isLoading: boolean

  /**
   * Loading state for join operation
   */
  isJoining: boolean

  /**
   * Loading state for leave operation
   */
  isLeaving: boolean

  /**
   * Loading state for status check
   */
  isCheckingStatus: boolean

  /**
   * Error message if any operation failed
   */
  error: string | null

  /**
   * Success message after successful operation
   */
  successMessage: string | null

  /**
   * Join the waitlist
   */
  join: (data: WaitlistJoinInput) => Promise<WaitlistEntry | null>

  /**
   * Leave the waitlist
   */
  leave: (email: string) => Promise<boolean>

  /**
   * Check if an email is on the waitlist
   */
  checkStatus: (email: string) => Promise<WaitlistStatus | null>

  /**
   * Refresh the waitlist count
   */
  refreshCount: () => Promise<void>

  /**
   * Clear error and success messages
   */
  clearMessages: () => void
}

export function useWaitlist(options: UseWaitlistOptions = {}): UseWaitlistResult {
  const { fetchCountOnMount = true } = options
  const { client } = useAppgramContext()

  const [count, setCount] = useState<number | null>(null)
  const [status, setStatus] = useState<WaitlistStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const refreshCount = useCallback(async () => {
    try {
      const response = await client.getWaitlistCount()
      if (response.success && response.data) {
        setCount(response.data.count)
      }
    } catch (err) {
      console.error('Failed to fetch waitlist count:', err)
    }
  }, [client])

  const checkStatus = useCallback(
    async (email: string): Promise<WaitlistStatus | null> => {
      setIsCheckingStatus(true)
      setError(null)

      try {
        const response = await client.checkWaitlistStatus(email)

        if (response.success && response.data) {
          setStatus(response.data)
          return response.data
        } else {
          const errorMsg = getErrorMessage(response.error, 'Failed to check waitlist status')
          setError(errorMsg)
          return null
        }
      } catch (err) {
        const errorMsg = getErrorMessage(err, 'An error occurred')
        setError(errorMsg)
        return null
      } finally {
        setIsCheckingStatus(false)
      }
    },
    [client]
  )

  const join = useCallback(
    async (data: WaitlistJoinInput): Promise<WaitlistEntry | null> => {
      setIsJoining(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const response = await client.joinWaitlist(data)

        if (response.success && response.data) {
          setSuccessMessage("You've been added to the waitlist!")
          setStatus({ is_on_waitlist: true, position: response.data.position })
          options.onJoinSuccess?.(response.data)
          // Refresh count after joining
          refreshCount()
          return response.data
        } else {
          const errorMsg = getErrorMessage(response.error, 'Failed to join waitlist')
          setError(errorMsg)
          options.onJoinError?.(errorMsg)
          return null
        }
      } catch (err) {
        const errorMsg = getErrorMessage(err, 'An error occurred')
        setError(errorMsg)
        options.onJoinError?.(errorMsg)
        return null
      } finally {
        setIsJoining(false)
      }
    },
    [client, options, refreshCount]
  )

  const leave = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLeaving(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const response = await client.leaveWaitlist(email)

        if (response.success) {
          setSuccessMessage("You've been removed from the waitlist.")
          setStatus({ is_on_waitlist: false })
          options.onLeaveSuccess?.()
          // Refresh count after leaving
          refreshCount()
          return true
        } else {
          const errorMsg = getErrorMessage(response.error, 'Failed to leave waitlist')
          setError(errorMsg)
          options.onLeaveError?.(errorMsg)
          return false
        }
      } catch (err) {
        const errorMsg = getErrorMessage(err, 'An error occurred')
        setError(errorMsg)
        options.onLeaveError?.(errorMsg)
        return false
      } finally {
        setIsLeaving(false)
      }
    },
    [client, options, refreshCount]
  )

  // Fetch count and optionally check status on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)

      if (fetchCountOnMount) {
        await refreshCount()
      }

      if (options.email) {
        await checkStatus(options.email)
      }

      setIsLoading(false)
    }

    init()
  }, [fetchCountOnMount, options.email, refreshCount, checkStatus])

  return {
    count,
    isOnWaitlist: status?.is_on_waitlist ?? null,
    status,
    isLoading,
    isJoining,
    isLeaving,
    isCheckingStatus,
    error,
    successMessage,
    join,
    leave,
    checkStatus,
    refreshCount,
    clearMessages,
  }
}
