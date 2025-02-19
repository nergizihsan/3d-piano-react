import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { PianoKeyProps } from '@/types/piano'
import { PIANO_PHYSICS, PIANO_DIMENSIONS } from '@/constants/piano'

export function PianoKey({ note, type, position, isPressed, onPress, onRelease }: PianoKeyProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (groupRef.current) {
      const targetRotation = isPressed ? PIANO_PHYSICS.MAX_ROTATION : 0
      const currentRotation = groupRef.current.rotation.x
      const rotationDelta = (targetRotation - currentRotation) * 
        PIANO_PHYSICS.SPRING_STRENGTH * 
        PIANO_PHYSICS.DAMPING
      
      groupRef.current.rotation.x += rotationDelta
    }
  })

  const dimensions = type === 'white' 
    ? {
        width: PIANO_DIMENSIONS.WHITE_KEY.WIDTH,
        height: PIANO_DIMENSIONS.WHITE_KEY.HEIGHT,
        length: PIANO_DIMENSIONS.WHITE_KEY.LENGTH
      }
    : {
        width: PIANO_DIMENSIONS.WHITE_KEY.WIDTH * PIANO_DIMENSIONS.BLACK_KEY.WIDTH_RATIO,
        height: PIANO_DIMENSIONS.BLACK_KEY.HEIGHT,
        length: PIANO_DIMENSIONS.WHITE_KEY.LENGTH * PIANO_DIMENSIONS.BLACK_KEY.LENGTH_RATIO
      }

  const hitboxDimensions = type === 'black' 
    ? {
        width: PIANO_DIMENSIONS.WHITE_KEY.WIDTH * PIANO_DIMENSIONS.BLACK_KEY.HITBOX_WIDTH_RATIO,
        height: PIANO_DIMENSIONS.BLACK_KEY.HITBOX_HEIGHT,
        length: PIANO_DIMENSIONS.WHITE_KEY.LENGTH * PIANO_DIMENSIONS.BLACK_KEY.HITBOX_LENGTH_RATIO
      }
    : null

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    onPress?.()
  }

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    onRelease?.()
  }

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (isPressed) {
      onRelease?.()
    }
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onPress?.()
    
    // Add release after a short delay
    setTimeout(() => {
      onRelease?.()
    }, 200)
  }

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2] + PIANO_PHYSICS.PIVOT_POINT]}
      rotation={[0, 0, 0]}
    >
      {/* Invisible hitbox for black keys */}
      {type === 'black' && hitboxDimensions && (
        <mesh
          position={[0, 0, -PIANO_PHYSICS.PIVOT_POINT]}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <boxGeometry 
            args={[
              hitboxDimensions.width,
              hitboxDimensions.height,
              hitboxDimensions.length
            ]} 
          />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* Visible key mesh */}
      <mesh
        ref={meshRef}
        position={[0, type === 'black' ? dimensions.height / 5 : 0, -PIANO_PHYSICS.PIVOT_POINT]}
        onPointerDown={type === 'white' ? handlePointerDown : undefined}
        onPointerUp={type === 'white' ? handlePointerUp : undefined}
        onPointerLeave={type === 'white' ? handlePointerLeave : undefined}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.length]} />
        <meshStandardMaterial 
          color={type === 'white' ? '#ffffff' : '#1a1a1a'}
          metalness={0.2}
          roughness={0.8}
          shadowSide={THREE.FrontSide}
        />
      </mesh>
    </group>
  )
} 