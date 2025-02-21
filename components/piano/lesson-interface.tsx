import { useLessonStore } from '@/stores/lesson-store'
import { Button } from '@/components/ui/button'

export function LessonInterface() {
  const { currentLessonId, lessons, isLessonMode, setCurrentLesson } = useLessonStore()
  const currentLesson = lessons.find(l => l.id === currentLessonId)

  if (!isLessonMode) return null

  return (
    <div className="absolute top-4 left-4 bg-black/50 p-4 rounded-lg max-w-md">
      {currentLesson ? (
        <>
          <h2 className="text-xl font-bold mb-2">{currentLesson.title}</h2>
          <p className="text-sm text-gray-300 mb-4">{currentLesson.description}</p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setCurrentLesson(null)}
            >
              Exit Lesson
            </Button>
          </div>
        </>
      ) : (
        <div className="grid gap-2">
          <h2 className="text-xl font-bold mb-2">Choose a Lesson</h2>
          {lessons.map(lesson => (
            <Button
              key={lesson.id}
              variant="outline"
              onClick={() => setCurrentLesson(lesson.id)}
              className="justify-start"
            >
              <div>
                <div className="font-medium">{lesson.title}</div>
                <div className="text-xs text-gray-400">{lesson.description}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
} 