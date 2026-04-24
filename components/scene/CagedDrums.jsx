'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { BODEGA_ELEVATION, DS43_ZONE } from '@/lib/constants';

function DrumWithCage({ position }) {
  const drumRadius = 0.3;
  const drumHeight = 0.9;
  const cageSize = 0.8;
  const cageHeight = 1.0;
  
  return (
    <group position={position}>
      {/* 1. Realistic Green Drum */}
      <group position={[0, drumHeight / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[drumRadius, drumRadius, drumHeight, 20]} />
          <meshStandardMaterial color="#166534" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Drum Rings (Bands) */}
        {[ -0.2, 0.2 ].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[drumRadius + 0.01, 0.02, 8, 24]} />
            <meshStandardMaterial color="#166534" roughness={0.2} />
          </mesh>
        ))}
        {/* Top Lid */}
        <mesh position={[0, drumHeight / 2, 0]}>
          <cylinderGeometry args={[drumRadius, drumRadius, 0.02, 20]} />
          <meshStandardMaterial color="#14532d" roughness={0.5} />
        </mesh>
      </group>

      {/* 2. Safety Cage (Jaula) */}
      <group position={[0, cageHeight / 2, 0]}>
        {/* Vertical Bars */}
        {[
          [-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]
        ].map((p, i) => (
          <mesh key={`v-${i}`} position={[p[0], 0, p[1]]}>
            <cylinderGeometry args={[0.02, 0.02, cageHeight, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Horizontal Bars (Middle and Bottom) */}
        {[ -0.4, 0 ].map((y, i) => (
          <group key={`h-level-${i}`} position={[0, y, 0]}>
             <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.4]}>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
             </mesh>
             <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, -0.4]}>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
             </mesh>
             <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
             </mesh>
             <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.4, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
             </mesh>
          </group>
        ))}
      </group>
      
      {/* 3. Base Pallet (Spill containment pallet style) */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.9]} />
        <meshStandardMaterial color="#facc15" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function CagedDrums() {
  const positions = useMemo(() => {
    const xStart = DS43_ZONE.xMin + 2;
    const xEnd = DS43_ZONE.xMax - 2;
    const step = (xEnd - xStart) / 4;
    return Array.from({ length: 5 }).map((_, i) => [
      xStart + i * step,
      BODEGA_ELEVATION,
      (DS43_ZONE.zMin + DS43_ZONE.zMax) / 2
    ]);
  }, []);

  return (
    <group>
      {positions.map((pos, i) => (
        <DrumWithCage key={i} position={pos} />
      ))}
    </group>
  );
}
