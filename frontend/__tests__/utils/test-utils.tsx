import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { useProgress } from '../../src/contexts/ProgressContext'

// Mock the ProgressContext provider
jest.mock('../../src/contexts/ProgressContext', () => ({
  useProgress: jest.fn(),
  ProgressProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock helpers
export const mockProgressContext = (overrides = {}) => {
  const defaultMock = {
    lessonProgress: new Map(),
    gameProgress: {},
    updateLessonProgress: jest.fn(),
    getLessonProgress: jest.fn().mockReturnValue({
      status: 'NOT_STARTED',
      progress: 0,
      score: null,
    }),
    updateGameProgress: jest.fn(),
    getGameProgress: jest.fn().mockReturnValue({}),
    getRecentLessons: jest.fn().mockReturnValue([]),
    ...overrides,
  }

  ;(useProgress as jest.Mock).mockReturnValue(defaultMock)
  return defaultMock
}












