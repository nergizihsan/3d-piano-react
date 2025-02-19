///components/piano/piano-scene.tsx
"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { Piano } from './piano'

export function PianoScene() {
  return (
    <div className="w-full h-[80vh]">
      <Canvas shadows camera={{ position: [0, 3, 4], fov: 50 }}>
        <Stage environment="city" intensity={0.5}>
          <Piano />
        </Stage>
        <OrbitControls 
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={7}
        />
      </Canvas>
    </div>
  )
}
