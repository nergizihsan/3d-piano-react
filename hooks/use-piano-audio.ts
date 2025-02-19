import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { useAudioStore } from '@/stores/audio-store'

// Audio format detection
const getAudioFormat = () => {
  const audio = new Audio()
  return audio.canPlayType('audio/ogg') ? 'ogg' : 'mp3'
}

export function usePianoAudio() {
  const sampler = useRef<Tone.Sampler>()
  const { volume, setIsReady } = useAudioStore()
  const [isLoaded, setIsLoaded] = useState(false)
  const audioFormat = getAudioFormat()

  useEffect(() => {
    const initSampler = async () => {
      try {
        sampler.current = new Tone.Sampler({
          urls: {
            // Main octave samples
            'C4': `C4.${audioFormat}`,
            'E4': `E4.${audioFormat}`,
            'G#4': `Gs4.${audioFormat}`,
            // Additional samples for better interpolation
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
        }).toDestination()

        // Pre-configure sampler settings
        sampler.current.volume.value = Tone.gainToDb(volume)
      } catch (error) {
        console.error('Failed to initialize sampler:', error)
      }
    }

    initSampler()

    return () => {
      if (sampler.current) {
        sampler.current.dispose()
      }
    }
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
      // Add octave number if not present
      const fullNote = note.includes('4') ? note : `${note}4`
      sampler.current.triggerAttackRelease(fullNote, '4n', undefined, 0.8)
    } catch (error) {
      console.error('Error playing note:', error)
    }
  }

  return { playNote, isLoaded }
}