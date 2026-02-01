# Stories on Mobile – Design & Implementation Plan

## 1. What exists on frontend

- **7 stories** (ids `story-9` … `story-15`): Mişka Spî, Şêr û Mişk, Hevpeyvîn, Hevpeyvîna Xwarinê, Hevpeyvîna Hewayê, Hevpeyvîna Ajelan, Hevpeyvîna Malê.
- **Data:** Each story has `id`, `title`, `summary`, `paragraphs: { ku, en }[]`.
- **Vocabulary:** In-code `vocabularyDict` (Kurdish → English); words in text are tappable and show translation.
- **Audio:** Per-paragraph Kurdish TTS: (1) in-memory cache, (2) pre-generated MP3s at `/audio/kurdish-tts-mp3/stories/{filename}.mp3`, (3) Kurdish TTS API fallback.
- **Progress:** `localStorage` key `stories-read` = array of story ids (user marks “read” manually).
- **UI:** Sidebar list + main area with two-column paragraphs, English on/off, vocab panel, mark read.

---

## 2. Mobile design (high level)

### 2.1 Navigation

- **Stories tab** (existing) → **Story list** (replace “Coming in Phase 2”).
- Tap a story → **Story detail** (new full-screen screen: read + listen + vocab).

### 2.2 Story list screen

- Single column of **story cards**: title, short summary, “Read” badge (checkmark) if in progress.
- Same 7 stories as frontend; order and ids match.
- Styling aligned with rest of app (e.g. brand blue, card style like Learn/Games).
- Optional: progress count “X/7 read” in header.

### 2.3 Story detail screen

- **Layout:** One column, full width (no two-column; better for small screens).
- **Per paragraph:**
  - Kurdish line (tappable words where we have a translation).
  - **Play** button for that paragraph’s Kurdish audio.
  - Optional English line below (controlled by “English on/off”).
- **Header / controls:**
  - Back.
  - Story title.
  - Toggles: **English on/off**, **Show/Hide vocab**, **Mark read** (same semantics as frontend).
- **Vocabulary:** Either expandable section below story or a bottom sheet / modal listing words + translations for the current story.
- **Word tap:** Show translation in a small **tooltip/modal** (no hover on mobile); tap outside to close.
- **Audio:** Use same logic as frontend (pre-generated MP3 when available, then TTS API); use `expo-av` (or similar) for playback.

### 2.4 Progress

- **Local:** `AsyncStorage` key `stories-read`, value = JSON array of story ids (same as frontend).
- **Sync (later):** Either extend games progress or add a small “stories read” payload to user progress so desktop and mobile stay in sync (optional Phase 2).

---

## 3. Data & code reuse

- **Stories + vocabulary:** Copy the same `stories` array and `vocabularyDict` (or shared types + data file) so mobile and frontend stay in sync. Prefer a **shared data module** (e.g. in a `shared/` or `lib/data/stories.ts`) if you want one source of truth; otherwise duplicate in mobile for now.
- **Audio filename:** Reuse the same `getAudioFilename(text)` logic so pre-generated MP3s match (frontend uses it for `/audio/kurdish-tts-mp3/stories/{filename}.mp3`).

---

## 4. Audio on mobile

- **Pre-generated MP3s:** Frontend serves them from `/audio/kurdish-tts-mp3/stories/`. On mobile you need a **base URL** (e.g. your deployed site or a CDN):  
  `BASE_URL + '/audio/kurdish-tts-mp3/stories/' + filename + '.mp3'`.  
  Add something like `EXPO_PUBLIC_WEB_URL` in `mobile/.env` and use it only for read-only assets (no auth).
- **Fallback:** Same Kurdish TTS API as frontend; store API key in `EXPO_PUBLIC_KURDISH_TTS_API_KEY` (or pull from backend if you prefer).
- **Playback:** Use `expo-av` (`Audio.Sound`) for loading and playing; handle “play one at a time” (stop previous when starting a new paragraph) like frontend.

---

## 5. Implementation order

1. **Data:** Add stories + vocabulary (and `getAudioFilename`) to mobile (shared or copied).
2. **Story list:** Replace placeholder Stories tab with list of 7 stories; read `stories-read` from AsyncStorage and show Read badge.
3. **Story detail:** New screen (e.g. `app/stories/[id].tsx` or `app/stories/detail.tsx` with `id` param). Single-column paragraphs, play per paragraph, English toggle, vocab section or sheet, word tap → translation tooltip, mark read → save to AsyncStorage.
4. **Audio:** Wire pre-generated MP3 URL (using `EXPO_PUBLIC_WEB_URL`) and TTS API fallback; use `expo-av` for playback.
5. **Polish:** Match styling to Learn/Games (cards, buttons, spacing). Optional: sync “stories-read” with backend later.

---

## 6. Files to add/change (mobile)

| Area           | Action |
|----------------|--------|
| `(tabs)/stories.tsx` | Replace placeholder with story list (cards from shared/copied data, navigate to detail). |
| `stories/[id].tsx` or `stories/detail.tsx` | New: story detail, paragraphs, audio, vocab, word tap, mark read. |
| `lib/data/stories.ts` (or shared) | Story array + vocabularyDict + getAudioFilename (or copy from frontend). |
| `lib/store/storiesProgressStore.ts` (optional) | Like games: read/write `stories-read` and optionally sync to backend. |
| Audio          | Use `expo-av`; resolve MP3 URL from `EXPO_PUBLIC_WEB_URL`; TTS API fallback. |

---

## 7. Summary

- **Bring stories to mobile** by: (1) reusing the same 7 stories and vocabulary, (2) story list on the Stories tab, (3) story detail screen with one-column layout, per-paragraph audio, English/vocab toggles, word tap for translation, and mark read stored in AsyncStorage.
- **Design for mobile:** single column, big tap targets, tooltip/modal for translations, optional bottom sheet for vocab; audio via pre-generated MP3 (from web URL) + TTS API fallback.
- **Later:** optionally sync “stories-read” with backend so progress matches desktop (same user, same list).
