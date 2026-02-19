/**
 * AppgramClient
 *
 * API client for Appgram portal/public endpoints.
 * Adapted from the main app's api.ts for use in the SDK.
 */

import type {
  ApiResponse,
  Wish,
  WishFilters,
  WishesResponse,
  VoteCheckResponse,
  Comment,
  CommentsResponse,
  RoadmapData,
  Release,
  ReleaseFeature,
  HelpCollection,
  HelpFlow,
  HelpArticle,
  SupportRequest,
  SupportRequestInput,
  Survey,
  SurveyNode,
  SurveyResponse,
  SurveySubmitInput,
  ContactForm,
  ContactFormSubmission,
  ContactFormSubmitInput,
  StatusPageOverview,
  BlogPost,
  BlogPostsResponse,
  BlogCategory,
  BlogFilters,
} from '../types'

export interface AppgramClientConfig {
  baseUrl: string
  projectId: string
  orgSlug?: string
  projectSlug?: string
}

export class AppgramClient {
  private baseUrl: string
  private projectId: string
  private orgSlug?: string
  private projectSlug?: string

  constructor(config: AppgramClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.projectId = config.projectId
    this.orgSlug = config.orgSlug
    this.projectSlug = config.projectSlug
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  private async request<T>(
    method: string,
    endpoint: string,
    options?: {
      params?: Record<string, string>
      body?: unknown
    }
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`

    if (options?.params) {
      const searchParams = new URLSearchParams()
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value)
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: String(response.status),
            message: data.message || data.error || 'An error occurred',
          },
        }
      }

      // Handle both wrapped response format { success, data } and direct data format
      if (data && typeof data === 'object' && 'success' in data) {
        return data
      }

      return {
        success: true,
        data: data as T,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }

  private get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, { params })
  }

  /**
   * Raw request that returns the API response as-is without transformation
   */
  private async requestRaw<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T & { success: boolean; error?: { code: string; message: string } }> {
    let url = `${this.baseUrl}${endpoint}`

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value)
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: String(response.status),
            message: data.message || data.error || 'An error occurred',
          },
        } as T & { success: boolean; error?: { code: string; message: string } }
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      } as T & { success: boolean; error?: { code: string; message: string } }
    }
  }

  private post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { body })
  }

  private delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint)
  }

  // ============================================================================
  // Wishes
  // ============================================================================

  /**
   * Get public wishes for the project
   */
  async getPublicWishes(filters?: WishFilters): Promise<ApiResponse<WishesResponse>> {
    const params: Record<string, string> = {
      project_id: this.projectId,
    }

    if (filters?.status) {
      params.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status
    }
    if (filters?.category_id) params.category_id = filters.category_id
    if (filters?.search) params.search = filters.search
    if (filters?.sort_by) params.sort_by = filters.sort_by
    if (filters?.sort_order) params.sort_order = filters.sort_order
    if (filters?.page) params.page = String(filters.page)
    if (filters?.per_page) params.per_page = String(filters.per_page)
    if (filters?.fingerprint) params.fingerprint = filters.fingerprint

    // The API returns { success, data: [...wishes], total, page, per_page, total_pages }
    // We need to transform this to { success, data: { data: [...wishes], total, ... } }
    const rawResponse = await this.requestRaw<{
      success: boolean
      data: Wish[]
      total: number
      page: number
      per_page: number
      total_pages: number
      error?: { code: string; message: string }
    }>('/portal/wishes', params)

    if (!rawResponse.success) {
      return {
        success: false,
        error: rawResponse.error,
      }
    }

    return {
      success: true,
      data: {
        data: rawResponse.data || [],
        total: rawResponse.total || 0,
        page: rawResponse.page || 1,
        per_page: rawResponse.per_page || 20,
        total_pages: rawResponse.total_pages || 0,
      },
    }
  }

  /**
   * Get a single wish by ID
   */
  async getWish(wishId: string): Promise<ApiResponse<Wish>> {
    return this.get<Wish>(`/portal/wishes/${wishId}`, {
      project_id: this.projectId,
    })
  }

  /**
   * Create a new wish (feature request)
   */
  async createWish(data: {
    title: string
    description: string
    author_email?: string
    author_name?: string
    category_id?: string
  }): Promise<ApiResponse<Wish>> {
    return this.post<Wish>('/portal/wishes', {
      project_id: this.projectId,
      ...data,
    })
  }

  // ============================================================================
  // Votes
  // ============================================================================

  /**
   * Check if a fingerprint has voted on a wish
   */
  async checkVote(wishId: string, fingerprint: string): Promise<ApiResponse<VoteCheckResponse>> {
    return this.get<VoteCheckResponse>(`/api/v1/votes/check/${wishId}`, {
      fingerprint,
    })
  }

  /**
   * Create a vote
   */
  async createVote(wishId: string, fingerprint: string, voterEmail?: string): Promise<ApiResponse<{ id: string; wish_id: string }>> {
    return this.post<{ id: string; wish_id: string }>('/api/v1/votes', {
      wish_id: wishId,
      fingerprint,
      voter_email: voterEmail,
    })
  }

  /**
   * Delete a vote
   */
  async deleteVote(voteId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.delete<{ success: boolean }>(`/api/v1/votes/${voteId}`)
  }

  // ============================================================================
  // Comments
  // ============================================================================

  /**
   * Get comments for a wish
   */
  async getComments(
    wishId: string,
    options?: { page?: number; per_page?: number }
  ): Promise<ApiResponse<CommentsResponse>> {
    const params: Record<string, string> = {
      wish_id: wishId,
    }
    if (options?.page) params.page = String(options.page)
    if (options?.per_page) params.per_page = String(options.per_page)

    // The API returns Comment[] directly, not a paginated response
    // We need to transform it to match the expected CommentsResponse format
    const response = await this.get<Comment[]>('/api/v1/comments', params)

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      }
    }

    const comments = response.data || []
    return {
      success: true,
      data: {
        data: comments,
        total: comments.length,
        page: options?.page || 1,
        per_page: options?.per_page || 20,
        total_pages: 1,
      },
    }
  }

  /**
   * Create a comment
   */
  async createComment(data: {
    wish_id: string
    content: string
    author_name?: string
    author_email?: string
    parent_id?: string
  }): Promise<ApiResponse<Comment>> {
    // Include required fields for anonymous public comments
    return this.post<Comment>('/api/v1/comments', {
      ...data,
      author_type: 'anonymous',
      is_official: false,
    })
  }

  // ============================================================================
  // Roadmap
  // ============================================================================

  /**
   * Get roadmap data for the project
   */
  async getRoadmapData(): Promise<ApiResponse<RoadmapData>> {
    const params: Record<string, string> = {
      project_id: this.projectId,
    }

    if (this.orgSlug && this.projectSlug) {
      params.org_slug = this.orgSlug
      params.project_slug = this.projectSlug
    }

    return this.get<RoadmapData>('/portal/roadmap-data', params)
  }

  // ============================================================================
  // Releases
  // ============================================================================

  /**
   * Get public releases for the project
   */
  async getReleases(options?: { limit?: number }): Promise<ApiResponse<Release[]>> {
    if (!this.orgSlug || !this.projectSlug) {
      return {
        success: false,
        error: {
          code: 'MISSING_SLUGS',
          message: 'orgSlug and projectSlug are required for releases endpoint',
        },
      }
    }

    const params: Record<string, string> = {}
    if (options?.limit) params.limit = String(options.limit)

    return this.get<Release[]>(
      `/api/v1/releases/public/${this.orgSlug}/${this.projectSlug}`,
      params
    )
  }

  /**
   * Get a single release by slug
   */
  async getRelease(releaseSlug: string): Promise<ApiResponse<Release>> {
    if (!this.orgSlug || !this.projectSlug) {
      return {
        success: false,
        error: {
          code: 'MISSING_SLUGS',
          message: 'orgSlug and projectSlug are required for releases endpoint',
        },
      }
    }

    return this.get<Release>(
      `/api/v1/releases/public/${this.orgSlug}/${this.projectSlug}/${releaseSlug}`
    )
  }

  /**
   * Get features for a release (public endpoint)
   */
  async getReleaseFeatures(releaseSlug: string): Promise<ApiResponse<ReleaseFeature[]>> {
    if (!this.orgSlug || !this.projectSlug) {
      return {
        success: false,
        error: {
          code: 'MISSING_SLUGS',
          message: 'orgSlug and projectSlug are required for release features endpoint',
        },
      }
    }

    return this.get<ReleaseFeature[]>(
      `/api/v1/releases/public/${this.orgSlug}/${this.projectSlug}/${releaseSlug}/features`
    )
  }

  // ============================================================================
  // Help Center
  // ============================================================================

  /**
   * Get help center collection for the project
   */
  async getHelpCollection(): Promise<ApiResponse<{ collection: HelpCollection | null; flows: HelpFlow[] }>> {
    return this.get<{ collection: HelpCollection | null; flows: HelpFlow[] }>('/portal/help', {
      project_id: this.projectId,
    })
  }

  /**
   * Get a help flow by slug
   */
  async getHelpFlow(slug: string): Promise<ApiResponse<HelpFlow>> {
    return this.get<HelpFlow>(`/portal/help/flows/${slug}`, {
      project_id: this.projectId,
    })
  }

  /**
   * Get a help article by slug
   */
  async getHelpArticle(slug: string, flowId: string): Promise<ApiResponse<HelpArticle>> {
    return this.get<HelpArticle>(`/portal/help/articles/${slug}`, {
      flow_id: flowId,
    })
  }

  // ============================================================================
  // Support
  // ============================================================================

  /**
   * Upload a file via public portal (no auth required)
   */
  async uploadFile(file: File): Promise<ApiResponse<{
    url: string
    name: string
    size: number
    mime_type?: string
  }>> {
    const url = `${this.baseUrl}/portal/files/upload`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('project_id', this.projectId)

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'UPLOAD_ERROR',
            message: data.error?.message || data.message || 'File upload failed',
          },
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: error instanceof Error ? error.message : 'File upload failed',
        },
      }
    }
  }

  /**
   * Submit a support request
   */
  async submitSupportRequest(
    data: SupportRequestInput
  ): Promise<ApiResponse<SupportRequest>> {
    // Upload attachments first if any
    const uploadedAttachments: Array<{ url: string; name: string; size: number; mime_type?: string }> = []
    if (data.attachments && data.attachments.length > 0) {
      for (const file of data.attachments) {
        if (file.size > 10 * 1024 * 1024) {
          return {
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File "${file.name}" is too large. Maximum size is 10MB.`,
            },
          }
        }
        const uploadResponse = await this.uploadFile(file)
        if (uploadResponse.success && uploadResponse.data) {
          uploadedAttachments.push({
            url: uploadResponse.data.url,
            name: uploadResponse.data.name,
            size: uploadResponse.data.size,
            mime_type: uploadResponse.data.mime_type,
          })
        } else {
          return {
            success: false,
            error: uploadResponse.error || {
              code: 'UPLOAD_ERROR',
              message: 'Failed to upload attachment',
            },
          }
        }
      }
    }

    const payload: Record<string, unknown> = {
      project_id: this.projectId,
      subject: data.subject,
      description: data.description,
      user_email: data.user_email,
    }

    if (data.user_name) payload.user_name = data.user_name
    if (data.external_user_id) payload.external_user_id = data.external_user_id
    if (data.category) payload.category = data.category
    if (uploadedAttachments.length > 0) payload.attachments = uploadedAttachments

    return this.post<SupportRequest>('/portal/support-requests', payload)
  }

  /**
   * Request a magic link to access support tickets
   */
  async sendSupportMagicLink(userEmail: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.post<{ success: boolean; message: string }>('/portal/support-requests/send-magic-link', {
      project_id: this.projectId,
      user_email: userEmail,
    })
  }

  /**
   * Verify magic link token and get user's support tickets
   */
  async verifySupportToken(token: string): Promise<ApiResponse<{
    tickets: SupportRequest[]
    user_email: string
  }>> {
    return this.get<{ tickets: SupportRequest[]; user_email: string }>(
      '/portal/support-requests/verify-token',
      {
        token,
        project_id: this.projectId,
      }
    )
  }

  /**
   * Get a specific support ticket using magic link token
   */
  async getSupportTicket(
    ticketId: string,
    token: string
  ): Promise<ApiResponse<SupportRequest>> {
    return this.get<SupportRequest>(`/portal/support-requests/${ticketId}`, {
      token,
    })
  }

  /**
   * Add a message to a support ticket
   */
  async addSupportMessage(
    ticketId: string,
    token: string,
    content: string
  ): Promise<ApiResponse<{ id: string; content: string; created_at: string }>> {
    return this.post<{ id: string; content: string; created_at: string }>(
      `/portal/support-requests/${ticketId}/messages?token=${encodeURIComponent(token)}`,
      { content }
    )
  }

  // ============================================================================
  // Status Pages
  // ============================================================================

  /**
   * Get public status page overview (services, active updates, overall status)
   */
  async getPublicStatusOverview(slug = 'status'): Promise<ApiResponse<StatusPageOverview>> {
    return this.get<StatusPageOverview>(
      `/api/v1/status-pages/public/${this.projectId}/${slug}/overview`
    )
  }

  // ============================================================================
  // Surveys
  // ============================================================================

  /**
   * Get a public survey by slug
   */
  async getPublicSurvey(slug: string): Promise<ApiResponse<Survey & { nodes: SurveyNode[] }>> {
    return this.get<Survey & { nodes: SurveyNode[] }>(`/portal/surveys/${slug}`, {
      project_id: this.projectId,
    })
  }

  /**
   * Submit a survey response
   */
  async submitSurveyResponse(
    surveyId: string,
    data: SurveySubmitInput
  ): Promise<ApiResponse<SurveyResponse>> {
    return this.post<SurveyResponse>(`/portal/surveys/${surveyId}/responses`, data)
  }

  /**
   * Get survey customization settings
   */
  async getPublicSurveyCustomization(surveyId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.get<Record<string, unknown>>(`/portal/surveys/customization/${surveyId}`)
  }

  // ============================================================================
  // Contact Forms
  // ============================================================================

  /**
   * Get a public contact form by ID
   */
  async getPublicForm(formId: string): Promise<ApiResponse<ContactForm>> {
    return this.get<ContactForm>(`/api/v1/forms/${formId}`)
  }

  /**
   * Track a contact form view (call when form is displayed)
   */
  async trackContactFormView(formId: string): Promise<ApiResponse<{ tracked: boolean }>> {
    const endpoint = `/projects/${this.projectId}/contact-forms/${formId}/view`
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Handle empty or non-JSON responses gracefully
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // If response is OK but not JSON, assume success
        if (response.ok) {
          return { success: true, data: { tracked: true } }
        }
        return {
          success: false,
          error: { code: 'INVALID_RESPONSE', message: 'Invalid response from server' },
        }
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: String(response.status),
            message: data.message || data.error || 'An error occurred',
          },
        }
      }

      // Handle both wrapped and unwrapped responses
      if (data && typeof data === 'object' && 'success' in data) {
        return data
      }

      return { success: true, data: { tracked: true } }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }

  /**
   * Submit a contact form
   */
  async submitContactForm(
    projectId: string,
    formId: string,
    data: ContactFormSubmitInput
  ): Promise<ApiResponse<ContactFormSubmission>> {
    return this.post<ContactFormSubmission>(
      `/api/v1/projects/${projectId}/contact-forms/${formId}/submit`,
      data
    )
  }

  // ============================================================================
  // Page Data (Combined)
  // ============================================================================

  /**
   * Get all public page data in one request
   */
  async getPageData(): Promise<ApiResponse<{
    project?: unknown
    customization_data?: unknown
    wishes?: Wish[]
    total_wishes?: number
    categories?: unknown[]
  }>> {
    const params: Record<string, string> = {
      project_id: this.projectId,
    }

    if (this.orgSlug) params.org_slug = this.orgSlug
    if (this.projectSlug) params.project_slug = this.projectSlug

    return this.get('/portal/page-data', params)
  }

  // ============================================================================
  // Blog / Resources
  // ============================================================================

  /**
   * Get public blog posts with optional filters
   */
  async getBlogPosts(filters?: BlogFilters): Promise<ApiResponse<BlogPostsResponse>> {
    const params: Record<string, string> = {
      project_id: this.projectId,
    }

    if (filters?.category_slug) params.category_slug = filters.category_slug
    if (filters?.tag) params.tag = filters.tag
    if (filters?.search) params.search = filters.search
    if (filters?.is_featured !== undefined) params.is_featured = String(filters.is_featured)
    if (filters?.page) params.page = String(filters.page)
    if (filters?.per_page) params.per_page = String(filters.per_page)

    // The API returns { success, data: [...posts], total, page, per_page, total_pages }
    // We need to transform this to { success, data: { data: [...posts], total, ... } }
    const rawResponse = await this.requestRaw<{
      success: boolean
      data: BlogPost[]
      total: number
      page: number
      per_page: number
      total_pages: number
      error?: { code: string; message: string }
    }>('/portal/blog/posts', params)

    if (!rawResponse.success) {
      return {
        success: false,
        error: rawResponse.error,
      }
    }

    return {
      success: true,
      data: {
        data: rawResponse.data || [],
        total: rawResponse.total || 0,
        page: rawResponse.page || 1,
        per_page: rawResponse.per_page || 10,
        total_pages: rawResponse.total_pages || 1,
      },
    }
  }

  /**
   * Get a single blog post by slug
   */
  async getBlogPost(slug: string): Promise<ApiResponse<BlogPost>> {
    return this.get<BlogPost>(`/portal/blog/posts/${slug}`, {
      project_id: this.projectId,
    })
  }

  /**
   * Get featured blog posts
   */
  async getFeaturedBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return this.get<BlogPost[]>('/portal/blog/featured', {
      project_id: this.projectId,
    })
  }

  /**
   * Get blog categories
   */
  async getBlogCategories(): Promise<ApiResponse<BlogCategory[]>> {
    return this.get<BlogCategory[]>('/portal/blog/categories', {
      project_id: this.projectId,
    })
  }

  /**
   * Get blog posts by category slug
   */
  async getBlogPostsByCategory(
    categorySlug: string,
    options?: { page?: number; per_page?: number }
  ): Promise<ApiResponse<BlogPostsResponse>> {
    const params: Record<string, string> = {
      project_id: this.projectId,
    }
    if (options?.page) params.page = String(options.page)
    if (options?.per_page) params.per_page = String(options.per_page)

    // The API returns { success, data: [...posts], total, page, per_page, total_pages }
    const rawResponse = await this.requestRaw<{
      success: boolean
      data: BlogPost[]
      total: number
      page: number
      per_page: number
      total_pages: number
      error?: { code: string; message: string }
    }>(`/portal/blog/categories/${categorySlug}`, params)

    if (!rawResponse.success) {
      return {
        success: false,
        error: rawResponse.error,
      }
    }

    return {
      success: true,
      data: {
        data: rawResponse.data || [],
        total: rawResponse.total || 0,
        page: rawResponse.page || 1,
        per_page: rawResponse.per_page || 10,
        total_pages: rawResponse.total_pages || 1,
      },
    }
  }

  /**
   * Get blog posts by tag
   */
  async getBlogPostsByTag(
    tag: string,
    options?: { page?: number; per_page?: number }
  ): Promise<ApiResponse<BlogPostsResponse>> {
    const params: Record<string, string> = {
      project_id: this.projectId,
    }
    if (options?.page) params.page = String(options.page)
    if (options?.per_page) params.per_page = String(options.per_page)

    // The API returns { success, data: [...posts], total, page, per_page, total_pages }
    const rawResponse = await this.requestRaw<{
      success: boolean
      data: BlogPost[]
      total: number
      page: number
      per_page: number
      total_pages: number
      error?: { code: string; message: string }
    }>(`/portal/blog/tags/${tag}`, params)

    if (!rawResponse.success) {
      return {
        success: false,
        error: rawResponse.error,
      }
    }

    return {
      success: true,
      data: {
        data: rawResponse.data || [],
        total: rawResponse.total || 0,
        page: rawResponse.page || 1,
        per_page: rawResponse.per_page || 10,
        total_pages: rawResponse.total_pages || 1,
      },
    }
  }

  /**
   * Search blog posts
   */
  async searchBlogPosts(
    query: string,
    options?: { page?: number; per_page?: number }
  ): Promise<ApiResponse<BlogPostsResponse>> {
    const params: Record<string, string> = {
      project_id: this.projectId,
      q: query,
    }
    if (options?.page) params.page = String(options.page)
    if (options?.per_page) params.per_page = String(options.per_page)

    // The API returns { success, data: [...posts], total, page, per_page, total_pages }
    const rawResponse = await this.requestRaw<{
      success: boolean
      data: BlogPost[]
      total: number
      page: number
      per_page: number
      total_pages: number
      error?: { code: string; message: string }
    }>('/portal/blog/search', params)

    if (!rawResponse.success) {
      return {
        success: false,
        error: rawResponse.error,
      }
    }

    return {
      success: true,
      data: {
        data: rawResponse.data || [],
        total: rawResponse.total || 0,
        page: rawResponse.page || 1,
        per_page: rawResponse.per_page || 10,
        total_pages: rawResponse.total_pages || 1,
      },
    }
  }

  /**
   * Get related blog posts for a given post
   */
  async getRelatedBlogPosts(slug: string): Promise<ApiResponse<BlogPost[]>> {
    return this.get<BlogPost[]>(`/portal/blog/posts/${slug}/related`, {
      project_id: this.projectId,
    })
  }
}
