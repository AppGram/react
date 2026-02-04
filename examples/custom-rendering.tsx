/**
 * Custom Rendering Example
 *
 * Shows how to use render props to customize component rendering.
 */

import React from 'react'
import {
  AppgramProvider,
  WishList,
  WishCard,
  VoteButton,
  RoadmapBoard,
  ReleaseList,
  type Wish,
  type RoadmapItem,
  type Release,
  type RoadmapColumn,
} from '@appgram/react'

// ============================================================================
// Custom WishCard with render props
// ============================================================================

function CustomWishListExample() {
  return (
    <WishList
      variant="cards"
      showSearch
      // Custom render for each wish
      renderWish={(wish, index) => (
        <div
          key={wish.id}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 mb-4"
        >
          <div className="flex items-start gap-4">
            {/* Custom vote button */}
            <VoteButton
              wishId={wish.id}
              initialVoteCount={wish.vote_count}
              initialHasVoted={wish.has_voted}
              size="lg"
              className="rounded-xl"
              // Custom content rendering
              renderContent={({ hasVoted, voteCount, isLoading }) => (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{hasVoted ? '🎉' : '👍'}</span>
                  <span className="font-bold text-lg">{voteCount}</span>
                  <span className="text-xs opacity-70">
                    {hasVoted ? 'Voted!' : 'Vote'}
                  </span>
                </div>
              )}
            />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                {wish.category && (
                  <span
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: wish.category.color }}
                  >
                    {wish.category.name}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{wish.title}</h3>
              <p className="text-gray-600">{wish.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>💬 {wish.comment_count} comments</span>
                <span>📅 {new Date(wish.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      // Custom loading state
      renderLoading={() => (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Loading amazing ideas...</p>
        </div>
      )}
      // Custom empty state
      renderEmpty={() => (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <span className="text-6xl mb-4 block">💡</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas yet!</h3>
          <p className="text-gray-500">Be the first to submit a feature request.</p>
        </div>
      )}
      // Custom error state
      renderError={(error, retry) => (
        <div className="text-center py-16 bg-red-50 rounded-2xl">
          <span className="text-6xl mb-4 block">😵</span>
          <h3 className="text-xl font-bold text-red-700 mb-2">Oops!</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={retry}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
    />
  )
}

// ============================================================================
// Custom WishCard with custom sub-element renders
// ============================================================================

function CustomWishCardExample({ wish }: { wish: Wish }) {
  return (
    <WishCard
      wish={wish}
      className="hover:scale-[1.02] transition-transform"
      // Custom vote button
      renderVoteButton={({ wishId, voteCount, hasVoted }) => (
        <div
          className={`
            w-16 h-20 flex flex-col items-center justify-center rounded-xl
            ${hasVoted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}
          `}
        >
          <span className="text-xl">{hasVoted ? '✅' : '⬆️'}</span>
          <span className="font-bold">{voteCount}</span>
        </div>
      )}
      // Custom status badge
      renderStatus={(status) => {
        const statusConfig: Record<string, { emoji: string; label: string; color: string }> = {
          pending: { emoji: '⏳', label: 'Pending', color: 'bg-gray-100' },
          under_review: { emoji: '👀', label: 'Reviewing', color: 'bg-yellow-100' },
          planned: { emoji: '📋', label: 'Planned', color: 'bg-blue-100' },
          in_progress: { emoji: '🚀', label: 'Building', color: 'bg-purple-100' },
          completed: { emoji: '✅', label: 'Shipped', color: 'bg-green-100' },
          declined: { emoji: '❌', label: 'Declined', color: 'bg-red-100' },
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
          <span className={`px-3 py-1 rounded-full text-sm ${config.color}`}>
            {config.emoji} {config.label}
          </span>
        )
      }}
      // Custom category badge
      renderCategory={(category) => (
        <span
          className="px-3 py-1 rounded-full text-sm text-white flex items-center gap-1"
          style={{ backgroundColor: category.color }}
        >
          <span>🏷️</span>
          {category.name}
        </span>
      )}
    />
  )
}

// ============================================================================
// Custom Roadmap Board
// ============================================================================

function CustomRoadmapExample() {
  return (
    <RoadmapBoard
      variant="kanban"
      showVoteCounts
      // Custom column rendering
      renderColumn={(column) => (
        <div key={column.id} className="min-w-[300px]">
          <div
            className="text-white font-bold px-4 py-3 rounded-t-xl flex items-center justify-between"
            style={{ backgroundColor: column.color }}
          >
            <span>{column.name}</span>
            <span className="bg-white/20 px-2 py-1 rounded text-sm">
              {column.items?.length || 0}
            </span>
          </div>
          <div className="bg-gray-100 rounded-b-xl p-3 min-h-[400px] space-y-3">
            {column.items?.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <h4 className="font-semibold mb-2">
                  {item.title || item.wish?.title}
                </h4>
                {item.wish && (
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      ⬆️ {item.wish.vote_count}
                    </span>
                    {item.target_date && (
                      <span className="flex items-center gap-1">
                        📅 {new Date(item.target_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    />
  )
}

// ============================================================================
// Custom Release List
// ============================================================================

function CustomReleaseListExample() {
  return (
    <ReleaseList
      variant="cards"
      limit={10}
      renderRelease={(release, index) => (
        <div
          key={release.id}
          className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 transition-colors"
        >
          {release.cover_image_url && (
            <img
              src={release.cover_image_url}
              alt={release.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              {release.version && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-mono">
                  v{release.version}
                </span>
              )}
              <span className="text-sm text-gray-500">
                {new Date(release.published_at || release.created_at).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">{release.title}</h3>
            {release.labels && release.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {release.labels.map((label) => (
                  <span
                    key={label}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
            {release.excerpt && (
              <p className="text-gray-600 line-clamp-3">{release.excerpt}</p>
            )}
          </div>
        </div>
      )}
    />
  )
}

// ============================================================================
// Main App
// ============================================================================

export function App() {
  return (
    <AppgramProvider
      config={{
        projectId: 'proj_xxx',
        orgSlug: 'acme',
        projectSlug: 'my-app',
        theme: {
          colors: {
            primary: '#6366f1',
          },
          borderRadius: 16,
        },
      }}
    >
      <div className="max-w-6xl mx-auto p-8 space-y-16">
        <section>
          <h2 className="text-2xl font-bold mb-6">Custom Wish List</h2>
          <CustomWishListExample />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Custom Roadmap</h2>
          <CustomRoadmapExample />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Custom Releases</h2>
          <CustomReleaseListExample />
        </section>
      </div>
    </AppgramProvider>
  )
}
