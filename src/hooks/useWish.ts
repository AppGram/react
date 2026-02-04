/**
 * useWish Hook
 *
 * Fetches and manages a single wish.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { Wish } from '../types'

export interface UseWishOptions {
  /**
   * The wish ID to fetch
   */
  wishId: string

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseWishResult {
  /**
   * The wish data
   */
  wish: Wish | null

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

export function useWish(options: UseWishOptions): UseWishResult {
  const { client, fingerprint } = useAppgramContext()
  const [wish, setWish] = useState<Wish | null>(null)
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchWish = useCallback(async () => {
    if (options.skip || !options.wishId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getWish(options.wishId)

      if (response.success && response.data) {
        let wishData = response.data

        // Check vote status if fingerprint available
        if (fingerprint) {
          const voteResponse = await client.checkVote(options.wishId, fingerprint)
          wishData = {
            ...wishData,
            has_voted: voteResponse.success && voteResponse.data?.has_voted,
          }
        }

        setWish(wishData)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch wish'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, fingerprint, options.wishId, options.skip])

  useEffect(() => {
    fetchWish()
  }, [fetchWish])

  return {
    wish,
    isLoading,
    error,
    refetch: fetchWish,
  }
}
