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
    HEIGHT: 0.25,
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
  // Starting position [x, y, z]
  // x: left/right (0 = centered)
  // y: height above piano (higher = looking down more)
  // z: distance from piano (higher = further away)
  INITIAL_POSITION: [0, 3, 5] as const,  // Changed from [0, 3, 5]

  // Field of view in degrees (higher = wider angle)
  FOV: 45, 

  // Minimum angle user can rotate camera down from horizontal
  MIN_POLAR_ANGLE: Math.PI / 6, 

  // Maximum angle user can rotate camera up
  MAX_POLAR_ANGLE: Math.PI / 1.8, 

  // How close user can zoom in
  MIN_DISTANCE: 2,  

  // How far user can zoom out
  MAX_DISTANCE: 8  
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

export const PIANO_DEFAULTS = {
  MIN_OCTAVE: 0,
  MAX_OCTAVE: 7,
  DEFAULT_OCTAVE: 4,  // Changed from 3 to 4 to align with standard piano middle C
} as const 