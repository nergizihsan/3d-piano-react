import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause } from "lucide-react"
import { useState, useRef } from "react"
import { SAMPLE_SONGS } from "@/data/sample-songs"
import { cn } from "@/lib/utils"
import { useMidiStore } from '@/stores/midi-store'
import * as Tone from 'tone'
import { usePianoAudio } from "@/hooks/use-piano-audio"
import { useAudioStore } from "@/stores/audio-store"
import { SONG_PLAYER_PHYSICS } from "@/constants/song-player"

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
  const [selectedSongId, setSelectedSongId] = useState<string>('')
  const { playNote, releaseNote } = usePianoAudio()
  const { pressKey, releaseKey } = useAudioStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const midiSongs = useMidiStore(state => state.songs)
  const getMidiSong = useMidiStore(state => state.getSong)
  const scheduledEvents = useRef<number[]>([])

  const stopPlayback = () => {
    console.log('Stopping playback:', {
      scheduledEvents: scheduledEvents.current.length,
      pressedKeys: useAudioStore.getState().pressedKeys
    })

    setIsPlaying(false)
    
    // Clear all scheduled events
    scheduledEvents.current.forEach(id => Tone.getTransport().clear(id))
    scheduledEvents.current = []
    
    // Release all pressed keys
    useAudioStore.getState().pressedKeys.forEach(note => {
      console.log(`Releasing pressed key on stop: ${note}`)
      releaseNote(note)
      releaseKey(note)
    })
    useAudioStore.getState().clearPressedKeys()
    
    Tone.getTransport().stop()
    Tone.getTransport().position = 0
    Tone.getTransport().cancel()
  }

  const handlePlayPause = async () => {
    if (isPlaying) {
      stopPlayback()
    } else {
      const midiSong = getMidiSong(selectedSongId)
      if (!midiSong) return

      await Tone.start()
      const transport = Tone.getTransport()
      transport.stop()
      transport.position = 0

      // Set tempo from MIDI
      if (midiSong.midi.header.tempos.length > 0) {
        transport.bpm.value = midiSong.midi.header.tempos[0].bpm
      }

      // Find first track with notes
      const track = midiSong.midi.tracks.find(track => track.notes.length > 0)
      if (!track) return

      // Sort notes by time
      const notes = track.notes.sort((a, b) => a.time - b.time)

      // Schedule all notes
      notes.forEach((note, index) => {
        const nextNote = index < notes.length - 1 ? notes[index + 1] : null

        // Schedule audio exactly as in MIDI
        const audioStartId = transport.schedule(time => {
          playNote(note.name, note.velocity)
        }, note.time)

        const audioEndId = transport.schedule(time => {
          releaseNote(note.name)
        }, note.time + note.duration)

        // Schedule visual key press with physics constraints
        const nextSameNote = nextNote && nextNote.name === note.name
        const keyPressTime = note.time
        const keyReleaseTime = nextSameNote ?
          Math.min(
            note.time + note.duration - SONG_PLAYER_PHYSICS.DAMPER_FALL_TIME,
            nextNote.time - SONG_PLAYER_PHYSICS.KEY_RETURN_TIME
          ) :
          note.time + note.duration

        const visualStartId = transport.schedule(time => {
          pressKey(note.name, false, note.velocity)
        }, keyPressTime)

        const visualEndId = transport.schedule(time => {
          releaseKey(note.name)
        }, keyReleaseTime)

        scheduledEvents.current.push(audioStartId, audioEndId, visualStartId, visualEndId)
      })

      // Schedule end of song
      const endId = transport.schedule(time => {
        stopPlayback()
      }, midiSong.midi.duration)
      scheduledEvents.current.push(endId)

      setIsPlaying(true)
      transport.start()
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={selectedSongId}
        onValueChange={setSelectedSongId}
      >
        <SelectTrigger className="w-[180px] bg-white/5">
          <SelectValue placeholder="Select a MIDI file" />
        </SelectTrigger>
        <SelectContent>
          {midiSongs.map((song) => (
            <SelectItem key={song.id} value={song.id}>
              {song.title} - {song.artist}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
    </div>
  )
}