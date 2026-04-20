'use client';

import { useMemo } from 'react';
import {
  RACK_HEIGHT,
  RACK_WIDTH,
  RACK_DEPTH,
  RACK_LEVELS,
  BODEGA_ELEVATION,
  BODEGA_WIDTH,
  TERRAIN_DEPTH,
  COLORS,
} from '@/lib/constants';

function SelectiveRack({ position }) {
  const levelSpacing = RACK_HEIGHT / RACK_LEVELS;

  return (
    <group position={position}>
      {[
        [-RACK_WIDTH / 2, 0, -RACK_DEPTH / 2],
        [RACK_WIDTH / 2, 0, -RACK_DEPTH / 2],
        [-RACK_WIDTH / 2, 0, RACK_DEPTH / 2],
        [RACK_WIDTH / 2, 0, RACK_DEPTH / 2],
      ].map((pos, i) => (
        <mesh key={`up-${i}`} position={[pos[0], RACK_HEIGHT / 2, pos[2]]} castShadow>
          <boxGeometry args={[0.06, RACK_HEIGHT, 0.06]} />
          <meshStandardMaterial color={COLORS.rackMetal} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {Array.from({ length: RACK_LEVELS }).map((_, lvl) => {
        const y = (lvl + 1) * levelSpacing;
        return (
          <group key={`lvl-${lvl}`}>
            <mesh position={[0, y, -RACK_DEPTH / 2]}>
              <boxGeometry args={[RACK_WIDTH, 0.08, 0.05]} />
              <meshStandardMaterial color={COLORS.rackBeam} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, y, RACK_DEPTH / 2]}>
              <boxGeometry args={[RACK_WIDTH, 0.08, 0.05]} />
              <meshStandardMaterial color={COLORS.rackBeam} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, y + 0.15, 0]}>
              <boxGeometry args={[RACK_WIDTH - 0.2, 0.3, RACK_DEPTH - 0.2]} />
              <meshStandardMaterial color={COLORS.pallet} roughness={0.8} transparent opacity={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function DrumRack({ position }) {
  return (
    <group position={position}>
      {[
        [-RACK_WIDTH / 2, 0, -RACK_DEPTH / 2],
        [RACK_WIDTH / 2, 0, -RACK_DEPTH / 2],
        [-RACK_WIDTH / 2, 0, RACK_DEPTH / 2],
        [RACK_WIDTH / 2, 0, RACK_DEPTH / 2],
      ].map((pos, i) => (
        <mesh key={`dup-${i}`} position={[pos[0], 1.5, pos[2]]} castShadow>
          <boxGeometry args={[0.06, 3, 0.06]} />
          <meshStandardMaterial color={COLORS.drumRack} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {[-0.5, 0.5].map((dx, i) => (
        <mesh key={`drum-${i}`} position={[dx * (RACK_WIDTH / 3), 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.0, 10]} />
          <meshStandardMaterial color={COLORS.drumRack} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function Racks() {
  const baseY = BODEGA_ELEVATION;

  const racks = useMemo(() => {
    const items = [];
    const rackSpacing = RACK_WIDTH + 0.5;
    const aisleWidth = 3;

    // Main storage rows — run along X-axis in the bodega interior
    // Zone: X=5..50, Z=5..45 (avoiding walls and staging areas near X=60)
    for (let row = 0; row < 5; row++) {
      const z = 6 + row * (RACK_DEPTH + aisleWidth);
      if (z > 44) break;

      for (let col = 0; col < 8; col++) {
        const x = 5 + col * rackSpacing;
        if (x > 48) break;
        items.push({ pos: [x, baseY, z], type: 'selective' });
      }
    }

    // Additional rows in deeper part (Z=25..45)
    for (let row = 0; row < 4; row++) {
      const z = 26 + row * (RACK_DEPTH + aisleWidth);
      if (z > 45) break;

      for (let col = 0; col < 8; col++) {
        const x = 5 + col * rackSpacing;
        if (x > 48) break;
        items.push({ pos: [x, baseY, z], type: 'selective' });
      }
    }

    // Drum racks near back wall
    for (let col = 0; col < 4; col++) {
      items.push({ pos: [5 + col * (RACK_WIDTH + 1.5), baseY, 3], type: 'drum' });
    }

    return items;
  }, [baseY]);

  return (
    <group>
      {racks.map((rack, i) =>
        rack.type === 'selective' ? (
          <SelectiveRack key={i} position={rack.pos} />
        ) : (
          <DrumRack key={i} position={rack.pos} />
        )
      )}
    </group>
  );
}
