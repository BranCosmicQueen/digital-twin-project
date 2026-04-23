'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export default function YardSafety() {
  const hydrants = useMemo(() => [
    [65, 0, 5],
    [95, 0, 5],
    [65, 0, 45],
    [95, 0, 45],
  ], []);

  const foamMonitors = useMemo(() => [
    [75, 0, 15],
    [75, 0, 35],
  ], []);

  const groundingMarks = useMemo(() => [
    [85, 0.02, 20],
    [85, 0.02, 30],
  ], []);

  return (
    <group>
      {/* Grifos (Hydrants) */}
      {hydrants.map((pos, i) => (
        <group key={`hydrant-${i}`} position={pos}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      ))}

      {/* Monitores de Espuma */}
      {foamMonitors.map((pos, i) => (
        <group key={`foam-${i}`} position={pos}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
          <mesh position={[0, 1.3, 0.3]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
        </group>
      ))}

      {/* Grounding Marks */}
      {groundingMarks.map((pos, i) => (
        <mesh key={`ground-${i}`} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}
