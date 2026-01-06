// Shared types between web and mobile apps

export interface User {
  id: string
  username: string
  email: string
  name?: string
  image?: string
  subscriptionPlan?: string | null
  subscriptionStatus?: string | null
}

export interface Lesson {
  id: string
  title: string
  type: string
  description?: string
}

export interface LessonProgress {
  lessonId: string
  progress: number
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
}

export interface Game {
  id: string
  name: string
  description: string
  icon: string
}

export type AuthResponse = {
  user?: User
  error?: string
}


