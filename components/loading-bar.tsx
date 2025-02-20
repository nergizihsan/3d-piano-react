// components/loading-bar.tsx
import { motion, AnimatePresence } from "framer-motion"
import { useAudioStore } from "@/stores/audio-store"

export function LoadingBar() {
  const { loadingProgress, loadingMessage, isReady } = useAudioStore()

  return (
    <AnimatePresence>
      {!isReady && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="bg-black/80 rounded-lg p-6 min-w-[300px] border border-white/10">
            <div className="text-xl font-bold text-center mb-4 text-white">Loading Piano</div>
            <div className="text-sm text-center mb-4 text-white/80">{loadingMessage}</div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-xs text-center mt-2 text-white/60">
              {Math.round(loadingProgress)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}