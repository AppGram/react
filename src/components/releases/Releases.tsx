/**
 * Releases Component
 *
 * Complete releases/changelog with navigation between list and detail views.
 * Handles all state management internally for a seamless user experience.
 *
 * @example
 * ```tsx
 * import { Releases } from '@appgram/react'
 *
 * <Releases
 *   heading="What's New"
 *   description="See the latest features and improvements"
 *   variant="timeline"
 *   limit={10}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Cards variant for a grid layout
 * <Releases
 *   heading="Release Notes"
 *   variant="cards"
 *   onReleaseClick={(release) => router.push(`/releases/${release.id}`)}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ReleaseList } from './ReleaseList'
import { ReleaseDetail } from './ReleaseDetail'
import { cn } from '../../utils/cn'
import type { Release } from '../../types'

type ViewState =
  | { type: 'list' }
  | { type: 'detail'; release: Release }

export interface ReleasesProps {
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
   * Layout variant for list
   * @default 'timeline'
   */
  variant?: 'timeline' | 'cards' | 'compact'

  /**
   * External callback when release is clicked (for custom routing)
   * If not provided, internal navigation is used
   */
  onReleaseClick?: (release: Release) => void

  /**
   * Use external routing instead of internal state management
   * Set to true if you want to handle navigation yourself via onReleaseClick
   * @default false
   */
  useExternalRouting?: boolean

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

export function Releases({
  heading = 'Releases',
  description = 'See what\'s new and what\'s changed.',
  headingAlignment = 'left',
  limit = 50,
  variant = 'timeline',
  onReleaseClick: externalReleaseClick,
  useExternalRouting = false,
  renderLoading,
  renderEmpty,
  renderError,
  className,
}: ReleasesProps): React.ReactElement {
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' })

  // Handle release click
  const handleReleaseClick = useCallback(
    (release: Release) => {
      if (useExternalRouting && externalReleaseClick) {
        externalReleaseClick(release)
      } else {
        setViewState({ type: 'detail', release })
      }
    },
    [useExternalRouting, externalReleaseClick]
  )

  // Navigate back to list
  const handleBackToList = useCallback(() => {
    setViewState({ type: 'list' })
  }, [])

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {viewState.type === 'list' && (
          <motion.div
            key="list"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <ReleaseList
              heading={heading}
              description={description}
              headingAlignment={headingAlignment}
              limit={limit}
              variant={variant}
              onReleaseClick={handleReleaseClick}
              renderLoading={renderLoading}
              renderEmpty={renderEmpty}
              renderError={renderError}
            />
          </motion.div>
        )}

        {viewState.type === 'detail' && (
          <motion.div
            key={`detail-${viewState.release.id}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <ReleaseDetail
              release={viewState.release}
              onBack={handleBackToList}
              renderLoading={renderLoading}
              renderError={renderError}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
