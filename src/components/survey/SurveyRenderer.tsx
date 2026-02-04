/**
 * SurveyRenderer Component
 *
 * Renders survey questions step-by-step with branching logic.
 * Supports all 6 question types: yes_no, short_answer, paragraph,
 * multiple_choice, checkboxes, rating.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useSurvey, useSurveySubmit } from '../../hooks/useSurvey'
import { getFingerprint } from '../../utils'
import type { SurveyNode } from '../../types'

export interface SurveyRendererProps {
  /**
   * Survey slug to load
   */
  slug: string

  /**
   * Optional title override
   */
  title?: string

  /**
   * Optional description override
   */
  description?: string

  /**
   * Called when the survey is submitted successfully
   */
  onComplete?: () => void

  /**
   * Called on submission error
   */
  onError?: (error: string) => void

  /**
   * External user ID to attach to the response
   */
  externalUserId?: string

  /**
   * Additional metadata to attach to the response
   */
  metadata?: Record<string, unknown>

  /**
   * Custom class name
   */
  className?: string
}

interface AnswerState {
  answer_text?: string
  answer_options?: string[]
  answer_rating?: number
  answer?: boolean
}

export function SurveyRenderer({
  slug,
  title,
  description,
  onComplete,
  onError,
  externalUserId,
  metadata,
  className,
}: SurveyRendererProps): React.ReactElement {
  const { theme } = useAppgramContext()
  const { survey, nodes, isLoading, error: fetchError } = useSurvey(slug)
  const { submitResponse, isSubmitting, error: submitError, successMessage } = useSurveySubmit({
    onSuccess: () => onComplete?.(),
    onError,
  })

  const [answers, setAnswers] = useState<Map<string, AnswerState>>(new Map())
  const [visitedNodes, setVisitedNodes] = useState<string[]>([])

  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  // Sort nodes by sort_order and get the root node
  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => a.sort_order - b.sort_order)
  }, [nodes])

  const rootNode = useMemo(() => {
    return sortedNodes.find(n => n.parent_id === null) || sortedNodes[0]
  }, [sortedNodes])

  // Get current node from visitedNodes or the root
  const currentNodeId = visitedNodes.length > 0 ? visitedNodes[visitedNodes.length - 1] : rootNode?.id
  const currentNode = nodes.find(n => n.id === currentNodeId) || null

  const getNextNode = useCallback((node: SurveyNode, answer: AnswerState): SurveyNode | null => {
    // Yes/No legacy branching
    if (node.question_type === 'yes_no') {
      const isYes = answer.answer_text === 'yes' || answer.answer === true
      const nextId = isYes ? node.answer_yes_node_id : node.answer_no_node_id
      if (nextId) {
        return nodes.find(n => n.id === nextId) || null
      }
    }

    // Branch-based routing
    if (node.branches && node.branches.length > 0) {
      for (const branch of node.branches) {
        const { condition } = branch
        let matches = false

        if (condition.type === 'equals') {
          if (answer.answer_text !== undefined) matches = answer.answer_text === String(condition.value)
          if (answer.answer_rating !== undefined) matches = answer.answer_rating === Number(condition.value)
          if (answer.answer_options?.length === 1) matches = answer.answer_options[0] === String(condition.value)
        } else if (condition.type === 'contains') {
          if (answer.answer_text) matches = answer.answer_text.includes(String(condition.value))
          if (answer.answer_options) matches = answer.answer_options.includes(String(condition.value))
        } else if (condition.type === 'gt' && answer.answer_rating !== undefined) {
          matches = answer.answer_rating > Number(condition.value)
        } else if (condition.type === 'lt' && answer.answer_rating !== undefined) {
          matches = answer.answer_rating < Number(condition.value)
        } else if (condition.type === 'gte' && answer.answer_rating !== undefined) {
          matches = answer.answer_rating >= Number(condition.value)
        } else if (condition.type === 'lte' && answer.answer_rating !== undefined) {
          matches = answer.answer_rating <= Number(condition.value)
        }

        if (matches) {
          return nodes.find(n => n.id === branch.next_node_id) || null
        }
      }
    }

    // Default next node
    if (node.next_node_id) {
      return nodes.find(n => n.id === node.next_node_id) || null
    }

    return null
  }, [nodes])

  const handleNext = useCallback(() => {
    if (!currentNode) return
    const answer = answers.get(currentNode.id)
    if (!answer && currentNode.is_required) return

    const nextNode = answer ? getNextNode(currentNode, answer) : null

    if (nextNode) {
      setVisitedNodes(prev => [...prev, nextNode.id])
    } else {
      // No next node — submit the survey
      handleSubmit()
    }
  }, [currentNode, answers, getNextNode])

  const handleBack = useCallback(() => {
    setVisitedNodes(prev => prev.slice(0, -1))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!survey) return

    const fingerprint = getFingerprint()
    const answerEntries = Array.from(answers.entries()).map(([nodeId, ans]) => ({
      node_id: nodeId,
      answer: ans.answer,
      answer_text: ans.answer_text,
      answer_options: ans.answer_options,
      answer_rating: ans.answer_rating,
    }))

    await submitResponse(survey.id, {
      fingerprint,
      external_user_id: externalUserId,
      metadata,
      answers: answerEntries,
    })
  }, [survey, answers, submitResponse, externalUserId, metadata])

  const updateAnswer = useCallback((nodeId: string, answer: AnswerState) => {
    setAnswers(prev => {
      const next = new Map(prev)
      next.set(nodeId, answer)
      return next
    })
  }, [])

  // Result message check
  if (currentNode?.result_message) {
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
          <p
            className="text-lg font-medium"
            style={{ color: 'var(--appgram-foreground)' }}
          >
            {currentNode.result_message}
          </p>
        </div>
      </div>
    )
  }

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
            Thank You
          </h2>
          <p
            className="text-base"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            {successMessage}
          </p>
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
  if (fetchError || submitError) {
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
          {fetchError || submitError}
        </div>
      </div>
    )
  }

  if (!currentNode || !survey) return <div />

  const currentAnswer = answers.get(currentNode.id)
  const isAnswered = !!currentAnswer
  const isRequired = currentNode.is_required !== false
  const canProceed = !isRequired || isAnswered

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Header */}
      {(title || survey.name) && (
        <div className="mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--appgram-foreground)' }}
          >
            {title || survey.name}
          </h1>
          {(description || survey.description) && (
            <p
              className="text-base"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
            >
              {description || survey.description}
            </p>
          )}
        </div>
      )}

      {/* Question Card */}
      <div
        className="rounded-lg border p-6"
        style={{
          backgroundColor: isDark ? 'var(--appgram-card)' : 'rgba(255, 255, 255, 0.7)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: `${Math.min(borderRadius, 12)}px`,
        }}
      >
        {/* Question */}
        <h2
          className="text-lg font-semibold mb-6"
          style={{ color: 'var(--appgram-foreground)' }}
        >
          {currentNode.question}
          {isRequired && <span style={{ color: '#dc2626' }}> *</span>}
        </h2>

        {/* Answer Input */}
        <QuestionInput
          node={currentNode}
          answer={currentAnswer}
          onChange={(answer) => updateAnswer(currentNode.id, answer)}
          primaryColor={primaryColor}
          borderRadius={borderRadius}
          isDark={isDark}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}>
          <button
            onClick={handleBack}
            disabled={visitedNodes.length === 0}
            className="px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-30"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="px-6 py-2.5 text-sm text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
            style={{
              backgroundColor: primaryColor,
              borderRadius: `${Math.min(borderRadius, 8)}px`,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// QuestionInput - Renders the appropriate input for each question type
// ============================================================================

function QuestionInput({
  node,
  answer,
  onChange,
  primaryColor,
  borderRadius,
  isDark,
}: {
  node: SurveyNode
  answer?: AnswerState
  onChange: (answer: AnswerState) => void
  primaryColor: string
  borderRadius: number
  isDark: boolean
}): React.ReactElement {
  switch (node.question_type) {
    case 'yes_no':
      return (
        <div className="flex gap-3">
          {['yes', 'no'].map((value) => (
            <button
              key={value}
              onClick={() => onChange({ answer_text: value, answer: value === 'yes' })}
              className="flex-1 py-3 text-sm font-medium border transition-all"
              style={{
                backgroundColor: answer?.answer_text === value ? `${primaryColor}15` : 'transparent',
                borderColor: answer?.answer_text === value ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                color: answer?.answer_text === value ? primaryColor : 'var(--appgram-foreground)',
                borderRadius: `${Math.min(borderRadius, 8)}px`,
              }}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      )

    case 'short_answer':
      return (
        <input
          type="text"
          value={answer?.answer_text || ''}
          onChange={(e) => onChange({ answer_text: e.target.value })}
          placeholder="Type your answer..."
          className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            color: 'var(--appgram-foreground)',
            borderRadius: `${Math.min(borderRadius, 8)}px`,
          }}
        />
      )

    case 'paragraph':
      return (
        <textarea
          value={answer?.answer_text || ''}
          onChange={(e) => onChange({ answer_text: e.target.value })}
          placeholder="Type your answer..."
          rows={4}
          className="w-full px-4 py-3 text-sm border focus:outline-none focus:ring-2 resize-none transition-all"
          style={{
            backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            color: 'var(--appgram-foreground)',
            borderRadius: `${Math.min(borderRadius, 8)}px`,
          }}
        />
      )

    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {(node.options || []).map((option) => (
            <button
              key={option.value}
              onClick={() => onChange({ answer_options: [option.value] })}
              className="w-full text-left px-4 py-3 text-sm border transition-all"
              style={{
                backgroundColor: answer?.answer_options?.[0] === option.value ? `${primaryColor}15` : 'transparent',
                borderColor: answer?.answer_options?.[0] === option.value ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                color: 'var(--appgram-foreground)',
                borderRadius: `${Math.min(borderRadius, 8)}px`,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )

    case 'checkboxes':
      return (
        <div className="space-y-2">
          {(node.options || []).map((option) => {
            const selected = answer?.answer_options?.includes(option.value) || false
            return (
              <button
                key={option.value}
                onClick={() => {
                  const current = answer?.answer_options || []
                  const next = selected
                    ? current.filter(v => v !== option.value)
                    : [...current, option.value]
                  onChange({ answer_options: next })
                }}
                className="w-full text-left px-4 py-3 text-sm border transition-all flex items-center gap-3"
                style={{
                  backgroundColor: selected ? `${primaryColor}15` : 'transparent',
                  borderColor: selected ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                  color: 'var(--appgram-foreground)',
                  borderRadius: `${Math.min(borderRadius, 8)}px`,
                }}
              >
                <div
                  className="w-4 h-4 border rounded flex items-center justify-center shrink-0"
                  style={{
                    borderColor: selected ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'),
                    backgroundColor: selected ? primaryColor : 'transparent',
                  }}
                >
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {option.label}
              </button>
            )
          })}
        </div>
      )

    case 'rating': {
      const min = node.min_rating ?? 1
      const max = node.max_rating ?? 5
      const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i)

      return (
        <div className="flex gap-2 justify-center">
          {ratings.map((value) => (
            <button
              key={value}
              onClick={() => onChange({ answer_rating: value })}
              className="w-12 h-12 text-sm font-medium border transition-all"
              style={{
                backgroundColor: answer?.answer_rating === value ? primaryColor : 'transparent',
                borderColor: answer?.answer_rating === value ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                color: answer?.answer_rating === value ? 'white' : 'var(--appgram-foreground)',
                borderRadius: `${Math.min(borderRadius, 8)}px`,
              }}
            >
              {value}
            </button>
          ))}
        </div>
      )
    }

    default:
      return <div />
  }
}
