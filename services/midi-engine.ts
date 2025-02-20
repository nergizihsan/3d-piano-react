import * as Tone from 'tone'
import { SONG_PLAYER_PHYSICS } from "@/constants/piano-physics"

interface NoteSchedule {
  audioStartId: number
  audioEndId: number
  visualStartId: number
  visualEndId: number
  handlers: {
    onNoteOn: (note: string, velocity: number) => void
    onNoteOff: (note: string) => void
  }
}

class MidiEngine {
  private transport = Tone.getTransport()
  private activeSchedules = new Map<string, NoteSchedule>()
  private endScheduleId?: number
  private activeNotes = new Set<string>()
  
  async ensureContext() {
    await Tone.start()
    this.transport.stop()
    this.transport.position = 0
  }

  storeSchedule(note: string, schedule: NoteSchedule) {
    this.activeSchedules.set(note, schedule)
  }

  scheduleNote(
    note: { name: string; time: number; duration: number; velocity: number },
    nextNote: { name: string; time: number } | null,
    handlers: {
      onNoteOn: (note: string, velocity: number) => void
      onNoteOff: (note: string) => void
    }
  ) {
    const { name, time, duration, velocity } = note
    
    // Schedule audio events
    const audioStartId = this.transport.schedule(() => {
      handlers.onNoteOn(name, velocity)
    }, time)

    const audioEndId = this.transport.schedule(() => {
      handlers.onNoteOff(name)
    }, time + duration)

    // Calculate visual timing with physics
    const nextSameNote = nextNote?.name === name
    const keyReleaseTime = nextSameNote
      ? Math.min(
          time + duration - SONG_PLAYER_PHYSICS.DAMPER_FALL_TIME,
          nextNote.time - SONG_PLAYER_PHYSICS.KEY_RETURN_TIME
        )
      : time + duration

    // Store all scheduled events and handlers
    this.activeSchedules.set(name, {
      audioStartId,
      audioEndId,
      visualStartId: audioStartId,
      visualEndId: audioEndId,
      handlers
    })
  }

  scheduleEnd(duration: number, onEnd: () => void) {
    this.endScheduleId = this.transport.schedule(() => {
      this.cleanup()
      onEnd()
    }, duration)
  }

  cleanup() {
    // Release any active notes first
    this.activeNotes.forEach(note => {
      const schedule = this.activeSchedules.get(note);
      if (schedule?.handlers) {
        schedule.handlers.onNoteOff(note);
      }
    });
    this.activeNotes.clear();

    // Clear note schedules
    this.activeSchedules.forEach(schedule => {
      Object.values(schedule).forEach(id => {
        this.transport.clear(id)
      })
    })
    this.activeSchedules.clear()

    // Clear end schedule
    if (this.endScheduleId) {
      this.transport.clear(this.endScheduleId)
      this.endScheduleId = undefined
    }

    this.transport.stop()
    this.transport.position = 0
    this.transport.cancel()
  }
}

export const midiEngine = new MidiEngine() 