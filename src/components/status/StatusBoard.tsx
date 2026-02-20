/**
 * StatusBoard Component
 *
 * Modern system status page with service health indicators and incident tracking.
 * Adapted from StatusModern variant.
 *
 * @example
 * ```tsx
 * import { StatusBoard } from '@appgram/react'
 *
 * <StatusBoard
 *   heading="System Status"
 *   description="Current operational status of all services"
 *   status={statusData}
 *   onIncidentClick={(incident) => openIncidentDetail(incident.id)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom component rendering
 * <StatusBoard
 *   status={statusData}
 *   renderComponent={(component) => (
 *     <div className="custom-card">
 *       <Icon name={component.status} />
 *       <span>{component.name}</span>
 *     </div>
 *   )}
 * />
 * ```
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'

// Status types
export type OverallStatus =
  | 'operational'
  | 'degraded'
  | 'partial_outage'
  | 'major_outage'

export type ComponentStatus =
  | 'operational'
  | 'degraded'
  | 'partial_outage'
  | 'major_outage'

export type IncidentStatus =
  | 'investigating'
  | 'identified'
  | 'monitoring'
  | 'resolved'

export type IncidentImpact = 'minor' | 'major' | 'critical'

export interface StatusComponent {
  id: string
  name: string
  description?: string
  status: ComponentStatus
  group?: string
}

export interface IncidentUpdate {
  id: string
  message: string
  status: IncidentStatus
  created_at: string
}

export interface StatusIncident {
  id: string
  title: string
  status: IncidentStatus
  impact: IncidentImpact
  created_at: string
  resolved_at?: string | null
  updates: IncidentUpdate[]
  affected_components?: string[]
}

export interface StatusData {
  overall_status: OverallStatus
  components: StatusComponent[]
  incidents: StatusIncident[]
  last_updated?: string
}

export interface StatusBoardProps {
  /**
   * Status data to display
   */
  status: StatusData

  /**
   * Page heading
   */
  heading?: string

  /**
   * Page description
   */
  description?: string

  /**
   * Heading alignment
   * @default 'left'
   */
  headingAlignment?: 'left' | 'center' | 'right'

  /**
   * Show component descriptions
   * @default true
   */
  showComponentDescriptions?: boolean

  /**
   * Show incident history
   * @default true
   */
  showIncidentHistory?: boolean

  /**
   * Max number of past incidents to show
   * @default 5
   */
  maxPastIncidents?: number

  /**
   * Click handler for incidents
   */
  onIncidentClick?: (incident: StatusIncident) => void

  /**
   * Custom render for overall status
   */
  renderOverallStatus?: (status: OverallStatus) => React.ReactNode

  /**
   * Custom render for component
   */
  renderComponent?: (component: StatusComponent) => React.ReactNode

  /**
   * Custom render for incident
   */
  renderIncident?: (incident: StatusIncident) => React.ReactNode

  /**
   * Custom class name
   */
  className?: string
}

// Overall status configuration
const overallStatusConfig: Record<
  OverallStatus,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  operational: {
    label: 'All Systems Operational',
    color: '#10b981',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Partial System Degradation',
    color: '#f59e0b',
    icon: AlertTriangle,
  },
  partial_outage: {
    label: 'Partial System Outage',
    color: '#f97316',
    icon: AlertTriangle,
  },
  major_outage: {
    label: 'Major System Outage',
    color: '#ef4444',
    icon: XCircle,
  },
}

// Component status configuration
const componentStatusConfig: Record<
  ComponentStatus,
  { label: string; color: string }
> = {
  operational: { label: 'Operational', color: '#10b981' },
  degraded: { label: 'Degraded', color: '#f59e0b' },
  partial_outage: { label: 'Partial Outage', color: '#f97316' },
  major_outage: { label: 'Major Outage', color: '#ef4444' },
}

// Incident status configuration
const incidentStatusConfig: Record<
  IncidentStatus,
  { label: string; color: string }
> = {
  investigating: { label: 'Investigating', color: '#f59e0b' },
  identified: { label: 'Identified', color: '#f97316' },
  monitoring: { label: 'Monitoring', color: '#3b82f6' },
  resolved: { label: 'Resolved', color: '#10b981' },
}

// Impact configuration
const impactConfig: Record<IncidentImpact, { label: string; color: string }> = {
  minor: { label: 'Minor', color: '#6b7280' },
  major: { label: 'Major', color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
}

// Status dot component
function StatusDot({
  status,
  primaryColor,
}: {
  status: ComponentStatus
  primaryColor?: string
}) {
  const config = componentStatusConfig[status]
  const color = status === 'operational' && primaryColor ? primaryColor : config.color

  return (
    <div className="relative flex h-2.5 w-2.5">
      {status !== 'operational' && (
        <motion.span
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

export function StatusBoard({
  status,
  heading,
  description,
  headingAlignment = 'left',
  showComponentDescriptions = true,
  showIncidentHistory = true,
  maxPastIncidents = 5,
  onIncidentClick,
  renderOverallStatus,
  renderComponent,
  renderIncident,
  className,
}: StatusBoardProps): React.ReactElement {
  const { theme } = useAppgramContext()

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  const overallConfig = overallStatusConfig[status.overall_status]
  const OverallIcon = overallConfig.icon
  const activeIncidents = status.incidents.filter((i) => i.status !== 'resolved')
  const resolvedIncidents = status.incidents.filter((i) => i.status === 'resolved')

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
  }

  // Group components by group name
  const componentGroups = status.components.reduce(
    (acc, component) => {
      const group = component.group || 'Services'
      if (!acc[group]) acc[group] = []
      acc[group].push(component)
      return acc
    },
    {} as Record<string, StatusComponent[]>
  )

  return (
    <div className={cn('max-w-4xl mx-auto space-y-8', className)}>
      {/* Page Header */}
      {(heading || description) && (
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          className="mb-8"
          style={{ textAlign: headingAlignment }}
        >
          {heading && (
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--appgram-foreground)', lineHeight: 1.2 }}
            >
              {heading}
            </h1>
          )}
          {description && (
            <p
              className="text-base md:text-lg leading-relaxed max-w-2xl"
              style={{
                color: 'var(--appgram-muted-foreground)',
                marginLeft: headingAlignment === 'center' ? 'auto' : 0,
                marginRight: headingAlignment === 'center' ? 'auto' : 0,
              }}
            >
              {description}
            </p>
          )}
        </motion.header>
      )}

      {/* Overall Status Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
      >
        {renderOverallStatus ? (
          renderOverallStatus(status.overall_status)
        ) : (
          <div
            className="flex flex-col sm:flex-row items-center justify-between p-5 border rounded-lg"
            style={{
              backgroundColor: 'var(--appgram-card)',
              borderColor:
                status.overall_status === 'operational'
                  ? 'var(--appgram-border)'
                  : overallConfig.color,
              borderRadius: `${Math.min(borderRadius, 12)}px`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{ backgroundColor: `${overallConfig.color}15` }}
              >
                <OverallIcon
                  className="w-6 h-6"
                  style={{ color: overallConfig.color }}
                />
              </div>
              <div>
                <h2
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: 'var(--appgram-foreground)' }}
                >
                  {overallConfig.label}
                </h2>
              </div>
            </div>
            <div
              className="mt-4 sm:mt-0 text-sm font-medium flex items-center gap-2"
              style={{ color: 'var(--appgram-muted-foreground)' }}
            >
              <Clock className="w-4 h-4" />
              <span>
                Updated{' '}
                {status.last_updated
                  ? formatDateTime(status.last_updated)
                  : new Date().toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--appgram-foreground)' }}
            >
              Active Incidents
            </h2>
          </div>

          <div className="space-y-4">
            {activeIncidents.map((incident) => {
              const incidentConfig = incidentStatusConfig[incident.status]
              const impact = impactConfig[incident.impact]

              return renderIncident ? (
                <React.Fragment key={incident.id}>
                  {renderIncident(incident)}
                </React.Fragment>
              ) : (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="rounded-lg border overflow-hidden"
                  style={{
                    backgroundColor: 'var(--appgram-card)',
                    borderColor: 'var(--appgram-border)',
                    borderRadius: `${Math.min(borderRadius, 12)}px`,
                  }}
                >
                  {/* Incident Header */}
                  <div
                    className="px-6 py-4 border-b"
                    style={{
                      backgroundColor: 'var(--appgram-muted)',
                      borderColor: 'var(--appgram-border)',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold uppercase px-2 py-0.5 rounded border"
                            style={{
                              color: incidentConfig.color,
                              borderColor: `${incidentConfig.color}40`,
                              backgroundColor: `${incidentConfig.color}10`,
                            }}
                          >
                            {incidentConfig.label}
                          </span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{
                              color: impact.color,
                              backgroundColor: `${impact.color}15`,
                            }}
                          >
                            {impact.label}
                          </span>
                        </div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: 'var(--appgram-foreground)' }}
                        >
                          {incident.title}
                        </h3>
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: 'var(--appgram-muted-foreground)' }}
                      >
                        {formatDate(incident.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Incident Updates Timeline */}
                  <div className="px-6 py-6 space-y-6">
                    {incident.updates.map((update, idx) => (
                      <div
                        key={update.id}
                        className="relative pl-6"
                      >
                        {/* Timeline line */}
                        {idx !== incident.updates.length - 1 && (
                          <div
                            className="absolute left-[3px] top-2 bottom-[-24px] w-[2px]"
                            style={{ backgroundColor: 'var(--appgram-border)' }}
                          />
                        )}
                        {/* Dot */}
                        <div
                          className="absolute left-0 top-1.5 w-2 h-2 rounded-full"
                          style={{ backgroundColor: 'var(--appgram-muted-foreground)' }}
                        />

                        <div className="space-y-1">
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--appgram-foreground)' }}
                          >
                            {update.message}
                          </p>
                          <div
                            className="flex items-center gap-2 text-xs"
                            style={{ color: 'var(--appgram-muted-foreground)' }}
                          >
                            <span>{formatDateTime(update.created_at)}</span>
                            <span>—</span>
                            <span className="capitalize">
                              {update.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* System Components */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--appgram-foreground)' }}>
          System Status
        </h2>

        {Object.entries(componentGroups).map(([groupName, components]) => (
          <div key={groupName} className="mb-6 last:mb-0">
            {Object.keys(componentGroups).length > 1 && (
              <h3
                className="text-sm font-medium uppercase mb-3"
                style={{ color: 'var(--appgram-muted-foreground)' }}
              >
                {groupName}
              </h3>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {components.map((component) => {
                const config = componentStatusConfig[component.status]

                return renderComponent ? (
                  <React.Fragment key={component.id}>
                    {renderComponent(component)}
                  </React.Fragment>
                ) : (
                  <motion.div
                    key={component.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
                    className="group rounded-lg border p-4"
                    style={{
                      backgroundColor: 'var(--appgram-card)',
                      borderColor: 'var(--appgram-border)',
                      borderRadius: `${Math.min(borderRadius, 12)}px`,
                      transition: 'all 150ms cubic-bezier(0.33, 1, 0.68, 1)',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4
                          className="font-medium leading-tight"
                          style={{ color: 'var(--appgram-foreground)' }}
                        >
                          {component.name}
                        </h4>
                        {showComponentDescriptions && component.description && (
                          <p
                            className="text-sm line-clamp-2"
                            style={{ color: 'var(--appgram-muted-foreground)' }}
                          >
                            {component.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pl-3">
                        <StatusDot
                          status={component.status}
                          primaryColor={primaryColor}
                        />
                        <span
                          className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Incident History */}
      {showIncidentHistory && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--appgram-foreground)' }}>
            Past Incidents
          </h2>

          <div
            className="rounded-lg border divide-y"
            style={{
              backgroundColor: 'var(--appgram-card)',
              borderColor: 'var(--appgram-border)',
              borderRadius: `${Math.min(borderRadius, 12)}px`,
            }}
          >
            {resolvedIncidents.length > 0 ? (
              resolvedIncidents.slice(0, maxPastIncidents).map((incident) => {
                const impact = impactConfig[incident.impact]
                const duration = incident.resolved_at
                  ? Math.round(
                      (new Date(incident.resolved_at).getTime() -
                        new Date(incident.created_at).getTime()) /
                        60000
                    )
                  : null

                return (
                  <motion.div
                    key={incident.id}
                    whileHover={{ backgroundColor: 'var(--appgram-muted)' }}
                    transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    style={{
                      borderColor: 'var(--appgram-border)',
                      transition: 'background-color 150ms cubic-bezier(0.33, 1, 0.68, 1)',
                    }}
                    onClick={() => onIncidentClick?.(incident)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-medium"
                          style={{ color: 'var(--appgram-foreground)' }}
                        >
                          {incident.title}
                        </span>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: impact.color }}
                        />
                      </div>
                      <div
                        className="text-sm flex items-center gap-2"
                        style={{ color: 'var(--appgram-muted-foreground)' }}
                      >
                        <span>{formatDate(incident.created_at)}</span>
                        {duration !== null && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-xs">
                              {duration < 60
                                ? `${duration}m`
                                : `${Math.round(duration / 60)}h ${duration % 60}m`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-1 rounded capitalize"
                        style={{
                          backgroundColor: `${incidentStatusConfig.resolved.color}15`,
                          color: incidentStatusConfig.resolved.color,
                        }}
                      >
                        {incident.status}
                      </span>
                      <ArrowRight
                        className="w-4 h-4 opacity-50"
                        style={{ color: 'var(--appgram-foreground)' }}
                      />
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="py-16 text-center">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{ backgroundColor: 'var(--appgram-muted)' }}
                >
                  <Activity
                    className="w-5 h-5"
                    style={{ color: 'var(--appgram-muted-foreground)' }}
                  />
                </div>
                <h3 className="font-medium" style={{ color: 'var(--appgram-foreground)' }}>
                  No recent incidents
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--appgram-muted-foreground)' }}
                >
                  Systems have been running smoothly.
                </p>
              </div>
            )}
          </div>

          {resolvedIncidents.length > maxPastIncidents && (
            <div className="mt-4 text-center">
              <button
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: primaryColor }}
              >
                View full history
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
