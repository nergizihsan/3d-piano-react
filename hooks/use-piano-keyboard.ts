// src/hooks/use-piano-keyboard.ts
import { useEffect } from 'react'
import { usePianoAudio } from '@/hooks/use-piano-audio'
import { useAudioStore } from '@/stores/audio-store'

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
  const { pressKey, releaseKey } = useAudioStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      const key = event.key.toLowerCase()
      const note = KEY_MAPPINGS[key as keyof typeof KEY_MAPPINGS]
      
      if (note) {
        event.preventDefault()
        playNote(note)
        pressKey(note)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const note = KEY_MAPPINGS[key as keyof typeof KEY_MAPPINGS]
      
      if (note) {
        event.preventDefault()
        releaseKey(note)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [playNote, pressKey, releaseKey])
}