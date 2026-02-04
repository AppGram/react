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
