// Piano dimensions and physics constants
export const PIANO_DIMENSIONS = {
  WHITE_KEY: {
    WIDTH: 0.23,
    HEIGHT: 0.1,
    LENGTH: 1.5,
    GAP: 0.01
  },
  BLACK_KEY: {
    WIDTH_RATIO: 0.6,      // Relative to white key width
    HEIGHT: 0.2,
    LENGTH_RATIO: 0.6,     // Relative to white key length
    OFFSET_RATIO: 0.25,    // How far forward black keys sit
    // New hitbox dimensions
    HITBOX_WIDTH_RATIO: 0.8,   // Wider clickable area
    HITBOX_LENGTH_RATIO: 0.8,  // Longer clickable area
    HITBOX_HEIGHT: 0.3         // Taller clickable area
  }
}

export const PIANO_PHYSICS = {
  PIVOT_POINT: PIANO_DIMENSIONS.WHITE_KEY.LENGTH / 2,
  MAX_ROTATION: -0.05,
  SPRING_STRENGTH: 0.2,
  DAMPING: 0.8
}

export const PIANO_CAMERA = {
  INITIAL_POSITION: [0, 3, 5] as const,
  FOV: 45,
  MIN_POLAR_ANGLE: Math.PI / 4,
  MAX_POLAR_ANGLE: Math.PI / 2,
  MIN_DISTANCE: 3,
  MAX_DISTANCE: 7
}

export const WEBGL_SETTINGS = {
  antialias: true,
  alpha: false,
  powerPreference: "high-performance" as const,
  depth: true
}

export const PIANO_MATERIALS = {
  BLACK_KEY: {
    METALNESS: 0.3,
    ROUGHNESS: 0.7,
    COLOR: '#1a1a1a'
  },
  WHITE_KEY: {
    METALNESS: 0.2,
    ROUGHNESS: 0.8,
    COLOR: '#ffffff'
  }
} 