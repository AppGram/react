/**
 * VoteButton Component
 *
 * A button for voting on wishes with animated feedback.
 */

import React from 'react'
import { cn } from '../../utils/cn'
import { useVote, type UseVoteOptions } from '../../hooks/useVote'

export interface VoteButtonProps extends Omit<UseVoteOptions, 'onVoteChange'> {
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Show vote count
   * @default true
   */
  showCount?: boolean

  /**
   * Custom class name
   */
  className?: string

  /**
   * Callback when vote state changes
   */
  onVoteChange?: (hasVoted: boolean, voteCount: number) => void

  /**
   * Custom render function for the button content
   */
  renderContent?: (props: {
    hasVoted: boolean
    voteCount: number
    isLoading: boolean
  }) => React.ReactNode
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs min-w-[50px]',
  md: 'px-3 py-2 text-sm min-w-[60px]',
  lg: 'px-4 py-3 text-base min-w-[70px]',
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export function VoteButton({
  wishId,
  initialVoteCount,
  initialHasVoted,
  voterEmail,
  onVoteChange,
  size = 'md',
  showCount = true,
  className,
  renderContent,
}: VoteButtonProps): React.ReactElement {
  const { hasVoted, voteCount, isLoading, toggle } = useVote({
    wishId,
    initialVoteCount,
    initialHasVoted,
    voterEmail,
    onVoteChange,
  })

  // Default content
  const defaultContent = (
    <>
      <svg
        className={cn(
          iconSizes[size],
          'transition-transform duration-200',
          hasVoted && 'animate-appgram-vote-pop'
        )}
        viewBox="0 0 24 24"
        fill={hasVoted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 15l7-7 7 7"
        />
      </svg>
      {showCount && <span className="font-medium">{voteCount}</span>}
    </>
  )

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        'inline-flex flex-col items-center justify-center gap-0.5 rounded-lg',
        'border focus:outline-none focus:ring-2 focus:ring-offset-2',
        sizeClasses[size],
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        backgroundColor: hasVoted ? 'var(--appgram-primary)' : 'var(--appgram-card)',
        borderColor: hasVoted ? 'var(--appgram-primary)' : 'var(--appgram-border)',
        color: hasVoted ? 'white' : 'var(--appgram-foreground)',
        transition: 'all 150ms cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      {renderContent
        ? renderContent({ hasVoted, voteCount, isLoading })
        : defaultContent}
    </button>
  )
}
