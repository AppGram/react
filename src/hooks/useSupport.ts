/**
 * useSupport Hook
 *
 * Manages support ticket submissions and access.
 */

import { useState, useCallback } from 'react'
import { useAppgramContext } from '../provider/context'
import { getErrorMessage } from '../utils'
import type { SupportRequest, SupportRequestInput } from '../types'

export interface UseSupportOptions {
  /**
   * Callback when a ticket is successfully submitted
   */
  onSubmitSuccess?: (ticket: SupportRequest) => void

  /**
   * Callback when a submission fails
   */
  onSubmitError?: (error: string) => void
}

export interface UseSupportResult {
  /**
   * Loading state for ticket submission
   */
  isSubmitting: boolean

  /**
   * Loading state for magic link request
   */
  isSendingMagicLink: boolean

  /**
   * Loading state for token verification
   */
  isVerifying: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Success message after submitting
   */
  successMessage: string | null

  /**
   * Submit a new support ticket
   */
  submitTicket: (data: SupportRequestInput) => Promise<SupportRequest | null>

  /**
   * Request a magic link to access tickets
   */
  requestMagicLink: (email: string) => Promise<boolean>

  /**
   * Verify a magic link token
   */
  verifyToken: (token: string) => Promise<{
    tickets: SupportRequest[]
    userEmail: string
  } | null>

  /**
   * Get a specific ticket by ID with token
   */
  getTicket: (ticketId: string, token: string) => Promise<SupportRequest | null>

  /**
   * Add a message to a ticket
   */
  addMessage: (
    ticketId: string,
    token: string,
    content: string
  ) => Promise<{ id: string; content: string; created_at: string } | null>

  /**
   * Clear any error or success messages
   */
  clearMessages: () => void
}

export function useSupport(options: UseSupportOptions = {}): UseSupportResult {
  const { client } = useAppgramContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const submitTicket = useCallback(
    async (data: SupportRequestInput): Promise<SupportRequest | null> => {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const response = await client.submitSupportRequest(data)

        if (response.success && response.data) {
          setSuccessMessage('Your support request has been submitted successfully.')
          options.onSubmitSuccess?.(response.data)
          return response.data
        } else {
          const errorMsg = getErrorMessage(response.error, 'Failed to submit support request')
          setError(errorMsg)
          options.onSubmitError?.(errorMsg)
          return null
        }
      } catch (err) {
        const errorMsg = getErrorMessage(err, 'An error occurred')
        setError(errorMsg)
        options.onSubmitError?.(errorMsg)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [client, options]
  )

  const requestMagicLink = useCallback(
    async (email: string): Promise<boolean> => {
      setIsSendingMagicLink(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const response = await client.sendSupportMagicLink(email)

        if (response.success) {
          setSuccessMessage('A magic link has been sent to your email.')
          return true
        } else {
          setError(getErrorMessage(response.error, 'Failed to send magic link'))
          return false
        }
      } catch (err) {
        setError(getErrorMessage(err, 'An error occurred'))
        return false
      } finally {
        setIsSendingMagicLink(false)
      }
    },
    [client]
  )

  const verifyToken = useCallback(
    async (
      token: string
    ): Promise<{ tickets: SupportRequest[]; userEmail: string } | null> => {
      setIsVerifying(true)
      setError(null)

      try {
        const response = await client.verifySupportToken(token)

        if (response.success && response.data) {
          return {
            tickets: response.data.tickets,
            userEmail: response.data.user_email,
          }
        } else {
          setError(getErrorMessage(response.error, 'Invalid or expired token'))
          return null
        }
      } catch (err) {
        setError(getErrorMessage(err, 'An error occurred'))
        return null
      } finally {
        setIsVerifying(false)
      }
    },
    [client]
  )

  const getTicket = useCallback(
    async (ticketId: string, token: string): Promise<SupportRequest | null> => {
      setError(null)

      try {
        const response = await client.getSupportTicket(ticketId, token)

        if (response.success && response.data) {
          return response.data
        } else {
          setError(getErrorMessage(response.error, 'Failed to fetch ticket'))
          return null
        }
      } catch (err) {
        setError(getErrorMessage(err, 'An error occurred'))
        return null
      }
    },
    [client]
  )

  const addMessage = useCallback(
    async (
      ticketId: string,
      token: string,
      content: string
    ): Promise<{ id: string; content: string; created_at: string } | null> => {
      setError(null)

      try {
        const response = await client.addSupportMessage(ticketId, token, content)

        if (response.success && response.data) {
          return response.data
        } else {
          setError(getErrorMessage(response.error, 'Failed to add message'))
          return null
        }
      } catch (err) {
        setError(getErrorMessage(err, 'An error occurred'))
        return null
      }
    },
    [client]
  )

  return {
    isSubmitting,
    isSendingMagicLink,
    isVerifying,
    error,
    successMessage,
    submitTicket,
    requestMagicLink,
    verifyToken,
    getTicket,
    addMessage,
    clearMessages,
  }
}
