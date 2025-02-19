import { create } from 'zustand'
import { PIANO_DEFAULTS } from '@/constants/piano'
import { useLayoutEffect } from 'react'

interface AudioStore {
  volume: number
  setVolume: (volume: number) => void
  isReady: boolean
  setIsReady: (ready: boolean) => void
  pressedKeys: string[]
  pressKey: (note: string) => void
  releaseKey: (note: string) => void
  isSceneLocked: boolean
  toggleSceneLock: () => void
  clearPressedKeys: () => void
  currentOctave: number
  setCurrentOctave: (octave: number) => void
}

export const useAudioStore = create<AudioStore>((set) => ({
  volume: 0.7,
  setVolume: (volume) => set({ volume }),
  isReady: false,
  setIsReady: (ready) => set({ isReady: ready }),
  pressedKeys: [],
  pressKey: (note) => set((state) => ({
    pressedKeys: state.pressedKeys.includes(note) 
      ? state.pressedKeys 
      : [...state.pressedKeys, note]
  })),
  releaseKey: (note) => set((state) => ({
    pressedKeys: state.pressedKeys.filter(key => key !== note)
  })),
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