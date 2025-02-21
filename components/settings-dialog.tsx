import { HexColorPicker } from "react-colorful"
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
import { useState } from "react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenShortcuts: () => void
}

/**
 * SettingsDialog Component
 * 
 * RESPONSIBILITY:
 * - Manages piano settings and preferences
 * - Provides access to keyboard shortcuts
 * - Controls volume and note name display
 * 
 * FEATURES:
 * - Volume control with slider
 * - Note names toggle
 * - Keyboard shortcuts access
 * 
 * STATE MANAGEMENT:
 * - Connected to audio store for settings persistence
 * - Handles modal visibility through props
 * 
 * DESIGN DECISIONS:
 * - Semi-transparent backdrop for context
 * - Immediate feedback on setting changes
 * - Consistent styling with main app theme
 * - High contrast close button for visibility
 */
export function SettingsDialog({ open, onOpenChange, onOpenShortcuts }: SettingsDialogProps) {
  const { 
    volume, 
    setVolume, 
    showNoteNames, 
    toggleNoteNames,
    staffVisible,
    toggleStaff,
    pressedKeyColor,
    setPressedKeyColor
  } = useAudioStore()

  // Local state for color picker visibility
  const [showColorPicker, setShowColorPicker] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/95 border-white/10 [&>button]:text-white">
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
            <span className="text-sm text-white">Pressed Key Color</span>
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full flex items-center gap-2 bg-white/5 border-white/10 hover:bg-blue-500 text-white"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-white/20" 
                  style={{ backgroundColor: pressedKeyColor }} 
                />
                {pressedKeyColor}
              </Button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setShowColorPicker(false)} 
                  />
                  <HexColorPicker
                    color={pressedKeyColor}
                    onChange={setPressedKeyColor}
                    className="relative"
                  />
                </div>
              )}
            </div>
          </div>

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

          <div className="flex flex-col gap-4">
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

            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Show Music Staff</span>
              <Switch
                checked={staffVisible}
                onCheckedChange={toggleStaff}
                className={cn(
                  "data-[state=checked]:bg-blue-500",
                  "data-[state=checked]:hover:bg-blue-400",
                  "bg-white/10",
                  "hover:bg-white/20"
                )}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 