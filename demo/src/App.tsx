import React, { useState } from 'react'
import {
  AppgramProvider,
  WishList,
  WishDetail,
  SubmitWishForm,
  RoadmapBoard,
  Releases,
  WhatsNewPopup,
  HelpCenter,
  SupportForm,
  StatusBoard,
  StatusIncidentDetail,
  ContactFormRenderer,
  Blog,
  useWishes,
  useVote,
  useContactForm,
  type Wish,
  type StatusData,
  type StatusIncident,
  type ThemeMode,
} from '@appgram/react'

// Configuration - Update these values to test with your Appgram project
const CONFIG = {
  projectId: '8be98cbb-308e-4aaa-8201-4fa17d5f2116', // Replace with your project ID
  orgSlug: 'acme-corp',           // Replace with your org slug
  projectSlug: 'my-app',   // Replace with your project slug
  // apiUrl: 'http://localhost:3001', // Uncomment for local API testing
}

type Tab = 'components' | 'hooks' | 'roadmap' | 'releases' | 'help' | 'support' | 'status' | 'forms' | 'blog'

// Theme mode icons
const ThemeIcons = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
}

// ============================================================================
// Demo: Pre-built Components
// ============================================================================

function ComponentsDemo() {
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddWishOpen, setIsAddWishOpen] = useState(false)

  const handleWishClick = (wish: Wish) => {
    setSelectedWish(wish)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-8">
      <WishList
        variant="cards"
        heading="Feature Requests"
        description="Vote for features you'd like to see, or submit your own ideas."
        headingAlignment="center"
        showSearch
        showStatusFilter
        onWishClick={handleWishClick}
        onAddWish={() => setIsAddWishOpen(true)}
      />

      {/* Wish Detail Sheet */}
      <WishDetail
        wish={selectedWish}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onVote={(wishId) => console.log('Voted on:', wishId)}
        onCommentAdded={(comment) => console.log('Comment added:', comment)}
      />

      {/* Submit Wish Form Sheet */}
      <SubmitWishForm
        open={isAddWishOpen}
        onOpenChange={setIsAddWishOpen}
        onSuccess={(wish) => {
          console.log('Wish submitted:', wish)
          setIsAddWishOpen(false)
        }}
        onError={(error) => console.error('Submit error:', error)}
      />
    </div>
  )
}

// ============================================================================
// Demo: Headless Hooks
// ============================================================================

function CustomWishCard({ wish }: { wish: Wish }) {
  const { hasVoted, voteCount, toggle, isLoading } = useVote({
    wishId: wish.id,
    initialVoteCount: wish.vote_count,
    initialHasVoted: wish.has_voted,
  })

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
      <div className="flex items-start gap-4">
        <button
          onClick={toggle}
          disabled={isLoading}
          className={`
            flex flex-col items-center justify-center w-16 h-16 rounded-xl
            transition-all duration-200 font-medium
            ${hasVoted
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
            ${isLoading ? 'opacity-50' : ''}
          `}
        >
          <span className="text-lg">{hasVoted ? '✓' : '▲'}</span>
          <span className="text-sm">{voteCount}</span>
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1">{wish.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{wish.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded">{wish.status}</span>
            {wish.category && (
              <span
                className="px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: wish.category.color }}
              >
                {wish.category.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function HooksDemo() {
  const { wishes, isLoading, error, page, totalPages, setPage, setFilters } = useWishes({
    filters: { sort_by: 'votes', sort_order: 'desc' },
  })
  const [search, setSearch] = useState('')

  const handleSearch = (query: string) => {
    setSearch(query)
    setFilters({ search: query || undefined, sort_by: 'votes', sort_order: 'desc' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Custom UI with useWishes + useVote</h3>
        <p className="text-gray-600 mb-4">
          Build your own components using headless hooks.
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      )}

      {/* Wishes */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {wishes.map((wish) => (
            <CustomWishCard key={wish.id} wish={wish} />
          ))}
          {wishes.length === 0 && (
            <div className="text-center py-8 text-gray-500">No wishes found</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Demo: Roadmap
// ============================================================================

function RoadmapDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">RoadmapBoard Component</h3>
        <p className="text-gray-600 mb-4">
          Kanban-style roadmap with columns and items.
        </p>
      </div>
      <RoadmapBoard
        variant="kanban"
        showVoteCounts
        onItemClick={(item) => console.log('Clicked:', item)}
      />
    </div>
  )
}

// ============================================================================
// Demo: Releases
// ============================================================================

function ReleasesDemo() {
  const [showWhatsNew, setShowWhatsNew] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Releases Component</h3>
        <p className="text-gray-600 mb-4">
          Complete changelog with navigation. Click on a release to see full details.
        </p>
      </div>

      {/* What's New Popup Demo */}
      <div className="p-4 bg-indigo-50 rounded-lg">
        <h4 className="font-medium text-indigo-900 mb-2">What's New Popup</h4>
        <p className="text-sm text-indigo-700 mb-3">
          A small popup that appears at the bottom of the screen showing the latest release features.
        </p>
        <button
          onClick={() => setShowWhatsNew(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Show What's New Popup
        </button>
      </div>

      <Releases
        heading="What's New"
        description="See what we've been working on."
        headingAlignment="center"
        limit={10}
      />

      {/* What's New Popup */}
      <WhatsNewPopup
        open={showWhatsNew}
        onOpenChange={setShowWhatsNew}
        autoShow={false}
        position="bottom-right"
        onViewAll={() => console.log('View all clicked')}
      />
    </div>
  )
}

// ============================================================================
// Demo: Help Center
// ============================================================================

function HelpDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">HelpCenter Component</h3>
        <p className="text-gray-600 mb-4">
          Complete help center with navigation. Click on a topic to see articles, click an article to read it.
        </p>
      </div>
      <HelpCenter
        heading="Help Center"
        description="How can we help you today?"
        headingAlignment="center"
        showSearch
        variant="grid"
        quickActions={[
          { label: 'Submit a Ticket', onClick: () => alert('Open ticket form') },
          { label: 'Live Chat', onClick: () => alert('Open live chat') },
          { label: 'API Docs', onClick: () => alert('Open API docs') },
        ]}
        showFooter
        contactSupportUrl="#support"
        onLiveChatClick={() => alert('Live chat clicked')}
      />
    </div>
  )
}

// ============================================================================
// Demo: Support
// ============================================================================

function SupportDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">SupportForm Component</h3>
        <p className="text-gray-600 mb-4">
          Support ticket submission form.
        </p>
      </div>
      <div className="max-w-md">
        <SupportForm
          showCategory
          showName
          onSubmitSuccess={(ticket) => {
            console.log('Ticket created:', ticket)
            alert('Ticket submitted successfully!')
          }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Demo: Contact Forms
// ============================================================================

// Demo form ID - replace with your own form ID for testing
const DEMO_FORM_ID = 'your-form-id-here'

function FormsDemo() {
  // Example of using the hook directly for custom implementations
  const { form, isLoading, error } = useContactForm(DEMO_FORM_ID, {
    trackView: true, // Automatically tracks form view for analytics (default: true)
  })

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">ContactFormRenderer Component</h3>
        <p className="text-gray-600 mb-4">
          Pre-built contact form component that auto-loads form config and handles submission.
          Form views are automatically tracked for analytics.
        </p>
        <p className="text-sm text-amber-600 mb-6">
          Note: Replace DEMO_FORM_ID in the code with your actual form ID to test.
        </p>
      </div>

      {/* Using the pre-built component */}
      <div className="max-w-lg">
        <ContactFormRenderer
          formId={DEMO_FORM_ID}
          projectId={CONFIG.projectId}
          title="Contact Us"
          description="Have a question? Send us a message and we'll get back to you."
          onSuccess={() => console.log('Form submitted successfully!')}
          onError={(error) => console.error('Form error:', error)}
        />
      </div>

      {/* Hook usage example */}
      <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--appgram-card)' }}>
        <h4 className="font-medium mb-2">Hook Usage Example (useContactForm)</h4>
        <p className="text-sm opacity-70 mb-3">
          Use the <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">useContactForm</code> hook
          for custom form implementations while still getting automatic view tracking.
        </p>
        <pre className="text-xs p-3 rounded overflow-x-auto" style={{ backgroundColor: 'var(--appgram-background)' }}>
{`const { form, isLoading, error } = useContactForm('form-id', {
  trackView: true, // Tracks form view for analytics
});

// form: ContactForm | null
// isLoading: boolean
// error: string | null`}
        </pre>
        <div className="mt-3 text-sm">
          <strong>Hook State:</strong>{' '}
          {isLoading ? 'Loading...' : error ? `Error: ${error}` : form ? `Form loaded: ${form.name}` : 'No form'}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Demo: Blog
// ============================================================================

function BlogDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Blog Component</h3>
        <p className="text-gray-600 mb-4">
          Complete blog with posts, categories, and article views.
        </p>
      </div>
      <Blog
        heading="Latest Updates"
        description="News, tutorials, and insights from our team."
        headingAlignment="center"
        showFeatured
        showCategories
        postsPerPage={6}
      />
    </div>
  )
}

// ============================================================================
// Demo: Status Page
// ============================================================================

// Mock status data
const mockStatusData: StatusData = {
  overall_status: 'operational',
  last_updated: new Date().toISOString(),
  components: [
    { id: '1', name: 'API', status: 'operational', description: 'REST API endpoints', group: 'Core Services' },
    { id: '2', name: 'Web App', status: 'operational', description: 'Main web application', group: 'Core Services' },
    { id: '3', name: 'Database', status: 'operational', description: 'Primary database cluster', group: 'Infrastructure' },
    { id: '4', name: 'CDN', status: 'degraded', description: 'Content delivery network', group: 'Infrastructure' },
    { id: '5', name: 'Email', status: 'operational', description: 'Transactional emails', group: 'Communications' },
    { id: '6', name: 'Push Notifications', status: 'operational', description: 'Mobile push notifications', group: 'Communications' },
  ],
  incidents: [
    {
      id: 'inc-1',
      title: 'Elevated CDN latency in EU region',
      status: 'monitoring',
      impact: 'minor',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updates: [
        {
          id: 'upd-1',
          message: 'We are investigating reports of elevated latency for users in the EU region.',
          status: 'investigating',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'upd-2',
          message: 'We have identified the issue as a misconfigured cache rule. A fix is being deployed.',
          status: 'identified',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'upd-3',
          message: 'The fix has been deployed. We are monitoring to ensure the issue is resolved.',
          status: 'monitoring',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ],
      affected_components: ['CDN'],
    },
    {
      id: 'inc-2',
      title: 'Database maintenance completed',
      status: 'resolved',
      impact: 'minor',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      updates: [
        {
          id: 'upd-3',
          message: 'Scheduled database maintenance is starting now.',
          status: 'investigating',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'upd-4',
          message: 'Maintenance completed successfully. All systems operational.',
          status: 'resolved',
          created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        },
      ],
      affected_components: ['Database'],
    },
  ],
}

function StatusDemo() {
  const [statusData, setStatusData] = useState<StatusData>(mockStatusData)
  const [selectedIncident, setSelectedIncident] = useState<StatusIncident | null>(null)

  // Toggle between different states for demo
  const toggleOverallStatus = () => {
    const statuses: StatusData['overall_status'][] = ['operational', 'degraded', 'partial_outage', 'major_outage']
    const currentIndex = statuses.indexOf(statusData.overall_status)
    const nextIndex = (currentIndex + 1) % statuses.length
    setStatusData({
      ...statusData,
      overall_status: statuses[nextIndex],
      last_updated: new Date().toISOString(),
    })
  }

  // Show incident detail view when an incident is selected
  if (selectedIncident) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">StatusIncidentDetail Component</h3>
          <p style={{ color: 'var(--appgram-foreground)', opacity: 0.6 }} className="mb-4">
            Detailed view of an incident with full timeline.
          </p>
        </div>
        <StatusIncidentDetail
          incident={selectedIncident}
          onBack={() => setSelectedIncident(null)}
          showAffectedComponents
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">StatusBoard Component</h3>
        <p style={{ color: 'var(--appgram-foreground)', opacity: 0.6 }} className="mb-4">
          System status page with service health indicators and incidents. Click on an incident to see details.
        </p>
        <button
          onClick={toggleOverallStatus}
          className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--appgram-primary)' }}
        >
          Toggle Status: {statusData.overall_status}
        </button>
      </div>
      <StatusBoard
        status={statusData}
        heading="System Status"
        description="Current operational status of all services"
        headingAlignment="center"
        onIncidentClick={(incident) => setSelectedIncident(incident)}
      />
    </div>
  )
}

// ============================================================================
// Main App
// ============================================================================

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('components')
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'components', label: 'Components' },
    { id: 'hooks', label: 'Hooks' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'releases', label: 'Releases' },
    { id: 'help', label: 'Help' },
    { id: 'support', label: 'Support' },
    { id: 'status', label: 'Status' },
    { id: 'forms', label: 'Forms' },
    { id: 'blog', label: 'Blog' },
  ]

  const themeModes: ThemeMode[] = ['light', 'dark', 'system']

  const cycleTheme = () => {
    const currentIndex = themeModes.indexOf(themeMode)
    const nextIndex = (currentIndex + 1) % themeModes.length
    setThemeMode(themeModes[nextIndex])
  }

  return (
    <AppgramProvider
      config={{
        projectId: CONFIG.projectId,
        orgSlug: CONFIG.orgSlug,
        projectSlug: CONFIG.projectSlug,
        theme: {
          // Theme mode: 'light' | 'dark' | 'system'
          mode: themeMode,
          // Light mode colors (Arctic Blue)
          colors: {
            primary: '#0EA5E9',
            secondary: '#6B7280',
            accent: '#0EA5E9',
            background: '#FFFFFF',
            text: '#242424',
            cardBackground: '#F7F7F7',
            cardText: '#242424',
          },
          // Dark mode colors (optional - has sensible defaults)
          darkColors: {
            primary: '#38BDF8',
            secondary: '#3A3A3A',
            accent: '#38BDF8',
            background: '#0A0A0A',
            text: '#E5E5E5',
            cardBackground: '#1A1A1A',
            cardText: '#E5E5E5',
          },
          borderRadius: 12,
        },
      }}
    >
      <div
        className="min-h-screen transition-colors duration-200"
        style={{
          backgroundColor: 'var(--appgram-background)',
          color: 'var(--appgram-foreground)'
        }}
      >
        {/* Header */}
        <header
          className="border-b sticky top-0 z-40 transition-colors duration-200"
          style={{
            backgroundColor: 'var(--appgram-background)',
            borderColor: 'var(--appgram-secondary)',
          }}
        >
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                @appgram/react Demo
              </h1>
              <p className="text-sm mt-1 opacity-70">
                Test components and hooks with your Appgram project
              </p>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--appgram-secondary)',
                backgroundColor: 'var(--appgram-card)',
              }}
              title={`Current: ${themeMode}. Click to change.`}
            >
              <span className="text-lg">{ThemeIcons[themeMode]}</span>
              <span className="text-sm font-medium capitalize">{themeMode}</span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div
          className="border-b transition-colors duration-200"
          style={{
            backgroundColor: 'var(--appgram-background)',
            borderColor: 'var(--appgram-secondary)',
          }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--appgram-primary)' : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : 'var(--appgram-foreground)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {activeTab === 'components' && <ComponentsDemo />}
          {activeTab === 'hooks' && <HooksDemo />}
          {activeTab === 'roadmap' && <RoadmapDemo />}
          {activeTab === 'releases' && <ReleasesDemo />}
          {activeTab === 'help' && <HelpDemo />}
          {activeTab === 'support' && <SupportDemo />}
          {activeTab === 'status' && <StatusDemo />}
          {activeTab === 'forms' && <FormsDemo />}
          {activeTab === 'blog' && <BlogDemo />}
        </main>

        {/* Config Info */}
        <footer
          className="border-t mt-8 transition-colors duration-200"
          style={{
            backgroundColor: 'var(--appgram-card)',
            borderColor: 'var(--appgram-secondary)',
          }}
        >
          <div className="max-w-6xl mx-auto px-4 py-4">
            <p className="text-sm opacity-70">
              <strong>Config:</strong> projectId={CONFIG.projectId}, orgSlug={CONFIG.orgSlug}, projectSlug={CONFIG.projectSlug}
            </p>
            <p className="text-xs opacity-50 mt-1">
              Update these values in demo/src/App.tsx to test with your project
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--appgram-primary)' }}>
              <strong>Theme:</strong> {themeMode} mode | Primary: Arctic Blue
            </p>
          </div>
        </footer>
      </div>
    </AppgramProvider>
  )
}
