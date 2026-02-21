/**
 * Contact Form Types
 *
 * Configurable contact forms for collecting user submissions.
 */

export type ContactFormFieldType = 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox'

export interface ContactFormFieldValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
}

export interface ContactFormField {
  id: string
  type: ContactFormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: ContactFormFieldValidation
}

/**
 * Contact form integration settings
 * Defines how the form submission is processed
 */
export interface ContactFormIntegration {
  /**
   * Integration type:
   * - 'support': Creates a support ticket
   * - 'wish': Creates a feature request/wish
   * - 'email': Sends email notification
   * - 'webhook': Posts to external webhook
   */
  type: 'support' | 'wish' | 'email' | 'webhook'

  /**
   * For support integration: auto-assign to team member
   */
  assigneeId?: string

  /**
   * For webhook integration: target URL
   */
  webhookUrl?: string
}

export interface ContactForm {
  id: string
  name: string
  description?: string
  fields: ContactFormField[]
  submitButtonText: string
  successMessage: string
  emailRecipient: string
  emailSubject: string
  enabled: boolean
  createdAt?: string
  updatedAt?: string

  /**
   * Integration settings for form submission
   */
  integration?: ContactFormIntegration
}

export interface ContactFormSubmission {
  id: string
  form_id: string
  project_id: string
  data: Record<string, string | boolean>
  submitted_at: string
}

export interface ContactFormSubmitInput {
  data: Record<string, string | boolean>
  metadata?: Record<string, unknown>
}
