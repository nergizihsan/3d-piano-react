"use client"

import { usePianoAudio } from '@/hooks/use-piano-audio'
import { useAudioStore } from '@/stores/audio-store'
import { usePianoKeyboard } from '@/hooks/use-piano-keyboard'
import { PianoKey } from './piano-key'
import { PIANO_DIMENSIONS } from '@/constants/piano'
import { generatePianoKeys } from '@/utils/piano-utils'

export function Piano() {
  const { playNote } = usePianoAudio()
  const { pressedKeys, pressKey, releaseKey } = useAudioStore()
  const KEYS = generatePianoKeys(PIANO_DIMENSIONS)
  
  usePianoKeyboard()

  const handleKeyPress = (note: string) => {
    playNote(note)
    pressKey(note)
    setTimeout(() => releaseKey(note), 200)
  }

  return (
    <group rotation={[0, Math.PI, 0]}>
      <group position={[-(PIANO_DIMENSIONS.WHITE_KEY.WIDTH + PIANO_DIMENSIONS.WHITE_KEY.GAP) * 3.5, 0, 0]}>
        {KEYS.map((key) => (
          <PianoKey
            key={key.note}
            note={key.note}
            type={key.type}
            position={key.position}
            isPressed={pressedKeys.includes(key.note)}
            onPress={() => handleKeyPress(key.note)}
          />
        ))}
      </group>
    </group>
  )
}
