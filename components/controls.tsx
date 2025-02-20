"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAudioStore } from "@/stores/audio-store"
import { cn } from "@/lib/utils"
import { Music, Upload } from "lucide-react"
import { useState } from "react"
import { SongPlayer } from "./song-player"
import { AnimatePresence, motion } from "framer-motion"
import { Midi } from "@tonejs/midi"
import { useMidiStore } from '@/stores/midi-store'
import * as Tone from "tone"

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

  const addSong = useMidiStore(state => state.addSong)

  const handleMidiUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const arrayBuffer = await file.arrayBuffer()
      const midi = new Midi(arrayBuffer)
      
      // Validate MIDI before adding
      if (!midi.tracks.some(track => track.notes.length > 0)) {
        throw new Error('No playable tracks found in MIDI file')
      }

      // Set initial tempo from MIDI
      if (midi.header.tempos.length > 0) {
        Tone.getTransport().bpm.value = midi.header.tempos[0].bpm
      }
      
      const songId = addSong(midi, file.name)
      
      // Only auto-select if no song is currently playing
      if (!useMidiStore.getState().isPlaying) {
        useMidiStore.getState().setCurrentSong(songId)
      }
      
      setShowSongPlayer(true)
      
    } catch (error) {
      console.error('Failed to load MIDI:', error)
      // Here you might want to add toast notification
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