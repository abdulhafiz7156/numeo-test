# High-Volume Users Dashboard

React + TypeScript dashboard that handles 10,000 users with virtualization and optimized rendering.

## Features

- 10,000 generated users with unique IDs
- Virtualized row rendering via `@tanstack/react-virtual`
- Infinite scroll chunking
- Sorting by name, email, age
- Debounced search (`400ms`)
- Status filter
- Expensive computed row score (memoized)
- Row click details modal
- Editable fields
- Optimistic save flow with random failure and rollback
- UI states: loading, error, empty

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```
