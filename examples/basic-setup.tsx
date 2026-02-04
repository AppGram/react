/**
 * Basic Setup Example
 *
 * Shows how to set up the AppgramProvider and use pre-built components.
 */

import React from 'react'
import {
  AppgramProvider,
  WishList,
  RoadmapBoard,
  ReleaseList,
  SupportForm,
} from '@appgram/react'

export function App() {
  return (
    <AppgramProvider
      config={{
        projectId: 'proj_xxx',
        orgSlug: 'acme',
        projectSlug: 'my-app',
        // Optional: Custom API URL
        // apiUrl: 'https://api.appgram.dev',
        // Optional: Theme customization
        theme: {
          colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#06b6d4',
          },
          borderRadius: 8,
        },
      }}
    >
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">My App Feedback Portal</h1>

        {/* Feature Requests */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Feature Requests</h2>
          <WishList
            variant="cards"
            showSearch
            showStatusFilter
            onWishClick={(wish) => console.log('Clicked wish:', wish)}
          />
        </section>

        {/* Roadmap */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Roadmap</h2>
          <RoadmapBoard
            variant="kanban"
            showVoteCounts
            onItemClick={(item) => console.log('Clicked item:', item)}
          />
        </section>

        {/* Changelog */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Changelog</h2>
          <ReleaseList
            variant="timeline"
            limit={10}
            onReleaseClick={(release) => console.log('Clicked release:', release)}
          />
        </section>

        {/* Support */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
          <SupportForm
            showCategory
            showName
            onSubmitSuccess={(ticket) => console.log('Ticket created:', ticket)}
          />
        </section>
      </div>
    </AppgramProvider>
  )
}
