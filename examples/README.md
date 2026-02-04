# @appgram/react Examples

This folder contains example implementations showing how to use the `@appgram/react` library.

## Examples

### 1. Basic Setup (`basic-setup.tsx`)

Shows the simplest way to get started with pre-built components:
- Setting up `AppgramProvider` with configuration
- Using `WishList`, `RoadmapBoard`, `ReleaseList`, and `SupportForm` components
- Basic theme customization

### 2. Headless Hooks (`headless-hooks.tsx`)

Demonstrates building completely custom UI with headless hooks:
- `useWishes` - Fetching and filtering wishes
- `useWish` - Fetching a single wish
- `useVote` - Managing vote state
- `useComments` - CRUD operations for comments
- `useRoadmap` - Fetching roadmap data

### 3. Next.js Integration (`nextjs-integration.tsx`)

Shows how to integrate with Next.js App Router:
- Client provider wrapper pattern
- Server and client component separation
- Environment variable configuration
- Tailwind CSS preset setup

### 4. Custom Rendering (`custom-rendering.tsx`)

Advanced customization using render props:
- Custom `renderWish` for completely custom wish cards
- Custom `renderVoteButton`, `renderStatus`, `renderCategory` for sub-elements
- Custom loading, empty, and error states
- Custom roadmap column rendering
- Custom release card rendering

## Quick Start

```tsx
import { AppgramProvider, WishList } from '@appgram/react'

function App() {
  return (
    <AppgramProvider
      config={{
        projectId: 'your-project-id',
        orgSlug: 'your-org',
        projectSlug: 'your-project',
      }}
    >
      <WishList variant="cards" />
    </AppgramProvider>
  )
}
```

## Headless Usage

```tsx
import { AppgramProvider, useWishes, useVote } from '@appgram/react'

function MyCustomFeedback() {
  const { wishes, isLoading } = useWishes()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {wishes.map((wish) => (
        <MyCustomCard key={wish.id} wish={wish} />
      ))}
    </div>
  )
}

function MyCustomCard({ wish }) {
  const { hasVoted, voteCount, toggle } = useVote({ wishId: wish.id })

  return (
    <div>
      <h3>{wish.title}</h3>
      <button onClick={toggle}>
        {hasVoted ? '✓' : '▲'} {voteCount}
      </button>
    </div>
  )
}
```

## Theme Customization

```tsx
<AppgramProvider
  config={{
    projectId: 'xxx',
    theme: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#ffffff',
        text: '#09090b',
        cardBackground: '#f9fafb',
        cardText: '#111827',
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
      },
      borderRadius: 12,
    },
  }}
>
```

## Available Hooks

| Hook | Purpose |
|------|---------|
| `useWishes` | List wishes with filters, pagination, search |
| `useWish` | Fetch a single wish by ID |
| `useVote` | Vote/unvote with optimistic updates |
| `useComments` | Fetch and create comments |
| `useRoadmap` | Fetch roadmap columns and items |
| `useReleases` | Fetch changelog/releases |
| `useRelease` | Fetch a single release |
| `useHelpCenter` | Fetch help collections and flows |
| `useHelpFlow` | Fetch a single help flow |
| `useHelpArticle` | Fetch a single help article |
| `useSupport` | Submit and manage support tickets |

## Available Components

| Component | Description |
|-----------|-------------|
| `WishList` | List of feature requests (cards, compact, masonry) |
| `WishCard` | Single wish card with voting |
| `VoteButton` | Standalone vote button |
| `RoadmapBoard` | Roadmap display (kanban, list, timeline) |
| `RoadmapColumn` | Single roadmap column |
| `ReleaseList` | Changelog list (timeline, cards, compact) |
| `ReleaseCard` | Single release card |
| `HelpCollections` | Help center collections grid |
| `SupportForm` | Support ticket submission form |
