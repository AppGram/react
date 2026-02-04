/**
 * WishCard Component
 *
 * Modern glassmorphism card with animations and theming.
 * Adapted from FeedbackModern variant.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, MessageSquare } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import type { Wish, WishStatus } from '../../types'

// Status labels - modern friendly names
const statusLabels: Record<WishStatus, string> = {
  pending: 'New',
  under_review: 'Reviewing',
  planned: 'Planned',
  in_progress: 'Building',
  completed: 'Shipped',
  declined: 'Closed',
}

// Get status colors based on theme
function getStatusColors(status: WishStatus, primaryColor: string) {
  const statusStyles: Record<WishStatus, { color: string; bgColor: string }> = {
    pending: { color: primaryColor, bgColor: `${primaryColor}15` },
    under_review: { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    planned: { color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
    in_progress: { color: primaryColor, bgColor: `${primaryColor}15` },
    completed: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    declined: { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  }
  return statusStyles[status] || statusStyles.pending
}

export interface WishCardProps {
  /**
   * The wish data
   */
  wish: Wish

  /**
   * Click handler for the card
   */
  onClick?: () => void

  /**
   * Vote handler
   */
  onVote?: (wishId: string, hasVoted: boolean, voteCount: number) => void

  /**
   * Comment click handler
   */
  onCommentClick?: () => void

  /**
   * Override hasVoted state (for optimistic updates)
   */
  hasVoted?: boolean

  /**
   * Override vote count (for optimistic updates)
   */
  voteCount?: number

  /**
   * Loading state for vote
   */
  isVoting?: boolean

  /**
   * Custom class name
   */
  className?: string

  /**
   * Custom render function for the vote button
   */
  renderVoteButton?: (props: {
    wishId: string
    voteCount: number
    hasVoted: boolean
    isLoading: boolean
    onVote: () => void
  }) => React.ReactNode

  /**
   * Show status badge
   * @default true
   */
  showStatus?: boolean

  /**
   * Show category badge
   * @default true
   */
  showCategory?: boolean

  /**
   * Show comment count
   * @default true
   */
  showCommentCount?: boolean

  /**
   * Show author
   * @default true
   */
  showAuthor?: boolean

  /**
   * Animation delay index (for staggered animations)
   */
  animationIndex?: number
}

export function WishCard({
  wish,
  onClick,
  onVote,
  onCommentClick,
  hasVoted,
  voteCount,
  isVoting = false,
  className,
  renderVoteButton,
  showStatus = true,
  showCategory = true,
  showCommentCount = true,
  showAuthor = true,
  animationIndex = 0,
}: WishCardProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  const displayVoteCount = voteCount ?? wish.vote_count
  const displayHasVoted = hasVoted ?? wish.has_voted ?? false
  const statusColors = getStatusColors(wish.status, primaryColor)
  const statusLabel = statusLabels[wish.status] || statusLabels.pending

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onVote?.(wish.id, !displayHasVoted, displayHasVoted ? displayVoteCount - 1 : displayVoteCount + 1)
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCommentClick?.()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        delay: animationIndex * 0.04,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn('cursor-pointer group', className)}
      onClick={onClick}
    >
      <div
        className="overflow-hidden transition-all duration-300 hover:shadow-2xl"
        style={{
          backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: `${borderRadius}px`,
          boxShadow: isDark ? '0 4px 24px -4px rgba(0,0,0,0.3)' : `0 4px 24px -4px ${primaryColor}10`,
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
        }}
      >
        <div className="flex items-stretch">
          {/* Vote Section - Left side */}
          <motion.div
            className="flex flex-col items-center justify-center px-5 py-6 border-r"
            style={{
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              minWidth: '80px',
            }}
            whileHover={{ scale: 1.02 }}
          >
            {renderVoteButton ? (
              renderVoteButton({
                wishId: wish.id,
                voteCount: displayVoteCount,
                hasVoted: displayHasVoted,
                isLoading: isVoting,
                onVote: () => onVote?.(wish.id, !displayHasVoted, displayHasVoted ? displayVoteCount - 1 : displayVoteCount + 1),
              })
            ) : (
              <button
                className="h-auto p-2 bg-transparent border-0 cursor-pointer"
                onClick={handleVoteClick}
                disabled={isVoting}
              >
                <motion.div
                  className="flex flex-col items-center gap-1"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronUp
                    className="h-5 w-5 transition-colors"
                    style={{
                      color: displayHasVoted ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'),
                    }}
                  />
                  <span
                    className="text-xl font-semibold"
                    style={{
                      color: displayHasVoted ? primaryColor : 'var(--appgram-foreground)',
                    }}
                  >
                    {displayVoteCount}
                  </span>
                </motion.div>
              </button>
            )}
          </motion.div>

          {/* Content Section */}
          <div className="flex-1 p-5">
            {/* Top row - Category and Status */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {showCategory && wish.category && (
                <span
                  className="text-xs font-medium px-2.5 py-1"
                  style={{
                    backgroundColor: `${wish.category.color}15`,
                    color: wish.category.color,
                    borderRadius: `${Math.max(4, borderRadius - 8)}px`,
                  }}
                >
                  {wish.category.name}
                </span>
              )}
              {showStatus && (
                <span
                  className="text-xs font-medium px-2.5 py-1"
                  style={{
                    backgroundColor: statusColors.bgColor,
                    color: statusColors.color,
                    borderRadius: `${Math.max(4, borderRadius - 8)}px`,
                  }}
                >
                  {statusLabel}
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className="text-lg font-semibold mb-2 group-hover:translate-x-1 transition-transform"
              style={{ color: 'var(--appgram-foreground)' }}
            >
              {wish.title}
            </h3>

            {/* Description */}
            {wish.description && (
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {wish.description}
              </p>
            )}

            {/* Footer - Author and comments */}
            <div className="flex items-center justify-between mt-auto pt-2">
              {showAuthor && (
                <span
                  className="text-sm"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                >
                  by {wish.author?.name || wish.author_name || 'Anonymous'}
                </span>
              )}

              {showCommentCount && (wish.comment_count ?? 0) > 0 && (
                <div
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                  onClick={handleCommentClick}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{wish.comment_count}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
