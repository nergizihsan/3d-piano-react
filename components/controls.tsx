"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAudioStore } from "@/stores/audio-store"
import { cn } from "@/lib/utils"
import { Music, Upload } from "lucide-react"
import { useState, useRef, useCallback } from "react"
import { SongPlayer } from "./song-player"
import { AnimatePresence, motion } from "framer-motion"
import { Midi } from "@tonejs/midi"
import { useMidiStore } from '@/stores/midi-store'
import * as Tone from "tone"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { midiEngine } from "@/services/midi-engine"

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
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const addSong = useMidiStore(state => state.addSong)

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer?.files || [])
    const midiFiles = files.filter(file => 
      file.name.endsWith('.mid') || file.name.endsWith('.midi')
    )
    
    for (const file of midiFiles) {
      await handleMidiFile(file)
    }
  }, [])

  const handleMidiFile = async (file: File) => {
    try {
      // Stop any currently playing song first using Promise.all like in song-player
      if (useMidiStore.getState().isPlaying) {
        const audioStore = useAudioStore.getState();
        await Promise.all([
          midiEngine.cleanup(),
          audioStore.clearKeys('midi'),
          Tone.getTransport().stop()
        ]);
        useMidiStore.getState().setIsPlaying(false);
      }

      setIsUploading(true)
      const arrayBuffer = await file.arrayBuffer()
      const midi = new Midi(arrayBuffer)
      
      if (!midi.tracks.some(track => track.notes.length > 0)) {
        throw new Error('No playable tracks found in MIDI file')
      }

      if (midi.header.tempos.length > 0) {
        Tone.getTransport().bpm.value = midi.header.tempos[0].bpm
      }
      
      const songId = addSong(midi, file.name)
      
      if (!useMidiStore.getState().isPlaying) {
        useMidiStore.getState().setCurrentSong(songId)
      }
      
      setShowSongPlayer(true)
      setShowUploadDialog(false)
      
    } catch (error) {
      console.error('Failed to load MIDI:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    for (const file of files) {
      await handleMidiFile(file)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-4 h-20 rounded-lg select-none border border-2 border-white/30">
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
          <Button
            variant="ghost"
            size="icon"
            disabled={isUploading}
            onClick={() => setShowUploadDialog(true)}
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
                <SongPlayer 
                  className="ml-2" 
                  onUploadRequest={() => setShowUploadDialog(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <div
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mid,.midi"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-8 w-8 mb-4 text-white/70" />
            <p className="text-sm text-white/70">
              Drop your MIDI files here or click to browse
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 