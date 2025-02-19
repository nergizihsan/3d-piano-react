"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { useAudioStore } from "@/stores/audio-store"

export function Controls() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { volume, setVolume } = useAudioStore()

  return (
    <div className="flex gap-4 items-center bg-black/40 backdrop-blur p-4 rounded-lg">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm">Volume</span>
        <Slider
          value={[volume]}
          max={1}
          step={0.1}
          onValueChange={([value]) => setVolume(value)}
          className="w-24"
        />
      </div>
    </div>
  )
} 