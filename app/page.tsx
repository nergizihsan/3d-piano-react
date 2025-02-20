"use client"

import { useState, useEffect } from 'react'
import { useInitializeAudioStore } from "@/stores/audio-store"
import { PianoLayout } from "@/components/layout/piano-layout"
import { PianoScene } from "@/components/piano/piano-scene"
import { useAudioContext } from "@/hooks/use-audio-context"
import { LoadingBar } from "@/components/loading-bar"
import * as Tone from 'tone'

export default function Home() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  
  useEffect(() => {
    const initializeAudio = async () => {
      await Tone.start()
      setIsAudioEnabled(true)
    }

    const handleInteraction = () => {
      if (!isAudioEnabled) {
        initializeAudio()
      }
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [isAudioEnabled])
  
  useAudioContext(isAudioEnabled)
  useInitializeAudioStore()

  return (
    <PianoLayout>
      <LoadingBar />
      <PianoScene />
    </PianoLayout>
  )
}