# Frontend Progress Tracking Analysis

## Summary
This document analyzes how progress tracking works across all frontend lesson pages.

---

## **Pattern 1: New Mobile-Style Pattern** (2 lessons)

### ✅ **Alphabet** (`learn/alphabet/page.tsx`)
- **Uses:** `restoreRefsFromProgress`, `uniqueAudiosPlayedRef`, `baseAudioPlaysRef`, `startTimeRef`
- **Progress Config:** `totalAudios: 37`, `hasPractice: false`, `audioWeight: 50`, `timeWeight: 50`
- **Calculation:** Weighted `calculateProgress()` with unique audio tracking
- **Features:**
  - Restores refs from stored progress on mount
  - Tracks unique audios (no duplicates)
  - Base audio plays estimated from previous sessions
  - Safeguards to prevent progress jumps
  - Time tracking with base + session time

### ✅ **Numbers** (`learn/[dialect]/numbers/page.tsx`)
- **Uses:** Same as Alphabet + practice tracking
- **Progress Config:** `totalAudios: 45`, `hasPractice: true`, `audioWeight: 30`, `timeWeight: 20`, `practiceWeight: 50`
- **Calculation:** Weighted `calculateProgress()` with practice score
- **Features:**
  - All Alphabet features
  - Individual practice game states (`mathQuizCompleted`, `matchingGameCompleted`, etc.)
  - Combined practice completion useEffect
  - Practice score calculation (70% threshold)

---

## **Pattern 2: Old Simple Pattern** (13+ lessons)

### **Days** (`learn/days/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number - counts all plays)
- **Calculation:** Simple `calculateProgress()` - 50% audio + 50% time
- **Audio:** `audioPlaysRef.current * 5` (max 50%, 10 clicks = 50%)
- **Time:** `timeSpent * 10` (max 50%, 5 minutes = 50%)
- **Practice:** Has practice games but no practice progress tracking
- **Issues:**
  - No unique audio tracking (duplicate clicks count)
  - No ref restoration (loses progress on refresh)
  - No base audio tracking

### **Months** (`learn/months/page.tsx`)
- **Same pattern as Days**
- Simple audio + time calculation
- No unique tracking, no ref restoration

### **Verbs** (`learn/verbs/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** 30% audio + 20% time + 50% practice
- **Audio:** `audioPlaysRef.current * 0.8` (max 30%)
- **Time:** `timeSpent * 5` (max 20%)
- **Practice:** `practiceScore * 0.5` (max 50%)
- **Issues:**
  - No unique audio tracking
  - No ref restoration
  - Practice score stored but not properly tracked

### **Animals** (`learn/animals/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (Set - for unique tracking!)
- **Calculation:** Not fully implemented - has unique Set but no calculateProgress
- **Issues:**
  - Has unique audio Set but doesn't use it for progress
  - No ref restoration
  - No base audio tracking
  - No progress calculation visible

### **Simple Present** (`learn/simple-present/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

### **Simple Past** (`learn/simple-past/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

### **Simple Future** (`learn/simple-future/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

### **Prepositions** (`learn/prepositions/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

### **Basic Adjectives** (`learn/basic-adjectives/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

### **Articles & Plurals** (`learn/articles-plurals/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

### **Possessive Pronouns** (`learn/possessive-pronouns/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

### **Questions & Negation** (`learn/questions-negation/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

### **Sentence Structure & Pronouns** (`learn/sentence-structure-pronouns/page.tsx`)
- **Uses:** `startTimeRef`, `audioPlaysRef` (number)
- **Calculation:** Similar to Verbs pattern
- **Issues:** Same as Verbs

---

## **Pattern 3: No Progress Tracking** (3+ lessons)

### **Colors** (`learn/colors/page.tsx`)
- **No progress tracking at all**
- No `updateLessonProgress`, no `getLessonProgress`
- No refs, no calculation

### **Other Lessons** (likely similar):
- `learn/nature/page.tsx`
- `learn/family/page.tsx`
- `learn/body-parts/page.tsx`
- `learn/weather/page.tsx`
- `learn/house/page.tsx`
- `learn/food/page.tsx`
- `learn/time/page.tsx`
- `learn/conversations/page.tsx`

---

## **Common Issues Across Old Pattern Lessons:**

1. **No Unique Audio Tracking**
   - Most use `audioPlaysRef` as a number, counting duplicate clicks
   - Only Animals uses Set but doesn't implement it properly

2. **No Ref Restoration**
   - Progress resets on page refresh
   - No `restoreRefsFromProgress` usage
   - No `baseAudioPlaysRef` to track previous sessions

3. **No Base Time Tracking**
   - `startTimeRef` always starts at `Date.now()` on mount
   - Doesn't account for time spent in previous sessions

4. **Inconsistent Progress Calculation**
   - Different weights across lessons
   - Some have practice, some don't
   - Practice threshold varies (70% vs 80%)

5. **No Progress Config**
   - Hardcoded weights in `calculateProgress`
   - No standardized `progressConfig` object

---

## **Recommendations:**

1. **Migrate all lessons to new pattern** (like Alphabet/Numbers)
   - Use `restoreRefsFromProgress`
   - Implement unique audio tracking
   - Add `progressConfig` with standardized weights
   - Restore base audio plays and time spent

2. **Standardize practice tracking**
   - Use 70% threshold consistently
   - Track individual practice games separately
   - Combine scores with useEffect (like Numbers)

3. **Add progress tracking to lessons without it**
   - Colors, Nature, Family, etc. should track progress

4. **Fix Animals lesson**
   - Already has unique Set - just needs to implement it properly

---

## **Progress Tracking Status by Lesson:**

| Lesson | Pattern | Unique Audio | Ref Restoration | Practice | Status |
|--------|---------|--------------|-----------------|----------|--------|
| Alphabet | ✅ New | ✅ Yes | ✅ Yes | ❌ No | ✅ Complete |
| Numbers | ✅ New | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Complete |
| Days | ⚠️ Old | ❌ No | ❌ No | ⚠️ Partial | ⚠️ Needs Update |
| Months | ⚠️ Old | ❌ No | ❌ No | ⚠️ Partial | ⚠️ Needs Update |
| Verbs | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Animals | ⚠️ Old | ⚠️ Set (unused) | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Simple Present | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Simple Past | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Simple Future | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Prepositions | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Basic Adjectives | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Articles & Plurals | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Possessive Pronouns | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Questions & Negation | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Sentence Structure | ⚠️ Old | ❌ No | ❌ No | ✅ Yes | ⚠️ Needs Update |
| Colors | ❌ None | ❌ No | ❌ No | ❌ No | ❌ No Tracking |
| Nature | ❓ Unknown | ❓ | ❓ | ❓ | ❓ |
| Family | ❓ Unknown | ❓ | ❓ | ❓ | ❓ |
| Body Parts | ❓ Unknown | ❓ | ❓ | ❓ | ❓ |
| Weather | ❓ Unknown | ❓ | ❓ | ❓ | ❓ |
| House | ❓ Unknown | ❓ | ❓ | ❓ | ❓ |
| Food | ❓ Unknown | ❓ | ❓ | ❓ | ❓ |
| Time | ❓ Unknown | ❓ | ❓ | ❓ | ❓ |
| Conversations | ❓ Unknown | ❓ | ❓ | ❓ | ❓ |

---

## **Next Steps:**

1. ✅ Alphabet - Complete
2. ✅ Numbers - Complete  
3. ⏳ Update Days to match Numbers pattern (has practice)
4. ⏳ Update remaining lessons with practice (13 lessons)
5. ⏳ Update lessons without practice (Days, Months, etc.)
6. ⏳ Add progress tracking to lessons without it (Colors, etc.)
