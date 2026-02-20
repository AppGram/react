/**
 * ReleaseList Component
 *
 * Modern changelog with animations.
 * Adapted from ReleasesModern variant.
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Bug, Wrench, ArrowRight, Package } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useReleases } from '../../hooks/useReleases'
import type { Release } from '../../types'

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

export interface ReleaseListProps {
  /**
   * Layout variant
   * @default 'timeline'
   */
  variant?: 'timeline' | 'cards' | 'compact'

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
   * Maximum number of releases to show
   * @default 50
   */
  limit?: number

  /**
   * Click handler for releases
   */
  onReleaseClick?: (release: Release) => void

  /**
   * Custom render function for releases
   */
  renderRelease?: (release: Release, index: number) => React.ReactNode

  /**
   * Custom render function for loading state
   */
  renderLoading?: () => React.ReactNode

  /**
   * Custom render function for empty state
   */
  renderEmpty?: () => React.ReactNode

  /**
   * Custom render function for error state
   */
  renderError?: (error: string, retry: () => void) => React.ReactNode

  /**
   * Custom class name
   */
  className?: string
}

// Modern release card
function ModernReleaseCard({
  release,
  primaryColor,
  borderRadius,
  onClick,
  featured = false,
}: {
  release: Release
  primaryColor: string
  borderRadius: number
  onClick?: () => void
  featured?: boolean
}) {
  // Group items by type
  const itemsByType = (release.items || []).reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const accentColor = primaryColor

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
      className={cn(
        'group cursor-pointer rounded-lg border',
        featured ? 'p-6 sm:p-8' : 'p-5'
      )}
      style={{
        backgroundColor: 'var(--appgram-card)',
        borderColor: 'var(--appgram-border)',
        borderRadius: `${Math.min(borderRadius, 12)}px`,
        transition: 'all 150ms cubic-bezier(0.33, 1, 0.68, 1)',
      }}
      onClick={onClick}
    >
      {/* Header: Version + Date */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {release.version && (
          <span
            className="font-mono text-xs font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor,
            }}
          >
            v{release.version}
          </span>
        )}
        {featured && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
            }}
          >
            Latest
          </span>
        )}
        {(release.published_at || release.created_at) && (
          <span
            className="text-sm ml-auto"
            style={{ color: 'var(--appgram-muted-foreground)' }}
          >
            {formatDate(release.published_at || release.created_at)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className={cn(
          'font-semibold mb-3 transition-opacity group-hover:opacity-70',
          featured ? 'text-2xl' : 'text-lg'
        )}
        style={{ color: 'var(--appgram-foreground)', lineHeight: 1.3 }}
      >
        {release.title}
      </h3>

      {/* Description / Excerpt */}
      {(release.excerpt || release.content) && (
        <p
          className={cn(
            'leading-relaxed mb-5',
            featured ? 'text-base' : 'text-sm'
          )}
          style={{ color: 'var(--appgram-muted-foreground)' }}
        >
          {(release.excerpt || release.content || '').slice(0, 200)}
          {(release.excerpt || release.content || '').length > 200 ? '...' : ''}
        </p>
      )}

      {/* Type badges */}
      {Object.keys(itemsByType).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {(Object.entries(itemsByType) as [string, number][]).map(([type, count]) => {
            const config = itemTypeConfig[type] || itemTypeConfig.other
            const Icon = config.icon
            return (
              <span
                key={type}
                className="inline-flex items-center text-xs font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: `${config.color}12`,
                  color: config.color,
                }}
              >
                <Icon className="w-3 h-3 mr-1.5" />
                {count} {config.label}{count > 1 ? 's' : ''}
              </span>
            )
          })}
        </div>
      )}

      {/* Items preview (featured only) */}
      {featured && release.items && release.items.length > 0 && (
        <div
          className="rounded-lg p-4 mb-5 space-y-3"
          style={{ backgroundColor: 'var(--appgram-muted)' }}
        >
          {release.items.slice(0, 4).map((item) => {
            const config = itemTypeConfig[item.type] || itemTypeConfig.other
            const Icon = config.icon
            return (
              <div key={item.id} className="flex items-start gap-3">
                <Icon
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: config.color }}
                />
                <span
                  className="text-sm leading-snug"
                  style={{ color: 'var(--appgram-foreground)' }}
                >
                  {item.title}
                </span>
              </div>
            )
          })}
          {release.items.length > 4 && (
            <p
              className="text-xs pt-2"
              style={{ color: 'var(--appgram-muted-foreground)' }}
            >
              +{release.items.length - 4} more changes
            </p>
          )}
        </div>
      )}

      {/* Read more link */}
      <div
        className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all"
        style={{ color: accentColor }}
      >
        <span>Read more</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </motion.article>
  )
}

export function ReleaseList({
  variant: _variant = 'timeline',
  heading,
  description,
  headingAlignment = 'left',
  limit = 50,
  onReleaseClick,
  renderRelease,
  renderLoading,
  renderEmpty,
  renderError,
  className,
}: ReleaseListProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const { releases, isLoading, error, refetch } = useReleases({ limit })

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16

  // Get featured (latest) release and remaining releases
  const publishedReleases = releases.filter((r) => r.is_published !== false)
  const [featuredRelease, ...otherReleases] = publishedReleases

  // Loading state
  if (isLoading) {
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
  if (error) {
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

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      {/* Page Header */}
      {(heading || description) && (
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          className="mb-12"
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

      {publishedReleases.length > 0 ? (
        <div className="space-y-8">
          {/* Featured Release */}
          {featuredRelease && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
            >
              {renderRelease ? (
                renderRelease(featuredRelease, 0)
              ) : (
                <ModernReleaseCard
                  release={featuredRelease}
                  primaryColor={primaryColor}
                  borderRadius={borderRadius}
                  onClick={onReleaseClick ? () => onReleaseClick(featuredRelease) : undefined}
                  featured
                />
              )}
            </motion.div>
          )}

          {/* Other Releases */}
          {otherReleases.length > 0 && (
            <div className="space-y-6">
              <h2
                className="text-sm font-medium uppercase"
                style={{ color: 'var(--appgram-muted-foreground)' }}
              >
                Previous Releases
              </h2>

              <div className="space-y-4">
                <AnimatePresence>
                  {otherReleases.map((release, index) => (
                    <motion.div
                      key={release.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
                    >
                      {renderRelease ? (
                        renderRelease(release, index + 1)
                      ) : (
                        <ModernReleaseCard
                          release={release}
                          primaryColor={primaryColor}
                          borderRadius={borderRadius}
                          onClick={onReleaseClick ? () => onReleaseClick(release) : undefined}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        renderEmpty ? (
          <>{renderEmpty()}</>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
            className="text-center py-16"
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{ backgroundColor: 'var(--appgram-muted)' }}
            >
              <Package
                className="w-8 h-8"
                style={{ color: 'var(--appgram-muted-foreground)' }}
              />
            </div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--appgram-foreground)' }}
            >
              No releases yet
            </h3>
            <p
              className="text-sm"
              style={{ color: 'var(--appgram-muted-foreground)' }}
            >
              Check back soon for updates.
            </p>
          </motion.div>
        )
      )}
    </div>
  )
}
