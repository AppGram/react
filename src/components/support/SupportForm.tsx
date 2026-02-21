/**
 * SupportForm Component
 *
 * Modern support form with animations for submitting and tracking support tickets.
 * Adapted from SupportModern variant.
 *
 * @example
 * ```tsx
 * import { SupportForm } from '@appgram/react'
 *
 * <SupportForm
 *   heading="Contact Support"
 *   description="We're here to help"
 *   showCategory
 *   showName
 *   showAttachments
 *   onSubmitSuccess={(ticket) => console.log('Created:', ticket.id)}
 *   onSubmitError={(error) => toast.error(error)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With status check enabled
 * <SupportForm
 *   heading="Get Help"
 *   showCheckStatus
 *   checkTitle="Check Your Tickets"
 *   checkDescription="Enter your email to find existing tickets"
 *   onCheckStatus={(email) => sendMagicLink(email)}
 * />
 * ```
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Search,
  Upload,
  FileText,
  X,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Mail,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useSupport } from '../../hooks/useSupport'
import { useContactForm } from '../../hooks/useContactForm'
import type { SupportRequestCategory, SupportRequest, ContactFormField, ContactForm } from '../../types'

// Status configuration for tickets
const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  open: { label: 'Open', color: '#3b82f6', bgColor: '#3b82f615' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bgColor: '#f59e0b15' },
  waiting_on_customer: {
    label: 'Awaiting Reply',
    color: '#8b5cf6',
    bgColor: '#8b5cf615',
  },
  resolved: { label: 'Resolved', color: '#10b981', bgColor: '#10b98115' },
  closed: { label: 'Closed', color: '#6b7280', bgColor: '#6b728015' },
}

export interface SupportFormProps {
  /**
   * Page heading
   */
  heading?: string

  /**
   * Page description
   */
  description?: string

  /**
   * Heading alignment
   * @default 'left'
   */
  headingAlignment?: 'left' | 'center' | 'right'

  /**
   * Submit section title
   */
  submitTitle?: string

  /**
   * Submit section description
   */
  submitDescription?: string

  /**
   * Check status section title
   */
  checkTitle?: string

  /**
   * Check status section description
   */
  checkDescription?: string

  /**
   * Callback when ticket is successfully submitted
   */
  onSubmitSuccess?: (ticket: SupportRequest) => void

  /**
   * Callback when submission fails
   */
  onSubmitError?: (error: string) => void

  /**
   * Callback when checking status (optional - uses magic link by default)
   */
  onCheckStatus?: (email: string) => void

  /**
   * Callback when a ticket is clicked
   */
  onTicketClick?: (ticket: SupportRequest) => void

  /**
   * Show category selector
   * @default true
   */
  showCategory?: boolean

  /**
   * Show name field
   * @default true
   */
  showName?: boolean

  /**
   * Show check status tab
   * @default true
   */
  showCheckStatus?: boolean

  /**
   * Show file attachments
   * @default true
   */
  showAttachments?: boolean

  /**
   * Submit button text
   * @default 'Send Request'
   */
  submitButtonText?: string

  /**
   * Access token for viewing tickets (from magic link)
   */
  accessToken?: string

  /**
   * Custom contact form ID to use instead of default support form.
   * When provided, fetches the form config and renders its fields dynamically.
   * The form should have integration.type = 'support' to create tickets.
   */
  customFormId?: string

  /**
   * Custom class name
   */
  className?: string
}

const categoryOptions: { value: SupportRequestCategory; label: string }[] = [
  { value: 'general_inquiry', label: 'General Inquiry' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'billing', label: 'Billing' },
  { value: 'account', label: 'Account' },
]

export function SupportForm({
  heading,
  description,
  headingAlignment = 'left',
  submitTitle = 'Submit a Request',
  submitDescription = "Describe your issue and we'll get back to you as soon as possible.",
  checkTitle = 'Check Status',
  checkDescription = 'Track the progress of your existing support requests.',
  onSubmitSuccess,
  onSubmitError,
  onCheckStatus,
  onTicketClick,
  showCategory = true,
  showName = true,
  showCheckStatus = true,
  showAttachments = true,
  submitButtonText = 'Send Request',
  accessToken,
  customFormId,
  className,
}: SupportFormProps): React.ReactElement {
  const { theme, client } = useAppgramContext()
  const {
    submitTicket,
    isSubmitting,
    error,
    successMessage,
    clearMessages,
    requestMagicLink,
    isSendingMagicLink,
    verifyToken,
    isVerifying,
  } = useSupport({
    onSubmitSuccess,
    onSubmitError,
  })

  // Auto-detect custom form from project customization
  // Store the actual form object, not just the ID (like BetterApp does)
  const [customForm, setCustomForm] = useState<ContactForm | null>(null)
  const [isLoadingCustomization, setIsLoadingCustomization] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch project customization to get support form config
  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const response = await client.getPageData()

        if (response.success && response.data?.customization_data) {
          const customizationData = response.data.customization_data as {
            content?: { support?: { customFormId?: string } }
            contactForms?: Record<string, ContactForm & { integration?: { type: string } }>
          }

          console.log('[SupportForm] Customization data:', {
            hasContent: !!customizationData.content,
            supportConfig: customizationData.content?.support,
            contactFormsKeys: customizationData.contactForms ? Object.keys(customizationData.contactForms) : [],
          })

          const contactForms = customizationData.contactForms || {}

          // Check for explicit customFormId in content.support
          const explicitFormId = customizationData.content?.support?.customFormId
          if (explicitFormId && contactForms[explicitFormId]) {
            const form = contactForms[explicitFormId]
            if (form.enabled && form.integration?.type === 'support') {
              console.log('[SupportForm] Using configured custom form:', explicitFormId, form.name)
              setCustomForm(form as ContactForm)
              setIsLoadingCustomization(false)
              return
            }
          }

          // Auto-detect: find any enabled form with integration.type = 'support'
          if (Object.keys(contactForms).length > 0) {
            // Filter for actual form objects (have fields array and name property)
            const formEntries = Object.entries(contactForms).filter(([_, form]) => {
              if (!form || typeof form !== 'object') return false
              if (!('fields' in form) || !Array.isArray(form.fields)) return false
              if (!('name' in form)) return false
              return true
            })

            console.log('[SupportForm] Valid form entries:', formEntries.map(([k, f]) => ({ id: k, name: (f as ContactForm).name })))

            const supportFormEntry = formEntries.find(([_, form]) => {
              return form.enabled && form.integration?.type === 'support'
            })

            if (supportFormEntry) {
              const [formId, form] = supportFormEntry
              console.log('[SupportForm] Auto-detected support form:', formId, form.name)
              setCustomForm(form as ContactForm)
            } else {
              console.log('[SupportForm] No support form found, using default')
            }
          } else {
            console.log('[SupportForm] No contactForms in customization, using default')
          }
        } else {
          console.log('[SupportForm] No customization data, using default')
        }
      } catch (err) {
        console.log('[SupportForm] Failed to fetch customization:', err)
        setFormError('Failed to load form configuration')
      } finally {
        setIsLoadingCustomization(false)
      }
    }

    // Only auto-fetch if no explicit customFormId provided
    if (!customFormId) {
      fetchCustomization()
    } else {
      setIsLoadingCustomization(false)
    }
  }, [client, customFormId])

  // If explicit customFormId prop is provided, fetch that form via API
  const {
    form: fetchedForm,
    isLoading: isLoadingForm,
    error: fetchError,
  } = useContactForm(customFormId || '', { enabled: !!customFormId })

  // Use fetched form if customFormId prop was provided, otherwise use auto-detected form
  const effectiveForm = customFormId ? fetchedForm : customForm
  const effectiveFormError = customFormId ? fetchError : formError
  const isLoadingEffectiveForm = customFormId ? isLoadingForm : false

  // Log which form is being used
  useEffect(() => {
    if (isLoadingCustomization) {
      console.log('[SupportForm] Loading project customization...')
      return
    }

    if (effectiveForm) {
      console.log('[SupportForm] Using custom form:', {
        id: effectiveForm.id,
        name: effectiveForm.name,
        fields: effectiveForm.fields.length,
        integration: effectiveForm.integration,
        source: customFormId ? 'explicit prop (fetched)' : 'auto-detected from customization',
      })
    } else if (effectiveFormError) {
      console.log('[SupportForm] Custom form error:', effectiveFormError)
    } else {
      console.log('[SupportForm] Using default support form')
    }
  }, [effectiveForm, effectiveFormError, isLoadingCustomization, customFormId])

  const [activeTab, setActiveTab] = useState<'submit' | 'check'>('submit')
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    user_email: '',
    user_name: '',
    category: 'general_inquiry' as SupportRequestCategory,
  })
  // State for custom form fields
  const [customFormData, setCustomFormData] = useState<Record<string, string | boolean>>({})
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({})
  const [checkEmail, setCheckEmail] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [tickets, setTickets] = useState<SupportRequest[]>([])
  const [ticketsEmail, setTicketsEmail] = useState('')
  const [showingTickets, setShowingTickets] = useState(false)

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Validate a custom form field
  const validateCustomField = (
    value: string | boolean | undefined,
    field: ContactFormField
  ): string | null => {
    if (field.type === 'checkbox') {
      if (field.required && !value) return 'This field is required'
      return null
    }
    const strValue = String(value || '')
    if (field.required && !strValue.trim()) return 'This field is required'
    if (field.type === 'email' && strValue) {
      if (!isValidEmail(strValue)) return 'Please enter a valid email'
    }
    if (field.validation) {
      if (field.validation.minLength && strValue.length < field.validation.minLength) {
        return `Must be at least ${field.validation.minLength} characters`
      }
      if (field.validation.maxLength && strValue.length > field.validation.maxLength) {
        return `Must be no more than ${field.validation.maxLength} characters`
      }
    }
    return null
  }

  // Handle custom form field changes
  const handleCustomFieldChange = (fieldId: string, value: string | boolean) => {
    setCustomFormData(prev => ({ ...prev, [fieldId]: value }))
    setCustomFieldErrors(prev => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    // Handle custom form submission
    if (effectiveForm) {
      // Validate all custom form fields
      const errors: Record<string, string> = {}
      let emailField = ''
      let subjectField = ''
      let descriptionField = ''

      for (const field of effectiveForm.fields) {
        const value = customFormData[field.id]
        const error = validateCustomField(value, field)
        if (error) errors[field.id] = error

        // Try to identify email, subject, description fields by label/type
        const labelLower = field.label.toLowerCase()
        if (field.type === 'email' || labelLower.includes('email')) {
          emailField = String(value || '')
        } else if (labelLower.includes('subject') || labelLower.includes('title')) {
          subjectField = String(value || '')
        } else if (field.type === 'textarea' || labelLower.includes('description') || labelLower.includes('message')) {
          descriptionField = String(value || '')
        }
      }

      if (Object.keys(errors).length > 0) {
        setCustomFieldErrors(errors)
        return
      }

      // Build description from all form fields if not found
      if (!descriptionField) {
        descriptionField = effectiveForm.fields
          .map(f => `${f.label}: ${customFormData[f.id] || ''}`)
          .join('\n')
      }

      // Use first text field as subject if not found
      if (!subjectField) {
        const firstTextField = effectiveForm.fields.find(f => f.type === 'text')
        if (firstTextField) {
          subjectField = String(customFormData[firstTextField.id] || effectiveForm.name)
        } else {
          subjectField = effectiveForm.name
        }
      }

      // Email is required
      if (!emailField || !isValidEmail(emailField)) {
        const emailFieldDef = effectiveForm.fields.find(f => f.type === 'email')
        if (emailFieldDef) {
          setCustomFieldErrors({ [emailFieldDef.id]: 'Valid email is required' })
        }
        return
      }

      const result = await submitTicket({
        subject: subjectField,
        description: descriptionField,
        user_email: emailField,
        attachments: showAttachments && attachments.length > 0 ? attachments : undefined,
      })

      if (result) {
        setCustomFormData({})
        setCustomFieldErrors({})
        setAttachments([])
      }
      return
    }

    // Default form submission
    if (!isValidEmail(formData.user_email)) return

    const result = await submitTicket({
      subject: formData.subject,
      description: formData.description,
      user_email: formData.user_email,
      user_name: showName ? formData.user_name : undefined,
      category: showCategory ? formData.category : undefined,
      attachments: showAttachments && attachments.length > 0 ? attachments : undefined,
    })

    if (result) {
      setFormData({
        subject: '',
        description: '',
        user_email: '',
        user_name: '',
        category: 'general_inquiry',
      })
      setAttachments([])
    }
  }

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkEmail || !isValidEmail(checkEmail)) return

    // If custom handler provided, use it
    if (onCheckStatus) {
      onCheckStatus(checkEmail)
      return
    }

    // Otherwise use magic link flow
    const success = await requestMagicLink(checkEmail)
    if (success) {
      setMagicLinkSent(true)
    }
  }

  // Verify token on mount if provided
  React.useEffect(() => {
    if (accessToken) {
      verifyToken(accessToken).then((result) => {
        if (result) {
          setTickets(result.tickets)
          setTicketsEmail(result.userEmail)
          setShowingTickets(true)
          setActiveTab('check')
        }
      })
    }
  }, [accessToken, verifyToken])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Success state
  if (successMessage) {
    return (
      <div className={cn('max-w-3xl mx-auto', className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ backgroundColor: '#10b98115' }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: '#10b981' }} />
          </div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--appgram-foreground)' }}
          >
            Request Submitted
          </h2>
          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            We've received your request and will get back to you at {formData.user_email || 'your email'}.
          </p>
          <button
            onClick={clearMessages}
            className="px-6 py-3 text-white font-medium transition-all hover:shadow-lg"
            style={{
              backgroundColor: primaryColor,
              borderRadius: `${Math.min(borderRadius, 12)}px`,
            }}
          >
            Submit Another Request
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      {/* Page Header */}
      {(heading || description) && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
          style={{ textAlign: headingAlignment }}
        >
          {heading && (
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--appgram-foreground)', lineHeight: 1.2 }}
            >
              {heading}
            </h1>
          )}
          {description && (
            <p
              className="text-base md:text-lg leading-relaxed max-w-2xl"
              style={{
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                marginLeft: headingAlignment === 'center' ? 'auto' : 0,
                marginRight: headingAlignment === 'center' ? 'auto' : 0,
              }}
            >
              {description}
            </p>
          )}
        </motion.header>
      )}

      {/* Tab Switcher */}
      {showCheckStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-1 p-1 rounded-lg mb-8 max-w-xs"
          style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' }}
        >
          <button
            onClick={() => setActiveTab('submit')}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'submit' ? (isDark ? 'var(--appgram-card)' : 'white') : 'transparent',
              color: activeTab === 'submit' ? 'var(--appgram-foreground)' : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'),
              boxShadow: activeTab === 'submit' ? (isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)') : 'none',
            }}
          >
            Submit Request
          </button>
          <button
            onClick={() => setActiveTab('check')}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'check' ? (isDark ? 'var(--appgram-card)' : 'white') : 'transparent',
              color: activeTab === 'check' ? 'var(--appgram-foreground)' : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'),
              boxShadow: activeTab === 'check' ? (isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)') : 'none',
            }}
          >
            Check Status
          </button>
        </motion.div>
      )}

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {activeTab === 'submit' ? (
          <div
            className="rounded-lg border p-6"
            style={{
              backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: `${Math.min(borderRadius, 12)}px`,
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <MessageSquare
                  className="w-5 h-5"
                  style={{ color: primaryColor }}
                />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ color: 'var(--appgram-foreground)' }}
                >
                  {effectiveForm?.name || submitTitle}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
                >
                  {effectiveForm?.description || submitDescription}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {(error || effectiveFormError) && (
              <div
                className="p-3 text-sm mb-4"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  borderRadius: `${Math.min(borderRadius, 8)}px`,
                }}
              >
                {error || effectiveFormError}
              </div>
            )}

            {/* Loading state for customization or custom form */}
            {(isLoadingCustomization || isLoadingEffectiveForm) && (
              <div className="flex items-center justify-center py-12">
                <div
                  className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
                />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Custom Form Fields */}
              {effectiveForm && !isLoadingEffectiveForm && !isLoadingCustomization && (
                <>
                  {effectiveForm.fields.map((field) => (
                    <CustomFormFieldInput
                      key={field.id}
                      field={field}
                      value={customFormData[field.id]}
                      error={customFieldErrors[field.id]}
                      onChange={(value) => handleCustomFieldChange(field.id, value)}
                      primaryColor={primaryColor}
                      borderRadius={borderRadius}
                      isDark={isDark}
                    />
                  ))}
                </>
              )}

              {/* Default Form Fields - only show if no custom form and done loading */}
              {!effectiveForm && !isLoadingCustomization && !isLoadingEffectiveForm && (
                <>
              {/* Name Field */}
              {showName && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--appgram-foreground)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="user_name"
                    placeholder="Your name"
                    value={formData.user_name}
                    onChange={handleChange}
                    className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      color: 'var(--appgram-foreground)',
                      borderRadius: `${Math.min(borderRadius, 8)}px`,
                    }}
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--appgram-foreground)' }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  name="user_email"
                  placeholder="you@example.com"
                  value={formData.user_email}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: 'var(--appgram-foreground)',
                    borderRadius: `${Math.min(borderRadius, 8)}px`,
                  }}
                />
              </div>

              {/* Category Field */}
              {showCategory && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--appgram-foreground)' }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all appearance-none"
                    style={{
                      backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      color: 'var(--appgram-foreground)',
                      borderRadius: `${Math.min(borderRadius, 8)}px`,
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--appgram-foreground)' }}>
                  Subject <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: 'var(--appgram-foreground)',
                    borderRadius: `${Math.min(borderRadius, 8)}px`,
                  }}
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--appgram-foreground)' }}>
                  Message <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your issue in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 text-sm border focus:outline-none focus:ring-2 resize-none transition-all"
                  style={{
                    backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: 'var(--appgram-foreground)',
                    borderRadius: `${Math.min(borderRadius, 8)}px`,
                    }}
                  />
                </div>
                </>
              )}

              {/* Attachments */}
              {showAttachments && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--appgram-foreground)' }}>
                    Attachments (optional)
                  </label>
                  <div
                    className="border border-dashed rounded-lg p-6 text-center transition-opacity hover:opacity-70"
                    style={{
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)',
                      borderRadius: `${Math.min(borderRadius, 8)}px`,
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload
                        className="w-6 h-6 mx-auto mb-2"
                        style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                      />
                      <p
                        className="text-sm"
                        style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                      >
                        Click to upload files
                      </p>
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm"
                          style={{
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            color: 'var(--appgram-foreground)',
                          }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="transition-opacity hover:opacity-70"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
                disabled={isSubmitting || isLoadingCustomization || isLoadingEffectiveForm}
                style={{
                  backgroundColor: primaryColor,
                  borderRadius: `${Math.min(borderRadius, 8)}px`,
                }}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {effectiveForm?.submitButtonText || submitButtonText}
                  </>
                )}
              </button>
            </form>
          </div>
        ) : showingTickets ? (
          /* Ticket List View */
          <div
            className="rounded-lg border p-6"
            style={{
              backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: `${Math.min(borderRadius, 12)}px`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <MessageSquare
                    className="w-5 h-5"
                    style={{ color: primaryColor }}
                  />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold mb-1"
                    style={{ color: 'var(--appgram-foreground)' }}
                  >
                    Your Requests
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
                  >
                    {ticketsEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowingTickets(false)
                  setTickets([])
                  setMagicLinkSent(false)
                }}
                className="text-sm flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: primaryColor }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Loading State */}
            {isVerifying && (
              <div className="flex items-center justify-center py-12">
                <div
                  className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{
                    borderColor: primaryColor,
                    borderTopColor: 'transparent',
                  }}
                />
              </div>
            )}

            {/* Ticket List */}
            {!isVerifying && tickets.length > 0 && (
              <div className="space-y-3">
                <AnimatePresence>
                  {tickets.map((ticket, index) => {
                    const status =
                      statusConfig[ticket.status] || statusConfig.open
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        className="group cursor-pointer rounded-lg border p-4 transition-all"
                        style={{
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          borderRadius: `${Math.min(borderRadius, 8)}px`,
                        }}
                        onClick={() => onTicketClick?.(ticket)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: status.bgColor,
                                  color: status.color,
                                }}
                              >
                                {status.label}
                              </span>
                              {ticket.category && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                                  }}
                                >
                                  {ticket.category.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <h3
                              className="font-medium text-base mb-1 truncate transition-opacity group-hover:opacity-70"
                              style={{ color: 'var(--appgram-foreground)' }}
                            >
                              {ticket.subject}
                            </h3>
                            <p
                              className="text-sm truncate"
                              style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                            >
                              {ticket.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className="text-xs"
                              style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                            >
                              {formatDate(ticket.created_at)}
                            </span>
                            <ChevronRight
                              className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: primaryColor }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Empty State */}
            {!isVerifying && tickets.length === 0 && (
              <div className="text-center py-12">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }}
                >
                  <MessageSquare
                    className="w-6 h-6"
                    style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                  />
                </div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: 'var(--appgram-foreground)' }}
                >
                  No requests found
                </h3>
                <p
                  className="text-sm"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                >
                  You haven't submitted any support requests yet.
                </p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: primaryColor,
                    borderRadius: `${Math.min(borderRadius, 8)}px`,
                  }}
                >
                  Submit a Request
                </button>
              </div>
            )}
          </div>
        ) : magicLinkSent ? (
          /* Magic Link Sent Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border p-6 text-center"
            style={{
              backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: `${Math.min(borderRadius, 12)}px`,
            }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Mail className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--appgram-foreground)' }}
            >
              Check Your Email
            </h2>
            <p
              className="text-base leading-relaxed mb-2"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
            >
              We've sent a magic link to <strong>{checkEmail}</strong>
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
            >
              Click the link in the email to view your support requests.
            </p>
            <button
              onClick={() => {
                setMagicLinkSent(false)
                setCheckEmail('')
              }}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: primaryColor }}
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          /* Check Status Form */
          <div
            className="rounded-lg border p-6"
            style={{
              backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: `${Math.min(borderRadius, 12)}px`,
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Search className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ color: 'var(--appgram-foreground)' }}
                >
                  {checkTitle}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
                >
                  {checkDescription}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && activeTab === 'check' && (
              <div
                className="p-3 text-sm mb-4 flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  borderRadius: `${Math.min(borderRadius, 8)}px`,
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCheckStatus} className="space-y-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--appgram-foreground)' }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter the email you used to submit"
                  value={checkEmail}
                  onChange={(e) => setCheckEmail(e.target.value)}
                  required
                  className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: 'var(--appgram-foreground)',
                    borderRadius: `${Math.min(borderRadius, 8)}px`,
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
                disabled={isSendingMagicLink}
                style={{
                  backgroundColor: primaryColor,
                  borderRadius: `${Math.min(borderRadius, 8)}px`,
                }}
              >
                {isSendingMagicLink ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" style={{ color: 'white' }} />
                    Find My Requests
                  </>
                )}
              </button>
            </form>

            <div
              className="mt-6 pt-6 border-t text-center"
              style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
            >
              <HelpCircle
                className="w-6 h-6 mx-auto mb-2"
                style={{ color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
              />
              <p className="text-sm" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                You'll receive a magic link to view your tickets
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ============================================================================
// CustomFormFieldInput - Renders individual custom form fields
// ============================================================================

function CustomFormFieldInput({
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
          rows={5}
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
