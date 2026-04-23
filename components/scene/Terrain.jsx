'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import {
  TERRAIN_WIDTH,
  TERRAIN_DEPTH,
  PATIO_X_START,
  PATIO_WIDTH,
  GATE_X,
  GATE_WIDTH,
  GATE_MAIN_Z,
  TURNING_RADIUS,
  PATIO_CENTER_X,
  PATIO_CENTER_Z,
  CALLE_ADELA_WIDTH,
  COLORS,
} from '@/lib/constants';

export default function Terrain() {
  // Lane markings
  const laneMarkings = useMemo(() => {
    const markings = [];

    // ── Inbound/Outbound central lane (Portón Principal Z=25 → Romana/Patio) ──
    for (let x = 100; x > 75; x -= 3) {
      markings.push({
        pos: [x, 0.02, GATE_MAIN_Z - 1.5],
        size: [2, 0.02, 0.12],
        color: COLORS.accentInbound,
      });
      markings.push({
        pos: [x, 0.02, GATE_MAIN_Z + 1.5],
        size: [2, 0.02, 0.12],
        color: COLORS.accentOutbound,
      });
    }

    // ── Center divider in patio ──
    for (let z = 5; z < 45; z += 3) {
      markings.push({
        pos: [PATIO_CENTER_X, 0.02, z],
        size: [0.12, 0.02, 1.5],
        color: '#ffffff',
      });
    }

    return markings;
  }, []);

  // Turning radius circle segments
  const turningCircle = useMemo(() => {
    const segments = [];
    const numSegments = 32;
    for (let i = 0; i < numSegments; i++) {
      const angle1 = (Math.PI * 2 * i) / numSegments;
      const angle2 = (Math.PI * 2 * (i + 1)) / numSegments;
      const x1 = PATIO_CENTER_X + Math.cos(angle1) * TURNING_RADIUS;
      const z1 = PATIO_CENTER_Z + Math.sin(angle1) * TURNING_RADIUS;
      const x2 = PATIO_CENTER_X + Math.cos(angle2) * TURNING_RADIUS;
      const z2 = PATIO_CENTER_Z + Math.sin(angle2) * TURNING_RADIUS;

      const cx = (x1 + x2) / 2;
      const cz = (z1 + z2) / 2;
      const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const rot = Math.atan2(x2 - x1, z2 - z1);

      if (i % 2 === 0) {
        segments.push({
          pos: [cx, 0.015, cz],
          size: [0.1, 0.02, len],
          rotation: [0, rot, 0],
          color: COLORS.turningRadius,
        });
      }
    }
    return segments;
  }, []);

  // Perimeter border walls with single gap calculation
  const gateZStart = GATE_MAIN_Z - GATE_WIDTH / 2;
  const gateZEnd = GATE_MAIN_Z + GATE_WIDTH / 2;

  return (
    <group>
      {/* ── Main ground plane ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[TERRAIN_WIDTH / 2, -0.02, TERRAIN_DEPTH / 2]}
        receiveShadow
      >
        <planeGeometry args={[TERRAIN_WIDTH, TERRAIN_DEPTH]} />
        <meshStandardMaterial color={COLORS.terrain} roughness={0.9} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[PATIO_X_START + PATIO_WIDTH / 2, 0.005, TERRAIN_DEPTH / 2]}
        receiveShadow
      >
        <planeGeometry args={[PATIO_WIDTH, TERRAIN_DEPTH]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* ── Calle Adela surface (X=100..115) ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GATE_X + CALLE_ADELA_WIDTH / 2, 0.006, TERRAIN_DEPTH / 2]}
        receiveShadow
      >
        <planeGeometry args={[CALLE_ADELA_WIDTH, TERRAIN_DEPTH]} />
        <meshStandardMaterial color={COLORS.asphaltCalle} roughness={0.7} />
      </mesh>

      {/* ── Grid ── */}
      <gridHelper
        args={[Math.max(TERRAIN_WIDTH, TERRAIN_DEPTH) * 1.2, 60, COLORS.terrainGrid, COLORS.terrainGrid]}
        position={[TERRAIN_WIDTH / 2, 0.01, TERRAIN_DEPTH / 2]}
        material-opacity={0.2}
        material-transparent={true}
      />

      {/* ── Perimeter borders ── */}
      {/* North (Z=0) */}
      <mesh position={[TERRAIN_WIDTH / 2, 0.05, 0]}>
        <boxGeometry args={[TERRAIN_WIDTH, 0.1, 0.15]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
      {/* South (Z=50) */}
      <mesh position={[TERRAIN_WIDTH / 2, 0.05, TERRAIN_DEPTH]}>
        <boxGeometry args={[TERRAIN_WIDTH, 0.1, 0.15]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
      {/* West (X=0) */}
      <mesh position={[0, 0.05, TERRAIN_DEPTH / 2]}>
        <boxGeometry args={[0.15, 0.1, TERRAIN_DEPTH]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
      {/* East (X=100) — con SINGLE gap para el portón de 10m */}
      <mesh position={[GATE_X, 0.05, gateZStart / 2]}>
        <boxGeometry args={[0.15, 0.1, gateZStart]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[GATE_X, 0.05, gateZEnd + (TERRAIN_DEPTH - gateZEnd) / 2]}>
        <boxGeometry args={[0.15, 0.1, TERRAIN_DEPTH - gateZEnd]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>

      {/* ── Body/Patio divider line at X=60 (API Canaleta) ── */}
      <mesh position={[PATIO_X_START, 0.03, TERRAIN_DEPTH / 2]}>
        <boxGeometry args={[0.2, 0.06, TERRAIN_DEPTH]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
      </mesh>

      {/* CÁMARA SEPARADORA API */}
      <mesh position={[95, 0.1, 45]}>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* ── Turning radius circle restored per requirement ── */}
      {turningCircle.map((seg, i) => (
        <mesh key={`turn-${i}`} position={seg.pos} rotation={seg.rotation}>
          <boxGeometry args={seg.size} />
          <meshStandardMaterial
            color={seg.color}
            emissive={seg.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
