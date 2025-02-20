import { Midi } from '@tonejs/midi'
import * as Tone from 'tone'

interface MidiPlaybackOptions {
  onNoteStart?: (note: string, velocity: number) => void
  onNoteEnd?: (note: string) => void
  onEnd?: () => void
}

export class MidiPlayer {
  private midi: Midi | null = null
  private isPlaying = false
  private scheduledEvents: number[] = []

  async loadMidi(file: File) {
    const arrayBuffer = await file.arrayBuffer()
    this.midi = new Midi(arrayBuffer)
    
    // Set initial tempo
    if (this.midi.header.tempos.length > 0) {
      Tone.getTransport().bpm.value = this.midi.header.tempos[0].bpm
    }
  }

  play(options: MidiPlaybackOptions = {}) {
    if (!this.midi) return

    this.isPlaying = true
    const track = this.midi.tracks.find(track => track.notes.length > 0)
    if (!track) return

    // Schedule all notes
    track.notes.forEach(note => {
      // Schedule note start
      const startId = Tone.Transport.schedule(time => {
        options.onNoteStart?.(note.name, note.velocity)
      }, note.time)

      // Schedule note end
      const endId = Tone.Transport.schedule(time => {
        options.onNoteEnd?.(note.name)
      }, note.time + note.duration)

      this.scheduledEvents.push(startId, endId)
    })

    // Schedule end of song
    const endId = Tone.getTransport().schedule(time => {
      this.stop()
      options.onEnd?.()
    }, this.midi.duration)
    this.scheduledEvents.push(endId)

    // Start playback
    Tone.getTransport().start()
  }

  stop() {
    this.isPlaying = false
    // Clear all scheduled events
    this.scheduledEvents.forEach(id => Tone.getTransport().clear(id))
    this.scheduledEvents = []
    Tone.getTransport().stop()
    Tone.getTransport().position = 0
  }
} 