/**
 * SubmitWishForm Component
 *
 * Sheet/modal for submitting new feature requests.
 * Adapted from FeatureRequestForm.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import type { Wish } from '../../types'

export interface SubmitWishFormProps {
  /**
   * Whether the form is open
   */
  open: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void

  /**
   * Callback when wish is successfully submitted
   */
  onSuccess?: (wish: Wish) => void

  /**
   * Callback when submission fails
   */
  onError?: (error: string) => void

  /**
   * Form title
   * @default 'Submit a Feature Request'
   */
  title?: string

  /**
   * Form description
   */
  description?: string

  /**
   * Submit button text
   * @default 'Submit Feature Request'
   */
  submitButtonText?: string

  /**
   * Custom class name
   */
  className?: string
}

interface FormData {
  title: string
  description: string
  email: string
}

export function SubmitWishForm({
  open,
  onOpenChange,
  onSuccess,
  onError,
  title = 'Submit a Feature Request',
  description = "Share your idea with us! We review all submissions and prioritize based on community feedback.",
  submitButtonText = 'Submit Feature Request',
  className,
}: SubmitWishFormProps): React.ReactElement {
  const { theme, client } = useAppgramContext()
  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const secondaryColor = theme.colors?.secondary || '#38BDF8'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({ title: '', description: '', email: '' })
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Extract author name from email or use default
      let authorName = 'Anonymous User'
      if (formData.email) {
        const emailParts = formData.email.split('@')[0]
        authorName =
          emailParts
            .split(/[._-]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ') || 'Anonymous User'
      }

      const response = await client.createWish({
        title: formData.title.trim(),
        description: formData.description.trim(),
        author_email: formData.email?.trim() || undefined,
        author_name: authorName,
      })

      if (response.success && response.data) {
        onOpenChange(false)
        onSuccess?.(response.data)
      } else {
        const errorMessage =
          response.error?.message || 'Failed to submit feature request'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 w-full sm:w-[480px] md:w-[540px] z-50 shadow-2xl flex flex-col overflow-hidden',
              className
            )}
            style={{
              borderRadius: `${borderRadius}px 0 0 ${borderRadius}px`,
              backgroundColor: isDark ? 'var(--appgram-background)' : 'white',
            }}
          >
            {/* Gradient Header */}
            <div
              className="h-1.5 flex-shrink-0"
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
              }}
            />

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors z-10"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent' }}
            >
              <X className="w-5 h-5" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }} />
            </button>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="px-8 pt-8 pb-6">
                <h2
                  className="text-2xl font-bold leading-tight mb-2"
                  style={{ color: 'var(--appgram-foreground)' }}
                >
                  {title}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
                >
                  {description}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                {/* Title Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: 'var(--appgram-foreground)' }}
                    >
                      Feature Title
                    </label>
                    <span
                      className="text-xs font-medium"
                      style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                    >
                      Required
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Add dark mode support"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full h-11 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                      borderRadius: `${Math.min(borderRadius, 12)}px`,
                      backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                      color: 'var(--appgram-foreground)',
                    }}
                  />
                  <p
                    className="text-xs mt-1"
                    style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                  >
                    Keep it concise and descriptive
                  </p>
                </motion.div>

                {/* Description Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: 'var(--appgram-foreground)' }}
                    >
                      Description
                    </label>
                    <span
                      className="text-xs font-medium"
                      style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                    >
                      Required
                    </span>
                  </div>
                  <textarea
                    placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={5}
                    className="w-full px-4 py-3 text-sm border focus:outline-none focus:ring-2 resize-none transition-all"
                    style={{
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                      borderRadius: `${Math.min(borderRadius, 12)}px`,
                      lineHeight: '1.6',
                      backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                      color: 'var(--appgram-foreground)',
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <p
                      className="text-xs"
                      style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                    >
                      Provide as much detail as possible
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{
                        color:
                          formData.description.length > 450
                            ? primaryColor
                            : (isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'),
                      }}
                    >
                      {formData.description.length}/500
                    </p>
                  </div>
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: 'var(--appgram-foreground)' }}
                    >
                      Email Address
                    </label>
                    <span
                      className="text-xs font-medium"
                      style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                    >
                      Optional
                    </span>
                  </div>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full h-11 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                      borderRadius: `${Math.min(borderRadius, 12)}px`,
                      backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                      color: 'var(--appgram-foreground)',
                    }}
                  />
                  <div className="flex items-start gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Sparkles
                        className="w-2.5 h-2.5"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                    >
                      We'll notify you when there are updates on your submission.
                    </p>
                  </div>
                </motion.div>

                {/* Separator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div
                    className="h-px"
                    style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}
                  />
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
                      {error}
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    type="submit"
                    disabled={
                      !formData.title.trim() ||
                      !formData.description.trim() ||
                      isSubmitting
                    }
                    className="w-full flex items-center justify-center gap-2.5 h-12 text-base font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius: `${borderRadius}px`,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>{submitButtonText}</span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Trust Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center justify-center gap-2"
                >
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p className="text-xs" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                    Your feedback is valuable and helps shape our product
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
