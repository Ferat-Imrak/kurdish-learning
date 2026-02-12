# Progress system: deep-dive analysis (current behavior)

## What was fixed

- **Body Parts (and all audio lessons):** “X/24” now **persists** after leaving and coming back. We store which audio keys were played (`playedAudioKeys`) and use that for the count and for dimming.
- **Progress:** For audio-focused lessons, progress is set so that playing all audios (and any time/practice rules) can reach 100%; after remount we show count from `playedAudioKeys`, not derived from a weighted percentage.
- **timeSpent:** Lessons pass **total** time spent (base + session). The store **replaces** with that value (no accumulation). Merge takes **max** of local and remote (both are totals).
- **Sync/merge:** `mergeProgress` and `syncFromBackend` preserve and **merge** `playedAudioKeys` (union) so local played keys are never lost when syncing with backend.

---

## How progress works (current)

### 1. What is stored (persisted)

| Layer        | What is stored | Where |
|-------------|----------------|--------|
| **Mobile**  | `progress` (0–100), `status`, `timeSpent`, optional `score`, **`playedAudioKeys`** (array of audio keys played) | AsyncStorage key `lesson_progress_<email>` |
| **Backend** | `progress`, `status`, `timeSpent` (no `playedAudioKeys`; backend does not store per-item state) | PostgreSQL via `/api/progress/user` and `/api/progress/user/sync` |
| **Frontend**| Same shape as mobile where applicable | `localStorage` key `lessonProgress_<email>` (and section interactions in `lessonInteractions_<lessonId>`) |

**Important:** Mobile **does** persist which items were played for audio lessons via **`playedAudioKeys`**. This is used for the “X/24” count and for dimming. Backend does not store `playedAudioKeys`; it is merged locally and kept on sync (union with any remote keys; in practice remote has none).

---

### 2. How the “X/24” number is shown (mobile, e.g. Body Parts)

- **During the session (same mount):**  
  `learnedCount` is based on `uniqueAudiosPlayedRef.current.size` (and/or `playedKeysSnapshot`), seeded from stored `playedAudioKeys` on mount. So you see the correct count including previously played items.

- **After leaving and coming back (remount):**  
  On mount we load `playedAudioKeys` from the store and seed `uniqueAudiosPlayedRef` and `playedKeysSnapshot`. So **learnedCount = playedAudioKeys.length** (capped by total). **24/24 stays 24/24** after coming back.

Progress percentage for these lessons is computed so that when all audios are played (and any time/practice rules are satisfied), progress can reach 100%. The displayed “X/24” is driven by the **actual count of played keys**, not by a weighted percentage.

---

### 3. timeSpent semantics

- **Stored value:** Total minutes spent in that lesson (cumulative per lesson).
- **On update:** Callers pass **total** time spent (stored base + current session). The store **replaces** the previous `timeSpent` with this value (no delta accumulation). Value is clamped to 0–1000 minutes.
- **On merge (local + remote):** We take **max(local.timeSpent, remote.timeSpent)** because both sides store totals; summing would double-count.

---

### 4. When is progress loaded/synced

- **Initialize:** Load from AsyncStorage (includes `playedAudioKeys`), then `syncFromBackend()`. Merged state uses:
  - **progress:** max(local, remote)
  - **timeSpent:** max(local, remote)
  - **playedAudioKeys:** union(local, remote) — in practice remote has none, so local is preserved.
- **After POST sync:** Response is merged with current local state via `mergeProgress`; `playedAudioKeys` are again unioned, and local progress/time are preserved or improved.

So:
- Progress and `playedAudioKeys` are persisted (AsyncStorage) and survive app restarts.
- Backend sync does not overwrite or drop `playedAudioKeys`; merge keeps the union.

---

### 5. mergeProgress and sync (summary)

- **mergeProgress(local, remote):**
  - `progress` = max(local, remote)
  - `lastAccessed` = latest of the two
  - `timeSpent` = max(local, remote)  // both are totals
  - `playedAudioKeys` = union(local.playedAudioKeys, remote.playedAudioKeys)
  - `status` / `score` = take best (e.g. COMPLETED if either is COMPLETED, max score).
- **syncFromBackend (GET):** Remote entries have no `playedAudioKeys`. When we merge with local, `mergeProgress` keeps the union, so local `playedAudioKeys` are preserved.
- **POST sync response:** We build merged progress from response and attach local `playedAudioKeys` where needed; then we run `mergeProgress(current, mergedProgress)` so again `playedAudioKeys` are unioned and not lost.

---

## Root cause (historical) and current state

1. **Previously:** “X/24” was in-session from a ref (lost on unmount) and after remount from `floor((progress/100)*total)`, with progress weighted (e.g. 50% audio + 50% time), so 24/24 could show as 20/24 after leaving.
2. **Now:** We persist **`playedAudioKeys`** and use it for count and dimming. Progress logic allows 100% when all audios (and any other rules) are done. **24/24 stays 24/24** after remount and sync.
3. **timeSpent:** Store treats incoming value as **total** (replace). Merge uses **max** so totals are not double-counted.
4. **playedAudioKeys:** Always merged as **union** so nothing is lost across sync or remount.

---

## Frontend vs mobile consistency

**Aligned (sync-safe):** Both use the same backend API; both treat timeSpent as total minutes (replace on update); **both merge timeSpent with max(local, remote)** so web + mobile sync does not double-count time. Progress and status merge by max / best on both.

**Different (by design):** Frontend has no `playedAudioKeys`; mobile persists and merges it. Backend does not store playedAudioKeys; sync is consistent for progress %, status, timeSpent, score.

| Aspect | Frontend (web) | Mobile |
|--------|-----------------|--------|
| **Storage** | `localStorage` (lessonProgress_*) | AsyncStorage + backend |
| **Merge timeSpent** | **max(local, remote)** | **max(local, remote)** |
| **Sync** | ProgressContext: sync from/to backend | progressStore: syncFromBackend; merge progress/time/playedAudioKeys |
| **“Items” tracking** | Section-based (lessonInteractions_*) | **Audio-based: `playedAudioKeys` persisted**; “X/24” and dimming use this |
| **Persistence** | Until user clears / logs out | Same; survives app restarts |
