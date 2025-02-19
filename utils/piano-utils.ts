import { PianoKeyData, KeyType } from '@/types/piano'

export function generatePianoKeys(PIANO_DIMENSIONS: any): PianoKeyData[] {
  const keys: PianoKeyData[] = []
  let whiteKeyIndex = 0

  // All notes in order (# represents sharp)
  const ALL_NOTES = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ]

  // Statistics objects
  const stats = {
    total: 0,
    white: 0,
    black: 0,
    byOctave: {} as Record<number, { white: number; black: number; keys: PianoKeyData[] }>
  }

  // Generate keys from A0 to C8
  for (let octave = 0; octave <= 8; octave++) {
    // Initialize octave stats
    stats.byOctave[octave] = { white: 0, black: 0, keys: [] }

    ALL_NOTES.forEach((note) => {
      // For octave 0, only include A and above
      if (octave === 0 && ALL_NOTES.indexOf(note) < ALL_NOTES.indexOf('A')) {
        return
      }
      
      // For octave 8, only include up to C
      if (octave === 8 && ALL_NOTES.indexOf(note) > ALL_NOTES.indexOf('C')) {
        return
      }
      
      const fullNote = `${note}${octave}`
      const isBlack = note.includes('#')

      // Calculate positions
      const whiteKeySpacing = PIANO_DIMENSIONS.WHITE_KEY.WIDTH + PIANO_DIMENSIONS.WHITE_KEY.GAP
      const x = -whiteKeyIndex * whiteKeySpacing
      const adjustedX = isBlack ? x + whiteKeySpacing / 2 : x

      const keyData: PianoKeyData = {
        note: fullNote,
        type: isBlack ? 'black' as KeyType : 'white' as KeyType,
        position: [
          adjustedX,
          0,
          isBlack ? PIANO_DIMENSIONS.WHITE_KEY.LENGTH * PIANO_DIMENSIONS.BLACK_KEY.OFFSET_RATIO : 0
        ]
      }

      // Update statistics
      stats.total++
      if (isBlack) {
        stats.black++
        stats.byOctave[octave].black++
      } else {
        stats.white++
        stats.byOctave[octave].white++
        whiteKeyIndex++
      }
      stats.byOctave[octave].keys.push(keyData)

      keys.push(keyData)
    })
  }

  // Log detailed statistics
  console.log('\n=== Piano Key Generation Statistics ===')
  console.log(`Total keys: ${stats.total} (White: ${stats.white}, Black: ${stats.black})`)
  console.log('\nBy Octave:')
  Object.entries(stats.byOctave).forEach(([octave, data]) => {
    console.log(`\nOctave ${octave}:`)
    console.log(`- White keys: ${data.white}`)
    console.log(`- Black keys: ${data.black}`)
    console.log('- Keys generated:')
    data.keys.forEach(key => {
      console.log(`  ${key.note}: [${key.position.map((p: number) => p.toFixed(3)).join(', ')}]`)
    })
  })

  return keys
} 