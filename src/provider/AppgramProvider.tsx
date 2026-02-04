/**
 * AppgramProvider
 *
 * Root provider component that manages configuration, API client, and theming.
 */

import React, { useMemo, useEffect, useState } from 'react'
import { AppgramContext, type AppgramConfig } from './context'
import { AppgramClient } from '../client/AppgramClient'
import { getFingerprint } from '../utils/fingerprint'
import type { AppgramTheme, CustomColors, ThemeMode } from '../types'

export interface AppgramProviderProps {
  /**
   * Appgram configuration
   */
  config: AppgramConfig

  /**
   * Child components
   */
  children: React.ReactNode
}

const DEFAULT_API_URL = 'https://api.appgram.dev'

// Arctic Blue light theme colors
const DEFAULT_LIGHT_COLORS: CustomColors = {
  primary: '#0EA5E9',      // Arctic blue
  secondary: '#6B7280',    // Gray
  accent: '#0EA5E9',       // Arctic blue
  background: '#FFFFFF',   // White
  text: '#242424',         // Near-black
  cardBackground: '#F7F7F7',
  cardText: '#242424',
}

// Arctic Blue dark theme colors
const DEFAULT_DARK_COLORS: CustomColors = {
  primary: '#38BDF8',      // Lighter arctic blue
  secondary: '#3A3A3A',    // Dark gray (subtle for borders)
  accent: '#38BDF8',       // Lighter arctic blue
  background: '#0A0A0A',   // Near-black
  text: '#E5E5E5',         // Light gray
  cardBackground: '#1A1A1A',
  cardText: '#E5E5E5',
}

const DEFAULT_THEME: AppgramTheme = {
  mode: 'system',
  colors: DEFAULT_LIGHT_COLORS,
  darkColors: DEFAULT_DARK_COLORS,
  typography: {
    fontFamily: 'inherit',
  },
  borderRadius: 8,
}

/**
 * Detect system dark mode preference
 */
function getSystemIsDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Resolve the effective dark mode state based on theme mode setting
 */
function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return getSystemIsDark()
}

/**
 * AppgramProvider - Root provider for Appgram React SDK
 *
 * Supports automatic dark/light theme based on system preference.
 *
 * @example
 * ```tsx
 * <AppgramProvider
 *   config={{
 *     projectId: 'proj_xxx',
 *     orgSlug: 'acme',
 *     projectSlug: 'feedback',
 *     theme: {
 *       mode: 'system', // 'light' | 'dark' | 'system' (default: 'system')
 *       colors: { primary: '#0EA5E9' }, // Light mode colors
 *       darkColors: { primary: '#38BDF8' }, // Dark mode colors (optional)
 *     }
 *   }}
 * >
 *   <App />
 * </AppgramProvider>
 * ```
 */
export function AppgramProvider({
  config,
  children,
}: AppgramProviderProps): React.ReactElement {
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const themeMode = config.theme?.mode ?? 'system'
  const [isDark, setIsDark] = useState(() => resolveIsDark(themeMode))

  // Initialize fingerprint on mount (client-side only)
  useEffect(() => {
    if (config.enableFingerprinting !== false) {
      setFingerprint(getFingerprint())
    }
  }, [config.enableFingerprinting])

  // Listen for system theme changes when mode is 'system'
  useEffect(() => {
    if (themeMode !== 'system' || typeof window === 'undefined') {
      setIsDark(resolveIsDark(themeMode))
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [themeMode])

  // Create API client instance
  const client = useMemo(() => {
    return new AppgramClient({
      baseUrl: config.apiUrl || DEFAULT_API_URL,
      projectId: config.projectId,
      orgSlug: config.orgSlug,
      projectSlug: config.projectSlug,
    })
  }, [config.apiUrl, config.projectId, config.orgSlug, config.projectSlug])

  // Get light and dark colors with user overrides
  const lightColors = useMemo(() => ({
    ...DEFAULT_LIGHT_COLORS,
    ...config.theme?.colors,
  }), [config.theme?.colors])

  const darkColors = useMemo(() => ({
    ...DEFAULT_DARK_COLORS,
    ...config.theme?.darkColors,
  }), [config.theme?.darkColors])

  // Resolve current colors based on dark mode state
  const currentColors = isDark ? darkColors : lightColors

  // Merge theme with defaults
  const theme = useMemo<AppgramTheme & { isDark: boolean; currentColors: CustomColors }>(() => {
    return {
      mode: themeMode,
      colors: lightColors,
      darkColors: darkColors,
      typography: {
        ...DEFAULT_THEME.typography,
        ...config.theme?.typography,
      },
      borderRadius: config.theme?.borderRadius ?? DEFAULT_THEME.borderRadius,
      // Include resolved state for components
      isDark,
      currentColors,
    }
  }, [themeMode, lightColors, darkColors, config.theme?.typography, config.theme?.borderRadius, isDark, currentColors])

  // Context value
  const contextValue = useMemo(() => ({
    config: {
      ...config,
      apiUrl: config.apiUrl || DEFAULT_API_URL,
    },
    client,
    fingerprint,
    theme,
  }), [config, client, fingerprint, theme])

  // Inject CSS custom properties for theming
  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const colors = currentColors

    // Set dark mode attribute for CSS targeting
    root.setAttribute('data-appgram-theme', isDark ? 'dark' : 'light')

    if (colors.primary) root.style.setProperty('--appgram-primary', colors.primary)
    if (colors.secondary) root.style.setProperty('--appgram-secondary', colors.secondary)
    if (colors.accent) root.style.setProperty('--appgram-accent', colors.accent)
    if (colors.background) root.style.setProperty('--appgram-background', colors.background)
    if (colors.text) root.style.setProperty('--appgram-foreground', colors.text)
    if (colors.cardBackground) root.style.setProperty('--appgram-card', colors.cardBackground)
    if (colors.cardText) root.style.setProperty('--appgram-card-foreground', colors.cardText)
    if (theme.borderRadius) root.style.setProperty('--appgram-radius', `${theme.borderRadius}px`)
    if (theme.typography?.fontFamily) root.style.setProperty('--appgram-font-family', theme.typography.fontFamily)
  }, [currentColors, isDark, theme.borderRadius, theme.typography?.fontFamily])

  return (
    <AppgramContext.Provider value={contextValue}>
      {children}
    </AppgramContext.Provider>
  )
}
