export type KeyType = 'white' | 'black'

export interface PianoKeyData {
  note: string
  type: KeyType
  position: [number, number, number]
}

export interface PianoKeyProps {
  note: string
  type: KeyType
  position: [number, number, number]
  isPressed?: boolean
  onPress?: () => void
} 