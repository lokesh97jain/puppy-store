# Frontend Implementation

> **Assessment Context:** This is the **coding portion** of the Mobile + Systems Engineering pre-interview exercise. The frontend is fully implemented in React Native. Backend API, LLM integration, and DevOps are documented separately as **theory-only** (no code required).

---

## Overview

**Tech Stack:**
- React Native with Expo
- TypeScript (optional, but used for type safety)
- Expo Router (file-based navigation)
- Functional components with React Hooks
- No external state management libraries (per requirements)

**Architecture:**
- Main entry renders a puppy list; tapping a card opens a detail screen
- Expo Router file-based routing manages navigation
- Data is local JSON (30 puppies), accessed via an async wrapper that simulates a real API (delay + error/empty toggles)
- Cursor-based pagination supports infinite scrolling with end-of-list handling
- UI demonstrates Loading, Error, Empty, and Success states with user actions to recover

---

## Implemented Features

### Screens
- **List screen:** 2-column grid of puppy cards
- **Detail screen:** Full puppy information with hero image

### Navigation
- Tap-through via Expo Router file-based routes
- Dynamic detail routes (`/puppy/[id]`)
- Clean back navigation with proper header configuration

### Data Management
- Local JSON dataset (30 puppies)
- Async fetch wrapper simulates real API behavior
- Configurable delay, error, and empty state toggles 

### Interactions
- **Pull-to-refresh:** Reload puppy list
- **Infinite scroll:** Load more on scroll bottom 

### UI States
- **Loading:** Activity indicator with "Loading puppies..." message
- **Error:** Friendly error message with retry button
- **Empty:** "No puppies available" with refresh action
- **Success:** Grid list with data

### Accessibility & UX
- Pressable touch targets with visual feedback
- Responsive grid layout adapts across mobile and web
- Images use `cover` behavior for consistent rendering
- Minimum touch target sizes (44x44)

---

## Key Design Decisions

- **Cursor-based pagination:** Chosen for stability when data changes and better performance vs offset-based pagination (avoids OFFSET-based pagination overhead)
- **Local JSON behind a Promise:** Exercises real UI states without backend dependency; easy to replace with actual API calls
- **Clean, functional styling:** Focuses on behavior and readability over visual polish (assessment priority)
- **File-based routing:** Clear structure with low configuration overhead

---

## File Structure

```
app/
├── index.tsx              # Home screen (puppy list)
├── puppy/
│   └── [id].tsx          # Detail screen (dynamic route)
├── _layout.tsx           # Root layout configuration
api/
└── puppies.ts            # Mock API layer (fetch simulation)
data/
└── puppies.json          # Local dataset (30 puppies)
components/               # Reusable UI components (if any)
```

**Key files:**
- `src/api/puppies.ts`: Simulates API with delay, pagination, error/empty toggles
- `puppies.json`: 30 puppy records with id, name, description, imageUrl, age, location
- `index.tsx`: List screen with infinite scroll, pull-to-refresh, error handling
- `[id].tsx`: Detail screen with puppy info and back navigation

---

## State Management

- **Local component state** via React hooks (useState, useEffect)
- **No global state:** No Redux, MobX, Zustand (per requirements)
- **Explicit load controllers:** Separate functions for initial load, refresh, and pagination
- **Async handling** is structured to avoid common race conditions

---

## Navigation

**Expo Router with file-based routes:**
- `app/index.tsx` → List screen (home)
- `app/puppy/[id].tsx` → Detail screen (dynamic route)

**Features:**
- Detail header title set to puppy name
- Back button label simplified
- Deep linking support (can navigate directly to `/puppy/p_123`)

---

## Responsiveness

- **2-column grid** on list screen with flexible card widths
- **Images use `cover`** to maintain visual consistency
- **Layout scales** without device-specific code paths
- **Works on:** iOS, Android, and Web (via Expo)

---

## Testing & Validation

Manually verified:
- All UI states (Loading, Error, Empty, Success)
- Pagination behavior (duplicate fetches minimized through cursor-based pagination, end-of-list handling)
- Navigation flow (list → detail → back) on mobile and web
- Responsive layout and image rendering across screen sizes
- Common edge cases (missing data, long text, invalid IDs)

---

## Known Limitations

**Intentional simplifications for assessment scope:**
- No image caching (would add in production)
- No offline support (would add local storage + queue)
- No unit tests included (would add automated tests)
- No detailed accessibility labels (would add for screen readers)
- Mock API doesn't persist state between app restarts
- No analytics or error tracking (would add in production)

These would be added in a production implementation but are out of scope for this exercise.

---
## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Expo CLI (optional, will auto-install)

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app (physical device)
   - Press `w` for web browser

### Testing Different States

To test error/empty states, modify `api/puppies.ts`:

```typescript
// Simulate error
const SIMULATE_ERROR = true;  // Change to true

// Simulate empty data
const SIMULATE_EMPTY = true;  // Change to true
```

### Project Structure
- File-based routing under `app/`
- Home screen: `app/index.tsx`
- Detail screen: `app/puppy/[id].tsx`
- Mock API: `api/puppies.ts`
- Data: `data/puppies.json` (30 puppies)

---

## UI Preview

Screenshots below show the list and detail screens for reference only.

![alt text](<Screenshot_20260105_171940_Expo Go.jpg>)
![alt text](<Screenshot_20260105_171946_Expo Go.jpg>)
