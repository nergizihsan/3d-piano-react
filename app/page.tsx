"use client"

import { useState } from "react"
import * as Tone from "tone"
import { useAudioStore } from "@/stores/audio-store"
import { PianoLayout } from "@/components/layout/piano-layout"
import { PianoScene } from "@/components/piano/piano-scene"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { WelcomeModal } from "@/components/welcome-modal"

export default function Home() {
  const [isStarted, setIsStarted] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { isReady } = useAudioStore()

  const initializeAudio = async () => {
    try {
      await Tone.start()
      setIsStarted(true)
    } catch (error) {
      console.error("Failed to start audio context:", error)
    }
  }

  return (
    <PianoLayout onOpenShortcuts={() => setShowShortcuts(true)}>
      {!isStarted && (
        <WelcomeModal 
          isReady={isReady} 
          onStart={initializeAudio} 
        />
      )}
      
      <PianoScene />
      
      <KeyboardShortcuts 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
    </PianoLayout>
  )
}