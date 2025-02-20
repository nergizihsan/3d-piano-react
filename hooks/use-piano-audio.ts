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
  const { volume, setIsReady, setLoadingState } = useAudioStore()
  const [isLoaded, setIsLoaded] = useState(false)
  const audioFormat = getAudioFormat()

  // Add a ref to track all created nodes
  const audioNodes = useRef<Tone.ToneAudioNode[]>([])

  const cleanupNodes = () => {
    audioNodes.current.forEach(node => {
      if (node) {
        node.dispose()
      }
    })
    audioNodes.current = []
  }

  useEffect(() => {
    const initSampler = async () => {
      try {
        setLoadingState(10, 'Initializing audio processor...')

        // Create compressor and track it
        compressor.current = new Tone.Compressor({
          threshold: -20,
          ratio: 3,
          attack: 0.003,
          release: 0.25
        })
        audioNodes.current.push(compressor.current)

        // Create EQ and track it
        eq.current = new Tone.EQ3({
          low: -3,
          mid: 0,
          high: 1.5
        })
        audioNodes.current.push(eq.current)

        setLoadingState(20, 'Setting up audio effects...')

        reverb.current = new Tone.Reverb({
          decay: 2.5,
          preDelay: 0.01,
          wet: 0.35
        })
        audioNodes.current.push(reverb.current)

        stringResonance.current = new Tone.Gain(0.2)
        audioNodes.current.push(stringResonance.current)

        resonanceDelay.current = new Tone.FeedbackDelay({
          delayTime: 0.02,
          feedback: 0.2,
          wet: 0.1
        })
        audioNodes.current.push(resonanceDelay.current)

        setLoadingState(40, 'Loading piano samples...')

        // Chain effects: Sampler -> EQ -> Compressor -> Reverb -> Destination
        sampler.current = new Tone.Sampler({
          urls: {
            'C3': `C3.${audioFormat}`,  // Lower octave
            'C4': `C4.${audioFormat}`,
            'E4': `E4.${audioFormat}`,
            'G#4': `Gs4.${audioFormat}`,
            'C5': `C5.${audioFormat}`,
            'G5': `G5.${audioFormat}`,
            'C6': `C6.${audioFormat}`,
          },
          baseUrl: '/samples/piano/',
          attack: 0,
          release: 0.1,
          curve: 'linear',
          volume: 0,
          onload: () => {
            console.log('Piano samples loaded')
            setIsLoaded(true)
            setIsReady(true)
            setLoadingState(100, 'Ready!')
          },
          onerror: (error) => {
            console.error('Error loading samples:', error)
            setLoadingState(0, 'Error loading samples')
          },
        })
        .connect(eq.current)
        .connect(compressor.current)
        .connect(stringResonance.current)
        .connect(resonanceDelay.current)
        .connect(reverb.current)
        .toDestination()

        setLoadingState(60, 'Configuring audio settings...')

        // Pre-configure sampler settings
        sampler.current.volume.value = Tone.gainToDb(volume)

        // Cleanup function
        return () => {
          cleanupNodes()
        }
      } catch (error) {
        console.error('Failed to initialize audio chain:', error)
        setLoadingState(0, 'Failed to initialize audio')
        // Clean up any nodes that were created before the error
        cleanupNodes()
      }
    }

    initSampler()
  }, [audioFormat, setIsReady, setLoadingState, volume])

  // Handle volume changes
  useEffect(() => {
    if (sampler.current) {
      sampler.current.volume.value = Tone.gainToDb(volume)
    }
  }, [volume])

  const playNote = async (note: string, velocity: number = 0.8) => {
    if (!sampler.current || !isLoaded) return

    try {
      await Tone.start()
      const fullNote = note
      
      // Store both start time and initial velocity
      activeNotes.current[fullNote] = {
        startTime: Tone.now(),
        velocity
      }
      
      sampler.current.triggerAttack(fullNote, undefined, velocity)
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
    const releaseTime = Math.max(0.08,  // Reduced minimum release time
      0.08 + (Math.min(holdDuration, 1.5) * 0.15)  // More responsive curve
    )
    
    // Use release time instead of velocity for the envelope
    sampler.current.triggerRelease(fullNote, Tone.now() + releaseTime)
    delete activeNotes.current[fullNote]
  }

  return { playNote, releaseNote, isLoaded }
}