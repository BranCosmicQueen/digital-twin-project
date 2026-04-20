'use client';

import { forwardRef } from 'react';
import { PALLET_WIDTH, PALLET_DEPTH, PALLET_HEIGHT, PALLET_STACK_HEIGHT, COLORS } from '@/lib/constants';

const Pallet = forwardRef(function Pallet({ visible = true, withBoxes = true }, ref) {
  if (!visible) return null;

  return (
    <group ref={ref}>
      {/* Pallet base */}
      <mesh position={[0, PALLET_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[PALLET_WIDTH, PALLET_HEIGHT, PALLET_DEPTH]} />
        <meshStandardMaterial color={COLORS.pallet} roughness={0.9} />
      </mesh>

      {/* Pallet slats (bottom) */}
      {[-0.4, 0, 0.4].map((x, i) => (
        <mesh key={`slat-${i}`} position={[x, 0.03, 0]}>
          <boxGeometry args={[0.12, 0.06, PALLET_DEPTH]} />
          <meshStandardMaterial color={COLORS.pallet} roughness={0.9} />
        </mesh>
      ))}

      {/* Stacked boxes (if applicable) */}
      {withBoxes && (
        <group position={[0, PALLET_HEIGHT, 0]}>
          {/* Bottom row */}
          <mesh position={[0, PALLET_STACK_HEIGHT / 2, 0]} castShadow>
            <boxGeometry args={[PALLET_WIDTH - 0.05, PALLET_STACK_HEIGHT, PALLET_DEPTH - 0.05]} />
            <meshStandardMaterial color={COLORS.palletBox} roughness={0.7} />
          </mesh>
          {/* Shrink wrap effect */}
          <mesh position={[0, PALLET_STACK_HEIGHT / 2, 0]}>
            <boxGeometry args={[PALLET_WIDTH, PALLET_STACK_HEIGHT + 0.02, PALLET_DEPTH]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.08}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}
    </group>
  );
});

export default Pallet;
