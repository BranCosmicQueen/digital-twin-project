'use client';

import { forwardRef } from 'react';
import { COLORS } from '@/lib/constants';

const Forklift = forwardRef(function Forklift({ visible = true }, ref) {
  if (!visible) return null;

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.2, 1.2, 2]} />
        <meshStandardMaterial color={COLORS.forklift} roughness={0.5} />
      </mesh>

      {/* Cabin / Roll cage */}
      <mesh position={[0, 1.8, -0.2]}>
        <boxGeometry args={[1.1, 1.2, 1.2]} />
        <meshStandardMaterial color={COLORS.forklift} transparent opacity={0.6} roughness={0.3} />
      </mesh>

      {/* Mast (vertical frame for forks) */}
      <mesh position={[0, 1.2, 1.1]} castShadow>
        <boxGeometry args={[0.15, 2.4, 0.15]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.5, 1.2, 1.1]} castShadow>
        <boxGeometry args={[0.15, 2.4, 0.15]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Fork arms */}
      <mesh position={[0.1, 0.3, 1.6]} castShadow>
        <boxGeometry args={[0.1, 0.08, 1.2]} />
        <meshStandardMaterial color="#777" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.4, 0.3, 1.6]} castShadow>
        <boxGeometry args={[0.1, 0.08, 1.2]} />
        <meshStandardMaterial color="#777" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Wheels */}
      {[[-0.55, 0.25, -0.6], [0.55, 0.25, -0.6], [-0.45, 0.2, 0.7], [0.45, 0.2, 0.7]].map(
        (pos, i) => (
          <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 10]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
        )
      )}

      {/* Warning light (top) */}
      <mesh position={[0.3, 2.5, -0.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color="#ff8800"
          emissive="#ff8800"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
});

export default Forklift;
