/**
 * RoadmapColumn Component
 *
 * A single column in the roadmap board.
 */

import React from 'react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import type { RoadmapColumn as RoadmapColumnType, RoadmapItem } from '../../types'

export interface RoadmapColumnProps {
  /**
   * The column data
   */
  column: RoadmapColumnType

  /**
   * Click handler for items
   */
  onItemClick?: (item: RoadmapItem) => void

  /**
   * Show vote counts on items
   * @default true
   */
  showVoteCounts?: boolean

  /**
   * Custom render function for items
   */
  renderItem?: (item: RoadmapItem) => React.ReactNode

  /**
   * Custom class name
   */
  className?: string
}

export function RoadmapColumn({
  column,
  onItemClick,
  showVoteCounts = true,
  renderItem,
  className,
}: RoadmapColumnProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const borderRadius = theme.borderRadius || 8
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  const items = column.items || []

  return (
    <div className={cn('flex flex-col min-w-[280px] max-w-[320px]', className)}>
      {/* Column Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg"
        style={{ backgroundColor: isDark ? `${column.color}15` : `${column.color}10` }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="font-semibold" style={{ color: 'var(--appgram-foreground)' }}>{column.name}</h3>
        <span className="text-sm ml-auto" style={{ color: 'var(--appgram-muted-foreground)' }}>{items.length}</span>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-3 min-h-[200px]">
        {items.map((item) =>
          renderItem ? (
            <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
          ) : (
            <div
              key={item.id}
              onClick={onItemClick ? () => onItemClick(item) : undefined}
              className={cn(
                'p-3',
                onItemClick && 'cursor-pointer'
              )}
              style={{
                borderRadius: `${borderRadius}px`,
                backgroundColor: 'var(--appgram-card)',
                border: '1px solid var(--appgram-border)',
                boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 150ms cubic-bezier(0.33, 1, 0.68, 1)',
              }}
              role={onItemClick ? 'button' : undefined}
              tabIndex={onItemClick ? 0 : undefined}
            >
              <h4 className="font-medium mb-1 line-clamp-2" style={{ color: 'var(--appgram-foreground)' }}>
                {item.title || item.wish?.title || 'Untitled'}
              </h4>
              {(item.description || item.wish?.description) && (
                <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--appgram-muted-foreground)' }}>
                  {item.description || item.wish?.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--appgram-muted-foreground)' }}>
                {showVoteCounts && item.wish && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    {item.wish.vote_count}
                  </span>
                )}
                {item.target_date && (
                  <span className="ml-auto">
                    {new Date(item.target_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )
        )}

        {items.length === 0 && (
          <div className="text-center text-sm py-8" style={{ color: 'var(--appgram-muted-foreground)' }}>
            No items
          </div>
        )}
      </div>
    </div>
  )
}
