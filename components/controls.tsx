"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAudioStore } from "@/stores/audio-store"
import { cn } from "@/lib/utils"
import { Music, Upload } from "lucide-react"
import { useState } from "react"
import { SongPlayer } from "./song-player"
import { AnimatePresence, motion } from "framer-motion"
import { convertMidiToSong } from "@/lib/midi-converter"
import { SAMPLE_SONGS } from "@/data/sample-songs"

/**
 * Controls Component
 * 
 * RESPONSIBILITY:
 * - Provides camera control toggle
 * - Manages song player visibility
 * - Visual feedback for scene lock and playback state
 * 
 * DESIGN DECISIONS:
 * - Smooth animations for player expansion
 * - Inline controls for better UX
 * - Visual continuity during state changes
 * 
 * TECHNICAL NOTES:
 * - Uses Framer Motion for animations
 * - Maintains consistent state during transitions
 * - Handles component mounting/unmounting gracefully
 * 
 * FEATURES:
 * - Animated transitions
 * - Integrated song selection
 * - Playback state indication
 * - Scene lock toggle
 */
export function Controls() {
  const { isSceneLocked, toggleSceneLock } = useAudioStore()
  const [showSongPlayer, setShowSongPlayer] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleMidiUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const song = await convertMidiToSong(file)
      
      // Add the new song to SAMPLE_SONGS
      // Note: In a real app, you might want to use a different state management solution
      SAMPLE_SONGS.push(song)
      
      // Show the song player
      setShowSongPlayer(true)
      
    } catch (error) {
      console.error('Failed to convert MIDI:', error)
      // You might want to add proper error handling/notification here
    } finally {
      setIsUploading(false)
    }
  }

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

      <div className="w-px h-4 bg-white/20 mx-2" />

      <div className="relative">
        <input
          type="file"
          accept=".mid,.midi"
          onChange={handleMidiUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button
          variant="ghost"
          size="icon"
          disabled={isUploading}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <Upload className={cn(
            "h-4 w-4",
            isUploading && "animate-pulse"
          )} />
        </Button>
      </div>

      <div className="w-px h-4 bg-white/20 mx-2" />

      <motion.div 
        className="flex items-center"
        animate={{ width: showSongPlayer ? 'auto' : '24px' }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSongPlayer(!showSongPlayer)}
          className={cn(
            "text-white/70 hover:text-white hover:bg-white/10",
            "transition-transform duration-300",
            showSongPlayer && "-translate-x-1"
          )}
        >
          <Music className="h-4 w-4" />
        </Button>

        <AnimatePresence>
          {showSongPlayer && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <SongPlayer className="ml-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 