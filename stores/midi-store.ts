import { create } from 'zustand'
import { Midi } from '@tonejs/midi'

interface MidiSong {
  id: string
  title: string
  artist: string
  midi: Midi
}

interface MidiStore {
  songs: MidiSong[]
  addSong: (midi: Midi, fileName: string) => void
  getSong: (id: string) => MidiSong | undefined
}

export const useMidiStore = create<MidiStore>((set, get) => ({
  songs: [],
  addSong: (midi: Midi, fileName: string) => {
    const newSong: MidiSong = {
      id: crypto.randomUUID(),
      // Remove file extension and use as title
      title: fileName.replace(/\.[^/.]+$/, ""),
      artist: "MIDI Upload", // Default artist name
      midi: midi
    }
    
    set(state => ({
      songs: [...state.songs, newSong]
    }))
    
    return newSong.id
  },
  getSong: (id: string) => {
    return get().songs.find(song => song.id === id)
  }
})) 