///components/piano/piano-scene.tsx
"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { Piano } from './piano'
import { useAudioStore } from '@/stores/audio-store'
import { WEBGL_SETTINGS, PIANO_CAMERA } from '@/constants/piano'

export function PianoScene() {
  const { isSceneLocked } = useAudioStore()

  return (
    <div className="w-full h-full">
      <Canvas
        gl={WEBGL_SETTINGS}
        dpr={[1, 2]}
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
