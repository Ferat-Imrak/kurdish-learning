# Mobile vs Frontend Games – Alignment Audit

This document compares the **mobile app** game settings and UI with the **frontend** after the recent frontend changes. Use it to align mobile with frontend where needed.

---

## 1. **Matching Game**

| Setting | Frontend | Mobile | Match? |
|--------|----------|--------|--------|
| Regular categories – rounds to complete | **10 rounds** | **5 rounds** (`REQUIRED_ROUNDS = 5`) | ❌ No |
| Master Challenge – rounds to complete | **20 rounds** | **15 rounds** (`MASTER_ROUNDS = 15`) | ❌ No |
| Category card subtitle | **"10 rounds"** / **"20 rounds"** | **"X words"** (vocabulary count) | ❌ No |

**Changes needed on mobile:**
- Set `REQUIRED_ROUNDS = 10`, `MASTER_ROUNDS = 20`.
- On category cards, show **"10 rounds"** for regular categories and **"20 rounds"** for Master Challenge instead of `"${item.count} words"`.

---

## 2. **Translation Quiz**

| Setting | Frontend | Mobile | Match? |
|--------|----------|--------|--------|
| Regular categories – questions per game | **25 questions** | **All items in deck** (no limit) | ❌ No |
| Master Challenge – questions per game | **50 questions** | **All items in deck** (no limit) | ❌ No |
| Category card subtitle | **"25 questions"** / **"50 questions"** | **"X words"** (`item.items.length`) | ❌ No |
| Option hover/press styling | No background change on hover; green/red only after selection | Uses `optionCorrect` / `optionWrong` only when answered (no hover issue on touch) | ✅ OK |

**Changes needed on mobile:**
- When starting a game, limit the session to **25 questions** for regular decks and **50 questions** for Master (e.g. `shuffle(deck.items).slice(0, deck.id === 'master' ? 50 : 25)`).
- On category cards, show **"25 questions"** for regular decks and **"50 questions"** for Master instead of `"${item.items.length} words"`.

---

## 3. **Word Builder**

| Setting | Frontend | Mobile | Match? |
|--------|----------|--------|--------|
| Regular categories – words per game | **20 words** (fixed pool) | **All words in deck** (no limit) | ❌ No |
| Master Challenge – words per game | **30 words** (fixed pool) | **All words in deck** (no limit) | ❌ No |
| Category card subtitle | **"20 words"** / **"30 words"** | **"X words"** (`item.words.length`) | ❌ No |
| Completion (saved progress) | 20 unique words (regular), 30 (Master) | Tracks by `uniqueWords`; completion is when all words in session done | ⚠️ Different logic |

**Changes needed on mobile:**
- When selecting a category, build a **session pool**: 20 words for regular, 30 for Master (same logic as frontend: fixed size, repeat from category if needed).
- On category cards, show **"20 words"** for regular and **"30 words"** for Master instead of `item.words.length`.
- Treat completion as: **20 words** for regular categories, **30 words** for Master (for progress/“Completed” state).

---

## 4. **Memory Cards**

| Setting | Frontend | Mobile | Match? |
|--------|----------|--------|--------|
| Max pairs per game | **10 pairs** | **10 pairs** (`MAX_PAIRS_PER_GAME = 10`) | ✅ Yes |
| Category card subtitle | **"X pairs"** (capped at 10 per game) | **"Math.min(MAX_PAIRS_PER_GAME, item.pairs.length) pairs"** | ✅ Yes |

No changes needed for counts or card labels.

---

## 5. **Sentence Builder**

| Setting | Frontend | Mobile | Match? |
|--------|----------|--------|--------|
| Master Challenge – sentences per game | **20 sentences** (random from all) | **20 sentences** (shuffle then slice(0, 20)) | ✅ Yes |
| Category card subtitle (Master) | **"20 sentences"** | **"20 sentences"** | ✅ Yes |
| Regular categories | Uses full deck per category | Uses full deck per category | ✅ OK |
| Progress storage key | **Display name** (`sentence-builder-progress-${deck.name}` e.g. "Colors", "Master Challenge") | **Was id** ("colors", "master"); **now display name** to match frontend | ✅ Aligned |

**Implemented on mobile:**
- Master Challenge uses 20 random sentences per game; card shows "20 sentences".
- Progress key uses **deck.name** (e.g. "Colors", "Master Challenge") so it matches frontend.

---

## 6. **Flashcards**

| Setting | Frontend | Mobile | Match? |
|--------|----------|--------|--------|
| Card back content | **English translation only** | Aligned in prior work | ✅ Assume OK |
| Styling | Kurdish front, English back styling | Aligned in prior work | ✅ Assume OK |

No further changes assumed from this audit.

---

## 7. **Games List (Tab)**

| Setting | Frontend | Mobile | Match? |
|--------|----------|--------|--------|
| Translation Quiz name | **"Translation Quiz"** | **"Translation Quiz"** | ✅ Yes |
| Game list items | Flashcards, Word Matching, Memory Cards, Translation Quiz, Word Builder, Sentence Builder | Same set, no “More Games Coming Soon” | ✅ Yes |

No changes needed.

---

## Summary: What to Change on Mobile

1. **Matching**  
   - `REQUIRED_ROUNDS = 10`, `MASTER_ROUNDS = 20`.  
   - Category cards: **"10 rounds"** / **"20 rounds"** instead of word count.

2. **Translation Quiz**  
   - Limit session to **25** (regular) / **50** (Master) questions.  
   - Category cards: **"25 questions"** / **"50 questions"** instead of item count.

3. **Word Builder**  
   - Session pool: **20 words** (regular), **30 words** (Master).  
   - Category cards: **"20 words"** / **"30 words"**.  
   - Completion: 20/30 words for progress and “Completed”.

4. **Sentence Builder**  
   - Master Challenge: use **20 sentences** per game and show **"20 sentences"** on the card.

5. **Memory Cards**  
   - Already aligned (10 pairs, correct labels).

6. **Flashcards / Games list**  
   - No further alignment changes from this audit.

After these updates, mobile will match the frontend behavior and copy for rounds, questions, words, and sentences.
