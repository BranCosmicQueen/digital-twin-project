'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export default function YardSafety() {
  const hydrants = useMemo(() => [
    [62, 0, 2],   // Esquina Nor-Oeste Patio
    [98, 0, 2],   // Esquina Nor-Este Patio
    [62, 0, 48],  // Esquina Sur-Oeste Patio
    [98, 0, 48],  // Esquina Sur-Este Patio
  ], []);

  const foamMonitors = useMemo(() => [
    [62, 0, 15],  // Perímetro Bodega
    [62, 0, 35],  // Perímetro Bodega
    [98, 0, 15],  // Perímetro Reja
    [98, 0, 35],  // Perímetro Reja
  ], []);

  const groundingMarks = useMemo(() => [
    [62, 0.02, 20], // Perímetro Bodega
    [62, 0.02, 30], // Perímetro Bodega
    [98, 0.02, 25], // Perímetro Reja
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
