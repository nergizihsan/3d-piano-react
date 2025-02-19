import { useEffect, useRef } from 'react'
import * as Tone from 'tone'

/**
 * This hook maintains a continuous audio connection to prevent unwanted latency in piano key responses.
 * 
 * THE PROBLEM:
 * Web browsers implement various power-saving strategies that can suspend audio contexts after periods
 * of inactivity. When this happens, there's a noticeable delay (latency) when playing the next note
 * as the audio context needs to be resumed. For a piano application, this creates a poor user experience
 * as immediate feedback is crucial for musical instruments.
 * 
 * THE SOLUTION:
 * We create an inaudible oscillator (20Hz frequency at -100dB volume) that keeps the audio connection
 * active. This prevents the browser from suspending the audio context, ensuring that piano notes play
 * immediately when triggered.
 * 
 * WHY THIS APPROACH:
 * 1. Musical instruments require immediate feedback - any latency breaks the experience
 * 2. The standard "resume on interaction" approach creates a noticeable delay on the first note
 * 3. Using an inaudible oscillator is more reliable than periodic "keepalive" signals
 * 4. The resource cost is minimal as we use:
 *    - Very low frequency (20Hz) - at the lower limit of human hearing
 *    - Extremely low volume (-100dB) - effectively silent
 *    - Simple sine wave - the least computationally intensive waveform
 * 
 * TRADE-OFFS:
 * - Slightly higher power consumption vs. letting the browser suspend audio
 * - Goes against browser's power-saving intentions
 * - May impact battery life on mobile devices
 * 
 * ALTERNATIVES CONSIDERED:
 * 1. Periodic context resume calls - less reliable, still introduces latency
 * 2. Resume on user interaction - creates noticeable delay on first note
 * 3. Page visibility based resume - doesn't prevent suspension during active use
 * 
 * Note: This is a workaround for a fundamental limitation in how browsers handle audio contexts.
 * Future Web Audio API improvements may provide better ways to handle this use case.
 */
export function useAudioContext() {
  const silentOscillator = useRef<Tone.Oscillator | null>(null)

  useEffect(() => {
    // Create an inaudible oscillator to keep the audio context alive
    const setupSilentOscillator = () => {
      if (!silentOscillator.current) {
        silentOscillator.current = new Tone.Oscillator({
          frequency: 20, // Very low frequency
          volume: -100, // Practically silent
          type: 'sine'
        }).toDestination()
        
        silentOscillator.current.start()
      }
    }

    // Set up the oscillator when audio is initialized
    if (Tone.getContext().state === 'running') {
      setupSilentOscillator()
    }

    // Monitor context state changes
    const context = Tone.getContext().rawContext
    const handleStateChange = () => {
      if (context.state === 'running') {
        setupSilentOscillator()
      }
    }
    
    context.addEventListener('statechange', handleStateChange)

    // Cleanup on unmount
    return () => {
      if (silentOscillator.current) {
        silentOscillator.current.stop()
        silentOscillator.current.dispose()
        silentOscillator.current = null
      }
      context.removeEventListener('statechange', handleStateChange)
    }
  }, [])
} 