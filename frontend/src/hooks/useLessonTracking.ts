import { useState, useEffect, useRef, useCallback } from 'react'
import { useProgress } from '../contexts/ProgressContext'

interface SectionInteraction {
  sectionId: string
  timeSpent: number // in seconds
  interactions: number // total audio plays, clicks, etc.
  uniqueInteractions: Set<string> // Track which specific items were interacted with
  scrollDepth: number // 0-1, how much of section was viewed
  completionScore: number // 0-100, calculated dynamically
  completed: boolean // true when completionScore >= 100
}

interface SectionRequirements {
  minTime: number
  minInteractions: number
  minUniqueInteractions: number
}

interface UseLessonTrackingOptions {
  lessonId: string
  totalSections: number
  sectionRequirements?: Record<string, SectionRequirements> // Requirements per section ID
  defaultRequirements?: SectionRequirements // Default if section-specific not provided
}

// Calculate completion score based on requirements
function calculateCompletionScore(
  section: Omit<SectionInteraction, 'completionScore' | 'completed'>,
  requirements: SectionRequirements
): number {
  const timeRatio = Math.min(section.timeSpent / requirements.minTime, 1)
  const interactionRatio = Math.min(section.uniqueInteractions.size / requirements.minUniqueInteractions, 1)
  const totalInteractionRatio = Math.min(section.interactions / requirements.minInteractions, 1)
  
  // Weighted average: time (30%), unique interactions (50%), total interactions (20%)
  const score = (timeRatio * 0.3) + (interactionRatio * 0.5) + (totalInteractionRatio * 0.2)
  return Math.round(score * 100)
}

export function useLessonTracking({
  lessonId,
  totalSections,
  sectionRequirements = {},
  defaultRequirements = {
    minTime: 30,
    minInteractions: 3,
    minUniqueInteractions: 2
  }
}: UseLessonTrackingOptions) {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  const [sectionInteractions, setSectionInteractions] = useState<Map<string, SectionInteraction>>(new Map())
  const sectionTimers = useRef<Map<string, { startTime: number; baseTime: number; intervalId: NodeJS.Timeout }>>(new Map())

  // Load saved interactions from localStorage
  useEffect(() => {
    const currentProgress = getLessonProgress(lessonId)
    if (currentProgress.score) {
      try {
        const saved = JSON.parse(currentProgress.score.toString())
        if (Array.isArray(saved)) {
          const interactionsMap = new Map<string, SectionInteraction>()
          saved.forEach((item: any) => {
            // Convert uniqueInteractions array back to Set
            const uniqueInteractions = item.uniqueInteractions 
              ? new Set(Array.isArray(item.uniqueInteractions) ? item.uniqueInteractions : [])
              : new Set<string>()
            
            const requirements = sectionRequirements[item.sectionId] || defaultRequirements
            const completionScore = item.completionScore ?? calculateCompletionScore(
              {
                sectionId: item.sectionId,
                timeSpent: item.timeSpent || 0,
                interactions: item.interactions || 0,
                uniqueInteractions,
                scrollDepth: item.scrollDepth || 0
              },
              requirements
            )
            
            interactionsMap.set(item.sectionId, {
              sectionId: item.sectionId,
              timeSpent: item.timeSpent || 0,
              interactions: item.interactions || 0,
              uniqueInteractions,
              scrollDepth: item.scrollDepth || 0,
              completionScore,
              completed: completionScore >= 100
            })
          })
          setSectionInteractions(interactionsMap)
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Mark lesson as started
    if (currentProgress.status === 'NOT_STARTED') {
      updateLessonProgress(lessonId, 0, 'IN_PROGRESS')
    }
  }, [lessonId, getLessonProgress, updateLessonProgress, sectionRequirements, defaultRequirements])

  // Start tracking time for a section
  const startSectionTracking = useCallback((sectionId: string) => {
    // Don't restart if already tracking
    if (sectionTimers.current.has(sectionId)) return

    const startTime = Date.now()
    
    // Get current saved time as base
    const current = sectionInteractions.get(sectionId)
    const baseTime = current?.timeSpent || 0
    
    const requirements = sectionRequirements[sectionId] || defaultRequirements
    
    const intervalId = setInterval(() => {
      setSectionInteractions(prev => {
        const currentState = prev.get(sectionId) || {
          sectionId,
          timeSpent: 0,
          interactions: 0,
          uniqueInteractions: new Set<string>(),
          scrollDepth: 0,
          completionScore: 0,
          completed: false
        }

        // Get the timer to access baseTime
        const timer = sectionTimers.current.get(sectionId)
        if (!timer) return prev

        // Calculate elapsed time in current session
        const elapsed = Math.floor((Date.now() - timer.startTime) / 1000)
        // Total time = base time (when we started) + elapsed
        const newTimeSpent = timer.baseTime + elapsed

        // Calculate new completion score
        const completionScore = calculateCompletionScore(
          {
            ...currentState,
            timeSpent: newTimeSpent
          },
          requirements
        )
        
        const completed = completionScore >= 100

        const updated = new Map(prev)
        updated.set(sectionId, {
          ...currentState,
          timeSpent: newTimeSpent,
          completionScore,
          completed
        })

        return updated
      })
    }, 5000) // Update every 5 seconds

    sectionTimers.current.set(sectionId, { startTime, baseTime, intervalId })
  }, [sectionRequirements, defaultRequirements, sectionInteractions])

  // Stop tracking time for a section
  const stopSectionTracking = useCallback((sectionId: string) => {
    const timer = sectionTimers.current.get(sectionId)
    if (timer) {
      clearInterval(timer.intervalId)
      
      // Save accumulated time before stopping
      const elapsed = Math.floor((Date.now() - timer.startTime) / 1000)
      setSectionInteractions(prev => {
        const current = prev.get(sectionId) || {
          sectionId,
          timeSpent: 0,
          interactions: 0,
          uniqueInteractions: new Set<string>(),
          scrollDepth: 0,
          completionScore: 0,
          completed: false
        }
        
        // Total time = base time (when tracking started) + elapsed time
        const newTimeSpent = timer.baseTime + elapsed
        
        const requirements = sectionRequirements[sectionId] || defaultRequirements
        const completionScore = calculateCompletionScore(
          {
            ...current,
            timeSpent: newTimeSpent
          },
          requirements
        )
        const completed = completionScore >= 100
        
        const updated = new Map(prev)
        updated.set(sectionId, {
          ...current,
          timeSpent: newTimeSpent,
          completionScore,
          completed
        })
        
        return updated
      })
      
      sectionTimers.current.delete(sectionId)
    }
  }, [sectionRequirements, defaultRequirements])

  // Record an interaction (audio play, click, etc.)
  const recordInteraction = useCallback((sectionId: string, itemId?: string) => {
    setSectionInteractions(prev => {
      const current = prev.get(sectionId) || {
        sectionId,
        timeSpent: 0,
        interactions: 0,
        uniqueInteractions: new Set<string>(),
        scrollDepth: 0,
        completionScore: 0,
        completed: false
      }

      const newInteractions = current.interactions + 1
      const newUniqueInteractions = new Set(current.uniqueInteractions)
      
      // If itemId provided, track it as unique interaction
      if (itemId) {
        newUniqueInteractions.add(itemId)
      }

      const requirements = sectionRequirements[sectionId] || defaultRequirements
      const completionScore = calculateCompletionScore(
        {
          ...current,
          interactions: newInteractions,
          uniqueInteractions: newUniqueInteractions
        },
        requirements
      )
      const completed = completionScore >= 100

      const updated = new Map(prev)
      updated.set(sectionId, {
        ...current,
        interactions: newInteractions,
        uniqueInteractions: newUniqueInteractions,
        completionScore,
        completed
      })

      return updated
    })
  }, [sectionRequirements, defaultRequirements])

  // Update progress when interactions change
  useEffect(() => {
    const sections = Array.from(sectionInteractions.values())
    
    // Calculate average completion score across all sections
    const averageCompletionScore = sections.length > 0
      ? sections.reduce((sum, s) => sum + s.completionScore, 0) / sections.length
      : 0
    
    // Also track fully completed sections
    const completedSections = sections.filter(s => s.completed).length
    const fullyCompletePercentage = Math.round((completedSections / totalSections) * 100)
    
    // Use average completion score for more granular progress
    const progressPercentage = Math.round(averageCompletionScore)
    const status = fullyCompletePercentage === 100 ? 'COMPLETED' : 
                  progressPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'

    // Save interactions to localStorage (convert Sets to arrays for JSON)
    const interactionsArray = sections.map(s => ({
      ...s,
      uniqueInteractions: Array.from(s.uniqueInteractions)
    }))
    
    updateLessonProgress(
      lessonId,
      progressPercentage,
      status,
      JSON.stringify(interactionsArray)
    )
  }, [sectionInteractions, totalSections, lessonId, updateLessonProgress])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      sectionTimers.current.forEach(timer => {
        clearInterval(timer.intervalId)
      })
      sectionTimers.current.clear()
    }
  }, [])

  return {
    sectionInteractions,
    startSectionTracking,
    stopSectionTracking,
    recordInteraction,
    getSectionProgress: (sectionId: string) => {
      const interaction = sectionInteractions.get(sectionId)
      if (!interaction) {
        return { 
          timeSpent: 0, 
          interactions: 0, 
          uniqueInteractions: new Set<string>(),
          completionScore: 0,
          completed: false 
        }
      }
      return {
        timeSpent: interaction.timeSpent,
        interactions: interaction.interactions,
        uniqueInteractions: interaction.uniqueInteractions,
        completionScore: interaction.completionScore,
        completed: interaction.completed
      }
    }
  }
}

