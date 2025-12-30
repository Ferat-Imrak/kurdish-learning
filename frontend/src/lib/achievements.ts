// Utility to check and sync achievements with backend
import { checkAchievements } from './api'

export async function syncAchievements() {
  if (typeof window === 'undefined') return

  try {
    // Get progress data from localStorage
    const progressData = getProgressData()
    
    // Check achievements with backend
    const result = await checkAchievements(progressData)
    
    if (result.newlyEarned && result.newlyEarned.length > 0) {
      // Show notification for newly earned achievements
      // You can add toast notifications here
    }
  } catch (error) {
    console.error('Failed to sync achievements:', error)
  }
}

function getProgressData() {
  // Check lesson progress
  const lessonProgressKey = typeof window !== 'undefined' 
    ? Object.keys(localStorage).find(key => key.startsWith('lessonProgress_'))
    : null
  
  let lessonsCompletedCount = 0
  if (lessonProgressKey) {
    try {
      const lessonProgress = JSON.parse(localStorage.getItem(lessonProgressKey) || '{}')
      lessonsCompletedCount = Object.values(lessonProgress).filter(
        (lesson: any) => lesson.status === 'COMPLETED'
      ).length
    } catch (error) {
      console.error('Failed to parse lesson progress:', error)
    }
  }

  // Check flashcards
  const flashcardsCategories = [
    "Colors", "Animals", "Food & Meals", "Family Members", "Nature",
    "Time & Schedule", "Weather & Seasons", "House & Objects", "Numbers",
    "Days & Months", "Basic Question Words", "Pronouns", "Body Parts", "Master Challenge"
  ]
  const flashcardsCompleted = flashcardsCategories.every(cat => {
    const stored = localStorage.getItem(`flashcards-progress-${cat}`)
    if (!stored) return false
    const progress = JSON.parse(stored)
    return progress.correct === progress.total && progress.total > 0
  })

  // Check matching
  const matchingCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
  const matchingCompleted = matchingCategories.every(cat => {
    const stored = localStorage.getItem(`matching-progress-${cat}`)
    if (!stored) return false
    const rounds = JSON.parse(stored)
    return rounds >= (cat === "master" ? 50 : 10)
  })

  // Check word builder
  const wordBuilderCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
  const wordBuilderCompleted = wordBuilderCategories.every(cat => {
    const stored = localStorage.getItem(`word-builder-progress-${cat}`)
    if (!stored) return false
    const progress = JSON.parse(stored)
    return progress.completed === true
  })

  // Check translation
  const translationCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
  const translationCompleted = translationCategories.every(cat => {
    const stored = localStorage.getItem(`picture-quiz-progress-${cat}`)
    if (!stored) return false
    const progress = JSON.parse(stored)
    return progress.completed === true
  })

  // Check memory cards
  const memoryCardsCategories = ["colors", "animals", "food", "nature", "time", "weather", "house", "numbers", "daysMonths", "bodyParts", "master"]
  const memoryCardsCompleted = memoryCardsCategories.every(cat => {
    const stored = localStorage.getItem(`memory-cards-progress-${cat}`)
    if (!stored) return false
    const progress = JSON.parse(stored)
    return progress.easy === true && progress.medium === true && progress.hard === true
  })

  // Check stories
  const storiesRead = localStorage.getItem('stories-read')
  const storiesReadCount = storiesRead ? JSON.parse(storiesRead).length : 0

  // Check all games completed
  const allGamesCompleted = flashcardsCompleted && matchingCompleted && wordBuilderCompleted && translationCompleted && memoryCardsCompleted

  return {
    lessonsCompletedCount,
    flashcardsCompleted,
    matchingCompleted,
    wordBuilderCompleted,
    translationCompleted,
    memoryCardsCompleted,
    storiesReadCount,
    allGamesCompleted
  }
}

