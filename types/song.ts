export interface PianoNote {
  note: string      // e.g., 'C4', 'F#3'
  startTime: number // in seconds
  duration: number  // in seconds
  velocity?: number // 0-1, optional for volume
}

export interface PianoSong {
  id: string
  title: string
  artist?: string
  notes: PianoNote[]
  tempo: number      // BPM
  duration: number   // total duration in seconds
  difficulty: 'easy' | 'medium' | 'hard'
} 