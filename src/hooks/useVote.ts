/**
 * useVote Hook
 *
 * Manages voting state and actions for a wish.
 * Provides optimistic updates for instant UI feedback.
 *
 * @example
 * ```tsx
 * import { useVote } from '@appgram/react'
 *
 * function VoteButton({ wishId, initialCount, initialHasVoted }) {
 *   const { hasVoted, voteCount, toggle, isLoading } = useVote({
 *     wishId,
 *     initialVoteCount: initialCount,
 *     initialHasVoted,
 *     onVoteChange: (voted, count) => {
 *       analytics.track('vote', { wishId, voted })
 *     }
 *   })
 *
 *   return (
 *     <button
 *       onClick={toggle}
 *       disabled={isLoading}
 *       className={hasVoted ? 'voted' : ''}
 *     >
 *       {hasVoted ? '✓' : '▲'} {voteCount}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Lazy vote check to avoid rate limiting
 * const { hasVoted, voteCount, toggle } = useVote({
 *   wishId: wish.id,
 *   initialVoteCount: wish.vote_count,
 *   skipAutoCheck: true, // Check on first click instead
 * })
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'

export interface UseVoteOptions {
  /**
   * The wish ID to vote on
   */
  wishId: string

  /**
   * Initial vote count (optional, useful when you already have the wish data)
   */
  initialVoteCount?: number

  /**
   * Initial hasVoted state (optional)
   */
  initialHasVoted?: boolean

  /**
   * Voter email (optional, for identified voting)
   */
  voterEmail?: string

  /**
   * Callback when vote state changes
   */
  onVoteChange?: (hasVoted: boolean, voteCount: number) => void

  /**
   * Skip automatic vote check on mount to avoid rate limiting
   * When true, vote status will be checked lazily on first interaction
   * @default true
   */
  skipAutoCheck?: boolean
}

export interface UseVoteResult {
  /**
   * Whether the current user has voted
   */
  hasVoted: boolean

  /**
   * Current vote count
   */
  voteCount: number

  /**
   * Loading state for vote operations
   */
  isLoading: boolean

  /**
   * Loading state for initial vote check
   */
  isChecking: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Toggle vote (vote if not voted, unvote if voted)
   */
  toggle: () => Promise<void>

  /**
   * Cast a vote
   */
  vote: () => Promise<void>

  /**
   * Remove a vote
   */
  unvote: () => Promise<void>
}

export function useVote(options: UseVoteOptions): UseVoteResult {
  const { client, fingerprint } = useAppgramContext()
  const [hasVoted, setHasVoted] = useState(options.initialHasVoted || false)
  const [voteCount, setVoteCount] = useState(options.initialVoteCount || 0)
  const [voteId, setVoteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Skip auto check by default to avoid rate limiting when many VoteButtons render
  const skipAutoCheck = options.skipAutoCheck !== false

  // Check vote status - called on mount (if not skipped) or lazily before voting
  const checkVoteStatus = useCallback(async () => {
    if (!fingerprint || !options.wishId || hasChecked) {
      return
    }

    setIsChecking(true)
    try {
      const response = await client.checkVote(options.wishId, fingerprint)
      if (response.success && response.data) {
        setHasVoted(response.data.has_voted)
        if (response.data.vote_id) {
          setVoteId(response.data.vote_id)
        }
      }
      setHasChecked(true)
    } catch {
      // Silent fail for vote check
      setHasChecked(true)
    } finally {
      setIsChecking(false)
    }
  }, [client, fingerprint, options.wishId, hasChecked])

  // Only auto-check on mount if skipAutoCheck is false
  useEffect(() => {
    if (!skipAutoCheck) {
      checkVoteStatus()
    }
  }, [skipAutoCheck, checkVoteStatus])

  // Update state if initial values change
  useEffect(() => {
    if (options.initialVoteCount !== undefined) {
      setVoteCount(options.initialVoteCount)
    }
  }, [options.initialVoteCount])

  useEffect(() => {
    if (options.initialHasVoted !== undefined) {
      setHasVoted(options.initialHasVoted)
    }
  }, [options.initialHasVoted])

  const vote = useCallback(async () => {
    if (!fingerprint || isLoading) return

    // If we haven't checked vote status yet, check first
    if (!hasChecked) {
      setIsLoading(true)
      try {
        const checkResponse = await client.checkVote(options.wishId, fingerprint)
        if (checkResponse.success && checkResponse.data) {
          setHasVoted(checkResponse.data.has_voted)
          if (checkResponse.data.vote_id) {
            setVoteId(checkResponse.data.vote_id)
          }
          setHasChecked(true)
          // If already voted, don't vote again
          if (checkResponse.data.has_voted) {
            setIsLoading(false)
            return
          }
        }
      } catch {
        // Continue with vote attempt if check fails
        setHasChecked(true)
      }
    } else if (hasVoted) {
      // Already voted and we know it
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.createVote(
        options.wishId,
        fingerprint,
        options.voterEmail
      )

      if (response.success && response.data) {
        setHasVoted(true)
        setVoteId(response.data.id)
        setVoteCount((prev) => prev + 1)
        options.onVoteChange?.(true, voteCount + 1)
      } else {
        setError(getErrorMessage(response.error, 'Failed to vote'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to vote'))
    } finally {
      setIsLoading(false)
    }
  }, [client, fingerprint, hasVoted, hasChecked, isLoading, options, voteCount])

  const unvote = useCallback(async () => {
    if (!voteId || !hasVoted || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.deleteVote(voteId)

      if (response.success) {
        setHasVoted(false)
        setVoteId(null)
        setVoteCount((prev) => Math.max(0, prev - 1))
        options.onVoteChange?.(false, Math.max(0, voteCount - 1))
      } else {
        setError(getErrorMessage(response.error, 'Failed to remove vote'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to remove vote'))
    } finally {
      setIsLoading(false)
    }
  }, [client, hasVoted, isLoading, options, voteCount, voteId])

  const toggle = useCallback(async () => {
    if (!fingerprint || isLoading) return

    // If we haven't checked vote status yet, check first to know which action to take
    if (!hasChecked) {
      setIsLoading(true)
      try {
        const checkResponse = await client.checkVote(options.wishId, fingerprint)
        if (checkResponse.success && checkResponse.data) {
          const alreadyVoted = checkResponse.data.has_voted
          setHasVoted(alreadyVoted)
          if (checkResponse.data.vote_id) {
            setVoteId(checkResponse.data.vote_id)
          }
          setHasChecked(true)
          setIsLoading(false)

          // Now perform the appropriate action
          if (alreadyVoted) {
            // User wants to unvote
            if (checkResponse.data.vote_id) {
              await unvote()
            }
          } else {
            // User wants to vote
            await vote()
          }
          return
        }
      } catch {
        // If check fails, default to voting
        setHasChecked(true)
        setIsLoading(false)
      }
    }

    // Normal toggle when we know the status
    if (hasVoted) {
      await unvote()
    } else {
      await vote()
    }
  }, [client, fingerprint, hasVoted, hasChecked, isLoading, options.wishId, unvote, vote])

  return {
    hasVoted,
    voteCount,
    isLoading,
    isChecking,
    error,
    toggle,
    vote,
    unvote,
  }
}
