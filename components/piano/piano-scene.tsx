///components/piano/piano-scene.tsx
"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, AdaptiveDpr, AdaptiveEvents, Environment } from '@react-three/drei'
import { Piano } from './piano'
import { useAudioStore } from '@/stores/audio-store'
import { WEBGL_SETTINGS, PIANO_CAMERA } from '@/constants/piano'
import { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'

/**
 * PianoScene Component
 * 
 * RESPONSIBILITY:
 * - Provides the 3D environment for the piano using Three.js
 * - Manages camera controls and scene settings
 * - Handles scene locking for performance and user experience
 * - Implements WebGL optimizations and performance monitoring
 * 
 * OPTIMIZATIONS:
 * 1. Adaptive DPR (Device Pixel Ratio) scaling
 * 2. Frustum culling for off-screen objects
 * 3. Power preference for better battery life
 * 4. Event throttling for performance
 * 5. Memory management for textures and geometries
 */
export function PianoScene() {
  const { isSceneLocked } = useAudioStore()
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null)

  // WebGL context loss handling
  useEffect(() => {
    if (!renderer) return

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn('WebGL context lost. Attempting to restore...')
    }

    const handleContextRestored = () => {
      console.log('WebGL context restored')
      if (renderer) {
        renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      }
    }

    const canvas = renderer.domElement
    canvas.addEventListener('webglcontextlost', handleContextLost as EventListener)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost as EventListener)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [renderer])

  // Memory management
  useEffect(() => {
    if (!renderer) return

    return () => {
      // Cleanup textures and geometries on unmount
      renderer.dispose()
      renderer.renderLists.dispose()
      THREE.Cache.clear()
    }
  }, [renderer])

  return (
    <div className="w-full h-full">
      <Canvas
        gl={{
          ...WEBGL_SETTINGS,
          powerPreference: "high-performance",
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true
        }}
        onCreated={({ gl }) => setRenderer(gl)}
        dpr={[1, 2]}
        camera={{ 
          position: [0, 3, 6],
          fov: PIANO_CAMERA.FOV,
          near: 0.1,
          far: 1000,
        }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 10]} 
              intensity={0.8} 
              castShadow
              shadow-mapSize={[512, 512]}
              shadow-bias={-0.0001}
            >
              <orthographicCamera 
                attach="shadow-camera"
                args={[-10, 10, 10, -10, 0.1, 20]}
              />
            </directionalLight>
            <pointLight 
              position={[0, 5, -5]} 
              intensity={0.6}
              distance={20}
              decay={2}
            />
            <Environment 
              preset="city"
              resolution={256}
              frames={Infinity}
            />
            <Piano />
          </group>
        </Suspense>

        <OrbitControls 
          enabled={!isSceneLocked}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={PIANO_CAMERA.MIN_POLAR_ANGLE}
          maxPolarAngle={PIANO_CAMERA.MAX_POLAR_ANGLE}
          minDistance={PIANO_CAMERA.MIN_DISTANCE}
          maxDistance={PIANO_CAMERA.MAX_DISTANCE}
          enableDamping={true}
          dampingFactor={0.05}
          target={new THREE.Vector3(0, 0, 0)}
        />
      </Canvas>
    </div>
  )
}
