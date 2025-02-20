/**
 * Custom hook to handle global pointer events for piano key cleanup
 * 
 * WHY THIS HOOK EXISTS:
 * 1. During rapid mouse interactions with piano keys, some pointer events might be missed,
 *    leading to "stuck" keys that appear pressed when they shouldn't be
 * 2. We need a global event listener because pointer events might end outside our piano keys
 * 
 * DESIGN DECISIONS:
 * - Separated into a custom hook to:
 *   a) Keep the Piano component focused on rendering logic
 *   b) Make the cleanup logic reusable
 *   c) Easier to test in isolation
 * - Uses useEffect because:
 *   a) We're subscribing to browser events (side effect)
 *   b) Need cleanup on component unmount
 *   c) This is the React-recommended way to handle DOM event listeners
 * 
 * TRADE-OFFS:
 * + Clean separation of concerns
 * + Reusable across components
 * + Proper cleanup handling
 * - Additional file in the codebase
 * - Slight overhead from hook initialization
 */
import { useEffect } from 'react'
import { useAudioStore } from '@/stores/audio-store'

export function usePointerCleanup() {
  const cleanupMousePressed = useAudioStore(state => state.cleanupMousePressed)

  useEffect(() => {
    const handlePointerUp = (e: PointerEvent) => {
      // Only handle mouse events - touch events have different interaction patterns
      if (e.pointerType === 'mouse') {
        cleanupMousePressed()
      }
    }

    window.addEventListener('pointerup', handlePointerUp)
    return () => window.removeEventListener('pointerup', handlePointerUp)
  }, [cleanupMousePressed])
} 