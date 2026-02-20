/**
 * ReleaseDetail Component
 *
 * Displays a single release's full content with glassmorphism styling.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Tag, Sparkles, Zap, Bug, Wrench } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Markdown } from '../shared'
import { useAppgramContext } from '../../provider/context'
import { useRelease } from '../../hooks/useReleases'
import type { Release } from '../../types'

export interface ReleaseDetailProps {
  /**
   * The release to display (either pass release object or releaseSlug)
   */
  release?: Release

  /**
   * Release slug to fetch (alternative to passing release object)
   */
  releaseSlug?: string

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
   * Custom render function for loading state
   */
  renderLoading?: () => React.ReactNode

  /**
   * Custom render function for error state
   */
  renderError?: (error: string, retry: () => void) => React.ReactNode

  /**
   * Custom class name
   */
  className?: string
}

// Release item type config
const itemTypeConfig: Record<string, {
  label: string
  color: string
  icon: typeof Zap
}> = {
  feature: { label: 'Feature', color: '#8b5cf6', icon: Sparkles },
  improvement: { label: 'Improvement', color: '#3b82f6', icon: Zap },
  bugfix: { label: 'Bug Fix', color: '#10b981', icon: Bug },
  other: { label: 'Other', color: '#6b7280', icon: Wrench },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ReleaseDetail({
  release: providedRelease,
  releaseSlug,
  onBack,
  showBackButton = true,
  renderLoading,
  renderError,
  className,
}: ReleaseDetailProps): React.ReactElement | null {
  const { theme } = useAppgramContext()
  const {
    release: fetchedRelease,
    isLoading,
    error,
    refetch,
  } = useRelease({
    releaseSlug: releaseSlug || '',
    skip: !releaseSlug || !!providedRelease,
  })

  const release = providedRelease || fetchedRelease

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const accentColor = theme.colors?.accent || primaryColor
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  // Loading state
  if (isLoading && !release) {
    if (renderLoading) return <>{renderLoading()}</>
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  // Error state
  if (error && !release) {
    if (renderError) return <>{renderError(error, refetch)}</>
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 text-white transition-colors"
          style={{ backgroundColor: primaryColor, borderRadius: `${borderRadius}px` }}
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!release) return null

  // Group items by type
  const itemsByType = (release.items || []).reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type]!.push(item)
    return acc
  }, {} as Record<string, typeof release.items>)

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
            Back to Releases
          </motion.button>
        )}

        {/* Release Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          className="mb-8"
        >
          {/* Cover Image */}
          {release.cover_image_url && (
            <div
              className="mb-6 overflow-hidden"
              style={{ borderRadius: `${borderRadius}px` }}
            >
              <img
                src={release.cover_image_url}
                alt={release.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {release.version && (
              <span
                className="font-mono text-xs font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                v{release.version}
              </span>
            )}
            {release.labels && release.labels.length > 0 && release.labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                }}
              >
                <Tag className="w-3 h-3" />
                {label}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: 'var(--appgram-foreground)', lineHeight: 1.2 }}
          >
            {release.title}
          </h1>

          {/* Date */}
          {(release.published_at || release.created_at) && (
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--appgram-muted-foreground)' }}
            >
              <Calendar className="w-4 h-4" />
              <span>{formatDate(release.published_at || release.created_at)}</span>
            </div>
          )}
        </motion.div>

        {/* Release Items by Type */}
        {Object.keys(itemsByType).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
            className="mb-8 space-y-6"
          >
            {(Object.entries(itemsByType) as [string, typeof release.items][]).map(([type, items]) => {
              const config = itemTypeConfig[type] || itemTypeConfig.other
              const Icon = config.icon

              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                    <h3
                      className="text-sm font-semibold uppercase"
                      style={{ color: config.color }}
                    >
                      {config.label}s
                    </h3>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      {items?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border"
                        style={{
                          backgroundColor: 'var(--appgram-card)',
                          borderColor: 'var(--appgram-border)',
                          borderRadius: `${Math.min(borderRadius, 12)}px`,
                          transition: 'all 150ms cubic-bezier(0.33, 1, 0.68, 1)',
                        }}
                      >
                        <h4
                          className="font-medium text-sm mb-1"
                          style={{ color: 'var(--appgram-foreground)' }}
                        >
                          {item.title}
                        </h4>
                        {item.description && (
                          <p
                            className="text-sm"
                            style={{ color: 'var(--appgram-muted-foreground)' }}
                          >
                            {item.description}
                          </p>
                        )}
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="mt-3 rounded-lg max-w-full h-auto"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Release Content */}
        {release.content && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          >
            <div
              className="p-6 md:p-8 border"
              style={{
                backgroundColor: 'var(--appgram-card)',
                borderColor: 'var(--appgram-border)',
                borderRadius: `${borderRadius}px`,
              }}
            >
              <Markdown content={release.content} accentColor={accentColor} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
