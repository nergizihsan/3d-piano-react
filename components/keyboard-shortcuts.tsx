import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const PIANO_SHORTCUTS = [
  { key: "Z X C V B N M", description: "Lower octave white keys" },
  { key: "1 2 3 4 5", description: "Lower octave black keys" },
  { key: "A S D F G H J", description: "Middle octave white keys" },
  { key: "W E T Y U", description: "Middle octave black keys" },
  { key: "K L ; ' \\", description: "Upper octave white keys" },
  { key: "O P ] ", description: "Upper octave black keys" },
  { key: ", . ↑ ↓", description: "Shift octave down/up" },
]

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBackToSettings: () => void
}

/**
 * KeyboardShortcuts Component
 * 
 * RESPONSIBILITY:
 * - Displays available keyboard shortcuts
 * - Provides navigation back to settings
 * 
 * TECHNICAL NOTES:
 * - Some keyboards may have limitations on simultaneous key presses (Key Rollover)
 * - Gaming keyboards with N-Key Rollover (NKRO) provide best experience
 * - Mouse clicks are not affected by keyboard limitations
 */
export function KeyboardShortcuts({ open, onOpenChange, onBackToSettings }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/95 border-white/10 [&>button]:text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          {/* Existing shortcuts */}
          <div className="space-y-4">
            {PIANO_SHORTCUTS.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center">
                <kbd className="px-2 py-1 text-xs text-white font-mono bg-white/10 rounded border border-white/20">
                  {shortcut.key}
                </kbd>
                <span className="text-sm text-gray-400">{shortcut.description}</span>
              </div>
            ))}
          </div>

          {/* Hardware limitation note */}
          <div className="text-sm text-gray-400 bg-white/5 p-3 rounded-lg">
            <p className="font-medium text-blue-400 mb-1">Note about keyboard limitations:</p>
            <p>Some keyboards may limit the number of simultaneous key presses due to key rollover rules.</p>
          </div>

          <Button
            variant="outline"
            onClick={onBackToSettings}
            className="bg-white/5 border-white/10 hover:bg-blue-500 text-white"
          >
            Back to Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 