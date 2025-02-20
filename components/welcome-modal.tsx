import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface WelcomeModalProps {
  isReady: boolean
  onStart: () => void
}

/**
 * WelcomeModal Component
 * 
 * RESPONSIBILITY:
 * - Initial user greeting and audio initialization
 * - Loading state indication
 * - Basic usage instructions
 * 
 * TECHNICAL CONTEXT:
 * - Audio initialization required by browsers
 * - Sample loading status indication
 * 
 * UX CONSIDERATIONS:
 * - Clear loading feedback
 * - Simple instructions for new users
 * - Disabled state while samples load
 * 
 * DESIGN DECISIONS:
 * - Backdrop blur for focus
 * - Loading animation for feedback
 * - Minimal, focused interface
 */
export function WelcomeModal({ isReady, onStart }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="p-6 text-center bg-black/50 border-white/10">
        <h2 className="text-xl font-bold mb-4">Welcome to 3D Piano</h2>
        <p className="mb-6 text-sm text-gray-400">
          {!isReady ? (
            "Loading piano samples..."
          ) : (
            <>
              Click start to enable audio and begin playing.
              <br />
              <span className="text-xs mt-2 block">
                Use your keyboard or mouse to play the piano.
              </span>
            </>
          )}
        </p>
        <Button
          onClick={onStart}
          disabled={!isReady}
          className="min-w-[120px]"
        >
          {!isReady ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            "Start Piano"
          )}
        </Button>
      </Card>
    </div>
  )
} 