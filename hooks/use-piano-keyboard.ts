// src/hooks/use-piano-keyboard.ts
import { useEffect } from 'react'
import { usePianoAudio } from './use-piano-audio'

const KEY_MAPPINGS = {
  'a': 'C',
  'w': 'C#',
  's': 'D',
  'e': 'D#',
  'd': 'E',
  'f': 'F',
  't': 'F#',
  'g': 'G',
  'y': 'G#',
  'h': 'A',
  'u': 'A#',
  'j': 'B',
} as const

export function usePianoKeyboard() {
  const { playNote } = usePianoAudio()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent repeat triggers when holding key
      if (event.repeat) return

      const note = KEY_MAPPINGS[event.key.toLowerCase() as keyof typeof KEY_MAPPINGS]
      if (note) {
        playNote(note)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playNote])

  // Return playNote function for click handling
  return { playNote }
}