import { useAudioStore } from "@/stores/audio-store"

/**
 * OctaveIndicator Component
 * 
 * RESPONSIBILITY:
 * - Displays current octave setting
 * - Shows keyboard shortcuts for octave control
 * 
 * DESIGN DECISIONS:
 * - Minimal UI with clear visual hierarchy
 * - Keyboard shortcut hints integrated into display
 * - Monospace font for numerical display
 * 
 * STATE MANAGEMENT:
 * - Subscribes to audio store for octave updates
 */
export function OctaveIndicator() {
  const currentOctave = useAudioStore(state => state.currentOctave)
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
      <span className="text-xs text-gray-400">Octave</span>
      <span className="text-sm font-mono font-bold">{currentOctave}</span>
      <div className="flex gap-1">
        <kbd className="px-1.5 py-0.5 text-xs font-mono text-white/70 bg-white/10 rounded border border-white/20">↓</kbd>
        <kbd className="px-1.5 py-0.5 text-xs font-mono text-white/70 bg-white/10 rounded border border-white/20">↑</kbd>
      </div>
    </div>
  )
} 