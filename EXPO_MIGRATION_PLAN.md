# Expo Migration Plan

## Overview
Migrating the Kurdish Learning Next.js web app to Expo (React Native) for native mobile deployment.

## Migration Strategy: Phased Approach

### Phase 1: Core Foundation ⏳ (IN PROGRESS)
**Goal:** Get a working mobile app with essential features

1. ✅ **Home/Landing Page** (`page.tsx`)
   - Main entry point
   - Language selection (Kurmanji/Sorani)
   - Feature highlights
   - Navigation to other sections

2. ✅ **Authentication** (`auth/login`, `auth/register`)
   - Login screen
   - Register screen
   - Auth state management
   - Integration with existing backend API

3. ✅ **Dashboard** (`dashboard/page.tsx`)
   - User progress overview
   - Quick access to lessons/games
   - Navigation hub

4. ✅ **Navigation Setup**
   - Tab navigation (Home, Learn, Games, Profile)
   - Stack navigation for auth flow
   - Deep linking setup

**Deliverable:** Working mobile app with auth and basic navigation

---

### Phase 2: Learning Core
**Goal:** Core learning functionality

5. **Learn Section** (`learn/page.tsx`)
   - Main learning hub
   - Category listing
   - Navigation to specific topics

6. **Lessons** (`lessons/[lessonId]/page.tsx`)
   - Lesson viewer
   - Progress tracking
   - Audio playback

7. **One Game** (e.g., `games/flashcards`)
   - Validate game mechanics in React Native
   - Touch interactions
   - Score tracking

**Deliverable:** Users can learn and play one game

---

### Phase 3: Expand Features
**Goal:** Complete feature parity

8. **Remaining Games**
   - Matching
   - Memory Cards
   - Word Builder
   - Picture Quiz
   - Sentence Builder
   - Story Time

9. **Stories** (`stories/page.tsx`)
   - Story reader
   - Vocabulary highlights
   - Audio narration

10. **Profile & Settings** (`profile/page.tsx`)
    - User profile
    - Settings
    - Subscription management

11. **Reference Pages** (`reference/*`)
    - Quick reference materials
    - Alphabet, numbers, etc.

**Deliverable:** Full feature parity with web app

---

## Technical Setup

### Project Structure
```
kurdish-learning/
├── frontend/          # Next.js web app (existing)
├── mobile/            # Expo React Native app (new)
│   ├── app/           # Expo Router pages
│   ├── components/    # React Native components
│   ├── lib/           # Shared utilities
│   └── hooks/         # Custom hooks
└── shared/            # Shared code (types, API clients, constants)
    ├── types/         # TypeScript types
    ├── api/           # API client functions
    └── constants/     # Shared constants/data
```

### Shared Code Strategy
- **Types:** User types, lesson types, game types
- **API Client:** Functions to call backend API
- **Constants:** Kurdish word lists, lesson data, game configurations
- **Utilities:** Helper functions used by both apps

### Key Technologies
- **Expo Router:** File-based routing (similar to Next.js)
- **React Native:** Core framework
- **Expo SDK:** Native features (audio, storage, etc.)
- **TypeScript:** Type safety
- **Zustand/Context:** State management
- **React Query:** API data fetching

---

## Migration Checklist

### Phase 1 Checklist
- [ ] Set up Expo project in `mobile/` directory
- [ ] Configure Expo Router
- [ ] Set up shared code structure
- [ ] Create API client in shared
- [ ] Migrate Home/Landing page
- [ ] Migrate Login page
- [ ] Migrate Register page
- [ ] Migrate Dashboard page
- [ ] Set up navigation (tabs + stack)
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical device

### Phase 2 Checklist
- [ ] Migrate Learn section
- [ ] Migrate Lessons viewer
- [ ] Migrate one game (flashcards)
- [ ] Test learning flow end-to-end

### Phase 3 Checklist
- [ ] Migrate remaining games
- [ ] Migrate Stories
- [ ] Migrate Profile
- [ ] Migrate Reference pages
- [ ] Polish and optimize
- [ ] Prepare for App Store/Play Store

---

## Notes
- Backend stays unchanged (same API endpoints)
- Web app continues to work independently
- Mobile app uses same backend API
- Shared code ensures consistency between web and mobile

---

## Status
- **Current Phase:** Phase 1 - Core Foundation
- **Started:** December 30, 2024
- **Last Updated:** December 30, 2024


