# @appgram/react

React library for integrating Appgram portal features with pre-built UI components and headless hooks.

## Installation

```bash
npm install @appgram/react
```

```bash
yarn add @appgram/react
```

```bash
pnpm add @appgram/react
```

## Quick Start

Wrap your app with `AppgramProvider`:

```tsx
import { AppgramProvider } from '@appgram/react'

function App() {
  return (
    <AppgramProvider apiKey="your-api-key">
      <YourApp />
    </AppgramProvider>
  )
}
```

Use components or hooks:

```tsx
import { WishList, useWishes } from '@appgram/react'

// Pre-built component
function Feedback() {
  return <WishList />
}

// Or headless hook for custom UI
function CustomFeedback() {
  const { wishes, isLoading } = useWishes()

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {wishes.map(wish => (
        <li key={wish.id}>{wish.title}</li>
      ))}
    </ul>
  )
}
```

## Features

- **Feedback & Wishboards** - Collect feature requests with voting
- **Roadmap** - Display product roadmap with status columns
- **Changelog** - Show release notes and updates
- **Help Center** - Knowledge base with collections and articles
- **Support** - Ticket submission forms
- **Status Page** - Service status and incident tracking
- **Surveys** - Collect user feedback with forms
- **Blog** - Display blog posts and categories

## Hooks

| Hook | Description |
|------|-------------|
| `useWishes` | Fetch and manage feature requests |
| `useVote` | Handle voting on wishes |
| `useRoadmap` | Fetch roadmap data |
| `useReleases` | Fetch changelog releases |
| `useHelpCenter` | Fetch help center collections |
| `useHelpArticle` | Fetch individual articles |
| `useSupport` | Submit support requests |
| `useStatus` | Fetch status page data |
| `useSurvey` | Fetch and submit surveys |
| `useContactForm` | Fetch and submit contact forms |
| `useBlogPosts` | Fetch blog posts |

## Components

| Component | Description |
|-----------|-------------|
| `WishList` | Feature request list with voting |
| `SubmitWishForm` | Form to submit new wishes |
| `RoadmapBoard` | Kanban-style roadmap display |
| `ReleaseList` | Changelog with release cards |
| `HelpCenter` | Full help center with search |
| `SupportForm` | Support ticket submission |
| `StatusBoard` | Service status dashboard |
| `SurveyRenderer` | Dynamic survey forms |
| `Blog` | Blog listing with categories |

## Documentation

Full documentation available at [appgram.dev/docs](https://appgram.dev/docs)

## Requirements

- React 18.0.0 or higher

## License

MIT
