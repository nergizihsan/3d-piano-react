import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { PianoSong } from '@/types/song'
import { usePianoAudio } from './use-piano-audio'
import { useAudioStore } from '@/stores/audio-store'
import { SONG_PLAYER_PHYSICS } from '@/constants/song-player'
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
  const endTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const transport = Tone.getTransport()

  const playSong = async (song: PianoSong) => {
    stopSong()
    transport.stop()
    transport.position = 0
    await Tone.start()
    
    // Calculate total duration in seconds - most reliable way to handle song end
    const songDurationInSeconds = song.duration * (60 / song.tempo)
    
    // Set up precise end time handler
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current)
    }
    endTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false)
      stopSong()
    }, songDurationInSeconds * 1000) // Convert to milliseconds

    song.notes.forEach((note, index) => {
      const previousNote = song.notes[index - 1]
      const timeSincePrevious = previousNote 
        ? note.startTime - (previousNote.startTime + previousNote.duration)
        : Infinity

      if (previousNote && previousNote.note === note.note) {
        if (timeSincePrevious < SONG_PLAYER_PHYSICS.MIN_REPEAT_TIME) {
          // Release key early to allow mechanism reset
          const releaseEarlyId = transport.schedule((time) => {
            releaseNote(note.note)
            releaseKey(note.note)
          }, note.startTime - SONG_PLAYER_PHYSICS.DAMPER_FALL_TIME)
          
          const adjustedStartTime = Math.max(
            note.startTime,
            previousNote.startTime + SONG_PLAYER_PHYSICS.MIN_REPEAT_TIME
          )
          
          const startId = transport.schedule((time) => {
            playNote(note.note)
            pressKey(note.note)
          }, adjustedStartTime)

          scheduledEvents.current.push(releaseEarlyId, startId)
        }
      }

      const startId = transport.schedule((time) => {
        playNote(note.note)
        pressKey(note.note)
      }, note.startTime)

      const releaseTime = note.startTime + note.duration
      const releaseId = transport.schedule((time) => {
        releaseNote(note.note)
        releaseKey(note.note)
      }, releaseTime)

      scheduledEvents.current.push(startId, releaseId)
    })

    transport.bpm.value = song.tempo
    setIsPlaying(true)
    transport.start()
  }

  const stopSong = () => {
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current)
      endTimeoutRef.current = null
    }
    setIsPlaying(false)
    scheduledEvents.current.forEach(id => transport.clear(id))
    scheduledEvents.current = []
    transport.stop()
    transport.position = 0
    transport.cancel()
  }

  useEffect(() => {
    return () => {
      if (endTimeoutRef.current) {
        clearTimeout(endTimeoutRef.current)
      }
      stopSong()
    }
  }, [])

  return { playSong, stopSong, isPlaying }
}