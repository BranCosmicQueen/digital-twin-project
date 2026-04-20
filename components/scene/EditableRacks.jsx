'use client';

import { useRef, useEffect, useCallback } from 'react';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import useLayoutStore from '@/store/useLayoutStore';
import {
  RACK_HEIGHT,
  RACK_WIDTH,
  RACK_DEPTH,
  RACK_LEVELS,
  COLORS,
} from '@/lib/constants';

// ══════════════════════════════════════════════════════════════════
// Rack Mesh (visual only — reused from Racks.jsx but now per-object)
// ══════════════════════════════════════════════════════════════════

function SelectiveRackMesh({ isSelected, isInvalid }) {
  const levelSpacing = RACK_HEIGHT / RACK_LEVELS;
  const metalColor = isInvalid ? '#ff1744' : isSelected ? COLORS.accentInbound : COLORS.rackMetal;
  const beamColor = isInvalid ? '#ff5252' : COLORS.rackBeam;

  return (
    <group>
      {[
        [-RACK_WIDTH / 2, 0, -RACK_DEPTH / 2],
        [RACK_WIDTH / 2, 0, -RACK_DEPTH / 2],
        [-RACK_WIDTH / 2, 0, RACK_DEPTH / 2],
        [RACK_WIDTH / 2, 0, RACK_DEPTH / 2],
      ].map((pos, i) => (
        <mesh key={`up-${i}`} position={[pos[0], RACK_HEIGHT / 2, pos[2]]} castShadow>
          <boxGeometry args={[0.06, RACK_HEIGHT, 0.06]} />
          <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {Array.from({ length: RACK_LEVELS }).map((_, lvl) => {
        const y = (lvl + 1) * levelSpacing;
        return (
          <group key={`lvl-${lvl}`}>
            <mesh position={[0, y, -RACK_DEPTH / 2]}>
              <boxGeometry args={[RACK_WIDTH, 0.08, 0.05]} />
              <meshStandardMaterial color={beamColor} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, y, RACK_DEPTH / 2]}>
              <boxGeometry args={[RACK_WIDTH, 0.08, 0.05]} />
              <meshStandardMaterial color={beamColor} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, y + 0.15, 0]}>
              <boxGeometry args={[RACK_WIDTH - 0.2, 0.3, RACK_DEPTH - 0.2]} />
              <meshStandardMaterial
                color={isInvalid ? '#ff1744' : COLORS.pallet}
                roughness={0.8}
                transparent
                opacity={isInvalid ? 0.5 : 0.7}
              />
            </mesh>
          </group>
        );
      })}

      {/* Selection highlight box */}
      {isSelected && (
        <mesh position={[0, RACK_HEIGHT / 2, 0]}>
          <boxGeometry args={[RACK_WIDTH + 0.3, RACK_HEIGHT + 0.3, RACK_DEPTH + 0.3]} />
          <meshStandardMaterial
            color={isInvalid ? '#ff1744' : COLORS.accentInbound}
            transparent
            opacity={0.1}
            wireframe={false}
          />
        </mesh>
      )}
    </group>
  );
}

function DrumRackMesh({ isSelected, isInvalid }) {
  const metalColor = isInvalid ? '#ff1744' : isSelected ? '#a78bfa' : COLORS.drumRack;

  return (
    <group>
      {[
        [-RACK_WIDTH / 2, 0, -RACK_DEPTH / 2],
        [RACK_WIDTH / 2, 0, -RACK_DEPTH / 2],
        [-RACK_WIDTH / 2, 0, RACK_DEPTH / 2],
        [RACK_WIDTH / 2, 0, RACK_DEPTH / 2],
      ].map((pos, i) => (
        <mesh key={`dup-${i}`} position={[pos[0], 1.5, pos[2]]} castShadow>
          <boxGeometry args={[0.06, 3, 0.06]} />
          <meshStandardMaterial color={metalColor} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {[-0.5, 0.5].map((dx, i) => (
        <mesh key={`drum-${i}`} position={[dx * (RACK_WIDTH / 3), 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.0, 10]} />
          <meshStandardMaterial color={metalColor} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {isSelected && (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[RACK_WIDTH + 0.3, 3.3, RACK_DEPTH + 0.3]} />
          <meshStandardMaterial
            color={isInvalid ? '#ff1744' : '#a78bfa'}
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════
// Editable Object wrapper with TransformControls
// ══════════════════════════════════════════════════════════════════

function EditableObject({ obj }) {
  const groupRef = useRef();
  const transformRef = useRef();

  const editMode = useLayoutStore((s) => s.editMode);
  const selectedObjectId = useLayoutStore((s) => s.selectedObjectId);
  const selectObject = useLayoutStore((s) => s.selectObject);
  const updateObjectPosition = useLayoutStore((s) => s.updateObjectPosition);
  const updateObjectRotation = useLayoutStore((s) => s.updateObjectRotation);

  const isSelected = selectedObjectId === obj.id;
  const isInvalid = !obj.validation.valid;

  const handleClick = useCallback(
    (e) => {
      if (!editMode) return;
      e.stopPropagation();
      selectObject(obj.id);
    },
    [editMode, obj.id, selectObject]
  );

  // Sync TransformControls changes back to store
  useEffect(() => {
    if (!transformRef.current || !isSelected || !editMode) return;

    const controls = transformRef.current;

    const onDragEnd = () => {
      if (groupRef.current) {
        const pos = groupRef.current.position;
        const rot = groupRef.current.rotation;
        updateObjectPosition(obj.id, [pos.x, pos.y, pos.z]);
        updateObjectRotation(obj.id, [rot.x, rot.y, rot.z]);
      }
    };

    controls.addEventListener('mouseUp', onDragEnd);
    return () => controls.removeEventListener('mouseUp', onDragEnd);
  }, [isSelected, editMode, obj.id, updateObjectPosition, updateObjectRotation]);

  const MeshComponent =
    obj.type === 'selective' ? SelectiveRackMesh : DrumRackMesh;

  return (
    <>
      <group
        ref={groupRef}
        position={obj.position}
        rotation={obj.rotation}
        onClick={handleClick}
        onPointerOver={(e) => {
          if (editMode) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <MeshComponent isSelected={isSelected} isInvalid={isInvalid} />
      </group>

      {editMode && isSelected && groupRef.current && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
          mode="translate"
          showX={true}
          showY={false}
          showZ={true}
          size={0.8}
          translationSnap={0.5}
          rotationSnap={Math.PI / 12}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// EditableRacks — renders all layout objects from store
// ══════════════════════════════════════════════════════════════════

export default function EditableRacks() {
  const layoutObjects = useLayoutStore((s) => s.layoutObjects);
  const editMode = useLayoutStore((s) => s.editMode);
  const deselectObject = useLayoutStore((s) => s.deselectObject);

  const handleCanvasClick = useCallback(
    (e) => {
      // Only deselect if clicking on empty space
      if (editMode && e.object?.type !== 'Group') {
        // handled by individual object clicks
      }
    },
    [editMode]
  );

  return (
    <group onPointerMissed={() => editMode && deselectObject()}>
      {layoutObjects.map((obj) => (
        <EditableObject key={obj.id} obj={obj} />
      ))}
    </group>
  );
}
