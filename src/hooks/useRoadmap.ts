/**
 * useRoadmap Hook
 *
 * Fetches and manages roadmap data for custom UI implementations.
 *
 * @example
 * ```tsx
 * import { useRoadmap } from '@appgram/react'
 *
 * function CustomRoadmap() {
 *   const { roadmap, isLoading, error, refetch } = useRoadmap({
 *     refreshInterval: 60000,
 *   })
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <Error message={error} />
 *
 *   return (
 *     <div className="roadmap-columns">
 *       {roadmap?.columns.map(col => (
 *         <Column key={col.id} title={col.title} items={col.items} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { Roadmap, RoadmapColumn } from '../types'

export interface UseRoadmapOptions {
  /**
   * Auto-refresh interval in milliseconds (0 to disable)
   * @default 0
   */
  refreshInterval?: number

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseRoadmapResult {
  /**
   * Roadmap data
   */
  roadmap: Roadmap | null

  /**
   * Roadmap columns with items
   */
  columns: RoadmapColumn[]

  /**
   * Total number of items
   */
  totalItems: number

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

export function useRoadmap(options: UseRoadmapOptions = {}): UseRoadmapResult {
  const { client } = useAppgramContext()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [columns, setColumns] = useState<RoadmapColumn[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchRoadmap = useCallback(async () => {
    if (options.skip) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getRoadmapData()

      if (response.success && response.data) {
        setRoadmap(response.data.roadmap)
        // Columns can be at top level or nested inside roadmap
        const cols = response.data.columns || response.data.roadmap?.columns || []
        setColumns(cols)
        // Calculate total items from columns
        const itemCount = response.data.total_items || cols.reduce((sum, col) => sum + (col.items?.length || 0), 0)
        setTotalItems(itemCount)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch roadmap'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip])

  useEffect(() => {
    fetchRoadmap()
  }, [fetchRoadmap])

  // Auto-refresh
  useEffect(() => {
    if (!options.refreshInterval || options.refreshInterval <= 0) return

    const interval = setInterval(fetchRoadmap, options.refreshInterval)
    return () => clearInterval(interval)
  }, [options.refreshInterval, fetchRoadmap])

  return {
    roadmap,
    columns,
    totalItems,
    isLoading,
    error,
    refetch: fetchRoadmap,
  }
}
