import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const PIANO_SHORTCUTS = [
  { key: "A S D F G H J", description: "White keys (C through B)" },
  { key: "W E T Y U", description: "Black keys (C# through A#)" },
]

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
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