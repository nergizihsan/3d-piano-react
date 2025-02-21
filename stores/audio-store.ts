import { create } from 'zustand'
import { PIANO_DEFAULTS } from '@/constants/piano'
import { useLayoutEffect } from 'react'

interface KeyState {
  isPressed: boolean
  velocity: number
  timestamp: number
  source: 'keyboard' | 'mouse' | 'midi'
}

interface AudioStore {
  // Audio State
  volume: number
  isReady: boolean
  currentOctave: number
  
  // Key States
  keyStates: Map<string, KeyState>
  
  // Loading State
  loadingProgress: number
  loadingMessage: string
  
  // UI Preferences
  showNoteNames: boolean
  pressedKeyColor: string
  isSceneLocked: boolean
  staffVisible: boolean
  showMiddleOctave: boolean
  
  // Progress State
  progress: number
  currentTime: string
  duration: string
  
  // Actions
  setVolume: (volume: number) => void
  setIsReady: (ready: boolean) => void
  setCurrentOctave: (octave: number) => void
  
  pressKey: (note: string, source: 'keyboard' | 'mouse' | 'midi', velocity?: number) => void
  releaseKey: (note: string, source: 'keyboard' | 'mouse' | 'midi') => void
  clearKeys: (source?: 'keyboard' | 'mouse' | 'midi') => void
  
  toggleNoteNames: () => void
  toggleSceneLock: () => void
  toggleStaff: () => void
  setPressedKeyColor: (color: string) => void
  setLoadingState: (progress: number, message: string) => void
  
  // Progress Actions
  setProgress: (progress: number, currentTime: string, duration: string) => void
  resetProgress: () => void
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
 *    - Source-specific cleanup (mouse/keyboard/midi)
 *    - Global pointer cleanup for mouse interactions (usePointerCleanup hook)
 *    - Handles edge cases like losing pointer events
 * 
 * 3. Key state management:
 *    - Uses Map for O(1) lookups
 *    - Tracks source, velocity, and timestamp
 *    - Prevents cross-source interference
 */
export const useAudioStore = create<AudioStore>((set) => ({
  // Initial State
  volume: 0.7,
  isReady: false,
  currentOctave: PIANO_DEFAULTS.DEFAULT_OCTAVE,
  keyStates: new Map(),
  loadingProgress: 0,
  loadingMessage: 'Initializing...',
  showNoteNames: false,
  pressedKeyColor: '#ff0000',
  isSceneLocked: false,
  staffVisible: false,
  showMiddleOctave: true,

  // Progress Initial State
  progress: 0,
  currentTime: "0:00",
  duration: "0:00",

  // Audio Actions
  setVolume: (volume) => set({ volume }),
  setIsReady: (ready) => set({ isReady: ready }),
  
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

  // Key State Management
  pressKey: (note, source, velocity = 0.8) => set((state) => {
    const keyStates = new Map(state.keyStates)
    keyStates.set(note, {
      isPressed: true,
      velocity,
      timestamp: Date.now(),
      source
    })
    return { keyStates }
  }),

  releaseKey: (note, source) => set((state) => {
    const keyStates = new Map(state.keyStates)
    const currentState = keyStates.get(note)
    
    // Only release if the key was pressed by the same source
    if (currentState?.source === source) {
      keyStates.delete(note)
    }
    return { keyStates }
  }),

  clearKeys: (source) => set((state) => {
    const keyStates = new Map(state.keyStates)
    
    if (source) {
      // Clear only keys from specific source
      for (const [note, state] of keyStates) {
        if (state.source === source) {
          keyStates.delete(note)
        }
      }
    } else {
      // Clear all keys
      keyStates.clear()
    }
    
    // Also reset progress when clearing all keys or MIDI source
    if (!source || source === 'midi') {
      return { 
        keyStates,
        progress: 0,
        currentTime: "0:00",
        duration: "0:00"
      }
    }
    
    return { keyStates }
  }),

  // UI Actions
  toggleNoteNames: () => set((state) => ({ 
    showNoteNames: !state.showNoteNames 
  })),

  toggleSceneLock: () => set((state) => ({ 
    isSceneLocked: !state.isSceneLocked 
  })),

  toggleStaff: () => set((state) => ({ 
    staffVisible: !state.staffVisible 
  })),

  setPressedKeyColor: (color) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('piano-pressed-key-color', color)
    }
    set({ pressedKeyColor: color })
  },

  setLoadingState: (progress, message) => set({ 
    loadingProgress: progress, 
    loadingMessage: message 
  }),

  // Progress Actions
  setProgress: (progress, currentTime, duration) => set({
    progress,
    currentTime,
    duration
  }),
  
  resetProgress: () => set({
    progress: 0,
    currentTime: "0:00",
    duration: "0:00"
  }),
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