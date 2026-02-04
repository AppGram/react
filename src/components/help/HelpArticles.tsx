/**
 * HelpArticles Component
 *
 * Displays articles within a selected help flow with glassmorphism styling.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  FileText,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useHelpFlow } from '../../hooks/useHelpCenter'
import type { HelpFlow, HelpArticle } from '../../types'

export interface HelpArticlesProps {
  /**
   * The flow to display articles for (either pass flow object or flowSlug)
   */
  flow?: HelpFlow

  /**
   * Flow slug to fetch (alternative to passing flow object)
   */
  flowSlug?: string

  /**
   * Click handler for articles
   */
  onArticleClick?: (article: HelpArticle) => void

  /**
   * Back button click handler
   */
  onBack?: () => void

  /**
   * Show search input
   * @default true
   */
  showSearch?: boolean

  /**
   * Show back button
   * @default true
   */
  showBackButton?: boolean

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

const ARTICLE_TYPE_CONFIG = {
  guide: { label: 'Guide', color: '#3b82f6' },
  faq: { label: 'FAQ', color: '#8b5cf6' },
  tutorial: { label: 'Tutorial', color: '#10b981' },
} as const

export function HelpArticles({
  flow: providedFlow,
  flowSlug,
  onArticleClick,
  onBack,
  showSearch = true,
  showBackButton = true,
  renderLoading,
  renderEmpty,
  renderError,
  className,
}: HelpArticlesProps): React.ReactElement | null {
  const { theme } = useAppgramContext()
  const isDark = (theme as { isDark?: boolean }).isDark ?? false
  const {
    flow: fetchedFlow,
    isLoading,
    error,
    refetch,
  } = useHelpFlow({
    flowSlug: flowSlug || '',
    skip: !flowSlug || !!providedFlow,
  })

  const flow = providedFlow || fetchedFlow
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllArticles, setShowAllArticles] = useState(false)

  const primaryColor = theme.colors?.primary || '#6366f1'
  const accentColor = theme.colors?.accent || primaryColor
  const borderRadius = theme.borderRadius || 16

  // Debounce search
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

  // Reset show all when search changes
  useEffect(() => {
    setShowAllArticles(false)
  }, [debouncedQuery])

  // Loading state
  if (isLoading && !flow) {
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
  if (error && !flow) {
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

  if (!flow) return null

  // Filter articles
  const articles = flow.articles || []
  const filteredArticles = debouncedQuery
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : articles

  const publishedArticles = filteredArticles
    .filter((a) => a.is_published)
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className={cn('w-full', className)}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        {showBackButton && onBack && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onBack}
            className="flex items-center gap-2 mb-6 px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
            style={{
              color: primaryColor,
              backgroundColor: `${primaryColor}10`,
              borderRadius: `${borderRadius}px`,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        )}

        {/* Flow Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div
            className={`p-6 backdrop-blur-sm border ${isDark ? 'bg-[var(--appgram-card)]' : 'bg-white/70'}`}
            style={{
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              borderRadius: `${borderRadius}px`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                {flow.icon ? (
                  <span className="text-2xl">{flow.icon}</span>
                ) : (
                  <BookOpen className="w-6 h-6" style={{ color: accentColor }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  className="text-xl md:text-2xl font-bold mb-2"
                  style={{ color: 'var(--appgram-foreground)' }}
                >
                  {flow.name}
                </h1>
                {flow.description && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
                  >
                    {flow.description}
                  </p>
                )}
                <div
                  className="flex items-center gap-1.5 text-xs mt-3"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {publishedArticles.length} article{publishedArticles.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        {showSearch && publishedArticles.length > 0 && (
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
                  placeholder="Search articles..."
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
              {isLoading && (
                <Loader2
                  className="w-5 h-5 animate-spin"
                  style={{ color: primaryColor }}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Articles List */}
        {publishedArticles.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="space-y-3">
              <AnimatePresence>
                {publishedArticles
                  .slice(0, showAllArticles ? undefined : 10)
                  .map((article, index) => {
                    const typeConfig =
                      ARTICLE_TYPE_CONFIG[article.article_type as keyof typeof ARTICLE_TYPE_CONFIG]

                    return (
                      <motion.button
                        key={article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.25 + index * 0.03, duration: 0.4 }}
                        whileHover={{ x: 4 }}
                        className={`w-full flex items-start gap-4 p-4 backdrop-blur-sm border transition-all group text-left ${isDark ? 'bg-[var(--appgram-card)] hover:bg-[var(--appgram-card)]' : 'bg-white/50 hover:bg-white/80'}`}
                        onClick={() => onArticleClick?.(article)}
                        disabled={!onArticleClick}
                        style={{
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                          borderRadius: `${Math.min(borderRadius, 12)}px`,
                          cursor: onArticleClick ? 'pointer' : 'default',
                        }}
                      >
                        <div
                          className="p-2 rounded-lg shrink-0"
                          style={{ backgroundColor: `${accentColor}10` }}
                        >
                          <FileText className="w-4 h-4" style={{ color: accentColor }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--appgram-foreground)' }}
                            >
                              {article.title}
                            </span>
                            {typeConfig && (
                              <span
                                className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${typeConfig.color}12`,
                                  color: typeConfig.color,
                                }}
                              >
                                {typeConfig.label}
                              </span>
                            )}
                          </div>

                          {article.excerpt && (
                            <p
                              className="text-sm line-clamp-2"
                              style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
                            >
                              {article.excerpt}
                            </p>
                          )}
                        </div>

                        <ChevronRight
                          className="w-4 h-4 mt-1 opacity-40 group-hover:opacity-100 shrink-0 transition-opacity"
                          style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                        />
                      </motion.button>
                    )
                  })}
              </AnimatePresence>
            </div>

            {/* Show More */}
            {!showAllArticles && publishedArticles.length > 10 && (
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
                  Show {publishedArticles.length - 10} more articles
                </button>
              </div>
            )}
          </motion.div>
        ) : debouncedQuery ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
              No results found for "{debouncedQuery}"
            </p>
          </motion.div>
        ) : renderEmpty ? (
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
              <FileText className="w-10 h-10" style={{ color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }} />
            </div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--appgram-foreground)' }}>
              No articles yet
            </h3>
            <p className="max-w-md mx-auto" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
              Check back soon for help articles in this topic.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
