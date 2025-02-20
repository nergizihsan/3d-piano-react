"use client"

import { useInitializeAudioStore } from "@/stores/audio-store"
import { PianoLayout } from "@/components/layout/piano-layout"
import { PianoScene } from "@/components/piano/piano-scene"
import { useAudioContext } from "@/hooks/use-audio-context"
import { LoadingBar } from "@/components/loading-bar"

export default function Home() {
  
  useAudioContext()
  useInitializeAudioStore()

  return (
    <PianoLayout>
      <LoadingBar />
      <PianoScene />
    </PianoLayout>
  )
}