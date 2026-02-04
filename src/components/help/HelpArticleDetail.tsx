/**
 * HelpArticleDetail Component
 *
 * Displays a single help article's content with glassmorphism styling.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Clock, Calendar } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useHelpArticle } from '../../hooks/useHelpCenter'
import type { HelpArticle, HelpFlow } from '../../types'

export interface HelpArticleDetailProps {
  /**
   * The article to display (either pass article object or articleSlug + flowId)
   */
  article?: HelpArticle

  /**
   * Article slug to fetch (alternative to passing article object)
   */
  articleSlug?: string

  /**
   * Flow ID for fetching article (required if using articleSlug)
   */
  flowId?: string

  /**
   * The parent flow (for context)
   */
  flow?: HelpFlow

  /**
   * Back button click handler
   */
  onBack?: () => void

  /**
   * Show back button
   * @default true
   */
  showBackButton?: boolean

  /**
   * Show article metadata (date, type)
   * @default true
   */
  showMetadata?: boolean

  /**
   * Custom render function for loading state
   */
  renderLoading?: () => React.ReactNode

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

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function HelpArticleDetail({
  article: providedArticle,
  articleSlug,
  flowId,
  flow,
  onBack,
  showBackButton = true,
  showMetadata = true,
  renderLoading,
  renderError,
  className,
}: HelpArticleDetailProps): React.ReactElement | null {
  const { theme } = useAppgramContext()
  const isDark = (theme as { isDark?: boolean }).isDark ?? false
  const {
    article: fetchedArticle,
    isLoading,
    error,
    refetch,
  } = useHelpArticle({
    articleSlug: articleSlug || '',
    flowId: flowId || '',
    skip: !articleSlug || !flowId || !!providedArticle,
  })

  const article = providedArticle || fetchedArticle

  const primaryColor = theme.colors?.primary || '#6366f1'
  const accentColor = theme.colors?.accent || primaryColor
  const borderRadius = theme.borderRadius || 16

  // Loading state
  if (isLoading && !article) {
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
  if (error && !article) {
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

  if (!article) return null

  const typeConfig = ARTICLE_TYPE_CONFIG[article.article_type as keyof typeof ARTICLE_TYPE_CONFIG]

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
            {flow ? `Back to ${flow.name}` : 'Back'}
          </motion.button>
        )}

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="p-3 rounded-xl shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <FileText className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {typeConfig && (
                  <span
                    className="text-xs font-medium uppercase px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${typeConfig.color}12`,
                      color: typeConfig.color,
                    }}
                  >
                    {typeConfig.label}
                  </span>
                )}
                {flow && (
                  <span
                    className="text-xs"
                    style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                  >
                    {flow.name}
                  </span>
                )}
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: 'var(--appgram-foreground)', lineHeight: 1.2 }}
              >
                {article.title}
              </h1>
            </div>
          </div>

          {/* Metadata */}
          {showMetadata && (
            <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
              {article.published_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Published {formatDate(article.published_at)}</span>
                </div>
              )}
              {article.updated_at && article.updated_at !== article.published_at && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {formatDate(article.updated_at)}</span>
                </div>
              )}
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <p
              className="mt-4 text-base leading-relaxed"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
            >
              {article.excerpt}
            </p>
          )}
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div
            className={`p-6 md:p-8 backdrop-blur-sm border ${isDark ? 'bg-[var(--appgram-card)]' : 'bg-white/70'}`}
            style={{
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              borderRadius: `${borderRadius}px`,
            }}
          >
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </motion.div>
      </div>

      {/* HTML content styling - theme aware */}
      <style>{`
        .article-content { color: ${isDark ? '#e5e5e5' : '#1f2937'}; }
        .article-content h1 { font-size: 1.875rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 1rem; line-height: 1.2; color: ${isDark ? '#e5e5e5' : '#1f2937'}; }
        .article-content h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; line-height: 1.3; color: ${isDark ? '#e5e5e5' : '#1f2937'}; }
        .article-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; line-height: 1.4; color: ${isDark ? '#e5e5e5' : '#1f2937'}; }
        .article-content h4 { font-size: 1.125rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: ${isDark ? '#e5e5e5' : '#1f2937'}; }
        .article-content p { margin-bottom: 1rem; line-height: 1.7; color: ${isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'}; }
        .article-content ul, .article-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
        .article-content ul { list-style-type: disc; }
        .article-content ol { list-style-type: decimal; }
        .article-content li { margin-bottom: 0.5rem; line-height: 1.6; color: ${isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'}; }
        .article-content a { color: ${accentColor}; text-decoration: underline; text-underline-offset: 2px; }
        .article-content a:hover { opacity: 0.8; }
        .article-content code {
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .article-content pre {
          background-color: ${isDark ? '#0a0a0a' : '#1f2937'};
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .article-content pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
        .article-content blockquote {
          border-left: 4px solid ${accentColor}40;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: ${isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .article-content th, .article-content td {
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .article-content th {
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
          font-weight: 600;
        }
        .article-content hr {
          border: none;
          border-top: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          margin: 2rem 0;
        }
      `}</style>
    </div>
  )
}
