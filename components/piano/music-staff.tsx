// components/piano/music-staff.tsx
import { useAudioStore } from '@/stores/audio-store'
import { BasicStaff } from './basic-staff'
import { StaffNotes } from './staff-notes'
import { useLessonStore } from '@/stores/lesson-store'

interface MusicStaffProps {
  position: [number, number, number]
  width: number
}

export function MusicStaff({ position, width }: MusicStaffProps) {
  const staffVisible = useAudioStore(state => state.staffVisible)
  const showMiddleOctave = useAudioStore(state => state.showMiddleOctave)
  const { currentLessonId, lessons, isLessonMode } = useLessonStore()
  
  const currentLesson = lessons.find(l => l.id === currentLessonId)

  if (!staffVisible) return null

  return (
    <group position={position}>
      <BasicStaff position={[0, 0, 0]} width={width} />
      {isLessonMode && currentLesson ? (
        <StaffNotes 
          position={[0, 0, 0]} 
          width={width} 
          notes={currentLesson.notes}
        />
      ) : (
        showMiddleOctave && (
          <StaffNotes position={[0, 0, 0]} width={width} notes={4} />
        )
      )}
    </group>
  )
}