/**
 * useReleases Hook
 *
 * Fetches and manages releases/changelog data for custom UI implementations.
 *
 * @example
 * ```tsx
 * import { useReleases } from '@appgram/react'
 *
 * function ChangelogList() {
 *   const { releases, isLoading, error, refetch } = useReleases({ limit: 10 })
 *
 *   if (isLoading) return <Spinner />
 *   if (error) return <Alert>{error}</Alert>
 *
 *   return (
 *     <ul className="changelog">
 *       {releases.map(release => (
 *         <li key={release.id}>
 *           <h3>{release.title}</h3>
 *           <time>{formatDate(release.published_at)}</time>
 *           <div dangerouslySetInnerHTML={{ __html: release.content }} />
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { Release } from '../types'

export interface UseReleasesOptions {
  /**
   * Maximum number of releases to fetch
   * @default 50
   */
  limit?: number

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseReleasesResult {
  /**
   * List of releases
   */
  releases: Release[]

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

export function useReleases(options: UseReleasesOptions = {}): UseReleasesResult {
  const { client } = useAppgramContext()
  const [releases, setReleases] = useState<Release[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchReleases = useCallback(async () => {
    if (options.skip) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getReleases({
        limit: options.limit || 50,
      })

      if (response.success && response.data) {
        setReleases(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch releases'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip, options.limit])

  useEffect(() => {
    fetchReleases()
  }, [fetchReleases])

  return {
    releases,
    isLoading,
    error,
    refetch: fetchReleases,
  }
}

/**
 * useRelease Hook
 *
 * Fetches a single release by slug.
 */
export interface UseReleaseOptions {
  /**
   * The release slug to fetch
   */
  releaseSlug: string

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseReleaseResult {
  /**
   * The release data
   */
  release: Release | null

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

export function useRelease(options: UseReleaseOptions): UseReleaseResult {
  const { client } = useAppgramContext()
  const [release, setRelease] = useState<Release | null>(null)
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchRelease = useCallback(async () => {
    if (options.skip || !options.releaseSlug) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getRelease(options.releaseSlug)

      if (response.success && response.data) {
        setRelease(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch release'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip, options.releaseSlug])

  useEffect(() => {
    fetchRelease()
  }, [fetchRelease])

  return {
    release,
    isLoading,
    error,
    refetch: fetchRelease,
  }
}
