"use client"

import { PianoScene } from "@/components/piano/piano-scene"
import { Controls } from "@/components/controls"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import * as Tone from "tone"
import { useAudioStore } from "@/stores/audio-store"


export default function Home() {
  const [isStarted, setIsStarted] = useState(false)
  const { isReady } = useAudioStore()

  // Initialize audio context
  const initializeAudio = async () => {
    try {
      await Tone.start()
      setIsStarted(true)
    } catch (error) {
      console.error("Failed to start audio context:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="p-6 text-center bg-black/50 border-white/10">
            <h2 className="text-xl mb-4">Welcome to 3D Piano</h2>
            <p className="mb-4 text-sm text-gray-400">
              {!isReady ? "Loading samples..." : "Click to enable audio"}
            </p>
            <Button 
              onClick={initializeAudio} 
              disabled={!isReady}
            >
              {isReady ? "Start Piano" : "Loading..."}
            </Button>
          </Card>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">3D Piano Player</h1>
        
        {/* Piano Scene Container */}
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl bg-black/20 backdrop-blur">
          <PianoScene />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <Controls />
          </div>
        </div>

        {/* Instructions Card */}
        <Card className="mt-8 p-4 bg-black/20 border-white/10">
          <div className="text-center">
            <h2 className="text-xl mb-2">Keyboard Controls</h2>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div>
                <h3 className="text-sm text-gray-400 mb-2">White Keys</h3>
                <p className="font-mono">A S D F G H J</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Black Keys</h3>
                <p className="font-mono">W E T Y U</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Credits */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Built with Next.js, Three.js, and Tone.js</p>
        </footer>
      </main>
    </div>
  )
}