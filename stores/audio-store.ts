import { create } from 'zustand'
import { PIANO_DEFAULTS } from '@/constants/piano'
import { useLayoutEffect } from 'react'

interface AudioStore {
  volume: number
  setVolume: (volume: number) => void
  isReady: boolean
  setIsReady: (ready: boolean) => void
  pressedKeys: string[]
  mousePressed: Set<string>
  pressKey: (note: string, isMouseEvent?: boolean, velocity?: number) => void
  releaseKey: (note: string, isMouseEvent?: boolean) => void
  isSceneLocked: boolean
  toggleSceneLock: () => void
  clearPressedKeys: () => void
  currentOctave: number
  setCurrentOctave: (octave: number) => void
  showNoteNames: boolean
  toggleNoteNames: () => void
  cleanupMousePressed: () => void
  pressedKeyColor: string
  setPressedKeyColor: (color: string) => void
}

/**
 * Central store for piano audio state management
 * 
 * ARCHITECTURE DECISIONS:
 * 1. Separate tracking for mouse vs keyboard interactions:
 *    - Prevents conflicts between input methods
 *    - Allows for different cleanup strategies
 *    - Enables playing with both mouse and keyboard simultaneously
 * 
 * 2. Cleanup strategy:
 *    - Only cleans up mouse-pressed keys
 *    - Preserves keyboard-pressed keys
 *    - Handles edge cases like losing pointer events
 */
export const useAudioStore = create<AudioStore>((set, get) => ({
  volume: 0.7,
  setVolume: (volume) => set({ volume }),
  isReady: false,
  setIsReady: (ready) => set({ isReady: ready }),
  pressedKeys: [],
  mousePressed: new Set<string>(),
  pressKey: (note, isMouseEvent = false, velocity = 0.8) => set((state) => {
    if (isMouseEvent) {
      state.mousePressed.add(note)
    }
    return {
      pressedKeys: state.pressedKeys.includes(note) 
        ? state.pressedKeys 
        : [...state.pressedKeys, note]
    }
  }),
  releaseKey: (note, isMouseEvent = false) => set((state) => {
    if (isMouseEvent) {
      state.mousePressed.delete(note)
    }
    return {
      pressedKeys: state.pressedKeys.filter(key => key !== note)
    }
  }),
  isSceneLocked: false,
  toggleSceneLock: () => set((state) => ({ isSceneLocked: !state.isSceneLocked })),
  clearPressedKeys: () => set({ pressedKeys: [] }),
  currentOctave: PIANO_DEFAULTS.DEFAULT_OCTAVE,  // Start with default
  setCurrentOctave: (octave) => {
    const newOctave = Math.max(
      PIANO_DEFAULTS.MIN_OCTAVE,
      Math.min(PIANO_DEFAULTS.MAX_OCTAVE, octave)
    )
    if (typeof window !== 'undefined') {
      localStorage.setItem('piano-octave', String(newOctave))
    }
    set({ currentOctave: newOctave })
  },
  showNoteNames: false,
  toggleNoteNames: () => set((state) => ({ 
    showNoteNames: !state.showNoteNames 
  })),
  cleanupMousePressed: () => set((state) => {
    const mouseKeys = Array.from(state.mousePressed)
    return {
      mousePressed: new Set<string>(),
      // Only remove keys that were pressed by mouse
      pressedKeys: state.pressedKeys.filter(key => !mouseKeys.includes(key))
    }
  }),
  pressedKeyColor: '#ff0000', // Default red color
  setPressedKeyColor: (color) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('piano-pressed-key-color', color)
    }
    set({ pressedKeyColor: color })
  },
}))

// Initialize octave from localStorage in a component
export function useInitializeAudioStore() {
  useLayoutEffect(() => {
    const saved = localStorage.getItem('piano-octave')
    if (saved) {
      useAudioStore.getState().setCurrentOctave(Number(saved))
    }
  }, [])
} 