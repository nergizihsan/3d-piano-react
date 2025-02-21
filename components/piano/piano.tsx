"use client"

import { useCallback, useMemo } from 'react'
import { usePianoAudio } from '@/hooks/use-piano-audio'
import { useAudioStore } from '@/stores/audio-store'
import { usePianoKeyboard } from '@/hooks/use-piano-keyboard'
import { PianoKey } from './piano-key'
import { MusicStaff } from './music-staff'
import { PIANO_DIMENSIONS } from '@/constants/piano'
import { generatePianoKeys } from '@/utils/piano-utils'
import { usePointerCleanup } from '@/hooks/use-pointer-cleanup'
import type { PianoKeyData } from '@/types/piano'

/**
 * Piano component responsible for rendering and handling interactions with piano keys
 * 
 * ARCHITECTURE:
 * - Uses custom hooks for specific functionality
 * - Manages both piano keys and staff rendering
 * - Maintains consistent positioning for all elements
 */
export function Piano() {
  const { playNote, releaseNote } = usePianoAudio()
  const keyStates = useAudioStore(state => state.keyStates)
  const staffVisible = useAudioStore(state => state.staffVisible)
  
  const KEYS = useMemo<PianoKeyData[]>(() => generatePianoKeys(PIANO_DIMENSIONS), [])
  
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
    <group rotation={[0, Math.PI, 0]} position={[-7, 0, 0]}>  {/* Simple x-offset to center */}
      {/* Piano Keys */}
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

      {/* Music Staff - tilted 30 degrees */}
      {staffVisible && (
        <group 
          position={[-3, 0.5, 2]} 
          rotation={[Math.PI * 0.15, -Math.PI, 0]}  // -0.15 is approximately -30 degrees
        >
          <MusicStaff 
            position={[0, 0, 0]} 
            width={7} 
          />
        </group>
      )}
    </group>
  )
}
