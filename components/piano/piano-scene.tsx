///components/piano/piano-scene.tsx
"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { Piano } from './piano'
import { useAudioStore } from '@/stores/audio-store'
import { WEBGL_SETTINGS, PIANO_CAMERA } from '@/constants/piano'

/**
 * PianoScene Component
 * 
 * RESPONSIBILITY:
 * - Provides the 3D environment for the piano using Three.js
 * - Manages camera controls and scene settings
 * - Handles scene locking for performance and user experience
 * 
 * ARCHITECTURE DECISIONS:
 * 1. Uses @react-three/fiber for React integration with Three.js
 * 2. Employs @react-three/drei for common 3D utilities
 * 3. Scene locking controlled via global state for consistency
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Uses dpr (device pixel ratio) scaling for optimal rendering
 * - Stage component for automatic lighting and environment
 * - Camera constraints to prevent awkward viewing angles
 */
export function PianoScene() {
  const { isSceneLocked } = useAudioStore()

  return (
    <div className="w-full h-full">
      <Canvas
        gl={WEBGL_SETTINGS}
        dpr={[1, 2]} // Balance between quality and performance
        camera={{ 
          position: PIANO_CAMERA.INITIAL_POSITION, 
          fov: PIANO_CAMERA.FOV 
        }}
      >
        <Stage environment="city" intensity={0.5}>
          <Piano />
        </Stage>
        <OrbitControls 
          enabled={!isSceneLocked}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={PIANO_CAMERA.MIN_POLAR_ANGLE}
          maxPolarAngle={PIANO_CAMERA.MAX_POLAR_ANGLE}
          minDistance={PIANO_CAMERA.MIN_DISTANCE}
          maxDistance={PIANO_CAMERA.MAX_DISTANCE}
        />
      </Canvas>
    </div>
  )
}
