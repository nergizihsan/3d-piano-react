import { Line, Text } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

interface BasicStaffProps {
  position: [number, number, number]
  width: number
}

export function BasicStaff({ position, width }: BasicStaffProps) {
  const lines = useMemo(() => {
    const lineCount = 5
    const spacing = 0.2
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(width, 0, 0)]
    
    return Array.from({ length: lineCount }).map((_, i) => (
      <Line
        key={`line-${i}`}
        points={points}
        color="#FFFFFF"
        lineWidth={2}
        position={[0, i * spacing, 0]}
      />
    ))
  }, [width])

  return (
    <group position={position}>
      {/* Treble clef */}
      <Text
        position={[0.3, 0.2, 0]}
        color="#FFFFFF"
        fontSize={0.4}
        anchorX="center"
        anchorY="middle"
        font="/fonts/NotoMusic-Regular.ttf"
      >
        𝄞
      </Text>
      {lines}
    </group>
  )
}