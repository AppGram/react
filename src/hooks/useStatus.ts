/**
 * useStatus Hook
 *
 * Fetches status page data and transforms it for the StatusBoard component.
 * Supports auto-refresh polling.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type {
  StatusPageOverview,
  StatusUpdate as ApiStatusUpdate,
  StatusPageService,
  StatusType,
} from '../types'
import type {
  StatusData,
  StatusComponent,
  StatusIncident,
  OverallStatus,
  ComponentStatus,
} from '../components/status/StatusBoard'

export interface UseStatusOptions {
  /**
   * Status page slug
   * @default 'status'
   */
  slug?: string

  /**
   * Whether to fetch immediately
   * @default true
   */
  enabled?: boolean

  /**
   * Auto-refresh interval in milliseconds (0 to disable)
   * @default 30000
   */
  refreshInterval?: number
}

export interface UseStatusResult {
  /**
   * Transformed status data ready for StatusBoard
   */
  status: StatusData | null

  /**
   * Raw API overview response
   */
  overview: StatusPageOverview | null

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message
   */
  error: string | null

  /**
   * Manually refresh
   */
  refetch: () => Promise<void>
}

// Map API status types to the component's simpler types
function mapOverallStatus(apiStatus: StatusType): OverallStatus {
  switch (apiStatus) {
    case 'operational':
      return 'operational'
    case 'degraded_performance':
      return 'degraded'
    case 'partial_outage':
      return 'partial_outage'
    case 'major_outage':
      return 'major_outage'
    case 'maintenance':
      return 'degraded'
    case 'incident':
      return 'major_outage'
    default:
      return 'operational'
  }
}

function mapComponentStatus(apiStatus: StatusType): ComponentStatus {
  switch (apiStatus) {
    case 'operational':
      return 'operational'
    case 'degraded_performance':
      return 'degraded'
    case 'partial_outage':
      return 'partial_outage'
    case 'major_outage':
      return 'major_outage'
    case 'maintenance':
      return 'degraded'
    case 'incident':
      return 'major_outage'
    default:
      return 'operational'
  }
}

function transformToStatusData(overview: StatusPageOverview): StatusData {
  // Transform services into components
  const components: StatusComponent[] = (overview.services || []).map(
    (service: StatusPageService) => ({
      id: service.id,
      name: service.name,
      description: service.description || undefined,
      status: mapComponentStatus(
        overview.services_status[service.name] ||
          overview.services_status[service.id] ||
          'operational'
      ),
      group: service.group_name || undefined,
    })
  )

  // Transform active updates into incidents
  const incidents: StatusIncident[] = (overview.active_updates || []).map(
    (update: ApiStatusUpdate) => ({
      id: update.id,
      title: update.title,
      status: update.state === 'resolved' ? 'resolved' as const : 'investigating' as const,
      impact:
        update.status_type === 'major_outage'
          ? ('critical' as const)
          : update.status_type === 'partial_outage' || update.status_type === 'incident'
          ? ('major' as const)
          : ('minor' as const),
      created_at: update.created_at,
      resolved_at: update.resolved_at,
      updates: [
        {
          id: `${update.id}-initial`,
          message: update.description,
          status: update.state === 'resolved' ? 'resolved' as const : 'investigating' as const,
          created_at: update.created_at,
        },
      ],
      affected_components: update.affected_services,
    })
  )

  // Also include recent resolved updates as past incidents
  const resolvedIncidents: StatusIncident[] = (overview.recent_updates || [])
    .filter((u: ApiStatusUpdate) => u.state === 'resolved')
    .map((update: ApiStatusUpdate) => ({
      id: update.id,
      title: update.title,
      status: 'resolved' as const,
      impact:
        update.status_type === 'major_outage'
          ? ('critical' as const)
          : update.status_type === 'partial_outage' || update.status_type === 'incident'
          ? ('major' as const)
          : ('minor' as const),
      created_at: update.created_at,
      resolved_at: update.resolved_at,
      updates: [
        {
          id: `${update.id}-initial`,
          message: update.description,
          status: 'resolved' as const,
          created_at: update.created_at,
        },
      ],
      affected_components: update.affected_services,
    }))

  // Merge and deduplicate
  const allIncidentIds = new Set(incidents.map((i) => i.id))
  const mergedIncidents = [
    ...incidents,
    ...resolvedIncidents.filter((i) => !allIncidentIds.has(i.id)),
  ]

  return {
    overall_status: mapOverallStatus(overview.current_status),
    components,
    incidents: mergedIncidents,
    last_updated: new Date().toISOString(),
  }
}

export function useStatus(options: UseStatusOptions = {}): UseStatusResult {
  const { slug = 'status', enabled = true, refreshInterval = 30000 } = options
  const { client } = useAppgramContext()
  const [overview, setOverview] = useState<StatusPageOverview | null>(null)
  const [status, setStatus] = useState<StatusData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(
    async (skipLoading = false) => {
      if (!skipLoading) {
        setIsLoading(true)
      }
      setError(null)

      try {
        const response = await client.getPublicStatusOverview(slug)

        if (response.success && response.data) {
          setOverview(response.data)
          setStatus(transformToStatusData(response.data))
        } else {
          setError(getErrorMessage(response.error, 'Failed to fetch status'))
        }
      } catch (err) {
        setError(getErrorMessage(err, 'An error occurred'))
      } finally {
        if (!skipLoading) {
          setIsLoading(false)
        }
      }
    },
    [client, slug]
  )

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchStatus()
    }
  }, [enabled, fetchStatus])

  // Auto-refresh
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return

    intervalRef.current = setInterval(() => {
      fetchStatus(true)
    }, refreshInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, refreshInterval, fetchStatus])

  return {
    status,
    overview,
    isLoading,
    error,
    refetch: () => fetchStatus(false),
  }
}
