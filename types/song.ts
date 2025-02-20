export interface PianoNote {
  name: string         // Complete note name (e.g., "A4")
  duration?: number
  time: number        // Start time in seconds
  ticks: number       // Start time in ticks
  durationTicks: number // Duration in ticks
  midi: number        // MIDI note number
  velocity: number    // Note velocity (0-1)
}

export type PianoSong = {
  id: string
  title: string
  artist: string
  difficulty: "unknown" | "easy" | "medium" | "hard" | "expert"
  tempo: number
  duration: number
  timeSignature: [number, number] // [beats per measure, beat unit]
  keySignature: string // e.g., "C", "G", "F#"
  notes: Array<PianoNote>
} 