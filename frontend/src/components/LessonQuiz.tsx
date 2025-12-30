"use client"

import { useState, useEffect } from 'react'
import { useProgress } from '../contexts/ProgressContext'
import { CheckCircle, XCircle, RotateCcw, Star } from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

interface LessonQuizProps {
  lessonId: string
  lessonTitle: string
  questions: QuizQuestion[]
  passingScore: number // percentage needed to pass
  onComplete?: () => void
}

export default function LessonQuiz({ 
  lessonId, 
  lessonTitle, 
  questions,
  passingScore = 70,
  onComplete 
}: LessonQuizProps) {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  
  const currentProgress = getLessonProgress(lessonId)
  const isQuizPassed = currentProgress.status === 'COMPLETED'

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = () => {
    const correctAnswers = questions.filter((q, index) => 
      selectedAnswers[index] === q.correctAnswer
    ).length
    
    const quizScore = Math.round((correctAnswers / questions.length) * 100)
    setScore(quizScore)
    setShowResults(true)
    
    if (quizScore >= passingScore) {
      setQuizCompleted(true)
      updateLessonProgress(lessonId, 100, 'COMPLETED', quizScore)
      if (onComplete) onComplete()
    } else {
      updateLessonProgress(lessonId, 50, 'IN_PROGRESS', quizScore)
    }
  }

  const retakeQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setQuizCompleted(false)
    setScore(0)
  }

  const currentQ = questions[currentQuestion]
  const isAnswered = selectedAnswers[currentQuestion] !== undefined

  if (isQuizPassed) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700 mb-2">Lesson Completed! 🎉</h3>
          <p className="text-gray-600 mb-4">
            You've successfully mastered {lessonTitle} with a score of {currentProgress.score}%
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-600">
            <Star className="w-5 h-5" />
            <span className="font-semibold">Achievement Unlocked!</span>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            quizCompleted ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {quizCompleted ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            quizCompleted ? 'text-green-700' : 'text-red-700'
          }`}>
            {quizCompleted ? 'Quiz Passed! 🎉' : 'Quiz Failed 😔'}
          </h3>
          <p className="text-gray-600">
            Your score: <span className="font-bold">{score}%</span>
            {!quizCompleted && ` (Need ${passingScore}% to pass)`}
          </p>
        </div>

        {/* Results Breakdown */}
        <div className="space-y-3 mb-6">
          {questions.map((q, index) => {
            const userAnswer = selectedAnswers[index]
            const isCorrect = userAnswer === q.correctAnswer
            return (
              <div key={q.id} className={`p-3 rounded-lg border ${
                isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{q.question}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your answer: <span className="font-medium">{userAnswer}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600 mt-1">
                        Correct answer: <span className="font-medium">{q.correctAnswer}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-sm text-gray-500 mt-1">{q.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          {!quizCompleted && (
            <button
              onClick={retakeQuiz}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">{lessonTitle} Quiz</h3>
        <div className="text-sm text-gray-500">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-primaryBlue h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Question */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          {currentQ.question}
        </h4>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                selectedAnswers[currentQuestion] === option
                  ? 'border-primaryBlue bg-blue-50 text-primaryBlue'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          onClick={nextQuestion}
          disabled={!isAnswered}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}
        </button>
      </div>
    </div>
  )
}
