/**
 * ContactFormRenderer Component
 *
 * Renders a contact form based on its field configuration.
 * Supports: text, email, textarea, select, radio, checkbox fields with validation.
 */

import React, { useState, useCallback } from 'react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useContactForm, useContactFormSubmit } from '../../hooks/useContactForm'
import type { ContactFormField } from '../../types'

export interface ContactFormRendererProps {
  /**
   * Form ID to load
   */
  formId: string

  /**
   * Project ID for submission
   */
  projectId: string

  /**
   * Optional title override
   */
  title?: string

  /**
   * Optional description override
   */
  description?: string

  /**
   * Called when the form is submitted successfully
   */
  onSuccess?: () => void

  /**
   * Called on submission error
   */
  onError?: (error: string) => void

  /**
   * Custom class name
   */
  className?: string
}

export function ContactFormRenderer({
  formId,
  projectId,
  title,
  description,
  onSuccess,
  onError,
  className,
}: ContactFormRendererProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const { form, isLoading, error: fetchError } = useContactForm(formId)
  const {
    submitForm,
    isSubmitting,
    error: submitError,
    successMessage,
    validateField,
    clearMessages,
  } = useContactFormSubmit({
    onSuccess: () => onSuccess?.(),
    onError,
  })

  const [formData, setFormData] = useState<Record<string, string | boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  const handleFieldChange = useCallback((fieldId: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    setFieldErrors(prev => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    // Validate all fields
    const errors: Record<string, string> = {}
    for (const field of form.fields) {
      const value = formData[field.id]
      if (field.type === 'checkbox') continue // checkboxes are boolean
      const error = validateField(String(value || ''), field)
      if (error) errors[field.id] = error
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    const result = await submitForm(projectId, formId, { data: formData })
    if (result) {
      setFormData({})
      setFieldErrors({})
    }
  }, [form, formData, validateField, submitForm, projectId, formId])

  // Success state
  if (successMessage) {
    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        <div
          className="rounded-lg border p-8 text-center"
          style={{
            backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.7)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: `${Math.min(borderRadius, 12)}px`,
          }}
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ backgroundColor: '#10b98115' }}
          >
            <svg className="w-8 h-8" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--appgram-foreground)' }}
          >
            {form?.successMessage || 'Thank You'}
          </h2>
          <p
            className="text-base mb-6"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            {successMessage}
          </p>
          <button
            onClick={clearMessages}
            className="px-6 py-3 text-white font-medium transition-all hover:shadow-lg"
            style={{
              backgroundColor: primaryColor,
              borderRadius: `${Math.min(borderRadius, 12)}px`,
            }}
          >
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('max-w-2xl mx-auto flex items-center justify-center py-12', className)}>
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  // Error state
  if (fetchError) {
    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        <div
          className="p-4 text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            borderRadius: `${Math.min(borderRadius, 8)}px`,
          }}
        >
          {fetchError}
        </div>
      </div>
    )
  }

  if (!form) return <div />

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Header */}
      {(title || form.name) && (
        <div className="mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--appgram-foreground)' }}
          >
            {title || form.name}
          </h1>
          {(description || form.description) && (
            <p
              className="text-base"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
            >
              {description || form.description}
            </p>
          )}
        </div>
      )}

      {/* Form Card */}
      <div
        className="rounded-lg border p-6"
        style={{
          backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.7)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: `${Math.min(borderRadius, 12)}px`,
        }}
      >
        {/* Submit Error */}
        {submitError && (
          <div
            className="p-3 text-sm mb-4"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              borderRadius: `${Math.min(borderRadius, 8)}px`,
            }}
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {form.fields.map((field) => (
            <FormFieldInput
              key={field.id}
              field={field}
              value={formData[field.id]}
              error={fieldErrors[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              primaryColor={primaryColor}
              borderRadius={borderRadius}
              isDark={isDark}
            />
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
            style={{
              backgroundColor: primaryColor,
              borderRadius: `${Math.min(borderRadius, 8)}px`,
            }}
          >
            {isSubmitting ? 'Submitting...' : (form.submitButtonText || 'Submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// FormFieldInput - Renders individual form fields
// ============================================================================

function FormFieldInput({
  field,
  value,
  error,
  onChange,
  primaryColor,
  borderRadius,
  isDark,
}: {
  field: ContactFormField
  value: string | boolean | undefined
  error?: string
  onChange: (value: string | boolean) => void
  primaryColor: string
  borderRadius: number
  isDark: boolean
}): React.ReactElement {
  const inputStyles = {
    backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
    borderColor: error ? '#dc2626' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
    color: 'var(--appgram-foreground)',
    borderRadius: `${Math.min(borderRadius, 8)}px`,
  }

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <label className="text-sm font-medium" style={{ color: 'var(--appgram-foreground)' }}>
          {field.label}
          {field.required && <span style={{ color: '#dc2626' }}> *</span>}
        </label>
      )}

      {field.type === 'text' && (
        <input
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
          style={inputStyles}
        />
      )}

      {field.type === 'email' && (
        <input
          type="email"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'you@example.com'}
          required={field.required}
          className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
          style={inputStyles}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={4}
          className="w-full px-4 py-3 text-sm border focus:outline-none focus:ring-2 resize-none transition-all"
          style={inputStyles}
        />
      )}

      {field.type === 'select' && (
        <select
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all appearance-none"
          style={inputStyles}
        >
          <option value="">{field.placeholder || 'Select an option'}</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div className="space-y-2">
          {(field.options || []).map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 px-4 py-3 text-sm border cursor-pointer transition-all"
              style={{
                backgroundColor: value === opt ? `${primaryColor}15` : 'transparent',
                borderColor: value === opt ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                color: 'var(--appgram-foreground)',
                borderRadius: `${Math.min(borderRadius, 8)}px`,
              }}
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: value === opt ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'),
                }}
              >
                {value === opt && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                )}
              </div>
              {opt}
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <label
          className="flex items-center gap-3 cursor-pointer"
          style={{ color: 'var(--appgram-foreground)' }}
        >
          <div
            className="w-4 h-4 border rounded flex items-center justify-center shrink-0 cursor-pointer"
            style={{
              borderColor: value ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'),
              backgroundColor: value ? primaryColor : 'transparent',
            }}
            onClick={() => onChange(!value)}
          >
            {value && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm" onClick={() => onChange(!value)}>
            {field.label}
            {field.required && <span style={{ color: '#dc2626' }}> *</span>}
          </span>
        </label>
      )}

      {error && (
        <p className="text-xs" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}
    </div>
  )
}
