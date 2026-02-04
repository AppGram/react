/**
 * Next.js Integration Example
 *
 * Shows how to integrate @appgram/react with Next.js App Router.
 */

// ============================================================================
// app/providers.tsx - Client Provider Wrapper
// ============================================================================

'use client'

import { AppgramProvider } from '@appgram/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppgramProvider
      config={{
        projectId: process.env.NEXT_PUBLIC_APPGRAM_PROJECT_ID!,
        orgSlug: process.env.NEXT_PUBLIC_APPGRAM_ORG_SLUG!,
        projectSlug: process.env.NEXT_PUBLIC_APPGRAM_PROJECT_SLUG!,
        theme: {
          colors: {
            primary: '#6366f1',
          },
          borderRadius: 12,
        },
      }}
    >
      {children}
    </AppgramProvider>
  )
}

// ============================================================================
// app/layout.tsx - Root Layout
// ============================================================================

/*
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
*/

// ============================================================================
// app/feedback/page.tsx - Feedback Page (Server + Client Components)
// ============================================================================

// Server Component (page.tsx)
/*
import { FeedbackClient } from './feedback-client'

export const metadata = {
  title: 'Feature Requests',
  description: 'Submit and vote on feature requests',
}

export default function FeedbackPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Feature Requests</h1>
      <FeedbackClient />
    </main>
  )
}
*/

// ============================================================================
// app/feedback/feedback-client.tsx - Client Component
// ============================================================================

'use client'

import { useState } from 'react'
import { WishList, WishCard, useWish, useComments, type Wish } from '@appgram/react'

// Wish Detail Modal
function WishModal({ wishId, onClose }: { wishId: string; onClose: () => void }) {
  const { wish, isLoading } = useWish({ wishId })
  const { comments } = useComments({ wishId })

  if (isLoading || !wish) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{wish.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6">{wish.description}</p>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-sm text-gray-600 mb-1">
                    {comment.author_name}
                  </p>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeedbackClient() {
  const [selectedWish, setSelectedWish] = useState<string | null>(null)

  return (
    <>
      <WishList
        variant="cards"
        showSearch
        showStatusFilter
        onWishClick={(wish) => setSelectedWish(wish.id)}
      />

      {selectedWish && (
        <WishModal wishId={selectedWish} onClose={() => setSelectedWish(null)} />
      )}
    </>
  )
}

// ============================================================================
// app/roadmap/page.tsx - Roadmap Page
// ============================================================================

'use client'

import { RoadmapBoard } from '@appgram/react'

export function RoadmapPage() {
  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Product Roadmap</h1>
      <RoadmapBoard
        variant="kanban"
        showVoteCounts
        onItemClick={(item) => {
          // Navigate to wish detail
          if (item.wish_id) {
            window.location.href = `/feedback/${item.wish_id}`
          }
        }}
      />
    </main>
  )
}

// ============================================================================
// app/changelog/page.tsx - Changelog Page
// ============================================================================

'use client'

import { ReleaseList } from '@appgram/react'
import { useRouter } from 'next/navigation'

export function ChangelogPage() {
  const router = useRouter()

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Changelog</h1>
      <ReleaseList
        variant="timeline"
        onReleaseClick={(release) => router.push(`/changelog/${release.slug}`)}
      />
    </main>
  )
}

// ============================================================================
// tailwind.config.js - Tailwind Configuration
// ============================================================================

/*
// Add the Appgram preset to your Tailwind config:

import appgramPreset from '@appgram/react/tailwind-preset'

export default {
  presets: [appgramPreset],
  content: [
    './app/** /*.{js,ts,jsx,tsx}',
    './node_modules/@appgram/react/dist/** /*.js',
  ],
  // ... your other config
}
*/

// ============================================================================
// .env.local - Environment Variables
// ============================================================================

/*
NEXT_PUBLIC_APPGRAM_PROJECT_ID=proj_xxx
NEXT_PUBLIC_APPGRAM_ORG_SLUG=acme
NEXT_PUBLIC_APPGRAM_PROJECT_SLUG=my-app
*/
