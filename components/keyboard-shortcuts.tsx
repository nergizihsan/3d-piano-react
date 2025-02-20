import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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

export function KeyboardShortcuts({ open, onOpenChange, onBackToSettings }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onOpenChange(false)
                onBackToSettings()
              }}
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {PIANO_SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center gap-4">
              <kbd className="px-2 py-1.5 text-xs font-mono text-white bg-white/10 rounded-lg border border-white/20">
                {key}
              </kbd>
              <span className="text-sm text-gray-300">{description}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 