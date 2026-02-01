# Frontend Progress Tracking Architecture

## Overview
The frontend (Next.js) uses a **React Context-based** progress tracking system, which is simpler than the mobile (React Native/Zustand) implementation.

## Key Components

### 1. ProgressContext (`frontend/src/contexts/ProgressContext.tsx`)

**Storage:**
- **Local:** `localStorage` (keyed by user email: `lessonProgress_${email}`)
- **Remote:** Backend API sync via `/progress/user` (GET) and `/progress/user/sync` (POST)
- **Debounce:** 5 seconds for backend sync

**State Management:**
```typescript
const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({})
```

**Key Functions:**
- `updateLessonProgress(lessonId, progress, status?, score?, timeSpent?)` - Updates progress
  - Accumulates `timeSpent` if provided: `currentTimeSpent + newTimeSpent`
  - Clamps progress between 0-100
- `getLessonProgress(lessonId)` - Returns progress for a lesson
- `syncFromBackend()` - Loads progress from backend on mount
- `syncToBackend()` - Debounced (5s) sync to backend

**Lifecycle:**
1. On mount: Loads from `localStorage` → Syncs from backend → Merges both
2. On update: Saves to `localStorage` immediately → Dispatches `lessonProgressUpdated` event → Syncs to backend (debounced)

### 2. Progress Data Structure

```typescript
interface LessonProgress {
  lessonId: string
  progress: number // 0-100
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  lastAccessed: Date
  score?: number // Optional practice score (0-100)
  timeSpent: number // in minutes
}
```

### 3. Current Frontend Lesson Pattern (Days Example)

**Simple Tracking (OLD PATTERN):**
```typescript
const { updateLessonProgress, getLessonProgress } = useProgress()
const startTimeRef = useRef<number>(Date.now())
const audioPlaysRef = useRef<number>(0) // Just counts total clicks

const calculateProgress = () => {
  const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
  const audioProgress = Math.min(50, audioPlaysRef.current * 5) // 10 clicks = 50%
  const timeProgress = Math.min(50, timeSpent * 10) // 5 minutes = 50%
  const progress = Math.min(100, audioProgress + timeProgress)
  const status = progress >= 80 ? 'COMPLETED' : 'IN_PROGRESS'
  return { progress, status }
}

// On audio play:
audioPlaysRef.current++
const { progress, status } = calculateProgress()
updateLessonProgress(LESSON_ID, progress, status)

// On practice complete:
const { progress, status } = calculateProgress()
updateLessonProgress(LESSON_ID, progress, status)
```

**Key Differences from Mobile:**
- ❌ **No unique audio tracking** - Just counts total clicks
- ❌ **No ref restoration** - Doesn't restore previous session's audio plays
- ❌ **No weighted progress config** - Simple formula: audio (50%) + time (50%)
- ❌ **No base progress tracking** - Doesn't separate base from session progress
- ✅ **Direct status updates** - Practice games directly call `updateLessonProgress`

### 4. Progress Helper (`frontend/src/lib/progressHelper.ts`)

A helper utility exists with mobile-like functions:
- `restoreRefsFromProgress()` - Restores refs from stored progress
- `calculateTotalProgress()` - Weighted progress calculation
- `initializeProgressState()` - Initializes progress state

**BUT:** This helper is **NOT currently used** in the frontend lessons. Frontend lessons use the simpler pattern shown above.

## Comparison: Frontend vs Mobile

| Feature | Frontend (Next.js) | Mobile (React Native) |
|---------|-------------------|----------------------|
| **State Management** | React Context | Zustand |
| **Local Storage** | `localStorage` | `AsyncStorage` / `SecureStore` |
| **Audio Tracking** | Total clicks (`audioPlaysRef`) | Unique audios (`Set<string>`) |
| **Progress Calculation** | Simple: `audio(50%) + time(50%)` | Weighted: `audio + time + practice` |
| **Ref Restoration** | ❌ None | ✅ Restores from stored progress |
| **Practice Tracking** | Direct `updateLessonProgress` call | Individual game states + `useEffect` |
| **Backend Sync** | 5s debounce | 2s debounce |
| **Progress Config** | ❌ None | ✅ `progressConfig` with weights |

## Frontend Lessons Status

**Current Pattern (Simple):**
- `days/page.tsx` - Uses simple `audioPlaysRef + timeSpent` calculation
- Most other lessons likely use similar pattern

**Should Migrate To:**
- Use `progressHelper.ts` utilities
- Implement unique audio tracking (`Set<string>`)
- Use weighted `progressConfig` like mobile
- Restore refs from previous sessions
- Track individual practice game states

## Notes

1. **Frontend is simpler** - Less sophisticated tracking than mobile
2. **No practice threshold** - Doesn't use 70% passing requirement like mobile
3. **Direct updates** - Practice games update progress immediately, not via `useEffect` watching completion states
4. **ProgressHelper exists** - But not used yet in actual lessons
5. **Event system** - Uses `window.dispatchEvent('lessonProgressUpdated')` to notify components

## Recommendation for Months Lesson

If you want to update the frontend months lesson to match the newer mobile pattern:
1. Use `progressHelper.ts` utilities
2. Implement unique audio tracking
3. Use weighted `progressConfig`
4. Restore refs from previous sessions
5. Track individual practice game states with `useEffect` for completion

But if you want to keep it simple (current frontend pattern):
- Use `audioPlaysRef` for total clicks
- Use `startTimeRef` for session time
- Call `updateLessonProgress` directly from practice games
