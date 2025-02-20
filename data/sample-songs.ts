import { PianoSong } from "@/types/song"

export const SAMPLE_SONGS: PianoSong[] = [
  {
    id: "twinkle-star",
    title: "Twinkle Twinkle Little Star",
    artist: "Traditional",
    difficulty: "easy",
    tempo: 100,
    duration: 20,
    notes: [
      // First phrase: Twinkle, twinkle
      { note: "C4", startTime: 0, duration: 0.5 },
      { note: "C4", startTime: 0.5, duration: 0.5 },
      { note: "G4", startTime: 1.0, duration: 0.5 },
      { note: "G4", startTime: 1.5, duration: 0.5 },
      { note: "A4", startTime: 2.0, duration: 0.5 },
      { note: "A4", startTime: 2.5, duration: 0.5 },
      { note: "G4", startTime: 3.0, duration: 1.0 },
      
      // Second phrase: little star
      { note: "F4", startTime: 4.0, duration: 0.5 },
      { note: "F4", startTime: 4.5, duration: 0.5 },
      { note: "E4", startTime: 5.0, duration: 0.5 },
      { note: "E4", startTime: 5.5, duration: 0.5 },
      { note: "D4", startTime: 6.0, duration: 0.5 },
      { note: "D4", startTime: 6.5, duration: 0.5 },
      { note: "C4", startTime: 7.0, duration: 1.0 },
    ]
  },
  {
    id: "mary-lamb",
    title: "Mary Had a Little Lamb",
    artist: "Traditional",
    difficulty: "easy",
    tempo: 120,
    duration: 16,
    notes: [
      // Mary had a
      { note: "E4", startTime: 0, duration: 0.5 },
      { note: "D4", startTime: 0.5, duration: 0.5 },
      { note: "C4", startTime: 1.0, duration: 0.5 },
      { note: "D4", startTime: 1.5, duration: 0.5 },
      
      // little lamb
      { note: "E4", startTime: 2.0, duration: 0.5 },
      { note: "E4", startTime: 2.5, duration: 0.5 },
      { note: "E4", startTime: 3.0, duration: 1.0 },
    ]
  }
] 