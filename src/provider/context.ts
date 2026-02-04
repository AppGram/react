/**
 * Appgram Context
 */

import { createContext, useContext } from 'react'
import type { AppgramClient } from '../client/AppgramClient'
import type { AppgramTheme } from '../types'

export interface AppgramConfig {
  /**
   * Your Appgram project ID
   */
  projectId: string

  /**
   * Organization slug (used for public URLs)
   */
  orgSlug?: string

  /**
   * Project slug (used for public URLs)
   */
  projectSlug?: string

  /**
   * Optional API URL override (defaults to https://api.appgram.dev)
   */
  apiUrl?: string

  /**
   * Enable browser fingerprinting for anonymous voting
   * @default true
   */
  enableFingerprinting?: boolean

  /**
   * Theme customization
   */
  theme?: AppgramTheme
}

export interface AppgramContextValue {
  /**
   * The Appgram configuration
   */
  config: Required<Pick<AppgramConfig, 'projectId'>> & AppgramConfig

  /**
   * The API client instance
   */
  client: AppgramClient

  /**
   * Browser fingerprint for anonymous voting
   */
  fingerprint: string | null

  /**
   * Theme values
   */
  theme: AppgramTheme
}

export const AppgramContext = createContext<AppgramContextValue | null>(null)

/**
 * Hook to access the Appgram context
 * @throws Error if used outside of AppgramProvider
 */
export function useAppgramContext(): AppgramContextValue {
  const context = useContext(AppgramContext)

  if (!context) {
    throw new Error(
      'useAppgramContext must be used within an AppgramProvider. ' +
      'Make sure you have wrapped your app with <AppgramProvider>.'
    )
  }

  return context
}
