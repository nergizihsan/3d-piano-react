import { PianoKeyData } from '@/types/piano'

export function generatePianoKeys(PIANO_DIMENSIONS: any): PianoKeyData[] {
  const keys: PianoKeyData[] = []
  let whiteKeyIndex = 0

  const addWhiteKey = (note: string) => {
    keys.push({
      note,
      type: 'white',
      position: [-whiteKeyIndex * (PIANO_DIMENSIONS.WHITE_KEY.WIDTH + PIANO_DIMENSIONS.WHITE_KEY.GAP), 0, 0]
    })
    whiteKeyIndex++
  }

  // Add white keys
  ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach(addWhiteKey)

  // Add black keys
  const blackKeyPositions = [
    { note: 'C#', offset: -0.5 },
    { note: 'D#', offset: -1.5 },
    { note: 'F#', offset: -3.5 },
    { note: 'G#', offset: -4.5 },
    { note: 'A#', offset: -5.5 },
  ]

  blackKeyPositions.forEach(({ note, offset }) => {
    keys.push({
      note,
      type: 'black',
      position: [
        offset * (PIANO_DIMENSIONS.WHITE_KEY.WIDTH + PIANO_DIMENSIONS.WHITE_KEY.GAP),
        0,
        PIANO_DIMENSIONS.WHITE_KEY.LENGTH * PIANO_DIMENSIONS.BLACK_KEY.OFFSET_RATIO
      ]
    })
  })

  return keys
} 