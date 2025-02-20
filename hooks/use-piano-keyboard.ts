// src/hooks/use-piano-keyboard.ts
import { useEffect, useState } from 'react'
import { usePianoAudio } from '@/hooks/use-piano-audio'
import { useAudioStore } from '@/stores/audio-store'
import { toast } from 'sonner'
import { PIANO_DEFAULTS } from '@/constants/piano'

const KEY_MAPPINGS = {
  // Lower Octave (C2-B2)
  'z': 'C2',
  'x': 'D2',
  'c': 'E2',
  'v': 'F2',
  'b': 'G2',
  'n': 'A2',
  'm': 'B2',
  
  // Middle Octave (C3-B3)
  'a': 'C3',
  'w': 'C#3',
  's': 'D3',
  'e': 'D#3',
  'd': 'E3',
  'f': 'F3',
  't': 'F#3',
  'g': 'G3',
  'y': 'G#3',
  'h': 'A3',
  'u': 'A#3',
  'j': 'B3',
  
  // Upper Octave (C4-B4)
  'k': 'C4',
  'o': 'C#4',
  'l': 'D4',
  'p': 'D#4',
  ';': 'E4',
  "'": 'F4',
  ']': 'F#4',
  '\\': 'G4',

  // Black keys for lower octave
  '1': 'C#2',
  '2': 'D#2',
  '3': 'F#2',
  '4': 'G#2',
  '5': 'A#2',

  // Octave Controls
  'arrowdown': 'octave_down',
  'arrowup': 'octave_up',
} as const

export function usePianoKeyboard() {
  const { playNote, releaseNote } = usePianoAudio()
  const { pressKey, releaseKey, currentOctave, setCurrentOctave } = useAudioStore()

  const handleNote = (note: string, isPress: boolean) => {
    if (note === 'octave_down') {
      if (currentOctave <= PIANO_DEFAULTS.MIN_OCTAVE) {
        toast.error('Reached lowest octave', {
          description: `You can't go lower than octave ${PIANO_DEFAULTS.MIN_OCTAVE}`,
        })
        return
      }
      setCurrentOctave(currentOctave - 1)
      return
    }
    if (note === 'octave_up') {
      if (currentOctave >= PIANO_DEFAULTS.MAX_OCTAVE) {
        toast.error('Reached highest octave', {
          description: `You can't go higher than octave ${PIANO_DEFAULTS.MAX_OCTAVE}`,
        })
        return
      }
      setCurrentOctave(currentOctave + 1)
      return
    }

    // Shift the note to the current octave
    const noteWithoutOctave = note.slice(0, -1)
    const noteOctave = parseInt(note.slice(-1))
    const shiftedNote = `${noteWithoutOctave}${noteOctave + currentOctave - 3}`

    if (isPress) {
      playNote(shiftedNote)
      pressKey(shiftedNote)
    } else {
      releaseNote(shiftedNote)
      releaseKey(shiftedNote)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      const key = event.key.toLowerCase()
      const note = KEY_MAPPINGS[key as keyof typeof KEY_MAPPINGS]
      
      if (note) {
        event.preventDefault()
        handleNote(note, true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const note = KEY_MAPPINGS[key as keyof typeof KEY_MAPPINGS]
      
      if (note && note !== 'octave_down' && note !== 'octave_up') {
        event.preventDefault()
        handleNote(note, false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [currentOctave, playNote, releaseNote, pressKey, releaseKey])
}