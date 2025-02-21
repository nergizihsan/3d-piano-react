import { useState } from "react"
import { Controls } from "@/components/controls"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { OctaveIndicator } from "@/components/octave-indicator"
import { SettingsDialog } from "@/components/settings-dialog"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"

interface PianoLayoutProps {
  children: React.ReactNode
}

/**
 * PianoLayout Component
 * 
 * RESPONSIBILITY:
 * - Provides the main application layout structure
 * - Manages modal states for settings and shortcuts
 * - Houses the header with controls and indicators
 * 
 * STATE MANAGEMENT:
 * - Local state for modal visibility
 * - Handles modal transitions between settings and shortcuts
 * 
 * DESIGN DECISIONS:
 * - Uses flex layout for responsive design
 * - Implements backdrop blur for depth
 * - Prevents text selection for better UX
 */
export function PianoLayout({ children }: PianoLayoutProps) {
  // Modal visibility states
  const [showSettings, setShowSettings] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Modal transition handlers
  const handleOpenShortcuts = () => {
    setShowSettings(false)
    setShowShortcuts(true)
  }

  const handleBackToSettings = () => {
    setShowShortcuts(false)
    setShowSettings(true)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 to-black text-white overflow-hidden select-none">
      <header className="container mx-auto px-4 py-1 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">3D Piano</h1>
          <p className="text-sm text-gray-400">
            Built with Next.js, Three.js, and Tone.js
          </p>
        </div>
        <div className="flex items-center gap-4">
          <OctaveIndicator />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Controls />
        </div>
      </header>
      <div className="flex-1 relative">
        {children}
      </div>

      <SettingsDialog 
        open={showSettings}
        onOpenChange={setShowSettings}
        onOpenShortcuts={handleOpenShortcuts}
      />

      <KeyboardShortcuts 
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
        onBackToSettings={handleBackToSettings}
      />
    </div>
  )
} 