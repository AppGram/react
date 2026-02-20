/**
 * Customization & Theme Types
 */

export interface CustomColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  cardBackground?: string
  cardText?: string
  navbarBackground?: string
  navbarText?: string
  // Hazel design system tokens
  muted?: string
  mutedForeground?: string
  border?: string
  // Semantic status colors
  success?: string
  successSubtle?: string
  warning?: string
  warningSubtle?: string
  info?: string
  infoSubtle?: string
}

export interface CustomTypography {
  fontFamily?: string
  fontSizes?: {
    h1: number
    h2: number
    h3: number
    h4: number
    body: number
    small: number
  }
}

/**
 * Theme mode - 'light', 'dark', or 'system' (follows OS preference)
 */
export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppgramTheme {
  /**
   * Theme mode - 'light', 'dark', or 'system' (default: 'system')
   */
  mode?: ThemeMode
  /**
   * Light mode colors (used when mode is 'light' or system is light)
   */
  colors?: Partial<CustomColors>
  /**
   * Dark mode colors (used when mode is 'dark' or system is dark)
   * If not provided, will auto-generate from light colors
   */
  darkColors?: Partial<CustomColors>
  typography?: Partial<CustomTypography>
  borderRadius?: number
}

export interface LayoutConfig {
  borderRadius?: number
  cardStyle?: {
    color?: string
    textColor?: string
    shadow?: 'none' | 'sm' | 'md' | 'lg'
  }
}
