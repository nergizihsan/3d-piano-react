import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMidiStore } from "@/stores/midi-store";
import * as Tone from "tone";
import { usePianoAudio } from "@/hooks/use-piano-audio";
import { useAudioStore } from "@/stores/audio-store";
import { midiEngine } from "@/services/midi-engine";
import { SONG_PLAYER_PHYSICS } from "@/constants/piano-physics";

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
  className?: string;
}

export function SongPlayer({ className }: SongPlayerProps) {
  const { playNote, releaseNote } = usePianoAudio();
  const { pressKey, releaseKey } = useAudioStore();
  const {
    songs,
    currentSongId,
    isPlaying,
    currentTrackIndex,
    setCurrentTrack,
    setCurrentSong,
    setIsPlaying,
    getSong,
  } = useMidiStore();

  const handlePlayPause = async () => {
    if (isPlaying) {
      midiEngine.cleanup();
      useAudioStore.getState().clearKeys('midi');
      setIsPlaying(false);
      Tone.getTransport().stop();
      return;
    }

    const song = getSong(currentSongId!);
    if (!song) return;

    try {
      // Start Tone.js context first
      await Tone.start();
      await midiEngine.ensureContext();
      
      // Reset transport
      Tone.getTransport().stop();
      Tone.getTransport().position = 0;
      
      // Find first track with notes if currentTrackIndex is invalid
      let track = song.midi.tracks[currentTrackIndex];
      if (!track?.notes.length) {
        const playableTrack = song.midi.tracks.find(t => t.notes.length > 0);
        if (!playableTrack) {
          throw new Error("No playable tracks found in MIDI file");
        }
        const newTrackIndex = song.midi.tracks.indexOf(playableTrack);
        setCurrentTrack(newTrackIndex);
        track = playableTrack;
      }

      const notes = track.notes.sort((a, b) => a.time - b.time);
      
      notes.forEach((note, index) => {
        const nextNote = index < notes.length - 1 ? notes[index + 1] : null;
        const prevNote = index > 0 ? notes[index - 1] : null;
        
        // Audio scheduling - Exact MIDI timing
        const audioStartId = Tone.getTransport().schedule(() => {
          playNote(note.name, note.velocity);
        }, note.time);

        const audioEndId = Tone.getTransport().schedule(() => {
          releaseNote(note.name);
        }, note.time + note.duration);

        // Visual scheduling with physics constraints
        const nextSameNote = nextNote?.name === note.name;
        const prevSameNote = prevNote?.name === note.name;
        
        // Calculate key press timing
        const keyPressTime = Math.max(
          note.time,
          prevSameNote 
            ? prevNote!.time + prevNote!.duration + SONG_PLAYER_PHYSICS.MIN_REPEAT_TIME
            : note.time
        );

        // Calculate key release timing
        const keyReleaseTime = nextSameNote
          ? Math.min(
              note.time + note.duration - SONG_PLAYER_PHYSICS.DAMPER_FALL_TIME,
              nextNote.time - SONG_PLAYER_PHYSICS.KEY_RETURN_TIME
            )
          : note.time + note.duration;

        // Schedule visual events with physics precision
        const visualStartId = Tone.getTransport().schedule(() => {
          pressKey(note.name, 'midi', note.velocity);
        }, Tone.Time(keyPressTime).quantize(SONG_PLAYER_PHYSICS.TIMING_PRECISION));

        const visualEndId = Tone.getTransport().schedule(() => {
          releaseKey(note.name, 'midi');
        }, Tone.Time(keyReleaseTime).quantize(SONG_PLAYER_PHYSICS.TIMING_PRECISION));

        // Store all scheduled events
        midiEngine.storeSchedule(note.name, {
          audioStartId,
          audioEndId,
          visualStartId,
          visualEndId,
          handlers: {
            onNoteOn: (note, velocity) => {
              playNote(note, velocity);
              pressKey(note, 'midi', velocity);
            },
            onNoteOff: (note) => {
              releaseNote(note);
              releaseKey(note, 'midi');
            },
          }
        });
      });

      midiEngine.scheduleEnd(song.duration, () => {
        setIsPlaying(false);
        Tone.getTransport().stop();
      });

      setIsPlaying(true);
      Tone.getTransport().start();
    } catch (error) {
      console.error("Playback failed:", error);
      console.log("MIDI file details:", {
        tracks: song?.midi.tracks.map(t => ({
          notes: t.notes.length,
          instrument: t.instrument?.name
        }))
      });
      setIsPlaying(false);
      midiEngine.cleanup();
      useAudioStore.getState().clearKeys('midi');
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={currentSongId ?? undefined} onValueChange={setCurrentSong}>
        <SelectTrigger className="w-[180px] bg-white/5">
          <SelectValue placeholder="Select a MIDI file" />
        </SelectTrigger>
        <SelectContent>
          {songs.map((song) => (
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
  );
}
