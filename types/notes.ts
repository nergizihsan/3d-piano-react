export interface MusicNoteData {
    note: string; // e.g., "C4", "D#5"
    pitchName: string; // e.g., "C", "D#"
    octave: number; // e.g., 4, 5
    duration?: number; // Optional: only if you're displaying a sequence of notes
    velocity?: number; // Optional: for visual emphasis
    isSharp: boolean;
  }