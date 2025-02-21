export type LessonType = 'basic' | 'scales' | 'chords' | 'songs'

export interface Lesson {
  id: string
  type: LessonType
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  notes: Array<{
    note: string
    position: number
    symbol: string
    finger?: number
    hint?: string
  }>
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  score?: number
  lastAttempt?: Date
} 