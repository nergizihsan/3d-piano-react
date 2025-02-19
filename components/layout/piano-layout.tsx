import { Controls } from "@/components/controls"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { OctaveIndicator } from "@/components/octave-indicator"

interface PianoLayoutProps {
  children: React.ReactNode
  onOpenShortcuts: () => void
}

export function PianoLayout({ children, onOpenShortcuts }: PianoLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 to-black text-white overflow-hidden select-none">
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
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
            onClick={onOpenShortcuts}
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
    </div>
  )
} 