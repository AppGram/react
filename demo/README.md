# @appgram/react Demo

Interactive demo app for testing the `@appgram/react` library.

## Quick Start

From the `packages/appgram-react` directory:

```bash
# Option 1: Full setup (builds library + installs demo + runs)
npm run demo

# Option 2: Step by step
npm install          # Install library dependencies
npm run build        # Build the library
cd demo
npm install          # Install demo dependencies
npm run dev          # Start demo at http://localhost:5173
```

## Configuration

Edit `demo/src/App.tsx` to update the config:

```tsx
const CONFIG = {
  projectId: 'your_project_id',  // Your Appgram project ID
  orgSlug: 'your_org',           // Your organization slug
  projectSlug: 'your_project',   // Your project slug
  // apiUrl: 'http://localhost:3000', // For local API testing
}
```

## What's Included

The demo showcases:

1. **Components Tab** - Pre-built `WishList` with search, filters, and click handling
2. **Hooks Tab** - Custom UI built with `useWishes` and `useVote` hooks
3. **Roadmap Tab** - `RoadmapBoard` component in kanban layout
4. **Releases Tab** - `ReleaseList` component in timeline layout
5. **Help Tab** - `HelpCollections` component with search
6. **Support Tab** - `SupportForm` for ticket submission

## Development

To develop the library and see changes in the demo:

**Terminal 1** (library watch mode):
```bash
cd packages/appgram-react
npm run dev
```

**Terminal 2** (demo dev server):
```bash
cd packages/appgram-react/demo
npm run dev
```

Changes to library files will trigger a rebuild, and Vite will hot-reload the demo.

## Testing with Mock Data

If you don't have an Appgram project, the components will show loading states and then empty/error states. To test the UI:

1. Set up a local Appgram API server
2. Update `CONFIG.apiUrl` to point to your local server
3. Or create a test project at appgram.dev
