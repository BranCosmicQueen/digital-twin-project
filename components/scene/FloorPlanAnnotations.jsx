'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import useSimStore from '@/store/useSimStore';
import { BODEGA_WIDTH, BODEGA_DEPTH, BODEGA_ELEVATION, RESPEL_CENTER_X, RESPEL_CENTER_Z, GLASS_STYLE } from '@/lib/constants';

function Compass({ position }) {
  return (
    <group position={position}>
      {/* North Arrow */}
      <mesh rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 1.2, 4]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.6, 0]}>
        <coneGeometry args={[0.3, 1.2, 4]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      <Html center position={[0, 1.2, 0]}>
        <div style={{ ...GLASS_STYLE, padding: '4px 8px', borderRadius: '4px' }}>N</div>
      </Html>
    </group>
  );
}

function ZoneLabel({ position, name, color }) {
  return (
    <group position={position}>
      <Html center position={[0, 0, 0]}>
        <div style={{ ...GLASS_STYLE, borderLeft: `4px solid ${color}`, paddingLeft: '10px' }}>
          {name}
        </div>
      </Html>
    </group>
  );
}

function ScaleBar({ position }) {
  const segments = [0, 5, 10, 15, 20];
  return (
    <group position={position}>
      {/* 20m scale bar with alternating segments */}
      {segments.slice(0, -1).map((m, i) => (
        <mesh key={`seg-${m}`} position={[m + 2.5, 0, 0]}>
          <boxGeometry args={[5, 0.15, 0.1]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#333" : "#fff"} />
        </mesh>
      ))}
      {/* Scale text removed as per request */}
    </group>
  );
}

export default function FloorPlanAnnotations() {
  const viewMode = useSimStore(s => s.viewMode);
  const is2D = viewMode === '2d';

  if (!is2D) return null;

  return (
    <group position={[0, BODEGA_ELEVATION + 0.5, 0]} renderOrder={100}>
      {/* Annotations cleared as per request */}
    </group>
  );
}
