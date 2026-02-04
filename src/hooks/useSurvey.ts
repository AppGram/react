/**
 * useSurvey Hook
 *
 * Fetches and manages survey data and response submission.
 */

import { useState, useCallback, useEffect } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { Survey, SurveyNode, SurveyResponse, SurveySubmitInput } from '../types'

// ============================================================================
// useSurvey - Fetch survey by slug
// ============================================================================

export interface UseSurveyOptions {
  /**
   * Whether to fetch the survey immediately
   * @default true
   */
  enabled?: boolean
}

export interface UseSurveyResult {
  survey: Survey | null
  nodes: SurveyNode[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSurvey(slug: string, options: UseSurveyOptions = {}): UseSurveyResult {
  const { enabled = true } = options
  const { client } = useAppgramContext()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [nodes, setNodes] = useState<SurveyNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSurvey = useCallback(async () => {
    if (!slug) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getPublicSurvey(slug)

      if (response.success && response.data) {
        const { nodes: surveyNodes, ...surveyData } = response.data
        setSurvey(surveyData as Survey)
        setNodes(surveyNodes || [])
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch survey'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, slug])

  useEffect(() => {
    if (enabled) {
      fetchSurvey()
    }
  }, [enabled, fetchSurvey])

  return {
    survey,
    nodes,
    isLoading,
    error,
    refetch: fetchSurvey,
  }
}

// ============================================================================
// useSurveySubmit - Submit survey responses
// ============================================================================

export interface UseSurveySubmitOptions {
  onSuccess?: (response: SurveyResponse) => void
  onError?: (error: string) => void
}

export interface UseSurveySubmitResult {
  isSubmitting: boolean
  error: string | null
  successMessage: string | null
  submitResponse: (surveyId: string, data: SurveySubmitInput) => Promise<SurveyResponse | null>
  clearMessages: () => void
}

export function useSurveySubmit(options: UseSurveySubmitOptions = {}): UseSurveySubmitResult {
  const { client } = useAppgramContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const submitResponse = useCallback(
    async (surveyId: string, data: SurveySubmitInput): Promise<SurveyResponse | null> => {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const response = await client.submitSurveyResponse(surveyId, data)

        if (response.success && response.data) {
          setSuccessMessage('Survey response submitted successfully.')
          options.onSuccess?.(response.data)
          return response.data
        } else {
          const errorMsg = getErrorMessage(response.error, 'Failed to submit survey response')
          setError(errorMsg)
          options.onError?.(errorMsg)
          return null
        }
      } catch (err) {
        const errorMsg = getErrorMessage(err, 'An error occurred')
        setError(errorMsg)
        options.onError?.(errorMsg)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [client, options]
  )

  return {
    isSubmitting,
    error,
    successMessage,
    submitResponse,
    clearMessages,
  }
}
