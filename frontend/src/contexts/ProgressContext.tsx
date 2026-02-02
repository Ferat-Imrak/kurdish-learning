"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react'
import { useAuth } from '../app/providers'
import { apiRequest } from '../lib/api'

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
  isSyncing: boolean
  clearProgress: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

// Helper to merge progress (take highest progress, latest timestamp, accumulate time)
function mergeProgress(local: LessonProgress, remote: LessonProgress): LessonProgress {
  const localTime = local.lastAccessed.getTime()
  const remoteTime = remote.lastAccessed.getTime()
  
  // Take highest progress
  const mergedProgress = Math.max(local.progress, remote.progress)
  
  // Take latest timestamp
  const mergedLastAccessed = localTime > remoteTime ? local.lastAccessed : remote.lastAccessed
  
  // Accumulate time spent
  const mergedTimeSpent = local.timeSpent + remote.timeSpent
  
  // Take highest score
  const mergedScore = Math.max(local.score || 0, remote.score || 0)
  
  // Status: if either is COMPLETED, use COMPLETED, else use the one with higher progress
  const mergedStatus = local.status === 'COMPLETED' || remote.status === 'COMPLETED'
    ? 'COMPLETED'
    : mergedProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
  
  return {
    lessonId: local.lessonId,
    progress: mergedProgress,
    status: mergedStatus,
    lastAccessed: mergedLastAccessed,
    score: mergedScore > 0 ? mergedScore : undefined,
    timeSpent: mergedTimeSpent
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({})
  const [isSyncing, setIsSyncing] = useState(false)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncRef = useRef<number>(0)

  // Sync progress from backend
  const syncFromBackend = useCallback(async () => {
    if (!user?.email) return

    try {
      setIsSyncing(true)
      const response = await apiRequest('/progress/user')
      
      if (response.status === 401) {
        // Not authenticated, skip sync
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress from backend')
      }

      const data = await response.json()
      const remoteProgress = data.progress || {}

      // Convert remote progress to our format
      const remoteProgressFormatted: Record<string, LessonProgress> = {}
      for (const [lessonId, progress] of Object.entries(remoteProgress)) {
        const p = progress as any
        remoteProgressFormatted[lessonId] = {
          lessonId,
          progress: p.progress || 0,
          status: p.status || 'NOT_STARTED',
          lastAccessed: new Date(p.lastAccessed),
          score: p.score,
          timeSpent: p.timeSpent || 0
        }
      }

      // Merge with local progress
      setLessonProgress(prev => {
        const merged: Record<string, LessonProgress> = {}
        
        // Get all unique lesson IDs
        const allLessonIds = Array.from(new Set([
          ...Object.keys(prev),
          ...Object.keys(remoteProgressFormatted)
        ]))

        for (const lessonId of allLessonIds) {
          const local = prev[lessonId]
          const remote = remoteProgressFormatted[lessonId]

          if (local && remote) {
            // Merge both
            merged[lessonId] = mergeProgress(local, remote)
          } else if (local) {
            // Only local
            merged[lessonId] = local
          } else if (remote) {
            // Only remote
            merged[lessonId] = remote
          }
        }

        return merged
      })

      lastSyncRef.current = Date.now()
    } catch (error) {
      console.error('Failed to sync progress from backend:', error)
      // Continue with local progress on error
    } finally {
      setIsSyncing(false)
    }
  }, [user?.email])

  // Sync progress to backend (debounced)
  const syncToBackend = useCallback(async (progress: Record<string, LessonProgress>) => {
    if (!user?.email) {
      console.log('⚠️ Frontend: Cannot sync - user not authenticated');
      return;
    }

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    // Debounce: wait 2 seconds before syncing
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('🔄 Frontend: Syncing progress to backend...', Object.keys(progress).length, 'lessons');
        
        // Debug: Log Alphabet progress specifically
        if (progress['1']) {
          console.log('📊 Frontend: Alphabet (lesson 1) progress to sync:', progress['1']);
        }

        // Convert to backend format
        const backendProgress: Record<string, any> = {}
        for (const [lessonId, p] of Object.entries(progress)) {
          backendProgress[lessonId] = {
            progress: p.progress,
            status: p.status,
            score: p.score,
            timeSpent: p.timeSpent,
            lastAccessed: p.lastAccessed.toISOString()
          }
        }

        console.log('📤 Frontend: Sending to backend:', JSON.stringify(backendProgress, null, 2));

        const response = await apiRequest('/progress/user/sync', {
          method: 'POST',
          body: JSON.stringify({ progress: backendProgress })
        })

        if (response.status === 401) {
          console.warn('⚠️ Frontend: Not authenticated, skipping sync');
          return
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Frontend: Sync failed:', response.status, errorText);
          throw new Error('Failed to sync progress to backend')
        }

        const data = await response.json()
        console.log('✅ Frontend: Backend response:', Object.keys(data.progress || {}).length, 'lessons');
        
        // Debug: Log Alphabet in response
        if (data.progress?.['1']) {
          console.log('📊 Frontend: Backend returned Alphabet progress:', data.progress['1']);
        }
        
        // Update with merged data from backend
        if (data.progress) {
          const mergedProgress: Record<string, LessonProgress> = {}
          for (const [lessonId, p] of Object.entries(data.progress)) {
            const progressData = p as any
            mergedProgress[lessonId] = {
              lessonId,
              progress: progressData.progress || 0,
              status: progressData.status || 'NOT_STARTED',
              lastAccessed: new Date(progressData.lastAccessed),
              score: progressData.score,
              timeSpent: progressData.timeSpent || 0
            }
          }
          setLessonProgress(prev => {
            const final: Record<string, LessonProgress> = {}
            for (const lessonId of Object.keys({ ...prev, ...mergedProgress })) {
              if (prev[lessonId] && mergedProgress[lessonId]) {
                final[lessonId] = mergeProgress(prev[lessonId], mergedProgress[lessonId])
              } else {
                final[lessonId] = prev[lessonId] || mergedProgress[lessonId]
              }
            }
            return final
          })
        }

        lastSyncRef.current = Date.now()
        console.log('✅ Frontend: Sync completed successfully');
      } catch (error: any) {
        console.error('❌ Frontend: Failed to sync progress to backend:', error.message || error);
        // Continue with local progress on error
      }
    }, 5000) // 5 second debounce (increased to reduce API calls)
  }, [user?.email])

  // Load progress from localStorage and sync from backend on mount
  useEffect(() => {
    if (user?.email) {
      // Load from localStorage first (for immediate display)
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

      // Then sync from backend (will merge with local)
      syncFromBackend()
    }
  }, [user?.email, syncFromBackend])

  // Save progress to localStorage and sync to backend whenever it changes
  useEffect(() => {
    if (user?.email && Object.keys(lessonProgress).length > 0) {
      // Save to localStorage immediately
      localStorage.setItem(`lessonProgress_${user.email}`, JSON.stringify(lessonProgress))
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('lessonProgressUpdated'))
      
      // Sync to backend (debounced)
      syncToBackend(lessonProgress)
    }
  }, [lessonProgress, user?.email]) // Remove syncToBackend from deps to avoid infinite loop

  const updateLessonProgress = (
    lessonId: string, 
    progress: number, 
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'IN_PROGRESS',
    score?: number,
    timeSpent?: number
  ) => {
    setLessonProgress(prev => {
      const current = prev[lessonId]
      
      // If timeSpent is provided, use it directly (it's already the total from the lesson)
      // Otherwise keep existing timeSpent
      const newTimeSpent = timeSpent !== undefined 
        ? timeSpent  // Use provided total timeSpent directly
        : (current?.timeSpent || 0)  // Keep existing time
      
      return {
        ...prev,
        [lessonId]: {
          lessonId,
          progress: Math.round(Math.max(0, Math.min(100, progress))), // Clamp between 0-100 and round to whole number
          status,
          lastAccessed: new Date(),
          score: score !== undefined ? score : current?.score,
          timeSpent: newTimeSpent
        }
      }
    })
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

  const clearProgress = async () => {
    if (!user?.email) {
      console.warn('⚠️ Frontend: Cannot clear progress - user not authenticated')
      return
    }

    try {
      // Clear local storage
      const key = `lessonProgress_${user.email}`
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key)
        console.log('✅ Frontend: Cleared local progress from localStorage')
      }

      // Clear backend progress
      try {
        console.log('🔄 Frontend: Attempting to clear backend progress...')
        const response = await apiRequest('/progress/user', {
          method: 'DELETE'
        })
        if (response.ok) {
          console.log('✅ Frontend: Cleared progress from backend')
        }
      } catch (error: any) {
        // If backend clear fails, log but don't fail the whole operation
        if (error.response?.status === 401) {
          console.warn('⚠️ Frontend: Not authenticated, skipping backend clear')
        } else if (error.response?.status === 404) {
          console.warn('⚠️ Frontend: DELETE endpoint not found (404). Backend may need restart. Progress cleared locally only.')
        } else {
          console.error('❌ Frontend: Failed to clear progress from backend:', error.message || error)
        }
      }

      // Clear local state
      setLessonProgress({})
      
      // Dispatch event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('lessonProgressUpdated'))
      }
      
      console.log('✅ Frontend: Progress cleared successfully')
    } catch (error) {
      console.error('❌ Frontend: Error clearing progress:', error)
      throw error
    }
  }

  return (
    <ProgressContext.Provider value={{
      lessonProgress,
      updateLessonProgress,
      getLessonProgress,
      getRecentLessons,
      getTotalTimeSpent,
      isSyncing,
      clearProgress
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
