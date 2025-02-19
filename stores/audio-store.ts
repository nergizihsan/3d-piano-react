import { create } from 'zustand'

interface AudioStore {
  volume: number
  setVolume: (volume: number) => void
  isReady: boolean
  setIsReady: (ready: boolean) => void
}

export const useAudioStore = create<AudioStore>((set) => ({
  volume: 0.7,
  setVolume: (volume) => set({ volume }),
  isReady: false,
  setIsReady: (ready) => set({ isReady: ready }),
})) 