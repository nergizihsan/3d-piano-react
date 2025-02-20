import { Midi } from '@tonejs/midi'
import { PianoSong } from '@/types/song'

export async function convertMidiToSong(file: File): Promise<PianoSong> {
  console.log('Starting MIDI conversion for file:', file.name)
  const arrayBuffer = await file.arrayBuffer()
  const midi = new Midi(arrayBuffer)
  
  // Get the first track with notes
  const track = midi.tracks.find(track => track.notes.length > 0)
  if (!track) throw new Error('No notes found in MIDI file')

  // Extract header information
  const header = midi.header
  const timeSignature = header.timeSignatures[0]?.timeSignature || [4, 4]
  const keySignature = header.keySignatures[0]?.key || 'C'
  const name = header.name || file.name.replace(/\.[^/.]+$/, "")
  const artist = track.name || "Unknown"

  // Pre-process timing data
  const notes = track.notes.map(note => ({
    name: note.name,
    time: note.time,  // Remove rounding
    ticks: note.ticks, // Keep as is, no Math.floor needed
    durationTicks: note.durationTicks,
    midi: note.midi,
    velocity: note.velocity,
  }))

    // Sort notes by time for more efficient playback
    notes.sort((a, b) => a.ticks - b.ticks)

  const song: PianoSong = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    title: name,
    artist,
    difficulty: "unknown" as const,
    tempo: header.tempos[0]?.bpm || 120,
    duration: midi.duration,
    timeSignature: timeSignature as [number, number],
    keySignature,
    notes
  }

  console.log('Converted song structure:', {
    ...song,
    notes: `${song.notes.length} notes`
  })

  return song
} 