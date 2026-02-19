/**
 * BlogPostDetail Component
 *
 * Displays a single blog post's full content with styling.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react'
import { cn } from '../../utils'
import { Markdown } from '../shared'
import { useAppgramContext } from '../../provider/context'
import { useBlogPost } from '../../hooks/useBlog'
import { BlogCard } from './BlogCard'
import type { BlogPost } from '../../types'

export interface BlogPostDetailProps {
  /**
   * The blog post to display (either pass post object or postSlug)
   */
  post?: BlogPost

  /**
   * Post slug to fetch (alternative to passing post object)
   */
  postSlug?: string

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
   * Show related posts section
   * @default true
   */
  showRelatedPosts?: boolean

  /**
   * Called when a related post is clicked
   */
  onRelatedPostClick?: (post: BlogPost) => void

  /**
   * Custom render function for loading state
   */
  renderLoading?: () => React.ReactNode

  /**
   * Custom render function for error state
   */
  renderError?: (error: string, retry: () => void) => React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BlogPostDetail({
  post: providedPost,
  postSlug,
  onBack,
  showBackButton = true,
  showRelatedPosts = true,
  onRelatedPostClick,
  renderLoading,
  renderError,
  className,
}: BlogPostDetailProps): React.ReactElement | null {
  const { theme } = useAppgramContext()
  const {
    post: fetchedPost,
    relatedPosts,
    isLoading,
    error,
    refetch,
  } = useBlogPost({
    slug: postSlug || '',
    skip: !postSlug || !!providedPost,
  })

  const post = providedPost || fetchedPost

  const primaryColor = theme.colors?.primary || '#6366f1'
  const accentColor = theme.colors?.accent || primaryColor
  const borderRadius = theme.borderRadius || 16

  // Loading state
  if (isLoading && !post) {
    if (renderLoading) return <>{renderLoading()}</>
    return (
      <div className={cn('space-y-6', className)}>
        {/* Skeleton header */}
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="h-8 w-24 bg-[var(--appgram-skeleton,#f3f4f6)] rounded-lg animate-pulse mb-6" />
          <div className="aspect-video bg-[var(--appgram-skeleton,#f3f4f6)] rounded-xl animate-pulse mb-6" />
          <div className="h-4 w-20 bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse mb-3" />
          <div className="h-8 w-3/4 bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse mb-4" />
          <div className="h-4 w-40 bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse mb-8" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse" />
            <div className="h-4 w-full bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !post) {
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

  if (!post) return null

  return (
    <div className={cn('w-full', className)}>
      <div className="max-w-3xl mx-auto px-6 py-8">
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
            Back to Blog
          </motion.button>
        )}

        {/* Post Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cover Image */}
          {post.og_image_url && (
            <div
              className="mb-6 overflow-hidden"
              style={{ borderRadius: `${borderRadius}px` }}
            >
              <img
                src={post.og_image_url}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Category */}
          {post.category && (
            <span
              className="inline-block text-xs font-medium tracking-wide uppercase mb-3"
              style={{ color: post.category.color || accentColor }}
            >
              {post.category.name}
            </span>
          )}

          {/* Title */}
          <h1
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: 'var(--appgram-text,#1a1a1a)', lineHeight: 1.2 }}
          >
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex items-center gap-4 flex-wrap mb-8 text-sm text-[var(--appgram-text-secondary,#6b7280)]">
            {post.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time>{formatDate(post.published_at)}</time>
              </div>
            )}
            {post.author_name && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{post.author_name}</span>
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span>{post.tags.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className="p-6 md:p-8 border bg-[var(--appgram-card,#ffffff)]"
            style={{
              borderColor: 'var(--appgram-border,#e5e7eb)',
              borderRadius: `${borderRadius}px`,
            }}
          >
            <Markdown content={post.content} accentColor={accentColor} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${accentColor}10`,
                    color: accentColor,
                  }}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.article>

        {/* Related Posts */}
        {showRelatedPosts && relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-[var(--appgram-border,#e5e7eb)]"
          >
            <h2 className="text-lg font-semibold text-[var(--appgram-text,#1a1a1a)] mb-6">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.slice(0, 4).map((relatedPost) => (
                <BlogCard
                  key={relatedPost.id}
                  post={relatedPost}
                  onClick={onRelatedPostClick}
                  variant="compact"
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
