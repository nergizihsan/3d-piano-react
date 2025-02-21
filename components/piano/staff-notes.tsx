import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import { useAudioStore } from '@/stores/audio-store'

interface StaffNote {
  note: string
  position: number
  symbol: string
  finger?: number
  hint?: string
}

interface StaffNotesProps {
  position: [number, number, number]
  width: number
  notes: StaffNote[] | number // can be either notes array or octave number
}

export function StaffNotes({ position, width, notes }: StaffNotesProps) {
  const keyStates = useAudioStore(state => state.keyStates)

  const notePositions = useMemo(() => {
    if (typeof notes === 'number') {
      // If notes is a number, treat it as octave
      const octave = notes
      return [
        { note: `C${octave}`, position: -0.2, symbol: '𝅗𝅥' },
        { note: `D${octave}`, position: 0, symbol: '𝅗𝅥' },
        { note: `E${octave}`, position: 0.2, symbol: '𝅗𝅥' },
        { note: `F${octave}`, position: 0.4, symbol: '𝅗𝅥' },
        { note: `G${octave}`, position: 0.6, symbol: '𝅗𝅥' },
        { note: `A${octave}`, position: 0.8, symbol: '𝅗𝅥' },
        { note: `B${octave}`, position: 1.0, symbol: '𝅗𝅥' },
      ]
    }
    return notes
  }, [notes])

  return (
    <group position={position}>
      {notePositions.map((notePos, index) => {
        const isNoteActive = keyStates.has(notePos.note)

        return (
          <group key={notePos.note}>
            <Text
              position={[width / 2 + (index - 3) * 0.8, notePos.position, 0]}
              color={isNoteActive ? "#00FF00" : "#FF69B4"}
              fontSize={0.3}
              fillOpacity={1}
              font="/fonts/NotoMusic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              {notePos.symbol}
            </Text>
            <Text
              position={[width / 2 + (index - 3) * 0.8, notePos.position - 0.3, 0]}
              color={isNoteActive ? "#00FF00" : "#FF69B4"}
              fontSize={0.15}
              anchorX="center"
              anchorY="middle"
            >
              {notePos.note}
            </Text>
            {notePos.finger && (
              <Text
                position={[width / 2 + (index - 3) * 0.8, notePos.position - 0.5, 0]}
                color={isNoteActive ? "#00FF00" : "#FFFFFF"}
                fontSize={0.12}
                anchorX="center"
                anchorY="middle"
              >
                {`👆 ${notePos.finger}`}
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
} 