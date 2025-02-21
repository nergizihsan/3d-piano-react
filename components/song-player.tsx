import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Square, SkipBack, SkipForward, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMidiStore } from "@/stores/midi-store";
import * as Tone from "tone";
import { usePianoAudio } from "@/hooks/use-piano-audio";
import { useAudioStore } from "@/stores/audio-store";
import { midiEngine } from "@/services/midi-engine";
import { SONG_PLAYER_PHYSICS } from "@/constants/piano-physics";
import { toast } from "sonner";

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
  onUploadRequest: () => void;
}

export function SongPlayer({ className, onUploadRequest }: SongPlayerProps) {
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

  const {
    progress,
    currentTime,
    duration,
    setProgress,
  } = useAudioStore();

  const { playNote, releaseNote } = usePianoAudio();
  const { pressKey, releaseKey } = useAudioStore();

  const currentSong = currentSongId ? getSong(currentSongId) : null;

  // Update progress bar and time
  useEffect(() => {
    if (!isPlaying || !currentSong) return;

    const interval = setInterval(() => {
      const current = Tone.getTransport().seconds;
      const total = currentSong.duration;
      const newProgress = (current / total) * 100;
      
      setProgress(
        newProgress,
        formatTime(current),
        formatTime(total)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentSong, setProgress]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = async (value: number) => {
    if (!currentSong) return;
    const newTime = (value / 100) * currentSong.duration;
    
    // Stop current playback and clean up
    await Promise.all([
      midiEngine.cleanup(),
      useAudioStore.getState().clearKeys('midi'),
      Tone.getTransport().stop()
    ]);

    // Set new position and restart if was playing
    Tone.getTransport().position = newTime;
    if (isPlaying) {
      handlePlayPause();
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      const audioStore = useAudioStore.getState();
      await Promise.all([
        midiEngine.cleanup(),
        audioStore.clearKeys('midi'),
        Tone.getTransport().stop()
      ]);
      setIsPlaying(false);
      return;
    }

    const song = getSong(currentSongId!);
    if (!song) {
      toast.error("Please select a song to play.");
      return;
    }

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
          toast.error("No playable tracks found in MIDI file");
          return;
        }
        const newTrackIndex = song.midi.tracks.indexOf(playableTrack);
        setCurrentTrack(newTrackIndex);
        track = playableTrack;
      }

      const notes = track.notes.sort((a, b) => a.time - b.time);
      
      // TODO: Make initial silence skip optional in settings
      // Skip initial silence if it's more than 1 second
      const firstNoteTime = notes[0].time;
      if (firstNoteTime > 1) {
        notes.forEach(note => {
          note.time -= firstNoteTime;
        });
        song.duration -= firstNoteTime;
      }

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
    <div className={cn("flex flex-col gap-1 min-w-[300px]", className)}>
      {/* Song Selection and Controls Row */}
      <div className="flex items-center gap-2 bg-black/20 rounded-lg">
        <div className="flex-shrink-0 w-8 h-8 bg-white/5 rounded-md flex items-center justify-center">
          <Music2 className="w-5 h-5 text-white/50" />
        </div>
        
        <div className="flex-grow">
          <Select 
            value={currentSongId ?? undefined} 
            onValueChange={setCurrentSong}
            onOpenChange={(open) => {
              if (open && songs.length === 0) onUploadRequest();
            }}
          >
            <SelectTrigger className="w-full bg-transparent border-none focus:ring-0">
              <SelectValue 
                placeholder="Select a song" 
                className="text-sm font-medium"
              />
            </SelectTrigger>
            <SelectContent>
              {songs.length === 0 ? (
                <SelectItem value="upload" className="opacity-50">
                  Upload MIDI file
                </SelectItem>
              ) : (
                songs.map((song) => (
                  <SelectItem key={song.id} value={song.id}>
                    {song.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            disabled={!currentSong}
            className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            {isPlaying ? (
              <Square className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar Row */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-xs text-white/50 w-10 text-right">
          {currentTime}
        </span>
        
        <div className="flex-grow h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/30 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <span className="text-xs text-white/50 w-10">
          {duration}
        </span>
      </div>
    </div>
  );
}
