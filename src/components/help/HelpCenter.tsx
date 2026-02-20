/**
 * HelpCenter Component
 *
 * Complete help center with navigation between collections, articles, and article detail.
 * Handles all state management internally for a seamless user experience.
 *
 * @example
 * ```tsx
 * import { HelpCenter } from '@appgram/react'
 *
 * <HelpCenter
 *   heading="Help Center"
 *   description="How can we help you today?"
 *   showSearch
 *   showFooter
 *   quickActions={[
 *     { label: 'Submit Ticket', onClick: () => router.push('/support') },
 *     { label: 'Live Chat', onClick: () => openChat() },
 *   ]}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Grid variant with featured articles
 * <HelpCenter
 *   variant="grid"
 *   featuredArticles={topArticles}
 *   onLiveChatClick={() => window.Intercom?.('show')}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HelpCollections, type QuickAction } from './HelpCollections'
import { HelpArticles } from './HelpArticles'
import { HelpArticleDetail } from './HelpArticleDetail'
import { cn } from '../../utils/cn'
import type { HelpFlow, HelpArticle } from '../../types'

type ViewState =
  | { type: 'collections' }
  | { type: 'flow'; flow: HelpFlow }
  | { type: 'article'; article: HelpArticle; flow: HelpFlow | null }

export interface HelpCenterProps {
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
   * @default 'center'
   */
  headingAlignment?: 'left' | 'center' | 'right'

  /**
   * Featured articles to display on the main view
   */
  featuredArticles?: HelpArticle[]

  /**
   * Show search input
   * @default true
   */
  showSearch?: boolean

  /**
   * Quick action buttons to display
   */
  quickActions?: QuickAction[]

  /**
   * Show contact support footer
   * @default true
   */
  showFooter?: boolean

  /**
   * Contact support URL
   */
  contactSupportUrl?: string

  /**
   * Live chat handler
   */
  onLiveChatClick?: () => void

  /**
   * Layout variant for collections
   * @default 'grid'
   */
  variant?: 'grid' | 'list'

  /**
   * External callback when flow is clicked (for custom routing)
   * If not provided, internal navigation is used
   */
  onFlowClick?: (flow: HelpFlow) => void

  /**
   * External callback when article is clicked (for custom routing)
   * If not provided, internal navigation is used
   */
  onArticleClick?: (article: HelpArticle, flow: HelpFlow | null) => void

  /**
   * Use external routing instead of internal state management
   * Set to true if you want to handle navigation yourself via onFlowClick/onArticleClick
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

export function HelpCenter({
  heading = 'Help Center',
  description = 'How can we help you today?',
  headingAlignment = 'center',
  featuredArticles,
  showSearch = true,
  quickActions,
  showFooter = true,
  contactSupportUrl,
  onLiveChatClick,
  variant = 'grid',
  onFlowClick: externalFlowClick,
  onArticleClick: externalArticleClick,
  useExternalRouting = false,
  renderLoading,
  renderEmpty,
  renderError,
  className,
}: HelpCenterProps): React.ReactElement {
  const [viewState, setViewState] = useState<ViewState>({ type: 'collections' })

  // Handle flow click
  const handleFlowClick = useCallback(
    (flow: HelpFlow) => {
      if (useExternalRouting && externalFlowClick) {
        externalFlowClick(flow)
      } else {
        setViewState({ type: 'flow', flow })
      }
    },
    [useExternalRouting, externalFlowClick]
  )

  // Handle article click from collections view (featured articles)
  const handleArticleClickFromCollections = useCallback(
    (article: HelpArticle, flow: HelpFlow) => {
      if (useExternalRouting && externalArticleClick) {
        externalArticleClick(article, flow)
      } else {
        setViewState({ type: 'article', article, flow })
      }
    },
    [useExternalRouting, externalArticleClick]
  )

  // Handle article click from flow view
  const handleArticleClickFromFlow = useCallback(
    (article: HelpArticle) => {
      if (useExternalRouting && externalArticleClick) {
        externalArticleClick(article, viewState.type === 'flow' ? viewState.flow : null)
      } else {
        const flow = viewState.type === 'flow' ? viewState.flow : null
        setViewState({ type: 'article', article, flow })
      }
    },
    [useExternalRouting, externalArticleClick, viewState]
  )

  // Navigate back to collections
  const handleBackToCollections = useCallback(() => {
    setViewState({ type: 'collections' })
  }, [])

  // Navigate back to flow from article
  const handleBackToFlow = useCallback(() => {
    if (viewState.type === 'article' && viewState.flow) {
      setViewState({ type: 'flow', flow: viewState.flow })
    } else {
      setViewState({ type: 'collections' })
    }
  }, [viewState])

  // Animation variants - Hazel design system
  const pageVariants = {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
  }

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {viewState.type === 'collections' && (
          <motion.div
            key="collections"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          >
            <HelpCollections
              heading={heading}
              description={description}
              headingAlignment={headingAlignment}
              featuredArticles={featuredArticles}
              showSearch={showSearch}
              quickActions={quickActions}
              showFooter={showFooter}
              contactSupportUrl={contactSupportUrl}
              onLiveChatClick={onLiveChatClick}
              variant={variant}
              onFlowClick={handleFlowClick}
              onArticleClick={handleArticleClickFromCollections}
              renderLoading={renderLoading}
              renderEmpty={renderEmpty}
              renderError={renderError}
            />
          </motion.div>
        )}

        {viewState.type === 'flow' && (
          <motion.div
            key={`flow-${viewState.flow.id}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          >
            <HelpArticles
              flow={viewState.flow}
              onArticleClick={handleArticleClickFromFlow}
              onBack={handleBackToCollections}
              showSearch={showSearch}
              renderLoading={renderLoading}
              renderEmpty={renderEmpty}
              renderError={renderError}
            />
          </motion.div>
        )}

        {viewState.type === 'article' && (
          <motion.div
            key={`article-${viewState.article.id}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
          >
            <HelpArticleDetail
              article={viewState.article}
              flow={viewState.flow || undefined}
              onBack={handleBackToFlow}
              renderLoading={renderLoading}
              renderError={renderError}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
