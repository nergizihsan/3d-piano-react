import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause } from "lucide-react"
import { useState } from "react"
import { SAMPLE_SONGS } from "@/data/sample-songs"
import { useSongPlayback } from "@/hooks/use-song-playback"
import { PianoSong } from "@/types/song"
import { cn } from "@/lib/utils"

/**
 * Song Player Component
 * 
 * RESPONSIBILITY:
 * - Provides song selection interface
 * - Controls playback state
 * - Manages current song state
 * 
 * FEATURES:
 * - Dropdown song selection
 * - Play/Pause toggle
 * - Visual feedback for playback state
 * 
 * TECHNICAL NOTES:
 * - Uses useSongPlayback hook for audio control
 * - Maintains local state for selected song
 * - Async handling of playback operations
 */

interface SongPlayerProps {
  className?: string
}

export function SongPlayer({ className }: SongPlayerProps) {
  const { playSong, stopSong, isPlaying } = useSongPlayback()
  const [currentSong, setCurrentSong] = useState<PianoSong | null>(null)

  // Handle song selection and immediate playback
  const handleSongSelect = async (id: string) => {
    const song = SAMPLE_SONGS.find(s => s.id === id)
    if (song) {
      setCurrentSong(song)
      await playSong(song)
    }
  }

  // Toggle play/pause for current song
  const handlePlayPause = async () => {
    if (isPlaying) {
      stopSong()
    } else if (currentSong) {
      await playSong(currentSong)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select 
        value={currentSong?.id}
        onValueChange={handleSongSelect}
      >
        <SelectTrigger className="w-[200px] bg-white/5 border-white/10">
          <SelectValue placeholder="Choose a song" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900/95 border-white/10">
          {SAMPLE_SONGS.map(song => (
            <SelectItem 
              key={song.id} 
              value={song.id}
              className="text-white hover:bg-white/10"
            >
              {song.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentSong && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )
}