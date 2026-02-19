/**
 * BlogList Component
 *
 * Displays a list of blog posts with optional filters.
 */

import React from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils'
import { BlogCard } from './BlogCard'
import type { BlogPost, BlogCategory } from '../../types'

export interface BlogListProps {
  /**
   * List of blog posts to display
   */
  posts: BlogPost[]

  /**
   * List of categories for filtering
   */
  categories?: BlogCategory[]

  /**
   * Currently selected category
   */
  selectedCategory?: string | null

  /**
   * Called when a category is selected
   */
  onCategoryChange?: (category: string | null) => void

  /**
   * Search query
   */
  searchQuery?: string

  /**
   * Called when search query changes
   */
  onSearchChange?: (query: string) => void

  /**
   * Called when a post is clicked
   */
  onPostClick?: (post: BlogPost) => void

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Current page
   */
  page?: number

  /**
   * Total pages
   */
  totalPages?: number

  /**
   * Called when page changes
   */
  onPageChange?: (page: number) => void

  /**
   * Show search input
   * @default true
   */
  showSearch?: boolean

  /**
   * Show category filter
   * @default true
   */
  showCategories?: boolean

  /**
   * Grid variant
   * @default 'grid'
   */
  variant?: 'grid' | 'list'

  /**
   * Custom loading component
   */
  renderLoading?: () => React.ReactNode

  /**
   * Custom empty state component
   */
  renderEmpty?: () => React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string
}

export function BlogList({
  posts,
  categories = [],
  selectedCategory,
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
  onPostClick,
  isLoading,
  page = 1,
  totalPages = 1,
  onPageChange,
  showSearch = true,
  showCategories = true,
  variant = 'grid',
  renderLoading,
  renderEmpty,
  className,
}: BlogListProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value)
  }

  if (isLoading) {
    if (renderLoading) {
      return <>{renderLoading()}</>
    }
    return (
      <div className={cn('space-y-6', className)}>
        {/* Skeleton filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {showSearch && (
            <div className="flex-1 h-10 bg-[var(--appgram-skeleton,#f3f4f6)] rounded-lg animate-pulse" />
          )}
          {showCategories && (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-20 bg-[var(--appgram-skeleton,#f3f4f6)] rounded-full animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
        {/* Skeleton cards */}
        <div className={cn(
          variant === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--appgram-border,#e5e7eb)] overflow-hidden"
            >
              <div className="aspect-video bg-[var(--appgram-skeleton,#f3f4f6)] animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-20 bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse" />
                <div className="h-4 w-full bg-[var(--appgram-skeleton,#f3f4f6)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      {(showSearch || showCategories) && (
        <div className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-[var(--appgram-border,#e5e7eb)]">
          {/* Categories */}
          {showCategories && categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onCategoryChange?.(null)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                  !selectedCategory
                    ? 'bg-[var(--appgram-text,#1a1a1a)] text-[var(--appgram-card,#ffffff)]'
                    : 'text-[var(--appgram-text-secondary,#6b7280)] hover:text-[var(--appgram-text,#1a1a1a)]'
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange?.(cat.slug)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                    selectedCategory === cat.slug
                      ? 'bg-[var(--appgram-text,#1a1a1a)] text-[var(--appgram-card,#ffffff)]'
                      : 'text-[var(--appgram-text-secondary,#6b7280)] hover:text-[var(--appgram-text,#1a1a1a)]'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          {showSearch && (
            <div className="relative sm:ml-auto sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--appgram-text-secondary,#6b7280)] pointer-events-none" />
              <input
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={cn(
                  'w-full h-10 pl-10 pr-4 rounded-lg',
                  'bg-[var(--appgram-card,#ffffff)]',
                  'border border-[var(--appgram-border,#e5e7eb)]',
                  'text-[var(--appgram-text,#1a1a1a)]',
                  'placeholder:text-[var(--appgram-text-secondary,#6b7280)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--appgram-primary,#6366f1)] focus:border-transparent'
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        renderEmpty ? (
          renderEmpty()
        ) : (
          <div className="py-12 text-center">
            <p className="text-[var(--appgram-text-secondary,#6b7280)]">
              {searchQuery || selectedCategory ? 'No posts found.' : 'No posts yet.'}
            </p>
          </div>
        )
      ) : (
        <div className={cn(
          variant === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              onClick={onPostClick}
              variant={variant === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 pt-6 border-t border-[var(--appgram-border,#e5e7eb)]">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1}
            className={cn(
              'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              page === 1
                ? 'text-[var(--appgram-text-secondary,#6b7280)] opacity-50 cursor-not-allowed'
                : 'text-[var(--appgram-text,#1a1a1a)] hover:bg-[var(--appgram-card-hover,rgba(0,0,0,0.05))]'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-[var(--appgram-text-secondary,#6b7280)]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === totalPages}
            className={cn(
              'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              page === totalPages
                ? 'text-[var(--appgram-text-secondary,#6b7280)] opacity-50 cursor-not-allowed'
                : 'text-[var(--appgram-text,#1a1a1a)] hover:bg-[var(--appgram-card-hover,rgba(0,0,0,0.05))]'
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  )
}
