/**
 * Browser Fingerprint Utility
 *
 * Generates a unique fingerprint for anonymous voting.
 * Uses a combination of browser/device characteristics.
 */

const STORAGE_KEY = 'appgram_fingerprint'

/**
 * Hash a string using a simple algorithm
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get browser characteristics for fingerprinting
 */
function getBrowserCharacteristics(): string {
  if (typeof window === 'undefined') {
    return 'server-side'
  }

  const characteristics = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    'deviceMemory' in navigator ? (navigator as any).deviceMemory : 0,
  ]

  return characteristics.join('|')
}

/**
 * Generate a fingerprint ID
 */
function generateFingerprint(): string {
  const characteristics = getBrowserCharacteristics()
  const timestamp = Date.now().toString(36)
  const randomBytes = new Uint8Array(6)
  crypto.getRandomValues(randomBytes)
  const random = Array.from(randomBytes, b => b.toString(36)).join('').substring(0, 10)
  return `${simpleHash(characteristics)}-${timestamp}-${random}`
}

/**
 * Get or create a fingerprint for the current browser/device
 * @returns The fingerprint string
 */
export function getFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side-fingerprint'
  }

  // Try to get from localStorage
  let fingerprint = localStorage.getItem(STORAGE_KEY)

  if (!fingerprint) {
    // Generate new fingerprint
    fingerprint = generateFingerprint()
    try {
      localStorage.setItem(STORAGE_KEY, fingerprint)
    } catch {
      // localStorage might be disabled
    }
  }

  return fingerprint
}

/**
 * Reset the stored fingerprint (for testing purposes)
 */
export function resetFingerprint(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage might be disabled
  }
}
