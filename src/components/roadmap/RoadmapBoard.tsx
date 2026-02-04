/**
 * RoadmapBoard Component
 *
 * Modern glassmorphism kanban board with animations for displaying product roadmap.
 * Adapted from RoadmapModern variant.
 *
 * @example
 * ```tsx
 * import { RoadmapBoard } from '@appgram/react'
 *
 * <RoadmapBoard
 *   heading="Product Roadmap"
 *   description="See what's coming next"
 *   variant="kanban"
 *   showVoteCounts
 *   onItemClick={(item) => openWishDetail(item.id)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Timeline view for chronological display
 * <RoadmapBoard
 *   variant="timeline"
 *   heading="Coming Soon"
 *   developersNote="Subject to change"
 * />
 * ```
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronRight, MessageSquare, Clock } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useRoadmap } from '../../hooks/useRoadmap'
import { WishDetail } from '../feedback/WishDetail'
import type { RoadmapItem, RoadmapColumn as RoadmapColumnType, Wish } from '../../types'

export interface RoadmapBoardProps {
  /**
   * Layout variant
   * @default 'kanban'
   */
  variant?: 'kanban' | 'list' | 'timeline'

  /**
   * Page heading
   */
  heading?: string

  /**
   * Page description
   */
  description?: string

  /**
   * Developer's note
   */
  developersNote?: string

  /**
   * Heading alignment
   * @default 'left'
   */
  headingAlignment?: 'left' | 'center' | 'right'

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
   * Show comment counts
   * @default true
   */
  showComments?: boolean

  /**
   * Custom render function for columns
   */
  renderColumn?: (column: RoadmapColumnType) => React.ReactNode

  /**
   * Custom render function for items
   */
  renderItem?: (item: RoadmapItem) => React.ReactNode

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
   * Auto-refresh interval in milliseconds
   * @default 0
   */
  refreshInterval?: number

  /**
   * Custom class name
   */
  className?: string
}

// Modern card component for roadmap items
function ModernCard({
  item,
  primaryColor,
  borderRadius,
  showVoteCounts,
  showComments,
  onClick,
  isDark,
}: {
  item: RoadmapItem
  primaryColor: string
  borderRadius: number
  showVoteCounts: boolean
  showComments: boolean
  onClick?: () => void
  isDark: boolean
}) {
  const wish = item.wish

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div
        className="p-4 backdrop-blur-sm border transition-all"
        style={{
          backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.5)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          borderRadius: `${Math.min(borderRadius, 12)}px`,
        }}
      >
        <div className="flex items-start gap-3">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            {wish?.category && (
              <span
                className="inline-block mb-2 text-[10px] font-medium uppercase px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${wish.category.color}12`,
                  color: wish.category.color,
                }}
              >
                {wish.category.name}
              </span>
            )}

            {/* Title */}
            <h4
              className="font-medium text-sm mb-1"
              style={{ color: 'var(--appgram-foreground)' }}
            >
              {item.title || wish?.title || 'Untitled'}
            </h4>

            {/* Description */}
            {(item.description || wish?.description) && (
              <p
                className="text-sm line-clamp-2 mb-2"
                style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
              >
                {item.description || wish?.description}
              </p>
            )}

            {/* Stats row */}
            {wish && (showVoteCounts || showComments) && (
              <div className="flex items-center gap-3 text-xs" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                {showVoteCounts && (
                  <div className="flex items-center gap-1" style={{ color: primaryColor }}>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span className="font-medium">{wish.vote_count || 0}</span>
                  </div>
                )}
                {showComments && (wish.comment_count ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{wish.comment_count}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Chevron */}
          <ChevronRight
            className="w-4 h-4 mt-1 opacity-40 group-hover:opacity-100 shrink-0 transition-opacity"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// Modern column component
function ModernColumn({
  column,
  primaryColor,
  borderRadius,
  showVoteCounts,
  showComments,
  onItemClick,
  isDark,
}: {
  column: RoadmapColumnType
  primaryColor: string
  borderRadius: number
  showVoteCounts: boolean
  showComments: boolean
  onItemClick?: (item: RoadmapItem) => void
  isDark: boolean
}) {
  return (
    <motion.div
      className="flex-shrink-0 w-80"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Column Header - Glassmorphism */}
      <div
        className="flex items-center gap-3 px-4 py-3 mb-3"
        style={{
          backgroundColor: `${column.color}10`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: `${borderRadius}px`,
          border: `1px solid ${column.color}20`,
        }}
      >
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: column.color }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h3
          className="font-semibold flex-1"
          style={{ color: 'var(--appgram-foreground)' }}
        >
          {column.name}
        </h3>
        <span
          className="text-xs font-medium px-2 py-0.5"
          style={{
            backgroundColor: `${column.color}20`,
            color: column.color,
            borderRadius: `${Math.max(4, borderRadius - 8)}px`,
          }}
        >
          {(column.items || []).length}
        </span>
      </div>

      {/* Column Content */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {(column.items || []).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <ModernCard
                item={item}
                primaryColor={primaryColor}
                borderRadius={Math.max(borderRadius - 4, 8)}
                showVoteCounts={showVoteCounts}
                showComments={showComments}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
                isDark={isDark}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {(column.items || []).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-4"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: `${borderRadius}px`,
              border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <p
              className="text-sm"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
            >
              No items yet
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function RoadmapBoard({
  variant: _variant = 'kanban',
  heading,
  description,
  developersNote,
  headingAlignment = 'left',
  onItemClick,
  showVoteCounts = true,
  showComments = true,
  renderColumn,
  renderItem: _renderItem,
  renderLoading,
  renderEmpty,
  renderError,
  refreshInterval = 0,
  className,
}: RoadmapBoardProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const { columns, isLoading, error, refetch } = useRoadmap({
    refreshInterval,
  })

  // State for wish detail
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  // Sort columns by sort_order
  const sortedColumns = [...columns].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  // Count total items
  const totalItems = columns.reduce((sum, col) => sum + (col.items || []).length, 0)

  // Handle item click - open wish detail
  const handleItemClick = useCallback((item: RoadmapItem) => {
    // Create a Wish object from either the associated wish or the roadmap item itself
    const wish: Wish = item.wish
      ? {
          id: item.wish.id,
          project_id: '',
          title: item.wish.title,
          description: item.wish.description || '',
          status: (item.wish.status as Wish['status']) || 'pending',
          vote_count: item.wish.vote_count || 0,
          comment_count: item.wish.comment_count || 0,
          has_voted: false,
          slug: '',
          author_type: 'anonymous',
          is_pinned: false,
          created_at: item.wish.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author_name: item.wish.author?.name || 'Anonymous',
          author_email: item.wish.author?.email || item.wish.author_email,
        }
      : {
          // For roadmap items without a wish, create a pseudo-wish from item data
          id: item.id,
          project_id: '',
          title: item.title,
          description: item.description || '',
          status: 'planned' as Wish['status'],
          vote_count: 0,
          comment_count: 0,
          has_voted: false,
          slug: '',
          author_type: 'anonymous',
          is_pinned: false,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }

    setSelectedWish(wish)
    setIsDetailOpen(true)

    // Also call external handler if provided
    onItemClick?.(item)
  }, [onItemClick])

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
    <div className={cn('space-y-8', className)}>
      {/* Page Header - Modern with gradient accent */}
      {heading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
          style={{ textAlign: headingAlignment }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: 'var(--appgram-foreground)' }}
          >
            {heading}
          </motion.h1>
          {description && (
            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                maxWidth: headingAlignment === 'center' ? '48rem' : '100%',
                marginLeft: headingAlignment === 'center' ? 'auto' : headingAlignment === 'right' ? 'auto' : '0',
                marginRight: headingAlignment === 'center' ? 'auto' : headingAlignment === 'left' ? 'auto' : '0',
              }}
            >
              {description}
            </p>
          )}
        </motion.div>
      )}

      {/* Developer's Note - Floating card */}
      {developersNote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="overflow-hidden p-5"
            style={{
              backgroundColor: `${primaryColor}08`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: `${borderRadius}px`,
              boxShadow: `0 4px 24px -4px ${primaryColor}15`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Clock className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: 'var(--appgram-foreground)' }}
              >
                {developersNote}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Roadmap Board */}
      {totalItems > 0 || sortedColumns.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="-mx-4 px-4"
        >
          <div className="overflow-x-auto">
            <div className="flex gap-5 pb-4 min-w-max">
              {sortedColumns.map((column, index) =>
                renderColumn ? (
                  <React.Fragment key={column.id}>{renderColumn(column)}</React.Fragment>
                ) : (
                  <motion.div
                    key={column.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  >
                    <ModernColumn
                      column={column}
                      primaryColor={primaryColor}
                      borderRadius={borderRadius}
                      showVoteCounts={showVoteCounts}
                      showComments={showComments}
                      onItemClick={handleItemClick}
                      isDark={isDark}
                    />
                  </motion.div>
                )
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        /* Empty State */
        renderEmpty ? (
          <>{renderEmpty()}</>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{
                backgroundColor: `${primaryColor}10`,
              }}
            >
              <Clock
                className="h-10 w-10"
                style={{ color: primaryColor }}
              />
            </motion.div>

            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--appgram-foreground)' }}
            >
              Coming soon
            </h3>
            <p
              className="max-w-sm mx-auto"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
            >
              Our roadmap is being prepared. Check back soon for exciting updates!
            </p>
          </motion.div>
        )
      )}

      {/* Wish Detail Sheet */}
      <WishDetail
        wish={selectedWish}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
