export const AUDIO_SETTINGS = {
  SAMPLE_RATE: 44100,
  BUFFER_SIZE: 1024,
  LATENCY_HINT: 'interactive' as const,
  
  EFFECTS: {
    COMPRESSOR: {
      THRESHOLD: -20,
      RATIO: 3,
      ATTACK: 0.003,
      RELEASE: 0.25
    },
    EQ: {
      LOW: -3,
      MID: 0,
      HIGH: 1.5
    },
    REVERB: {
      DECAY: 2.5,
      PRE_DELAY: 0.01,
      WET: 0.35
    },
    STRING_RESONANCE: {
      GAIN: 0.2,
      DELAY_TIME: 0.02,
      FEEDBACK: 0.2,
      WET: 0.1
    }
  },

  SAMPLES: {
    BASE_URL: '/samples/piano/',
    KEY_POINTS: [
      'C3', 'C4', 'E4', 'G#4', 'C5', 'G5', 'C6'
    ]
  },

  SILENT_OSCILLATOR: {
    FREQUENCY: 20,
    VOLUME: -100,
    TYPE: 'sine' as const
  }
} 