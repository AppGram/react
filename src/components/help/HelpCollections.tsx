/**
 * HelpCollections Component
 *
 * Modern help center with glassmorphism style, quick actions, and grid layout.
 * Adapted from HelpCenterGlass variant.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Folder,
  HelpCircle,
  FileText,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Mail,
  Loader2,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useHelpCenter } from '../../hooks/useHelpCenter'
import type { HelpFlow, HelpArticle } from '../../types'

export interface QuickAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
}

export interface HelpCollectionsProps {
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
   * Click handler for flows
   */
  onFlowClick?: (flow: HelpFlow) => void

  /**
   * Click handler for articles
   */
  onArticleClick?: (article: HelpArticle, flow: HelpFlow) => void

  /**
   * Featured articles to display
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
   * Layout variant
   * @default 'grid'
   */
  variant?: 'grid' | 'list'

  /**
   * Custom render function for flows
   */
  renderFlow?: (flow: HelpFlow) => React.ReactNode

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

// Icon mapping for collections based on name
function getCollectionIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('start') || lower.includes('getting')) return BookOpen
  if (lower.includes('api') || lower.includes('develop')) return MessageCircle
  if (lower.includes('account') || lower.includes('billing')) return Mail
  return Folder
}

export function HelpCollections({
  heading = 'Help Center',
  description = 'How can we help you today?',
  headingAlignment = 'center',
  onFlowClick,
  onArticleClick,
  featuredArticles,
  showSearch = true,
  quickActions,
  showFooter = true,
  contactSupportUrl,
  onLiveChatClick,
  variant = 'grid',
  renderFlow,
  renderLoading,
  renderEmpty,
  renderError,
  className,
}: HelpCollectionsProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const { flows, isLoading, error, refetch } = useHelpCenter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllArticles, setShowAllArticles] = useState(false)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const accentColor = theme.colors?.accent || primaryColor
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  // Track initial load
  useEffect(() => {
    if (!isLoading && flows.length > 0) {
      setHasInitiallyLoaded(true)
    }
  }, [isLoading, flows.length])

  // Reset show all when search changes
  useEffect(() => {
    setShowAllArticles(false)
  }, [searchQuery])

  // Debounce ref for search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [])

  // Loading state - only show full loading on initial load
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

  // Filter flows based on search
  const filteredFlows = debouncedQuery
    ? flows.filter(
        (flow) =>
          flow.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          flow.description?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          flow.articles?.some(
            (article) =>
              article.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              article.excerpt?.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
      )
    : flows

  // Default quick actions if none provided
  const defaultQuickActions: QuickAction[] = [
    ...(contactSupportUrl ? [{ label: 'Submit a Ticket', icon: Mail, onClick: () => window.open(contactSupportUrl, '_blank') }] : []),
    ...(onLiveChatClick ? [{ label: 'Live Chat', icon: MessageCircle, onClick: onLiveChatClick }] : []),
  ]

  const actions = quickActions || defaultQuickActions

  return (
    <div className={cn('w-full', className)}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        {(heading || description) && (
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
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
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                  marginLeft: headingAlignment === 'center' ? 'auto' : 0,
                  marginRight: headingAlignment === 'center' ? 'auto' : 0,
                }}
              >
                {description}
              </p>
            )}
          </motion.header>
        )}

        {/* Search Bar */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative max-w-2xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full h-12 pl-12 pr-4 text-sm backdrop-blur-sm border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-[var(--appgram-card)]' : 'bg-white/50'}`}
                  style={{
                    color: 'var(--appgram-foreground)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: `${borderRadius}px`,
                  }}
                />
              </div>
              {/* Loading indicator for search */}
              {isLoading && hasInitiallyLoaded && (
                <Loader2
                  className="w-5 h-5 animate-spin"
                  style={{ color: primaryColor }}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {actions.map((action) => {
              const Icon = action.icon || HelpCircle
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm border transition-all group ${isDark ? 'bg-[var(--appgram-card)] hover:bg-[var(--appgram-card)]' : 'bg-white/50 hover:bg-white/80'}`}
                  style={{
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Icon
                    className="w-4 h-4 transition-colors"
                    style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--appgram-foreground)' }}>
                    {action.label}
                  </span>
                </button>
              )
            })}
          </motion.div>
        )}

        {/* Collections */}
        {filteredFlows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Folder className="w-5 h-5" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }} />
              <h2
                className="text-lg font-semibold"
                style={{ color: 'var(--appgram-foreground)' }}
              >
                Browse by Topic
              </h2>
            </div>

            <div
              className={cn(
                variant === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
                variant === 'list' && 'space-y-3'
              )}
            >
              <AnimatePresence>
                {filteredFlows.map((flow, index) => {
                  if (renderFlow) {
                    return <React.Fragment key={flow.id}>{renderFlow(flow)}</React.Fragment>
                  }

                  const Icon = getCollectionIcon(flow.name)

                  return (
                    <motion.article
                      key={flow.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.25 + index * 0.05, duration: 0.4 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group cursor-pointer overflow-hidden"
                      onClick={() => onFlowClick?.(flow)}
                    >
                      <div
                        className={`h-full p-5 backdrop-blur-sm border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-[var(--appgram-card)] hover:bg-[var(--appgram-card)]' : 'bg-white/70 hover:bg-white/90'}`}
                        style={{
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                          borderRadius: `${borderRadius}px`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="p-2.5 rounded-xl"
                            style={{ backgroundColor: `${accentColor}10` }}
                          >
                            {flow.icon ? (
                              <span className="text-lg">{flow.icon}</span>
                            ) : (
                              <Icon className="w-5 h-5" style={{ color: accentColor }} />
                            )}
                          </div>
                          <ChevronRight
                            className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                            style={{ color: accentColor }}
                          />
                        </div>

                        <h3
                          className="text-base font-semibold mb-1.5 transition-colors"
                          style={{ color: 'var(--appgram-foreground)' }}
                        >
                          {flow.name}
                        </h3>

                        {flow.description && (
                          <p
                            className="text-sm leading-relaxed mb-3"
                            style={{
                              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {flow.description}
                          </p>
                        )}

                        {flow.articles && flow.articles.length > 0 && (
                          <div
                            className="flex items-center gap-1.5 text-xs"
                            style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>
                              {flow.articles.length} article{flow.articles.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Featured Articles */}
        {featuredArticles && featuredArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }} />
              <h2
                className="text-lg font-semibold"
                style={{ color: 'var(--appgram-foreground)' }}
              >
                Popular Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featuredArticles.slice(0, showAllArticles ? undefined : 6).map((article, index) => (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 p-4 backdrop-blur-sm border transition-all group text-left ${isDark ? 'bg-[var(--appgram-card)] hover:bg-[var(--appgram-card)]' : 'bg-white/50 hover:bg-white/80'}`}
                  onClick={() =>
                    onArticleClick?.(
                      article,
                      flows.find((f) => f.articles?.some((a) => a.id === article.id)) as HelpFlow
                    )
                  }
                  disabled={!onArticleClick}
                  style={{
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    borderRadius: `${Math.min(borderRadius, 12)}px`,
                    cursor: onArticleClick ? 'pointer' : 'default',
                  }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${accentColor}10` }}
                  >
                    <FileText className="w-4 h-4" style={{ color: accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-medium block truncate"
                      style={{ color: 'var(--appgram-foreground)' }}
                    >
                      {article.title}
                    </span>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                  />
                </motion.button>
              ))}
            </div>

            {!showAllArticles && featuredArticles.length > 6 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllArticles(true)}
                  className={`px-6 py-2.5 text-sm font-medium rounded-full border transition-all ${isDark ? 'hover:bg-[var(--appgram-card)]' : 'hover:bg-white/50'}`}
                  style={{
                    color: accentColor,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  Show {featuredArticles.length - 6} more articles
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* No results */}
        {filteredFlows.length === 0 && debouncedQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
              No results found for "{debouncedQuery}"
            </p>
          </motion.div>
        )}

        {/* Empty State */}
        {flows.length === 0 && !debouncedQuery && (
          renderEmpty ? (
            <>{renderEmpty()}</>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center py-20"
            >
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
              >
                <HelpCircle className="w-10 h-10" style={{ color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }} />
              </div>
              <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--appgram-foreground)' }}>
                No help articles yet
              </h3>
              <p className="max-w-md mx-auto" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                Check back soon for helpful articles and guides.
              </p>
            </motion.div>
          )
        )}

        {/* Footer */}
        {showFooter && (contactSupportUrl || onLiveChatClick) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 pt-8 border-t"
            style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}
          >
            <div
              className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
            >
              <p>Still need help? We're here for you.</p>
              <div className="flex items-center gap-6">
                {contactSupportUrl && (
                  <a
                    href={contactSupportUrl}
                    className="flex items-center gap-2 transition-colors hover:opacity-70"
                    style={{ color: 'var(--appgram-foreground)' }}
                  >
                    <Mail className="w-4 h-4" />
                    Contact Support
                  </a>
                )}
                {onLiveChatClick && (
                  <button
                    onClick={onLiveChatClick}
                    className="flex items-center gap-2 transition-colors hover:opacity-70"
                    style={{ color: 'var(--appgram-foreground)' }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
