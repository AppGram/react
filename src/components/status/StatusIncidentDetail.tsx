/**
 * StatusIncidentDetail Component
 *
 * Displays a single incident's full details with timeline of updates.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, Calendar } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import type { StatusIncident, IncidentStatus, IncidentImpact } from './StatusBoard'

export interface StatusIncidentDetailProps {
  /**
   * The incident to display
   */
  incident: StatusIncident

  /**
   * Back button click handler
   */
  onBack?: () => void

  /**
   * Show back button
   * @default true
   */
  showBackButton?: boolean

  /**
   * Show affected components
   * @default true
   */
  showAffectedComponents?: boolean

  /**
   * Custom class name
   */
  className?: string
}

// Incident status configuration
const incidentStatusConfig: Record<
  IncidentStatus,
  { label: string; color: string; icon: typeof AlertTriangle }
> = {
  investigating: { label: 'Investigating', color: '#f59e0b', icon: AlertTriangle },
  identified: { label: 'Identified', color: '#f97316', icon: AlertTriangle },
  monitoring: { label: 'Monitoring', color: '#3b82f6', icon: Clock },
  resolved: { label: 'Resolved', color: '#10b981', icon: CheckCircle2 },
}

// Impact configuration
const impactConfig: Record<IncidentImpact, { label: string; color: string }> = {
  minor: { label: 'Minor Impact', color: '#6b7280' },
  major: { label: 'Major Impact', color: '#f59e0b' },
  critical: { label: 'Critical Impact', color: '#ef4444' },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

function formatDuration(startDate: string, endDate: string): string {
  const duration = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 60000
  )

  if (duration < 60) {
    return `${duration} minute${duration !== 1 ? 's' : ''}`
  }

  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }

  return `${hours}h ${minutes}m`
}

export function StatusIncidentDetail({
  incident,
  onBack,
  showBackButton = true,
  showAffectedComponents = true,
  className,
}: StatusIncidentDetailProps): React.ReactElement {
  const { theme } = useAppgramContext()

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  const statusConfig = incidentStatusConfig[incident.status]
  const impact = impactConfig[incident.impact]
  const StatusIcon = statusConfig.icon
  const isResolved = incident.status === 'resolved'

  return (
    <div className={cn('w-full', className)}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back Button */}
        {showBackButton && onBack && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
            onClick={onBack}
            className="flex items-center gap-2 mb-6 px-4 py-2 text-sm font-medium"
            style={{
              color: primaryColor,
              backgroundColor: isDark ? `${primaryColor}15` : `${primaryColor}10`,
              borderRadius: `${borderRadius}px`,
              transition: 'opacity 150ms cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Status
          </motion.button>
        )}

        {/* Incident Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          className="mb-8"
        >
          {/* Status Banner */}
          <div
            className="flex items-center gap-3 p-4 mb-6 rounded-lg"
            style={{
              backgroundColor: `${statusConfig.color}10`,
              border: `1px solid ${statusConfig.color}30`,
              borderRadius: `${borderRadius}px`,
            }}
          >
            <StatusIcon className="w-5 h-5" style={{ color: statusConfig.color }} />
            <span
              className="text-sm font-semibold uppercase"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
            {isResolved && incident.resolved_at && (
              <span
                className="ml-auto text-sm"
                style={{ color: statusConfig.color }}
              >
                Resolved in {formatDuration(incident.created_at, incident.resolved_at)}
              </span>
            )}
          </div>

          {/* Title and Meta */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 flex-wrap">
              <span
                className="text-xs font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: `${impact.color}15`,
                  color: impact.color,
                }}
              >
                {impact.label}
              </span>
            </div>

            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--appgram-foreground)', lineHeight: 1.2 }}
            >
              {incident.title}
            </h1>

            <div
              className="flex items-center gap-4 flex-wrap text-sm"
              style={{ color: 'var(--appgram-muted-foreground)' }}
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Started {formatDate(incident.created_at)}</span>
              </div>
              {incident.resolved_at && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolved {formatDate(incident.resolved_at)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Affected Components */}
        {showAffectedComponents && incident.affected_components && incident.affected_components.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
            className="mb-8"
          >
            <h2
              className="text-sm font-semibold uppercase mb-3"
              style={{ color: 'var(--appgram-muted-foreground)' }}
            >
              Affected Components
            </h2>
            <div className="flex flex-wrap gap-2">
              {incident.affected_components.map((component) => (
                <span
                  key={component}
                  className="text-sm px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--appgram-muted)',
                    color: 'var(--appgram-foreground)',
                    border: '1px solid var(--appgram-border)',
                  }}
                >
                  {component}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--appgram-foreground)' }}
          >
            Incident Timeline
          </h2>

          <div
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: 'var(--appgram-card)',
              borderColor: 'var(--appgram-border)',
              borderRadius: `${borderRadius}px`,
            }}
          >
            <div className="p-6 space-y-6">
              {incident.updates.length > 0 ? (
                incident.updates.map((update, idx) => {
                  const updateStatusConfig = incidentStatusConfig[update.status]
                  const UpdateIcon = updateStatusConfig.icon
                  const isLast = idx === incident.updates.length - 1

                  return (
                    <div key={update.id} className="relative">
                      {/* Timeline connector */}
                      {!isLast && (
                        <div
                          className="absolute left-[11px] top-8 bottom-[-28px] w-[2px]"
                          style={{
                            backgroundColor: 'var(--appgram-border)',
                          }}
                        />
                      )}

                      <div className="flex gap-4">
                        {/* Status Icon */}
                        <div
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${updateStatusConfig.color}15` }}
                        >
                          <UpdateIcon
                            className="w-3.5 h-3.5"
                            style={{ color: updateStatusConfig.color }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-2">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className="text-xs font-semibold uppercase px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${updateStatusConfig.color}10`,
                                color: updateStatusConfig.color,
                              }}
                            >
                              {updateStatusConfig.label}
                            </span>
                            <span
                              className="text-xs"
                              style={{
                                color: 'var(--appgram-muted-foreground)',
                              }}
                            >
                              {formatDateTime(update.created_at)}
                            </span>
                          </div>

                          <p
                            className="text-sm leading-relaxed"
                            style={{
                              color: 'var(--appgram-foreground)',
                            }}
                          >
                            {update.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div
                  className="text-center py-8"
                  style={{
                    color: 'var(--appgram-muted-foreground)',
                  }}
                >
                  <p>No updates available for this incident.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
