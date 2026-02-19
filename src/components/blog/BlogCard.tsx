/**
 * BlogCard Component
 *
 * Displays a single blog post as a card.
 */

import { Calendar, Tag, ArrowRight } from 'lucide-react'
import { cn } from '../../utils'
import type { BlogPost } from '../../types'

export interface BlogCardProps {
  /**
   * The blog post to display
   */
  post: BlogPost

  /**
   * Called when the card is clicked
   */
  onClick?: (post: BlogPost) => void

  /**
   * Card variant
   * @default 'default'
   */
  variant?: 'default' | 'compact' | 'featured'

  /**
   * Additional CSS classes
   */
  className?: string
}

export function BlogCard({
  post,
  onClick,
  variant = 'default',
  className,
}: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleClick = () => {
    onClick?.(post)
  }

  if (variant === 'compact') {
    return (
      <article
        onClick={handleClick}
        className={cn(
          'group cursor-pointer p-4 rounded-lg transition-all duration-200',
          'hover:bg-[var(--appgram-card-hover,rgba(0,0,0,0.02))]',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {post.og_image_url && (
            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
              <img
                src={post.og_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--appgram-text,#1a1a1a)] line-clamp-2 group-hover:text-[var(--appgram-primary,#6366f1)] transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-[var(--appgram-text-secondary,#6b7280)]">
              <Calendar className="w-3.5 h-3.5" />
              <time>{formatDate(post.published_at)}</time>
            </div>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article
        onClick={handleClick}
        className={cn(
          'group cursor-pointer rounded-xl overflow-hidden',
          'bg-[var(--appgram-card,#ffffff)]',
          'border border-[var(--appgram-border,#e5e7eb)]',
          'shadow-sm hover:shadow-md transition-all duration-300',
          className
        )}
      >
        {post.og_image_url && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.og_image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          {post.category && (
            <span
              className="inline-block text-xs font-medium tracking-wide uppercase mb-3"
              style={{ color: post.category.color || 'var(--appgram-primary,#6366f1)' }}
            >
              {post.category.name}
            </span>
          )}
          <h3 className="text-xl font-bold text-[var(--appgram-text,#1a1a1a)] line-clamp-2 group-hover:text-[var(--appgram-primary,#6366f1)] transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-3 text-[var(--appgram-text-secondary,#6b7280)] line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-[var(--appgram-text-secondary,#6b7280)]">
              <Calendar className="w-4 h-4" />
              <time>{formatDate(post.published_at)}</time>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--appgram-primary,#6366f1)] opacity-0 group-hover:opacity-100 transition-opacity">
              Read more <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </article>
    )
  }

  // Default variant
  return (
    <article
      onClick={handleClick}
      className={cn(
        'group cursor-pointer rounded-xl overflow-hidden',
        'bg-[var(--appgram-card,#ffffff)]',
        'border border-[var(--appgram-border,#e5e7eb)]',
        'shadow-sm hover:shadow-md transition-all duration-300',
        className
      )}
    >
      {post.og_image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.og_image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5">
        {post.category && (
          <span
            className="inline-block text-xs font-medium tracking-wide uppercase mb-2"
            style={{ color: post.category.color || 'var(--appgram-primary,#6366f1)' }}
          >
            {post.category.name}
          </span>
        )}
        <h3 className="font-semibold text-[var(--appgram-text,#1a1a1a)] line-clamp-2 group-hover:text-[var(--appgram-primary,#6366f1)] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-[var(--appgram-text-secondary,#6b7280)] line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-[var(--appgram-text-secondary,#6b7280)]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <time>{formatDate(post.published_at)}</time>
          </div>
          {post.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <span>{post.tags[0]}</span>
              {post.tags.length > 1 && <span>+{post.tags.length - 1}</span>}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
