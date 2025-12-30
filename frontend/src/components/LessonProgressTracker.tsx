"use client"

import { useState, useEffect } from 'react'
import { useProgress } from '../contexts/ProgressContext'
import { CheckCircle, Circle, Star } from 'lucide-react'

interface LessonMilestone {
  id: string
  title: string
  completed: boolean
}

interface LessonProgressTrackerProps {
  lessonId: string
  lessonTitle: string
  milestones: LessonMilestone[]
  onComplete?: () => void
}

export default function LessonProgressTracker({ 
  lessonId, 
  lessonTitle, 
  milestones,
  onComplete 
}: LessonProgressTrackerProps) {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([])
  
  const currentProgress = getLessonProgress(lessonId)
  const progressPercentage = Math.round((completedMilestones.length / milestones.length) * 100)

  useEffect(() => {
    // Initialize completed milestones from stored progress
    const storedMilestones = currentProgress.score ? 
      JSON.parse(currentProgress.score.toString()) : []
    setCompletedMilestones(storedMilestones)
  }, [currentProgress.score])

  const toggleMilestone = (milestoneId: string) => {
    const newCompleted = completedMilestones.includes(milestoneId)
      ? completedMilestones.filter(id => id !== milestoneId)
      : [...completedMilestones, milestoneId]
    
    setCompletedMilestones(newCompleted)
    
    const newProgress = Math.round((newCompleted.length / milestones.length) * 100)
    const status = newProgress === 100 ? 'COMPLETED' : 
                  newProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
    
    // Store completed milestones count as score
    updateLessonProgress(lessonId, newProgress, status, newCompleted.length)
    
    // Call completion callback if lesson is 100% complete
    if (newProgress === 100 && onComplete) {
      onComplete()
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">{lessonTitle}</h3>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">
            {progressPercentage}% Complete
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div 
          className="bg-gradient-to-r from-primaryBlue to-kurdish-green h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Milestones */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Learning Steps:</h4>
        {milestones.map((milestone) => (
          <div 
            key={milestone.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => toggleMilestone(milestone.id)}
          >
            {completedMilestones.includes(milestone.id) ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <span className={`text-sm ${
              completedMilestones.includes(milestone.id) 
                ? 'text-gray-600 line-through' 
                : 'text-gray-800'
            }`}>
              {milestone.title}
            </span>
          </div>
        ))}
      </div>
      
      {progressPercentage === 100 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Lesson Completed! 🎉</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Great job! You've mastered this lesson.
          </p>
        </div>
      )}
    </div>
  )
}
