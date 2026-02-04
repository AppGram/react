/**
 * Headless Hooks Example
 *
 * Shows how to use hooks with custom UI components.
 */

import React, { useState } from 'react'
import {
  AppgramProvider,
  useWishes,
  useWish,
  useVote,
  useComments,
  useRoadmap,
  type Wish,
} from '@appgram/react'

// Custom Vote Button
function CustomVoteButton({ wishId, initialCount }: { wishId: string; initialCount: number }) {
  const { hasVoted, voteCount, isLoading, toggle } = useVote({
    wishId,
    initialVoteCount: initialCount,
  })

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full font-medium
        transition-all duration-200
        ${hasVoted
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span className="text-lg">{hasVoted ? '✓' : '▲'}</span>
      <span>{voteCount}</span>
    </button>
  )
}

// Custom Wish Card
function CustomWishCard({ wish, onClick }: { wish: Wish; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <CustomVoteButton wishId={wish.id} initialCount={wish.vote_count} />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2">{wish.title}</h3>
          <p className="text-gray-600 line-clamp-2">{wish.description}</p>
          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">{wish.status}</span>
            {wish.category && (
              <span
                className="px-2 py-1 rounded text-white"
                style={{ backgroundColor: wish.category.color }}
              >
                {wish.category.name}
              </span>
            )}
            <span>💬 {wish.comment_count}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wish Detail with Comments
function WishDetail({ wishId, onClose }: { wishId: string; onClose: () => void }) {
  const { wish, isLoading: wishLoading } = useWish({ wishId })
  const { comments, isLoading: commentsLoading, createComment, isCreating } = useComments({ wishId })
  const [newComment, setNewComment] = useState('')

  if (wishLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!wish) {
    return <div className="text-center py-8">Wish not found</div>
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    await createComment({
      content: newComment,
      author_name: 'Anonymous',
    })
    setNewComment('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <CustomVoteButton wishId={wish.id} initialCount={wish.vote_count} />
              <h2 className="text-xl font-bold">{wish.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
          <p className="text-gray-700 mb-6">{wish.description}</p>

          <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>

          {commentsLoading ? (
            <div className="text-gray-500">Loading comments...</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{comment.author_name}</span>
                    {comment.is_official && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                        Official
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleSubmitComment}
              disabled={isCreating || !newComment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
            >
              {isCreating ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Feedback Page
function CustomFeedbackPage() {
  const { wishes, isLoading, error, setFilters, page, totalPages, setPage } = useWishes({
    filters: { sort_by: 'votes', sort_order: 'desc' },
  })
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const handleSearch = (query: string) => {
    setSearch(query)
    setFilters({ search: query || undefined, sort_by: 'votes', sort_order: 'desc' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 text-center py-12">{error}</div>
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search feature requests..."
          className="w-full px-4 py-3 border rounded-xl"
        />
      </div>

      {/* Wish List */}
      <div className="space-y-4">
        {wishes.map((wish) => (
          <CustomWishCard
            key={wish.id}
            wish={wish}
            onClick={() => setSelectedWishId(wish.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWishId && (
        <WishDetail wishId={selectedWishId} onClose={() => setSelectedWishId(null)} />
      )}
    </div>
  )
}

// Custom Roadmap Page
function CustomRoadmapPage() {
  const { columns, isLoading, error } = useRoadmap()

  if (isLoading) {
    return <div className="text-center py-12">Loading roadmap...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-12">{error}</div>
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-t-xl text-white font-semibold"
            style={{ backgroundColor: column.color }}
          >
            {column.name}
            <span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-sm">
              {column.items?.length || 0}
            </span>
          </div>
          <div className="bg-gray-50 rounded-b-xl p-4 min-h-[400px]">
            <div className="space-y-3">
              {column.items?.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium mb-1">
                    {item.title || item.wish?.title}
                  </h4>
                  {item.wish && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>▲ {item.wish.vote_count}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Main App
export function App() {
  const [tab, setTab] = useState<'feedback' | 'roadmap'>('feedback')

  return (
    <AppgramProvider
      config={{
        projectId: 'proj_xxx',
        orgSlug: 'acme',
        projectSlug: 'my-app',
      }}
    >
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Custom UI with Headless Hooks</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('feedback')}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === 'feedback' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
          >
            Feature Requests
          </button>
          <button
            onClick={() => setTab('roadmap')}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === 'roadmap' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
          >
            Roadmap
          </button>
        </div>

        {/* Content */}
        {tab === 'feedback' && <CustomFeedbackPage />}
        {tab === 'roadmap' && <CustomRoadmapPage />}
      </div>
    </AppgramProvider>
  )
}
