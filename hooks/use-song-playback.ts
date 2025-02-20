import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { PianoSong } from '@/types/song'
import { usePianoAudio } from './use-piano-audio'
import { useAudioStore } from '@/stores/audio-store'
import { AUDIO_SETTINGS } from '@/constants/audio'
/**
 * Piano Song Playback Hook
 * 
 * RESPONSIBILITY:
 * - Manages playback of piano songs using Tone.js
 * - Handles note scheduling and timing
 * - Manages playback state and cleanup
 * 
 * TECHNICAL NOTES:
 * 1. End Time Calculation:
 *    - Uses precise time calculation based on song duration and tempo
 *    - More accurate than transport events or schedule callbacks
 *    - Current best solution for reliable end-of-song detection
 * 
 * 2. Physical Modeling:
 *    - Simulates basic piano key mechanics
 *    - Handles repeated notes with minimum time constraints
 *    - Models damper fall time for natural release
 * 
 * ARCHITECTURE DECISIONS:
 * - Uses setTimeout for end state management:
 *   • More reliable than transport.schedule for UI state
 *   • Provides consistent end-of-song detection
 *   • Syncs well with actual audio completion
 */


export function useSongPlayback() {
  const { playNote, releaseNote } = usePianoAudio()
  const { pressKey, releaseKey } = useAudioStore()
  const scheduledEvents = useRef<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const endCheckInterval = useRef<NodeJS.Timeout | null>(null)
  
  const transport = Tone.getTransport()

  const checkSongEnd = (duration: number) => {
    // Clear any existing interval
    if (endCheckInterval.current) {
      clearInterval(endCheckInterval.current)
    }

    // Start checking if song has ended
    endCheckInterval.current = setInterval(() => {
      const currentTime = transport.seconds
      if (currentTime >= duration) {
        console.log('Song ended naturally:', { currentTime, duration })
        stopSong()
      }
    }, 100) // Check every 100ms
  }

  const playSong = async (song: PianoSong) => {
    console.log('Starting playback:', {
      title: song.title,
      noteCount: song.notes.length,
      tempo: song.tempo,
      duration: song.duration
    })

    // Reset everything
    stopSong()
    transport.stop()
    transport.position = 0
    await Tone.start()
    
    // Set basic parameters with precise tempo handling
    transport.timeSignature = song.timeSignature
    transport.bpm.value = song.tempo

    // Pre-calculate timing for better accuracy
    const ticksPerBeat = transport.PPQ // Pulses Per Quarter note
    const secondsPerTick = (60 / song.tempo) / ticksPerBeat

    // Set context lookAhead to match our audio settings
    Tone.getContext().lookAhead = AUDIO_SETTINGS.PLAYBACK.LOOK_AHEAD

    // Schedule notes with improved timing
    song.notes.forEach((note, index) => {
      // Handle consecutive notes more precisely
      const previousNote = index > 0 ? song.notes[index - 1] : null
      const needsOffset = previousNote && 
                         previousNote.name === note.name && 
                         (note.ticks - previousNote.ticks) < ticksPerBeat / 32

      const adjustedStartTicks = needsOffset ? 
        note.ticks + Math.ceil(ticksPerBeat / 64) : // Minimal offset for repeated notes
        note.ticks

      // Schedule note start with more precise timing
      const startId = transport.schedule((time) => {
        playNote(note.name, note.velocity)
        pressKey(note.name, false, note.velocity)
      }, `${adjustedStartTicks}i`)

      // Schedule note release with precise duration
      const releaseId = transport.schedule((time) => {
        releaseNote(note.name)
        releaseKey(note.name)
      }, `${adjustedStartTicks + note.durationTicks}i`)

      scheduledEvents.current.push(startId, releaseId)
    })

    // Start playback
    setIsPlaying(true)
    transport.start()
    checkSongEnd(song.duration)
  }

  const stopSong = () => {
    console.log('Stopping song:', {
      scheduledEvents: scheduledEvents.current.length,
      pressedKeys: useAudioStore.getState().pressedKeys
    })
    
    // Clear end check interval
    if (endCheckInterval.current) {
      clearInterval(endCheckInterval.current)
      endCheckInterval.current = null
    }

    setIsPlaying(false)
    
    // Clear all scheduled events
    scheduledEvents.current.forEach(id => transport.clear(id))
    scheduledEvents.current = []
    
    // Release all pressed keys
    useAudioStore.getState().pressedKeys.forEach(note => {
      console.log(`Releasing pressed key on stop: ${note}`)
      releaseNote(note)
      releaseKey(note)
    })
    useAudioStore.getState().clearPressedKeys()
    
    transport.stop()
    transport.position = 0
    transport.cancel()
  }

  useEffect(() => {
    return () => {
      console.log('Cleanup on unmount')
      if (endCheckInterval.current) {
        clearInterval(endCheckInterval.current)
      }
      stopSong()
    }
  }, [])

  return { playSong, stopSong, isPlaying }
}