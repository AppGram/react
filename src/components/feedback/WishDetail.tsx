/**
 * WishDetail Component
 *
 * Sheet/modal for displaying wish details with voting and comments.
 * Adapted from PublicWishDetail.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useVote } from '../../hooks/useVote'
import { useComments } from '../../hooks/useComments'
import type { Wish, Comment } from '../../types'

export interface WishDetailProps {
  /**
   * The wish to display
   */
  wish: Wish | null

  /**
   * Whether the detail view is open
   */
  open: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void

  /**
   * Callback when vote is toggled
   */
  onVote?: (wishId: string) => void

  /**
   * Callback when a comment is added
   */
  onCommentAdded?: (comment: Comment) => void

  /**
   * Custom class name
   */
  className?: string
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  pending: { label: 'New', color: '#6366f1', icon: Clock },
  under_review: { label: 'Reviewing', color: '#8b5cf6', icon: AlertCircle },
  planned: { label: 'Planned', color: '#10b981', icon: Clock },
  in_progress: { label: 'Building', color: '#f59e0b', icon: AlertCircle },
  completed: { label: 'Shipped', color: '#10b981', icon: CheckCircle2 },
  declined: { label: 'Closed', color: '#6b7280', icon: AlertCircle },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function WishDetail({
  wish,
  open,
  onOpenChange,
  onVote,
  onCommentAdded,
  className,
}: WishDetailProps): React.ReactElement | null {
  const { theme } = useAppgramContext()
  const primaryColor = theme.colors?.primary || '#0EA5E9'
  const borderRadius = theme.borderRadius || 16
  const isDark = (theme as { isDark?: boolean }).isDark ?? false

  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')

  // Reset form when wish changes
  useEffect(() => {
    if (wish) {
      setNewComment('')
      setAuthorName('')
    }
  }, [wish?.id])

  const {
    hasVoted,
    voteCount,
    toggle: toggleVote,
    isLoading: isVoteLoading,
  } = useVote({
    wishId: wish?.id || '',
    initialVoteCount: wish?.vote_count,
    initialHasVoted: wish?.has_voted,
  })

  const {
    comments,
    isLoading: isLoadingComments,
    createComment,
    isCreating: isAddingComment,
  } = useComments({
    wishId: wish?.id || '',
  })

  if (!wish) return null

  const status = statusConfig[wish.status] || statusConfig.pending
  const StatusIcon = status.icon

  const handleVote = () => {
    toggleVote()
    onVote?.(wish.id)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const result = await createComment({
      content: newComment,
      author_name: authorName.trim() || undefined,
    })

    if (result) {
      setNewComment('')
      setAuthorName('')
      onCommentAdded?.(result)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
              'fixed right-0 top-0 bottom-0 w-full sm:w-[500px] md:w-[600px] z-50 shadow-2xl flex flex-col overflow-hidden',
              className
            )}
            style={{
              borderRadius: `${borderRadius}px 0 0 ${borderRadius}px`,
              backgroundColor: isDark ? 'var(--appgram-background)' : 'white',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors z-10"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent' }}
            >
              <X className="w-5 h-5" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }} />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 flex-shrink-0">
              <div className="flex gap-4">
                {/* Vote Button */}
                <motion.button
                  onClick={handleVote}
                  disabled={isVoteLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl border-2 transition-all min-w-[70px] shrink-0',
                    isVoteLoading && 'opacity-50'
                  )}
                  style={{
                    backgroundColor: hasVoted ? `${primaryColor}15` : 'transparent',
                    borderColor: hasVoted ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                    color: hasVoted ? primaryColor : 'var(--appgram-foreground)',
                  }}
                >
                  <ChevronUp
                    className={cn('w-6 h-6 transition-all', hasVoted && 'fill-current')}
                    strokeWidth={2}
                  />
                  <span className="text-sm font-bold">{voteCount}</span>
                </motion.button>

                {/* Title & Status */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--appgram-foreground)' }}
                  >
                    {wish.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${status.color}15`,
                        color: status.color,
                      }}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                    {wish.category && (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${wish.category.color}15`,
                          color: wish.category.color,
                        }}
                      >
                        {wish.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div
                className="h-px my-4"
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}
              />

              {/* Description */}
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
              >
                {wish.description}
              </p>

              {/* Author & Date */}
              <div
                className="flex items-center gap-4 mt-4 text-xs"
                style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
              >
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>
                    {wish.author?.name || wish.author_email || 'Anonymous'}
                  </span>
                </div>
                <span>•</span>
                <span>{formatDate(wish.created_at)}</span>
              </div>
            </div>

            {/* Separator */}
            <div
              className="h-px flex-shrink-0"
              style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}
            />

            {/* Comments Section */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Comments Header */}
              <div
                className="px-6 py-3 flex items-center gap-2 flex-shrink-0"
                style={{ color: 'var(--appgram-foreground)' }}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  Comments ({comments.length})
                </span>
              </div>

              {/* Comments List */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-6 space-y-4 pb-4">
                  {isLoadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2
                        className="w-5 h-5 animate-spin mr-2"
                        style={{ color: primaryColor }}
                      />
                      <span style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                        Loading comments...
                      </span>
                    </div>
                  ) : comments.length === 0 ? (
                    <p
                      className="text-center py-8 text-sm"
                      style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                    >
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    <AnimatePresence>
                      {comments.map((comment, index) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-3"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                            style={{
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                            }}
                          >
                            {getInitials(
                              comment.author_name || 'AN'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="font-medium text-sm"
                                style={{ color: 'var(--appgram-foreground)' }}
                              >
                                {comment.author_name || 'Anonymous'}
                              </span>
                              {comment.is_official && (
                                <span
                                  className="text-xs px-1.5 py-0 rounded text-white"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  Official
                                </span>
                              )}
                              <span
                                className="text-xs"
                                style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' }}
                              >
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-sm leading-relaxed',
                                comment.is_official && 'p-3 rounded-lg'
                              )}
                              style={
                                comment.is_official
                                  ? {
                                      backgroundColor: `${primaryColor}10`,
                                      borderLeft: `3px solid ${primaryColor}`,
                                      color: 'var(--appgram-foreground)',
                                    }
                                  : { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }
                              }
                            >
                              {comment.content}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Add Comment Form */}
              <div
                className="border-t flex-shrink-0 p-4"
                style={{
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  backgroundColor: isDark ? 'var(--appgram-background)' : 'white',
                }}
              >
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    maxLength={100}
                    className="w-full h-10 px-4 text-sm border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      borderRadius: `${Math.min(borderRadius, 8)}px`,
                      backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                      color: 'var(--appgram-foreground)',
                    }}
                  />
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      maxLength={1000}
                      className="flex-1 min-h-[60px] px-4 py-3 text-sm border focus:outline-none focus:ring-2 resize-none transition-all"
                      style={{
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: `${Math.min(borderRadius, 8)}px`,
                        backgroundColor: isDark ? 'var(--appgram-card)' : 'white',
                        color: 'var(--appgram-foreground)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isAddingComment}
                      className="h-[60px] w-[60px] shrink-0 flex items-center justify-center text-white disabled:opacity-50 transition-all"
                      style={{
                        backgroundColor: primaryColor,
                        borderRadius: `${Math.min(borderRadius, 8)}px`,
                      }}
                    >
                      {isAddingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
