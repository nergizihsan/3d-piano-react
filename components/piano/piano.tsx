"use client"

import { useCallback, useMemo } from 'react'
import { usePianoAudio } from '@/hooks/use-piano-audio'
import { useAudioStore } from '@/stores/audio-store'
import { usePianoKeyboard } from '@/hooks/use-piano-keyboard'
import { PianoKey } from './piano-key'
import { PIANO_DIMENSIONS } from '@/constants/piano'
import { generatePianoKeys } from '@/utils/piano-utils'
import { usePointerCleanup } from '@/hooks/use-pointer-cleanup'

/**
 * Piano component responsible for rendering and handling interactions with piano keys
 * 
 * ARCHITECTURE:
 * - Uses custom hooks for specific functionality:
 *   - usePianoAudio: Handles sound generation
 *   - usePointerCleanup: Handles global pointer event cleanup
 *   - useAudioStore: Manages state of pressed keys
 * 
 * INPUT HANDLING:
 * - Mouse interactions are tracked separately from keyboard
 * - Global pointer cleanup prevents stuck keys during rapid interactions
 * - Both mouse and keyboard can be used simultaneously
 */
export function Piano() {
  const { playNote, releaseNote } = usePianoAudio()
  const keyStates = useAudioStore(state => state.keyStates)
  
  // Memoize the piano keys generation
  const KEYS = useMemo(() => generatePianoKeys(PIANO_DIMENSIONS), [])
  
  usePianoKeyboard()
  usePointerCleanup()

  const handleKeyPress = useCallback((note: string) => {
    playNote(note)
    useAudioStore.getState().pressKey(note, 'mouse')
  }, [playNote])

  const handleKeyRelease = useCallback((note: string) => {
    releaseNote(note)
    useAudioStore.getState().releaseKey(note, 'mouse')
  }, [releaseNote])

  return (
    <group rotation={[0, Math.PI, 0]}>
      <group position={[-(PIANO_DIMENSIONS.WHITE_KEY.WIDTH + PIANO_DIMENSIONS.WHITE_KEY.GAP) * 3.5, 0, 0]}>
        {KEYS.map((key) => (
          <PianoKey
            key={key.note}
            note={key.note}
            type={key.type}
            position={key.position}
            isPressed={keyStates.has(key.note)}
            onPress={() => handleKeyPress(key.note)}
            onRelease={() => handleKeyRelease(key.note)}
          />
        ))}
      </group>
    </group>
  )
}
