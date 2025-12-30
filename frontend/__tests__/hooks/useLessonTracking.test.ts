import { renderHook, act } from '@testing-library/react'
import { useLessonTracking } from '../../src/hooks/useLessonTracking'
import { useProgress } from '../../src/contexts/ProgressContext'

// Mock the ProgressContext
jest.mock('../../src/contexts/ProgressContext', () => ({
  useProgress: jest.fn(),
}))

describe('useLessonTracking', () => {
  const mockUpdateLessonProgress = jest.fn()
  const mockGetLessonProgress = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useProgress as jest.Mock).mockReturnValue({
      updateLessonProgress: mockUpdateLessonProgress,
      getLessonProgress: mockGetLessonProgress,
    })
    mockGetLessonProgress.mockReturnValue({
      status: 'NOT_STARTED',
      progress: 0,
      score: null,
    })
  })

  it('should initialize with no sections tracked', () => {
    const { result } = renderHook(() =>
      useLessonTracking({
        lessonId: '2',
        totalSections: 5,
        minTimePerSection: 15,
        minInteractionsPerSection: 2,
      })
    )

    expect(result.current.sectionInteractions.size).toBe(0)
  })

  it('should start tracking when section is opened', () => {
    jest.useFakeTimers()
    
    const { result } = renderHook(() =>
      useLessonTracking({
        lessonId: '2',
        totalSections: 5,
        minTimePerSection: 15,
        minInteractionsPerSection: 2,
      })
    )

    act(() => {
      result.current.startSectionTracking('section-1')
    })

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    const progress = result.current.getSectionProgress('section-1')
    expect(progress.timeSpent).toBeGreaterThan(0)

    jest.useRealTimers()
  })

  it('should record interactions', () => {
    const { result } = renderHook(() =>
      useLessonTracking({
        lessonId: '2',
        totalSections: 5,
        minTimePerSection: 15,
        minInteractionsPerSection: 2,
      })
    )

    act(() => {
      result.current.startSectionTracking('section-1')
      result.current.recordInteraction('section-1')
      result.current.recordInteraction('section-1')
    })

    const progress = result.current.getSectionProgress('section-1')
    expect(progress.interactions).toBe(2)
  })

  it('should mark section as completed when requirements are met', () => {
    jest.useFakeTimers()
    
    const { result } = renderHook(() =>
      useLessonTracking({
        lessonId: '2',
        totalSections: 5,
        minTimePerSection: 15,
        minInteractionsPerSection: 2,
      })
    )

    act(() => {
      result.current.startSectionTracking('section-1')
      result.current.recordInteraction('section-1')
      result.current.recordInteraction('section-1')
    })

    // Fast-forward past minimum time
    act(() => {
      jest.advanceTimersByTime(20000)
    })

    const progress = result.current.getSectionProgress('section-1')
    expect(progress.completed).toBe(true)

    jest.useRealTimers()
  })
})












