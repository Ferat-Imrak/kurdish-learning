"use client"

import { useEffect, useState } from 'react'
import { useProgress } from '../contexts/ProgressContext'

interface ProgressTrackerProps {
  lessonId: string
  progress: number
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  score?: number
}

export default function ProgressTracker({ 
  lessonId, 
  progress, 
  status = 'IN_PROGRESS',
  score 
}: ProgressTrackerProps) {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Update progress when component mounts or props change
    const currentProgress = getLessonProgress(lessonId)
    const timeSpent = currentProgress.timeSpent + 5 // Add 5 minutes for visiting the lesson
    
    updateLessonProgress(lessonId, progress, status, score, timeSpent)
  }, [lessonId, progress, status, score, updateLessonProgress, getLessonProgress])

  return null // This component doesn't render anything, just tracks progress
}
