"use client"

import { Switch } from "@/components/ui/switch"
import { useAudioStore } from "@/stores/audio-store"
import { cn } from "@/lib/utils"

export function Controls() {
  const { isSceneLocked, toggleSceneLock } = useAudioStore()

  return (
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur p-4 rounded-lg select-none">
      <Switch
        checked={isSceneLocked}
        onCheckedChange={toggleSceneLock}
        className={cn(
          "data-[state=checked]:bg-blue-600",
          "data-[state=checked]:hover:bg-blue-500"
        )}
        id="scene-lock"
      />
      <label 
        htmlFor="scene-lock" 
        className={cn(
          "text-sm cursor-pointer select-none",
          isSceneLocked && "text-blue-400"
        )}
      >
        {isSceneLocked ? "Unlock Camera" : "Lock Camera"}
      </label>
    </div>
  )
} 