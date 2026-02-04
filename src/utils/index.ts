/**
 * Utility Exports
 */

export { cn } from './cn'
export { getFingerprint, resetFingerprint } from './fingerprint'

/**
 * Safely extract error message from API response error
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message
    }
  }
  return fallback
}
