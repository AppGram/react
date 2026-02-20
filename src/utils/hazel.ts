/**
 * Hazel Design System Utilities
 *
 * Design tokens and utilities for the Hazel-inspired design system.
 * Emphasizes clean solid backgrounds, fast transitions, and semantic colors.
 */

/**
 * Animation durations in milliseconds
 */
export const HAZEL_DURATION = {
  /** Instant feedback (100ms) */
  micro: 100,
  /** Hover states, small transitions (150ms) */
  fast: 150,
  /** Modals, panels (200ms) */
  normal: 200,
  /** Page transitions (300ms) */
  slow: 300,
} as const

/**
 * Animation durations as seconds for framer-motion
 */
export const HAZEL_DURATION_SECONDS = {
  micro: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
} as const

/**
 * Easing curves as cubic-bezier arrays for framer-motion
 */
export const HAZEL_EASING = {
  /** Default for most transitions */
  outCubic: [0.33, 1, 0.68, 1] as const,
  /** For more dramatic easing */
  outQuart: [0.25, 1, 0.5, 1] as const,
  /** For symmetrical animations */
  inOutCubic: [0.65, 0, 0.35, 1] as const,
} as const

/**
 * Border radius values in pixels
 */
export const HAZEL_RADIUS = {
  /** Small elements (badges, chips) */
  sm: 2,
  /** Buttons, inputs */
  md: 6,
  /** Cards, containers (default) */
  lg: 8,
  /** Large cards, modals */
  xl: 12,
  /** Feature sections */
  '2xl': 16,
} as const

/**
 * Default Hazel transition for framer-motion
 */
export const hazelTransition = {
  duration: HAZEL_DURATION_SECONDS.fast,
  ease: HAZEL_EASING.outCubic,
}

/**
 * Hazel entrance animation variants for framer-motion
 */
export const hazelFadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: hazelTransition,
}

/**
 * Hazel scale entrance for cards
 */
export const hazelScaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: hazelTransition,
}

/**
 * Staggered animation delay calculator
 * @param index - Item index in list
 * @param baseDelay - Base delay before first item (default: 0)
 * @param stagger - Delay between items (default: 0.03s)
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0,
  stagger: number = 0.03
): number {
  return baseDelay + index * stagger
}

/**
 * CSS transition string for Tailwind-style inline usage
 */
export const hazelCssTransition = `all ${HAZEL_DURATION.fast}ms cubic-bezier(0.33, 1, 0.68, 1)`
