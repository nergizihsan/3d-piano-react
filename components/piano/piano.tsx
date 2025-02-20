"use client"

import { useCallback, useMemo } from 'react'
import { usePianoAudio } from '@/hooks/use-piano-audio'
import { useAudioStore } from '@/stores/audio-store'
import { usePianoKeyboard } from '@/hooks/use-piano-keyboard'
import { PianoKey } from './piano-key'
import { PIANO_DIMENSIONS } from '@/constants/piano'
import { generatePianoKeys } from '@/utils/piano-utils'

export function Piano() {
  const { playNote, releaseNote } = usePianoAudio()
  const { pressedKeys, pressKey, releaseKey } = useAudioStore()
  
  // Memoize the piano keys generation
  const KEYS = useMemo(() => generatePianoKeys(PIANO_DIMENSIONS), [])
  
  usePianoKeyboard()

  const handleKeyPress = useCallback((note: string) => {
    playNote(note)
    pressKey(note)
  }, [playNote, pressKey])

  const handleKeyRelease = useCallback((note: string) => {
    releaseNote(note)
    releaseKey(note)
  }, [releaseNote, releaseKey])

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
            onRelease={() => handleKeyRelease(key.note)}
          />
        ))}
      </group>
    </group>
  )
}
