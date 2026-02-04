/**
 * WishList Component
 *
 * Modern glassmorphism list with animations for displaying and voting on feature requests.
 * Adapted from FeedbackModern variant.
 *
 * @example
 * ```tsx
 * import { WishList } from '@appgram/react'
 *
 * <WishList
 *   heading="Feature Requests"
 *   description="Vote for features you'd like to see"
 *   showSearch
 *   variant="cards"
 *   onWishClick={(wish) => console.log('Clicked:', wish.title)}
 *   onAddWish={() => setShowForm(true)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Compact variant for sidebar
 * <WishList
 *   variant="compact"
 *   filters={{ status: 'pending' }}
 *   showSearch
 * />
 * ```
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useWishes } from '../../hooks/useWishes'
import { WishCard } from './WishCard'
import type { Wish, WishFilters } from '../../types'

export interface WishListProps {
  /**
   * Layout variant
   * @default 'cards'
   */
  variant?: 'cards' | 'compact' | 'masonry'

  /**
   * Initial filters
   */
  filters?: WishFilters

  /**
   * Auto-refresh interval in milliseconds
   * @default 0
   */
  refreshInterval?: number

  /**
   * Click handler for a wish
   */
  onWishClick?: (wish: Wish) => void

  /**
   * Handler for adding a new wish
   */
  onAddWish?: () => void

  /**
   * Custom render function for individual wish cards
   */
  renderWish?: (wish: Wish, index: number) => React.ReactNode

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
   * Show search input
   * @default false
   */
  showSearch?: boolean

  /**
   * Custom class name
   */
  className?: string
}

export function WishList({
  variant = 'cards',
  filters: initialFilters,
  refreshInterval = 0,
  onWishClick,
  onAddWish,
  renderWish,
  renderLoading,
  renderEmpty,
  renderError,
  heading,
  description,
  headingAlignment = 'left',
  showSearch = false,
  className,
}: WishListProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)

  // Track locally voted wishes for optimistic updates
  const [localVotes, setLocalVotes] = useState<Record<string, { hasVoted: boolean; voteCount: number }>>({})

  const { wishes, isLoading, error, page, totalPages, setPage, setFilters, refetch } =
    useWishes({
      filters: initialFilters,
      refreshInterval,
    })

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  // Initialize local state from props and track initial load
  useEffect(() => {
    if (!isLoading && wishes.length > 0) {
      setHasInitiallyLoaded(true)
    }
    const newLocalVotes: Record<string, { hasVoted: boolean; voteCount: number }> = {}
    wishes.forEach((wish) => {
      newLocalVotes[wish.id] = {
        hasVoted: wish.has_voted || false,
        voteCount: wish.vote_count || 0,
      }
    })
    setLocalVotes(newLocalVotes)
  }, [wishes, isLoading])

  // Get vote state (local or from props)
  const getVoteState = useCallback(
    (wish: Wish) => {
      if (localVotes[wish.id]) {
        return localVotes[wish.id]
      }
      return { hasVoted: wish.has_voted || false, voteCount: wish.vote_count || 0 }
    },
    [localVotes]
  )

  // Handle vote with optimistic update
  const handleVote = useCallback((wishId: string) => {
    setLocalVotes((prev) => {
      const current = prev[wishId] || { hasVoted: false, voteCount: 0 }
      return {
        ...prev,
        [wishId]: {
          hasVoted: !current.hasVoted,
          voteCount: current.hasVoted ? current.voteCount - 1 : current.voteCount + 1,
        },
      }
    })
  }, [])

  // Debounce ref for search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Handle search with debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)

    // Clear previous debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    // Debounce the API call
    searchDebounceRef.current = setTimeout(() => {
      setFilters({
        ...initialFilters,
        search: query || undefined,
      })
    }, 300)
  }, [initialFilters, setFilters])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [])

  // Loading state - only show full loading spinner on initial load
  const showFullLoading = isLoading && !hasInitiallyLoaded
  if (showFullLoading) {
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
    <div className={cn('space-y-6', className)}>
      {/* Page Header - Modern gradient text effect */}
      {heading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-10"
          style={{ textAlign: headingAlignment }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--appgram-foreground)' }}
          >
            {heading}
          </motion.h1>
          {description && (
            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
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

      {/* Add Wish Button */}
      {onAddWish && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex justify-center mb-10"
        >
          <button
            onClick={onAddWish}
            className="flex items-center gap-2 px-6 py-3 text-white font-medium shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            style={{
              backgroundColor: primaryColor,
              borderRadius: `${borderRadius}px`,
            }}
          >
            <Plus className="w-4 h-4" />
            Submit Idea
          </button>
        </motion.div>
      )}

      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative flex-1 min-w-[200px] mb-6"
        >
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all"
            style={{
              borderRadius: `${borderRadius}px`,
              backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.5)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              color: 'var(--appgram-foreground)',
            }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }} />
        </motion.div>
      )}

      {/* Wish List */}
      {wishes.length > 0 ? (
        <div
          className={cn(
            variant === 'cards' && 'grid gap-4',
            variant === 'compact' && 'space-y-2',
            variant === 'masonry' && 'columns-1 md:columns-2 lg:columns-3 gap-4'
          )}
        >
          <AnimatePresence mode="popLayout">
            {wishes.map((wish, index) => {
              const voteState = getVoteState(wish)

              return renderWish ? (
                <React.Fragment key={wish.id}>{renderWish(wish, index)}</React.Fragment>
              ) : (
                <div
                  key={wish.id}
                  className={variant === 'masonry' ? 'break-inside-avoid mb-4' : undefined}
                >
                  <WishCard
                    wish={wish}
                    onClick={onWishClick ? () => onWishClick(wish) : undefined}
                    onVote={() => handleVote(wish.id)}
                    hasVoted={voteState.hasVoted}
                    voteCount={voteState.voteCount}
                    animationIndex={index}
                  />
                </div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State - Modern illustration */
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
              <Sparkles className="h-10 w-10" style={{ color: primaryColor }} />
            </motion.div>

            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--appgram-foreground)' }}>Share your ideas</h3>
            <p className="max-w-sm mx-auto" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
              Be the first to submit a feature request and help shape the future!
            </p>

            {onAddWish && (
              <button
                onClick={onAddWish}
                className="mt-6 flex items-center gap-2 px-6 py-3 text-white font-medium shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 mx-auto"
                style={{
                  backgroundColor: primaryColor,
                  borderRadius: `${borderRadius}px`,
                }}
              >
                <Plus className="w-4 h-4" />
                Submit First Idea
              </button>
            )}
          </motion.div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center gap-4 mt-8"
        >
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              borderRadius: `${borderRadius}px`,
              backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.5)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              color: 'var(--appgram-foreground)',
            }}
          >
            Previous
          </button>
          <span className="text-sm" style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              borderRadius: `${borderRadius}px`,
              backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.5)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              color: 'var(--appgram-foreground)',
            }}
          >
            Next
          </button>
        </motion.div>
      )}
    </div>
  )
}
