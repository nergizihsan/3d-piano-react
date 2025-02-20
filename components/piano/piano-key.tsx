import { useRef, memo, useMemo } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { Text } from "@react-three/drei";
import { PianoKeyProps } from "@/types/piano";
import { PIANO_PHYSICS, PIANO_DIMENSIONS } from "@/constants/piano";
import { useAudioStore } from "@/stores/audio-store";
import { PIANO_MATERIALS } from "@/constants/piano";

// PianoKey component, memoized to prevent unnecessary re-renders.
// React.memo() is a higher-order component that memoizes a component.
// It prevents re-renders if the props haven't changed.  By default, it does a shallow comparison of the props.
// In this case, we're using it to prevent the PianoKey from re-rendering when only the showNoteNames flag changes in the audio store.
// Without memo, any change to the audio store would cause all PianoKey components to re-render.
export const PianoKey = memo(function PianoKey({
  note,
  type,
  position,
  isPressed,
  onPress,
  onRelease,
}: PianoKeyProps) {
  // useRef hook to get a reference to the mesh element
  const meshRef = useRef<THREE.Mesh>(null);

  // Get the flag whether to display note names from the audio store.
  // This hook subscribes the component to the showNoteNames value in the store.
  // When showNoteNames changes, this component will re-render UNLESS it is memoized (as it is here).
  // Because we are using memo, the component will only re-render if the other props (note, type, position, isPressed, onPress, onRelease) change.
  const showNoteNames = useAudioStore((state) => state.showNoteNames);

  const pressedKeyColor = useAudioStore(state => state.pressedKeyColor)
  
  const material = useMemo(() => {
    const baseMaterial = type === 'white' ? PIANO_MATERIALS.WHITE_KEY : PIANO_MATERIALS.BLACK_KEY
    return new THREE.MeshStandardMaterial({
      metalness: baseMaterial.METALNESS,
      roughness: baseMaterial.ROUGHNESS,
      color: isPressed ? pressedKeyColor : baseMaterial.COLOR
    })
  }, [type, isPressed, pressedKeyColor])

  // useSpring hook to animate the key press
  const springs = useSpring({
    // Target values based on isPressed state.  If pressed, rotate to MAX_ROTATION, otherwise no rotation.
    rotationX: isPressed ? PIANO_PHYSICS.MAX_ROTATION : 0,
    config: {
      tension: 300,
      friction: 20,
      precision: 0.0001,
    },
  });

  // Dimensions of the key based on whether it is white or black
  const dimensions =
    type === "white"
      ? {
          width: PIANO_DIMENSIONS.WHITE_KEY.WIDTH,
          height: PIANO_DIMENSIONS.WHITE_KEY.HEIGHT,
          length: PIANO_DIMENSIONS.WHITE_KEY.LENGTH,
        }
      : {
          width:
            PIANO_DIMENSIONS.WHITE_KEY.WIDTH *
            PIANO_DIMENSIONS.BLACK_KEY.WIDTH_RATIO,
          height: PIANO_DIMENSIONS.BLACK_KEY.HEIGHT,
          length:
            PIANO_DIMENSIONS.WHITE_KEY.LENGTH *
            PIANO_DIMENSIONS.BLACK_KEY.LENGTH_RATIO,
        };

  // Hitbox dimensions for black keys.  White keys don't need a separate hitbox.
  const hitboxDimensions =
    type === "black"
      ? {
          width:
            PIANO_DIMENSIONS.WHITE_KEY.WIDTH *
            PIANO_DIMENSIONS.BLACK_KEY.HITBOX_WIDTH_RATIO,
          height: PIANO_DIMENSIONS.BLACK_KEY.HITBOX_HEIGHT,
          length:
            PIANO_DIMENSIONS.WHITE_KEY.LENGTH *
            PIANO_DIMENSIONS.BLACK_KEY.HITBOX_LENGTH_RATIO,
        }
      : null;

  // Event handler for pointer down (mouse click/touch start)
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation(); // Stop event from propagating to other elements
    onPress?.(); // Call the onPress callback if it exists
  };

  // Event handler for pointer up (mouse release/touch end)
  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation(); // Stop event from propagating to other elements
    onRelease?.(); // Call the onRelease callback if it exists
  };

  // Event handler for pointer leave (mouse leaves the key/touch is cancelled)
  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation(); // Stop event from propagating to other elements
    if (isPressed) {
      onRelease?.(); // Call the onRelease callback if the key is currently pressed
    }
  };

  // A small offset so text is not z-fighting with the key surface.
  const textOffset = 0.005;

  return (
    <animated.group
      position={[
        position[0],
        position[1],
        position[2] + PIANO_PHYSICS.PIVOT_POINT,
      ]}
      rotation-x={springs.rotationX}
    >
      {/* Invisible hitbox for black keys */}
      {type === "black" && hitboxDimensions && (
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
              hitboxDimensions.length,
            ]}
          />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* Visible key mesh */}
      <mesh
        ref={meshRef}
        position={[
          0,
          type === "black" ? dimensions.height / 5 : 0,
          -PIANO_PHYSICS.PIVOT_POINT,
        ]}
        onPointerDown={type === "white" ? handlePointerDown : undefined}
        onPointerUp={type === "white" ? handlePointerUp : undefined}
        onPointerLeave={type === "white" ? handlePointerLeave : undefined}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[dimensions.width, dimensions.height, dimensions.length]}
        />
        <meshStandardMaterial
          {...material}
          shadowSide={THREE.FrontSide}
        />
        {/* Always render text but control visibility */}
        {type === "white" ? (
          <Text
            position={[
              0,
              dimensions.height / 2 + textOffset,
              dimensions.length * -0.3,
            ]}
            rotation={[-Math.PI / 2, 0, Math.PI]}
            fontSize={0.12}
            font="/fonts/Inter_28pt-Bold.ttf"
            color="#000000"
            anchorX="center"
            anchorY="middle"
            visible={showNoteNames}
          >
            {note.charAt(0)}
          </Text>
        ) : (
          <animated.group rotation-x={springs.rotationX.to((r) => -r)}>
            <Text
              position={[0, dimensions.height / 2 + textOffset, 0.2]}
              rotation={[Math.PI / 6, Math.PI, 0]}
              fontSize={0.12}
              font="/fonts/Inter_28pt-Bold.ttf"
              color="#256fff"
              anchorX="center"
              anchorY="bottom"
              visible={showNoteNames}
            >
              {note.charAt(0)}{note.includes('#') ? '#' : ''}
            </Text>
          </animated.group>
        )}
      </mesh>
    </animated.group>
  );
});
