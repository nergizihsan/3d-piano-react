import { create } from 'zustand'
import { Lesson, LessonProgress } from '@/types/lessons'

interface LessonStore {
  // State
  currentLessonId: string | null
  lessons: Lesson[]
  progress: LessonProgress[]
  isLessonMode: boolean

  // Actions
  setCurrentLesson: (lessonId: string | null) => void
  toggleLessonMode: () => void
  updateProgress: (progress: LessonProgress) => void
}

export const useLessonStore = create<LessonStore>((set) => ({
  currentLessonId: null,
  lessons: [
    {
      id: 'middle-c',
      type: 'basic',
      title: 'Middle C',
      description: 'Learn to find and play Middle C, the foundation of piano playing',
      difficulty: 'beginner',
      notes: [
        {
          note: 'C4',
          position: -0.2,
          symbol: '𝅗𝅥',
          finger: 1,
          hint: 'Use your thumb (1) to play Middle C'
        }
      ]
    },
    {
      id: 'c-position',
      type: 'basic',
      title: 'C Position',
      description: 'Learn the C Position with your right hand',
      difficulty: 'beginner',
      notes: [
        { note: 'C4', position: -0.2, symbol: '𝅗𝅥', finger: 1 },
        { note: 'D4', position: 0, symbol: '𝅗𝅥', finger: 2 },
        { note: 'E4', position: 0.2, symbol: '𝅗𝅥', finger: 3 },
        { note: 'F4', position: 0.4, symbol: '𝅗𝅥', finger: 4 },
        { note: 'G4', position: 0.6, symbol: '𝅗𝅥', finger: 5 }
      ]
    }
  ],
  progress: [],
  isLessonMode: false,

  setCurrentLesson: (lessonId) => set({ currentLessonId: lessonId }),
  toggleLessonMode: () => set((state) => ({ isLessonMode: !state.isLessonMode })),
  updateProgress: (newProgress) => set((state) => ({
    progress: [
      ...state.progress.filter(p => p.lessonId !== newProgress.lessonId),
      newProgress
    ]
  }))
})) 