"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '../app/providers'

interface LessonProgress {
  lessonId: string
  progress: number // 0-100
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  lastAccessed: Date
  score?: number
  timeSpent: number // in minutes
}

interface ProgressContextType {
  lessonProgress: Record<string, LessonProgress>
  updateLessonProgress: (lessonId: string, progress: number, status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED', score?: number, timeSpent?: number) => void
  getLessonProgress: (lessonId: string) => LessonProgress
  getRecentLessons: () => LessonProgress[]
  getTotalTimeSpent: () => number
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({})

  // Load progress from localStorage on mount
  useEffect(() => {
    if (user?.email) {
      const savedProgress = localStorage.getItem(`lessonProgress_${user.email}`)
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress)
          // Convert lastAccessed strings back to Date objects
          const progressWithDates = Object.keys(parsed).reduce((acc, key) => {
            acc[key] = {
              ...parsed[key],
              lastAccessed: new Date(parsed[key].lastAccessed)
            }
            return acc
          }, {} as Record<string, LessonProgress>)
          setLessonProgress(progressWithDates)
        } catch (error) {
          console.error('Failed to parse saved progress:', error)
        }
      }
    }
  }, [user?.email])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (user?.email && Object.keys(lessonProgress).length > 0) {
      localStorage.setItem(`lessonProgress_${user.email}`, JSON.stringify(lessonProgress))
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('lessonProgressUpdated'))
    }
  }, [lessonProgress, user?.email])

  const updateLessonProgress = (
    lessonId: string, 
    progress: number, 
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'IN_PROGRESS',
    score?: number,
    timeSpent?: number
  ) => {
    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: {
        lessonId,
        progress: Math.max(0, Math.min(100, progress)), // Clamp between 0-100
        status,
        lastAccessed: new Date(),
        score,
        timeSpent: timeSpent || prev[lessonId]?.timeSpent || 0
      }
    }))
  }

  const getLessonProgress = (lessonId: string): LessonProgress => {
    return lessonProgress[lessonId] || {
      lessonId,
      progress: 0,
      status: 'NOT_STARTED',
      lastAccessed: new Date(),
      score: undefined,
      timeSpent: 0
    }
  }

  const getTotalTimeSpent = (): number => {
    return Object.values(lessonProgress).reduce((total, lesson) => total + lesson.timeSpent, 0)
  }

  const getRecentLessons = (): LessonProgress[] => {
    return Object.values(lessonProgress)
      .filter(lesson => lesson.status !== 'NOT_STARTED')
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
      .slice(0, 3) // Get top 3 recent lessons
  }

  return (
    <ProgressContext.Provider value={{
      lessonProgress,
      updateLessonProgress,
      getLessonProgress,
      getRecentLessons,
      getTotalTimeSpent
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
