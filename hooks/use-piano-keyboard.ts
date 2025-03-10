// src/hooks/use-piano-keyboard.ts
import { useEffect, useRef } from 'react'
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

/**
 * Piano Keyboard Hook
 * 
 * RESPONSIBILITY:
 * - Manages keyboard input for piano playback
 * - Handles octave switching
 * - Maps keyboard keys to musical notes
 * 
 * FEATURES:
 * 1. Multi-octave support with keyboard controls
 * 2. Prevents key repeat events
 * 3. Maps both white and black keys
 * 4. Octave range validation
 * 
 * TECHNICAL NOTES:
 * - Uses event.repeat check to prevent unwanted retriggering
 * - Handles both note and octave control keys
 * - Provides user feedback through toast messages
 * 
 * LIMITATIONS:
 * - Subject to keyboard hardware key rollover limits
 * - Some key combinations may not work on basic keyboards
 * 
 * KEY MAPPING LAYOUT:
 * - Lower Octave: Z-M (white), 1-5 (black)
 * - Middle Octave: A-J (white), W,E,T,Y,U (black)
 * - Upper Octave: K-\ (white), O,P,] (black)
 * - Octave Control: Arrow Up/Down
 */
export function usePianoKeyboard() {
  const { playNote, releaseNote } = usePianoAudio()
  const { currentOctave, setCurrentOctave } = useAudioStore()
  const lastKeyPressTime = useRef<Record<string, number>>({})

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

    const shiftedNote = `${note.slice(0, -1)}${parseInt(note.slice(-1)) + currentOctave - 3}`

    if (isPress) {
      lastKeyPressTime.current[shiftedNote] = Date.now()
      playNote(shiftedNote)
      useAudioStore.getState().pressKey(shiftedNote, 'keyboard')
    } else {
      useAudioStore.getState().releaseKey(shiftedNote, 'keyboard')
      releaseNote(shiftedNote)
      delete lastKeyPressTime.current[shiftedNote]
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
  }, [currentOctave, playNote, releaseNote])
}