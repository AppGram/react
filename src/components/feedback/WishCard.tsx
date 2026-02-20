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

// Get status colors using Hazel semantic tokens
function getStatusColors(status: WishStatus, primaryColor: string, isDark: boolean) {
  // Using semantic status colors from Hazel design system
  const statusStyles: Record<WishStatus, { color: string; bgColor: string }> = {
    pending: { color: 'var(--appgram-info)', bgColor: 'var(--appgram-info-subtle)' },
    under_review: { color: '#8b5cf6', bgColor: isDark ? '#4c1d95' : '#f3e8ff' },
    planned: { color: 'var(--appgram-info)', bgColor: 'var(--appgram-info-subtle)' },
    in_progress: { color: primaryColor, bgColor: isDark ? `${primaryColor}20` : `${primaryColor}10` },
    completed: { color: 'var(--appgram-success)', bgColor: 'var(--appgram-success-subtle)' },
    declined: { color: 'var(--appgram-muted-foreground)', bgColor: 'var(--appgram-muted)' },
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
  const statusColors = getStatusColors(wish.status, primaryColor, isDark)
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        delay: animationIndex * 0.03,
        duration: 0.15,
        ease: [0.33, 1, 0.68, 1],
      }}
      className={cn('cursor-pointer group', className)}
      onClick={onClick}
    >
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--appgram-card)',
          borderRadius: `${borderRadius}px`,
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.08)',
          border: `1px solid var(--appgram-border)`,
          transition: 'all 150ms cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      >
        <div className="flex items-stretch">
          {/* Vote Section - Left side */}
          <motion.div
            className="flex flex-col items-center justify-center px-5 py-6 border-r"
            style={{
              borderColor: 'var(--appgram-border)',
              minWidth: '80px',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
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
                  transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
                >
                  <ChevronUp
                    className="h-5 w-5"
                    style={{
                      color: displayHasVoted ? primaryColor : 'var(--appgram-muted-foreground)',
                      transition: 'color 150ms cubic-bezier(0.33, 1, 0.68, 1)',
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
                  color: 'var(--appgram-muted-foreground)',
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
                  style={{ color: 'var(--appgram-muted-foreground)' }}
                >
                  by {wish.author?.name || wish.author_name || 'Anonymous'}
                </span>
              )}

              {showCommentCount && (wish.comment_count ?? 0) > 0 && (
                <div
                  className="flex items-center gap-1.5 cursor-pointer"
                  style={{
                    color: 'var(--appgram-muted-foreground)',
                    transition: 'opacity 150ms cubic-bezier(0.33, 1, 0.68, 1)',
                  }}
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
