/**
 * useHelpCenter Hook
 *
 * Fetches and manages help center data.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { HelpCollection, HelpFlow, HelpArticle } from '../types'

export interface UseHelpCenterOptions {
  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseHelpCenterResult {
  /**
   * Help collection
   */
  collection: HelpCollection | null

  /**
   * Help flows
   */
  flows: HelpFlow[]

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

export function useHelpCenter(options: UseHelpCenterOptions = {}): UseHelpCenterResult {
  const { client } = useAppgramContext()
  const [collection, setCollection] = useState<HelpCollection | null>(null)
  const [flows, setFlows] = useState<HelpFlow[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchHelpCenter = useCallback(async () => {
    if (options.skip) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpCollection()

      if (response.success && response.data) {
        setCollection(response.data.collection)
        setFlows(response.data.flows || [])
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch help center'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip])

  useEffect(() => {
    fetchHelpCenter()
  }, [fetchHelpCenter])

  return {
    collection,
    flows,
    isLoading,
    error,
    refetch: fetchHelpCenter,
  }
}

/**
 * useHelpFlow Hook
 *
 * Fetches a single help flow by slug.
 */
export interface UseHelpFlowOptions {
  /**
   * The flow slug to fetch
   */
  flowSlug: string

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseHelpFlowResult {
  /**
   * The flow data
   */
  flow: HelpFlow | null

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

export function useHelpFlow(options: UseHelpFlowOptions): UseHelpFlowResult {
  const { client } = useAppgramContext()
  const [flow, setFlow] = useState<HelpFlow | null>(null)
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchFlow = useCallback(async () => {
    if (options.skip || !options.flowSlug) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpFlow(options.flowSlug)

      if (response.success && response.data) {
        setFlow(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch flow'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip, options.flowSlug])

  useEffect(() => {
    fetchFlow()
  }, [fetchFlow])

  return {
    flow,
    isLoading,
    error,
    refetch: fetchFlow,
  }
}

/**
 * useHelpArticle Hook
 *
 * Fetches a single help article by slug.
 */
export interface UseHelpArticleOptions {
  /**
   * The article slug to fetch
   */
  articleSlug: string

  /**
   * The flow ID the article belongs to
   */
  flowId: string

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseHelpArticleResult {
  /**
   * The article data
   */
  article: HelpArticle | null

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

export function useHelpArticle(options: UseHelpArticleOptions): UseHelpArticleResult {
  const { client } = useAppgramContext()
  const [article, setArticle] = useState<HelpArticle | null>(null)
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchArticle = useCallback(async () => {
    if (options.skip || !options.articleSlug || !options.flowId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpArticle(options.articleSlug, options.flowId)

      if (response.success && response.data) {
        setArticle(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch article'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip, options.articleSlug, options.flowId])

  useEffect(() => {
    fetchArticle()
  }, [fetchArticle])

  return {
    article,
    isLoading,
    error,
    refetch: fetchArticle,
  }
}
