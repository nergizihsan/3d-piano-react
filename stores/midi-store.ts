import { create } from 'zustand'
import { Midi } from '@tonejs/midi'
import { midiEngine } from '@/services/midi-engine'
import { useAudioStore } from './audio-store'

interface MidiSong {
  id: string
  title: string
  artist: string
  midi: Midi
  duration: number
  trackCount: number
}

interface MidiState {
  songs: MidiSong[]
  currentSongId: string | null
  currentTrackIndex: number
  isPlaying: boolean
  playbackPosition: number
  tempo: number
}

interface MidiActions {
  addSong: (midi: Midi, fileName: string) => string
  getSong: (id: string) => MidiSong | undefined
  setCurrentSong: (id: string | null) => void
  setCurrentTrack: (index: number) => void
  setTempo: (tempo: number) => void
  setPlaybackPosition: (position: number) => void
  setIsPlaying: (playing: boolean) => void
}

export const useMidiStore = create<MidiState & MidiActions>((set, get) => ({
  songs: [],
  currentSongId: null,
  currentTrackIndex: 0,
  isPlaying: false,
  playbackPosition: 0,
  tempo: 120,

  addSong: (midi, fileName) => {
    const id = crypto.randomUUID()
    const song: MidiSong = {
      id,
      title: fileName.replace(/\.[^/.]+$/, ""),
      artist: "MIDI Upload",
      midi,
      duration: midi.duration,
      trackCount: midi.tracks.length
    }
    
    set(state => ({ songs: [...state.songs, song] }))
    return id
  },

  getSong: (id) => get().songs.find(song => song.id === id),
  setCurrentSong: (id) => {
    if (get().isPlaying) {
      midiEngine.cleanup();
      useAudioStore.getState().clearKeys('midi');
    }
    set({ currentSongId: id, currentTrackIndex: 0 });
  },

  setCurrentTrack: (index) => {
    if (get().isPlaying) {
      midiEngine.cleanup();
      useAudioStore.getState().clearKeys('midi');
      set({ isPlaying: false });
    }
    set({ currentTrackIndex: index });
  },

  setTempo: (tempo) => set({ tempo }),
  setPlaybackPosition: (position) => set({ playbackPosition: position }),
  setIsPlaying: (playing) => set({ isPlaying: playing })
})) 