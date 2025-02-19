import { create } from 'zustand'

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
  toggleSceneLock: () => set((state) => ({ isSceneLocked: !state.isSceneLocked }))
})) 