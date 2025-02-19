"use client"

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePianoKeyboard } from '@/hooks/use-piano-keyboard'

// Key dimensions
const WHITE_KEY_WIDTH = 0.23
const WHITE_KEY_GAP = 0.01  // Smaller gap only where black keys exist
const WHITE_KEY_HEIGHT = 0.1
const WHITE_KEY_LENGTH = 1.5
const BLACK_KEY_WIDTH = 0.14  // Slightly thinner black keys
const BLACK_KEY_HEIGHT = 0.2
const BLACK_KEY_LENGTH = 0.9   // Slightly shorter black keys
const BLACK_KEY_OFFSET = 0.4   // Positive offset to move black keys to front

// Physics constants
const PIVOT_POINT = WHITE_KEY_LENGTH / 2 // Pivot point at the back of the key
const MAX_ROTATION = -0.05 // Maximum rotation in radians
const SPRING_STRENGTH = 0.2
const DAMPING = 0.8

// Define key type for better type safety
type KeyType = 'white' | 'black'

// Updated key positions with proper spacing and black key placement
const KEYS: Array<{
  note: string;
  type: KeyType;
  position: [number, number, number];
}> = [
  { note: 'C', type: 'white', position: [0, 0, 0] },
  { note: 'C#', type: 'black', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 0.7, 0, BLACK_KEY_OFFSET] },
  { note: 'D', type: 'white', position: [WHITE_KEY_WIDTH + WHITE_KEY_GAP, 0, 0] },
  { note: 'D#', type: 'black', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 1.7, 0, BLACK_KEY_OFFSET] },
  { note: 'E', type: 'white', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 2, 0, 0] },
  { note: 'F', type: 'white', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 3, 0, 0] },
  { note: 'F#', type: 'black', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 3.7, 0, BLACK_KEY_OFFSET] },
  { note: 'G', type: 'white', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 4, 0, 0] },
  { note: 'G#', type: 'black', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 4.7, 0, BLACK_KEY_OFFSET] },
  { note: 'A', type: 'white', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 5, 0, 0] },
  { note: 'A#', type: 'black', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 5.7, 0, BLACK_KEY_OFFSET] },
  { note: 'B', type: 'white', position: [(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 6, 0, 0] },
]

interface PianoKeyProps {
  note: string
  type: KeyType
  position: [number, number, number]
  isPressed?: boolean
  onPress?: () => void
}

function PianoKey({ note, type, position, isPressed, onPress }: PianoKeyProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (groupRef.current) {
      const targetRotation = isPressed ? MAX_ROTATION : 0
      const currentRotation = groupRef.current.rotation.x
      const rotationDelta = (targetRotation - currentRotation) * SPRING_STRENGTH * DAMPING
      
      groupRef.current.rotation.x += rotationDelta
    }
  })

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2] + PIVOT_POINT]}
      rotation={[0, 0, 0]}
    >
      <mesh
        ref={meshRef}
        position={[0, 0, -PIVOT_POINT]}
        onClick={onPress}
        receiveShadow
        castShadow
      >
        <boxGeometry 
          args={[
            type === 'white' ? WHITE_KEY_WIDTH - WHITE_KEY_GAP : BLACK_KEY_WIDTH,
            type === 'white' ? WHITE_KEY_HEIGHT : BLACK_KEY_HEIGHT,
            type === 'white' ? WHITE_KEY_LENGTH : BLACK_KEY_LENGTH
          ]} 
        />
        <meshStandardMaterial 
          color={type === 'white' ? '#ffffff' : '#1a1a1a'}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
    </group>
  )
}

export function Piano() {
  const [pressedKeys, setPressedKeys] = useState<string[]>([])
  const { playNote } = usePianoKeyboard()

  const handleKeyPress = (note: string) => {
    setPressedKeys(prev => [...prev, note])
    playNote(note)
    setTimeout(() => {
      setPressedKeys(prev => prev.filter(key => key !== note))
    }, 150)
  }

  return (
    <group position={[-(WHITE_KEY_WIDTH + WHITE_KEY_GAP) * 3.5, 0, 0]}>
      {KEYS.map((key) => (
        <PianoKey
          key={key.note}
          note={key.note}
          type={key.type}
          position={key.position}
          isPressed={pressedKeys.includes(key.note)}
          onPress={() => handleKeyPress(key.note)}
        />
      ))}
    </group>
  )
}
