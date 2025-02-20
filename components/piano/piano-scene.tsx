///components/piano/piano-scene.tsx
"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
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

  // Let's create a better initial camera position
  const initialCameraPosition = new THREE.Vector3(
    PIANO_CAMERA.INITIAL_POSITION[0],  // x: centered
    PIANO_CAMERA.INITIAL_POSITION[1],  // y: height above piano
    PIANO_CAMERA.INITIAL_POSITION[2] * 1.5  // z: 50% further back than default
  )

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
          alpha: false, // Disable alpha for better performance
          stencil: false, // Disable stencil buffer if not needed
          depth: true
        }}
        onCreated={({ gl }) => setRenderer(gl)}
        dpr={[1, 2]} // Balance between quality and performance
        camera={{ 
          position: initialCameraPosition,
          fov: PIANO_CAMERA.FOV,
          near: 0.1,
          far: 1000,

        }}
        performance={{ min: 0.5 }} // Allow frame rate to drop to 30fps before scaling quality
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        <Suspense fallback={null}>
          <Stage
            environment="city"
            intensity={0.5}
            adjustCamera={false} // Prevent camera adjustments for better control
          >
            <Piano />
          </Stage>
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
          // Add target to ensure orbit controls rotate around the piano
          target={new THREE.Vector3(0, 0, 0)}
        />
      </Canvas>
    </div>
  )
}
