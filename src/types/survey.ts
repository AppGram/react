/**
 * Survey Types
 *
 * Decision tree surveys for gathering user feedback.
 */

/**
 * Survey Question Types
 */
export type SurveyQuestionType = 'yes_no' | 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'rating'

/**
 * Survey Node Option
 */
export interface SurveyNodeOption {
  value: string
  label: string
}

/**
 * Survey Node Branch
 *
 * Conditional branching configuration for decision tree logic.
 */
export interface SurveyNodeBranch {
  condition: {
    type: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'
    value: string | number | boolean
  }
  next_node_id: string
}

/**
 * Survey Node
 *
 * Individual questions or result nodes in a survey decision tree.
 */
export interface SurveyNode {
  id: string
  survey_id: string
  parent_id: string | null
  question: string
  question_type: SurveyQuestionType

  // For multiple_choice and checkboxes
  options?: SurveyNodeOption[]

  // For rating questions
  min_rating?: number
  max_rating?: number

  // Validation
  is_required?: boolean

  // Legacy yes/no branching
  answer_yes_node_id: string | null
  answer_no_node_id: string | null

  // Conditional branching for all question types
  branches?: SurveyNodeBranch[]
  next_node_id?: string | null

  result_message: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * Survey
 */
export interface Survey {
  id: string
  project_id: string
  name: string
  slug: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string

  number_of_questions?: number
  number_of_responses?: number

  nodes?: SurveyNode[]
  responses?: SurveyResponse[]
}

/**
 * Survey Response
 */
export interface SurveyResponse {
  id: string
  survey_id: string
  external_user_id: string | null
  fingerprint: string
  metadata: Record<string, unknown>
  created_at: string

  answers?: SurveyAnswer[]
}

/**
 * Survey Answer
 */
export interface SurveyAnswer {
  id: string
  response_id: string
  node_id: string

  answer?: boolean
  answer_text?: string
  answer_options?: string[]
  answer_rating?: number

  created_at: string

  node?: {
    id: string
    question: string
    question_type?: SurveyQuestionType
    result_message: string | null
  }
}

/**
 * Input for submitting a survey response
 */
export interface SurveySubmitInput {
  fingerprint: string
  external_user_id?: string
  metadata?: Record<string, unknown>
  answers: Array<{
    node_id: string
    answer?: boolean
    answer_text?: string
    answer_options?: string[]
    answer_rating?: number
  }>
}
