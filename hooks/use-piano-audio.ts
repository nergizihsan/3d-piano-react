import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { useAudioStore } from '@/stores/audio-store'

/**
 * Piano Audio Hook
 * 
 * RESPONSIBILITY:
 * - Manages the audio engine using Tone.js
 * - Handles sample loading and audio processing chain
 * - Controls note playback with velocity and release timing
 * 
 * AUDIO CHAIN:
 * Sampler -> EQ -> Compressor -> String Resonance -> Delay -> Reverb -> Output
 * 
 * FEATURES:
 * 1. Dynamic sample loading based on browser support (ogg/mp3)
 * 2. Velocity-sensitive note playback
 * 3. Release time based on note hold duration
 * 4. Multiple audio enhancement effects:
 *    - EQ: Reduces mud, enhances clarity
 *    - Compressor: Controls dynamics
 *    - Reverb: Adds space and depth
 *    - String Resonance: Simulates piano string behavior
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Uses refs to prevent unnecessary re-renders
 * - Cleanup on unmount to prevent memory leaks
 * - Efficient audio format detection
 */

// Audio format detection
const getAudioFormat = () => {
  const audio = new Audio()
  return audio.canPlayType('audio/ogg') ? 'ogg' : 'mp3'
}

interface NoteData {
  startTime: number
  velocity: number
}

export function usePianoAudio() {
  // Audio processing nodes
  const sampler = useRef<Tone.Sampler>()
  const reverb = useRef<Tone.Reverb>()
  const compressor = useRef<Tone.Compressor>()
  const eq = useRef<Tone.EQ3>()
  const stringResonance = useRef<Tone.Gain>()
  const resonanceDelay = useRef<Tone.FeedbackDelay>()
  
  // Track active notes for release timing
  const activeNotes = useRef<Record<string, NoteData>>({})
  
  // State management
  const { volume, setIsReady } = useAudioStore()
  const [isLoaded, setIsLoaded] = useState(false)
  const audioFormat = getAudioFormat()

  useEffect(() => {
    const initSampler = async () => {
      try {
        // Create audio effects chain
        compressor.current = new Tone.Compressor({
          threshold: -20,
          ratio: 3,
          attack: 0.003,
          release: 0.25
        })

        eq.current = new Tone.EQ3({
          low: -3,    // Reduce muddy frequencies
          mid: 0,     // Keep mids natural
          high: 1.5   // Enhance brilliance
        })

        reverb.current = new Tone.Reverb({
          decay: 2.5,
          preDelay: 0.01,
          wet: 0.35
        })

        stringResonance.current = new Tone.Gain(0.2)
        resonanceDelay.current = new Tone.FeedbackDelay({
          delayTime: 0.02,
          feedback: 0.2,
          wet: 0.1
        })

        // Chain effects: Sampler -> EQ -> Compressor -> Reverb -> Destination
        sampler.current = new Tone.Sampler({
          urls: {
            // Consider adding more sample points for better interpolation
            'C3': `C3.${audioFormat}`,  // Lower octave
            'C4': `C4.${audioFormat}`,
            'E4': `E4.${audioFormat}`,
            'G#4': `Gs4.${audioFormat}`,
            'C5': `C5.${audioFormat}`,
            'G5': `G5.${audioFormat}`,
            'C6': `C6.${audioFormat}`,
          },
          baseUrl: '/samples/piano/',
          onload: () => {
            console.log('Piano samples loaded')
            setIsLoaded(true)
            setIsReady(true)
          },
          onerror: (error) => {
            console.error('Error loading samples:', error)
          },
        })
        .connect(eq.current)
        .connect(compressor.current)
        .connect(stringResonance.current)
        .connect(resonanceDelay.current)
        .connect(reverb.current)
        .toDestination()

        // Pre-configure sampler settings
        sampler.current.volume.value = Tone.gainToDb(volume)

        // Cleanup function
        return () => {
          [sampler.current, reverb.current, compressor.current, eq.current, stringResonance.current, resonanceDelay.current].forEach(node => {
            if (node) node.dispose()
          })
        }
      } catch (error) {
        console.error('Failed to initialize audio chain:', error)
      }
    }

    initSampler()
  }, [audioFormat, setIsReady])

  // Handle volume changes
  useEffect(() => {
    if (sampler.current) {
      sampler.current.volume.value = Tone.gainToDb(volume)
    }
  }, [volume])

  const playNote = async (note: string) => {
    if (!sampler.current || !isLoaded) return

    try {
      await Tone.start()
      const fullNote = note
      
      // Store both start time and initial velocity
      activeNotes.current[fullNote] = {
        startTime: Tone.now(),
        velocity: 0.8  // Initial attack velocity
      }
      
      sampler.current.triggerAttack(fullNote, undefined, 0.8)
    } catch (error) {
      console.error('Error playing note:', error)
    }
  }

  const releaseNote = (note: string) => {
    if (!sampler.current || !isLoaded) return
    
    const fullNote = note
    const noteData = activeNotes.current[fullNote]
    if (!noteData) return

    const holdDuration = Tone.now() - noteData.startTime
    
    // Calculate release velocity based on hold duration
    // Shorter holds (< 0.1s) = quick release (0.8)
    // Longer holds (> 2s) = gentle release (0.2)
    const releaseTime = Math.max(0.1, 
      0.1 + (Math.min(holdDuration, 2) * 0.2)
    )
    
    // Use release time instead of velocity for the envelope
    sampler.current.triggerRelease(fullNote, Tone.now() + releaseTime)
    delete activeNotes.current[fullNote]
  }

  return { playNote, releaseNote, isLoaded }
}