/**
 * ReleaseCard Component
 *
 * A card component for displaying a single release/changelog entry.
 */

import React from 'react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import type { Release } from '../../types'

export interface ReleaseCardProps {
  /**
   * The release data
   */
  release: Release

  /**
   * Click handler
   */
  onClick?: () => void

  /**
   * Show cover image
   * @default true
   */
  showCoverImage?: boolean

  /**
   * Show labels
   * @default true
   */
  showLabels?: boolean

  /**
   * Show date
   * @default true
   */
  showDate?: boolean

  /**
   * Custom class name
   */
  className?: string
}

const labelColors: Record<string, { bg: string; text: string }> = {
  feature: { bg: 'bg-green-100', text: 'text-green-700' },
  bugfix: { bg: 'bg-red-100', text: 'text-red-700' },
  fix: { bg: 'bg-red-100', text: 'text-red-700' },
  improvement: { bg: 'bg-blue-100', text: 'text-blue-700' },
  enhancement: { bg: 'bg-blue-100', text: 'text-blue-700' },
  breaking: { bg: 'bg-orange-100', text: 'text-orange-700' },
  security: { bg: 'bg-purple-100', text: 'text-purple-700' },
  docs: { bg: 'bg-gray-100', text: 'text-gray-700' },
  documentation: { bg: 'bg-gray-100', text: 'text-gray-700' },
  performance: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
}

function getLabelStyle(label: string): { bg: string; text: string } {
  const normalized = label.toLowerCase()
  return labelColors[normalized] || { bg: 'bg-gray-100', text: 'text-gray-700' }
}

export function ReleaseCard({
  release,
  onClick,
  showCoverImage = true,
  showLabels = true,
  showDate = true,
  className,
}: ReleaseCardProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const borderRadius = theme.borderRadius || 8

  const date = release.published_at || release.created_at
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article
      onClick={onClick}
      className={cn(
        'bg-white border border-gray-200 overflow-hidden',
        'hover:shadow-md transition-shadow duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ borderRadius: `${borderRadius}px` }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Cover Image */}
      {showCoverImage && release.cover_image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={release.cover_image_url}
            alt={release.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Labels */}
        {showLabels && release.labels && release.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {release.labels.map((label) => {
              const style = getLabelStyle(label)
              return (
                <span
                  key={label}
                  className={cn('px-2 py-0.5 text-xs rounded-full', style.bg, style.text)}
                >
                  {label}
                </span>
              )
            })}
          </div>
        )}

        {/* Version & Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {release.version && (
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
              {release.version}
            </span>
          )}
          {showDate && formattedDate && <span>{formattedDate}</span>}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {release.title}
        </h3>

        {/* Excerpt */}
        {release.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3">{release.excerpt}</p>
        )}
      </div>
    </article>
  )
}
