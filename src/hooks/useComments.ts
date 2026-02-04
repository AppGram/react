/**
 * useComments Hook
 *
 * Fetches and manages comments for a wish.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { Comment, CommentCreateInput } from '../types'

export interface UseCommentsOptions {
  /**
   * The wish ID to fetch comments for
   */
  wishId: string

  /**
   * Number of comments per page
   * @default 20
   */
  perPage?: number

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseCommentsResult {
  /**
   * List of comments
   */
  comments: Comment[]

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Loading state for creating a comment
   */
  isCreating: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Total number of comments
   */
  total: number

  /**
   * Current page
   */
  page: number

  /**
   * Total pages
   */
  totalPages: number

  /**
   * Go to next page
   */
  nextPage: () => void

  /**
   * Go to previous page
   */
  prevPage: () => void

  /**
   * Go to specific page
   */
  setPage: (page: number) => void

  /**
   * Create a new comment
   */
  createComment: (data: Omit<CommentCreateInput, 'wish_id'>) => Promise<Comment | null>

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

export function useComments(options: UseCommentsOptions): UseCommentsResult {
  const { client } = useAppgramContext()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const perPage = options.perPage || 20

  const fetchComments = useCallback(async () => {
    if (options.skip || !options.wishId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getComments(options.wishId, {
        page,
        per_page: perPage,
      })

      if (response.success && response.data) {
        setComments(response.data.data || [])
        setTotal(response.data.total)
        setTotalPages(response.data.total_pages)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch comments'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.wishId, options.skip, page, perPage])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const createComment = useCallback(
    async (data: Omit<CommentCreateInput, 'wish_id'>): Promise<Comment | null> => {
      setIsCreating(true)
      setError(null)

      try {
        const response = await client.createComment({
          ...data,
          wish_id: options.wishId,
        })

        if (response.success && response.data) {
          // Add new comment to the list
          setComments((prev) => [response.data!, ...prev])
          setTotal((prev) => prev + 1)
          return response.data
        } else {
          setError(getErrorMessage(response.error, 'Failed to create comment'))
          return null
        }
      } catch (err) {
        setError(getErrorMessage(err, 'An error occurred'))
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [client, options.wishId]
  )

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1)
    }
  }, [page, totalPages])

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1)
    }
  }, [page])

  return {
    comments,
    isLoading,
    isCreating,
    error,
    total,
    page,
    totalPages,
    nextPage,
    prevPage,
    setPage,
    createComment,
    refetch: fetchComments,
  }
}
