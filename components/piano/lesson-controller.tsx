import React, { useMemo } from 'react'

interface LessonControllerProps {
  lesson: 'middle-c' | 'c-position-right'
}

export function LessonController({ lesson }: LessonControllerProps) {
  const instructions = useMemo(() => {
    switch (lesson) {
      case 'middle-c':
        return [
          "Find Middle C on your piano (the C nearest to the center)",
          "Place your right thumb (finger 1) on Middle C",
          "Practice pressing Middle C with proper posture",
          "Watch the note light up green when pressed correctly"
        ]
      case 'c-position-right':
        return [
          "Place your right thumb on Middle C",
          "Rest your other fingers naturally on the next four white keys",
          "Practice pressing each key with the correct finger",
          "Try to maintain a curved hand position"
        ]
    }
  }, [lesson])

  return (
    <div className="absolute top-4 left-4 bg-black/50 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        {lesson === 'middle-c' ? 'Lesson 1: Meet Middle C' : 'Lesson 2: C Position'}
      </h2>
      <ul className="list-disc pl-4">
        {instructions.map((instruction, i) => (
          <li key={i} className="text-white mb-2">{instruction}</li>
        ))}
      </ul>
    </div>
  )
} 