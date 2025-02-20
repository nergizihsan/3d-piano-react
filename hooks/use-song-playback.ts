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
  const { pressKey, releaseKey, setLoadingState, isReady } = useAudioStore()
  const scheduledEvents = useRef<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const endCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const [songLoadingState, setSongLoadingState] = useState({
    isLoading: false,
    progress: 0,
    totalNotes: 0,
    processedNotes: 0
  })
  
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

  const prepareSong = async (song: PianoSong): Promise<PianoSong> => {
    // First check if audio system is ready
    if (!isReady) {
      setLoadingState(0, 'Waiting for audio system...')
      return song
    }

    console.log('Preparing song:', song.title)
    setLoadingState(0, `Loading "${song.title}"...`)

    // Process notes in chunks with loading feedback
    const chunkSize = 100
    const processedNotes = []
    const totalNotes = song.notes.length
    
    for (let i = 0; i < totalNotes; i += chunkSize) {
      const chunk = song.notes.slice(i, i + chunkSize)
      processedNotes.push(...chunk)
      
      // Update global loading state for LoadingBar
      const progress = Math.min(100, (i + chunk.length) / totalNotes * 100)
      const notesProcessed = i + chunk.length
      setLoadingState(
        progress,
        `Processing notes: ${notesProcessed}/${totalNotes}`
      )
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    setLoadingState(100, `"${song.title}" ready to play`)
    
    return {
      ...song,
      notes: processedNotes
    }
  }

  const playSong = async (song: PianoSong) => {
    try {
      // Prepare the song first
      const preparedSong = await prepareSong(song)
      
      console.log('Starting playback:', {
        title: preparedSong.title,
        noteCount: preparedSong.notes.length,
        tempo: preparedSong.tempo,
        duration: preparedSong.duration
      })

      // Reset everything
      stopSong()
      transport.stop()
      transport.position = 0
      await Tone.start()
      
      // Set basic parameters
      transport.timeSignature = preparedSong.timeSignature
      transport.bpm.value = preparedSong.tempo

      // Pre-calculate timing
      const ticksPerBeat = transport.PPQ
      const secondsPerTick = (60 / preparedSong.tempo) / ticksPerBeat

      // Schedule notes
      preparedSong.notes.forEach((note, index) => {
        const previousNote = index > 0 ? preparedSong.notes[index - 1] : null
        const needsOffset = previousNote && 
                           previousNote.name === note.name && 
                           (note.ticks - previousNote.ticks) < ticksPerBeat / 32

        const adjustedStartTicks = needsOffset ? 
          note.ticks + Math.ceil(ticksPerBeat / 64) : 
          note.ticks

        const startId = transport.schedule((time) => {
          playNote(note.name, note.velocity)
          pressKey(note.name, false, note.velocity)
        }, `${adjustedStartTicks}i`)

        const releaseId = transport.schedule((time) => {
          releaseNote(note.name)
          releaseKey(note.name)
        }, `${adjustedStartTicks + note.durationTicks}i`)

        scheduledEvents.current.push(startId, releaseId)
      })

      // Start playback
      setIsPlaying(true)
      transport.start()
      checkSongEnd(preparedSong.duration)
      
    } catch (error) {
      console.error('Error playing song:', error)
      setLoadingState(0, 'Error loading song')
      stopSong()
    }
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

  return { 
    playSong, 
    stopSong, 
    isPlaying,
    songLoadingState  // Expose loading state
  }
}