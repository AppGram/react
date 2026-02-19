/**
 * useBlog Hooks
 *
 * Fetches and manages blog/resources data for custom UI implementations.
 *
 * @example
 * ```tsx
 * import { useBlogPosts, useBlogPost } from '@appgram/react'
 *
 * function BlogList() {
 *   const { posts, isLoading, error, refetch } = useBlogPosts({ per_page: 10 })
 *
 *   if (isLoading) return <Spinner />
 *   if (error) return <Alert>{error}</Alert>
 *
 *   return (
 *     <ul className="blog-posts">
 *       {posts.map(post => (
 *         <li key={post.id}>
 *           <h3>{post.title}</h3>
 *           <time>{formatDate(post.published_at)}</time>
 *           <p>{post.excerpt}</p>
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { BlogPost, BlogCategory, BlogFilters } from '../types'

// ============================================================================
// useBlogPosts - List of posts with filters and pagination
// ============================================================================

export interface UseBlogPostsOptions {
  /**
   * Filter by category slug
   */
  category?: string

  /**
   * Filter by tag
   */
  tag?: string

  /**
   * Search query
   */
  search?: string

  /**
   * Only featured posts
   */
  featured?: boolean

  /**
   * Items per page
   * @default 10
   */
  per_page?: number

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean

  /**
   * Auto-refresh interval in milliseconds
   */
  refreshInterval?: number
}

export interface UseBlogPostsResult {
  /**
   * List of blog posts
   */
  posts: BlogPost[]

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Current page number
   */
  page: number

  /**
   * Total number of pages
   */
  totalPages: number

  /**
   * Total number of posts
   */
  total: number

  /**
   * Set the current page
   */
  setPage: (page: number) => void

  /**
   * Update filters
   */
  setFilters: (filters: Partial<UseBlogPostsOptions>) => void

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

export function useBlogPosts(options: UseBlogPostsOptions = {}): UseBlogPostsResult {
  const { client } = useAppgramContext()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFiltersState] = useState<Partial<UseBlogPostsOptions>>({
    category: options.category,
    tag: options.tag,
    search: options.search,
    featured: options.featured,
    per_page: options.per_page,
  })

  const fetchPosts = useCallback(async () => {
    if (options.skip) return

    setIsLoading(true)
    setError(null)

    try {
      const blogFilters: BlogFilters = {
        page,
        per_page: filters.per_page || 10,
      }

      if (filters.category) blogFilters.category_slug = filters.category
      if (filters.tag) blogFilters.tag = filters.tag
      if (filters.search) blogFilters.search = filters.search
      if (filters.featured !== undefined) blogFilters.is_featured = filters.featured

      const response = await client.getBlogPosts(blogFilters)

      if (response.success && response.data) {
        setPosts(response.data.data || [])
        setTotalPages(response.data.total_pages || 1)
        setTotal(response.data.total || 0)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch blog posts'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip, page, filters])

  // Initial fetch and refetch on filter/page changes
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Auto-refresh interval
  useEffect(() => {
    if (!options.refreshInterval || options.skip) return

    const interval = setInterval(fetchPosts, options.refreshInterval)
    return () => clearInterval(interval)
  }, [fetchPosts, options.refreshInterval, options.skip])

  const setFilters = useCallback((newFilters: Partial<UseBlogPostsOptions>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPage(1) // Reset to page 1 when filters change
  }, [])

  return {
    posts,
    isLoading,
    error,
    page,
    totalPages,
    total,
    setPage,
    setFilters,
    refetch: fetchPosts,
  }
}

// ============================================================================
// useBlogPost - Single post by slug
// ============================================================================

export interface UseBlogPostOptions {
  /**
   * The blog post slug to fetch
   */
  slug: string

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseBlogPostResult {
  /**
   * The blog post data
   */
  post: BlogPost | null

  /**
   * Related posts
   */
  relatedPosts: BlogPost[]

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

export function useBlogPost(options: UseBlogPostOptions): UseBlogPostResult {
  const { client } = useAppgramContext()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchPost = useCallback(async () => {
    if (options.skip || !options.slug) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getBlogPost(options.slug)

      if (response.success && response.data) {
        setPost(response.data)

        // Also fetch related posts
        const relatedResponse = await client.getRelatedBlogPosts(options.slug)
        if (relatedResponse.success && relatedResponse.data) {
          setRelatedPosts(relatedResponse.data)
        }
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch blog post'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip, options.slug])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  return {
    post,
    relatedPosts,
    isLoading,
    error,
    refetch: fetchPost,
  }
}

// ============================================================================
// useBlogCategories - Blog categories
// ============================================================================

export interface UseBlogCategoriesOptions {
  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseBlogCategoriesResult {
  /**
   * List of blog categories
   */
  categories: BlogCategory[]

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

export function useBlogCategories(options: UseBlogCategoriesOptions = {}): UseBlogCategoriesResult {
  const { client } = useAppgramContext()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (options.skip) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getBlogCategories()

      if (response.success && response.data) {
        setCategories(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch blog categories'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  }
}

// ============================================================================
// useFeaturedPosts - Featured blog posts
// ============================================================================

export interface UseFeaturedPostsOptions {
  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseFeaturedPostsResult {
  /**
   * List of featured blog posts
   */
  posts: BlogPost[]

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

export function useFeaturedPosts(options: UseFeaturedPostsOptions = {}): UseFeaturedPostsResult {
  const { client } = useAppgramContext()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    if (options.skip) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getFeaturedBlogPosts()

      if (response.success && response.data) {
        setPosts(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch featured posts'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, options.skip])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    isLoading,
    error,
    refetch: fetchPosts,
  }
}
