/**
 * Blog Component
 *
 * Full-featured blog component with list and detail views.
 * Manages internal state for navigation between posts.
 */

import React, { useState, useCallback } from 'react'
import { cn } from '../../utils'
import { useBlogPosts, useBlogCategories } from '../../hooks/useBlog'
import { BlogList } from './BlogList'
import { BlogPostDetail } from './BlogPostDetail'
import type { BlogPost } from '../../types'

export interface BlogProps {
  /**
   * Initial category filter
   */
  initialCategory?: string

  /**
   * Initial search query
   */
  initialSearch?: string

  /**
   * Posts per page
   * @default 9
   */
  postsPerPage?: number

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
   * Show related posts on detail view
   * @default true
   */
  showRelatedPosts?: boolean

  /**
   * Grid variant for list view
   * @default 'grid'
   */
  variant?: 'grid' | 'list'

  /**
   * Called when a post is viewed
   */
  onPostView?: (post: BlogPost) => void

  /**
   * Called when navigating back to list
   */
  onBackToList?: () => void

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
   * Additional CSS classes
   */
  className?: string
}

type ViewState =
  | { type: 'list' }
  | { type: 'detail'; post: BlogPost }

export function Blog({
  initialCategory,
  initialSearch,
  postsPerPage = 9,
  showSearch = true,
  showCategories = true,
  showRelatedPosts = true,
  variant = 'grid',
  onPostView,
  onBackToList,
  renderLoading,
  renderEmpty,
  renderError,
  className,
}: BlogProps): React.ReactElement {
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null)
  const [searchQuery, setSearchQuery] = useState(initialSearch || '')

  const {
    posts,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    setFilters,
    refetch,
  } = useBlogPosts({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    per_page: postsPerPage,
  })

  const {
    categories,
    isLoading: categoriesLoading,
  } = useBlogCategories()

  const handlePostClick = useCallback((post: BlogPost) => {
    setViewState({ type: 'detail', post })
    onPostView?.(post)
  }, [onPostView])

  const handleBackToList = useCallback(() => {
    setViewState({ type: 'list' })
    onBackToList?.()
  }, [onBackToList])

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category)
    setFilters({ category: category || undefined })
  }, [setFilters])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    setFilters({ search: query || undefined })
  }, [setFilters])

  const handleRelatedPostClick = useCallback((post: BlogPost) => {
    setViewState({ type: 'detail', post })
    onPostView?.(post)
    // Scroll to top when viewing a new post
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [onPostView])

  // Error state
  if (error && posts.length === 0) {
    if (renderError) return <>{renderError(error, refetch)}</>
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-[var(--appgram-primary,#6366f1)] text-white rounded-lg transition-colors hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Detail view
  if (viewState.type === 'detail') {
    return (
      <BlogPostDetail
        post={viewState.post}
        onBack={handleBackToList}
        showBackButton={true}
        showRelatedPosts={showRelatedPosts}
        onRelatedPostClick={handleRelatedPostClick}
        renderLoading={renderLoading}
        renderError={renderError}
        className={className}
      />
    )
  }

  // List view
  return (
    <BlogList
      posts={posts}
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onPostClick={handlePostClick}
      isLoading={isLoading || categoriesLoading}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      showSearch={showSearch}
      showCategories={showCategories}
      variant={variant}
      renderLoading={renderLoading}
      renderEmpty={renderEmpty}
      className={className}
    />
  )
}
