import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Keyboard } from "lucide-react"
import { useAudioStore } from "@/stores/audio-store"
import { cn } from "@/lib/utils"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenShortcuts: () => void
}

export function SettingsDialog({ open, onOpenChange, onOpenShortcuts }: SettingsDialogProps) {
  const { volume, setVolume, showNoteNames, toggleNoteNames } = useAudioStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/95 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onOpenShortcuts()
            }}
            className="flex items-center gap-2 bg-white/5 border-white/10 hover:bg-blue-500 text-white"
          >
            <Keyboard className="h-4 w-4" />
            View Keyboard Shortcuts
          </Button>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-white">Volume</span>
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              max={1}
              step={0.01}
              className={cn(
                "w-full",
                "[&_[role=slider]]:bg-blue-500",
                "[&_[role=slider]]:border-blue-500",
                "[&_[role=slider]]:hover:bg-blue-400",
                "[&_[role=slider]]:hover:border-blue-400",
                "[&_[role=slider]]:focus:bg-blue-400",
                "[&_[role=slider]]:focus:border-blue-400",
                "[&_.relative]:bg-white/10",
                "[&_[data-state=active]]:bg-blue-500"
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Show Note Names</span>
            <Switch
              checked={showNoteNames}
              onCheckedChange={toggleNoteNames}
              className={cn(
                "data-[state=checked]:bg-blue-500",
                "data-[state=checked]:hover:bg-blue-400",
                "bg-white/10",
                "hover:bg-white/20"
              )}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 