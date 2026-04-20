'use client';

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  TERRAIN_WIDTH,
  TERRAIN_DEPTH,
  PATIO_X_START,
  PATIO_WIDTH,
  BODEGA_WIDTH,
  GATE_X,
  GATE_ENTRY_Z,
  GATE_EXIT_Z,
  TURNING_RADIUS,
  PATIO_CENTER_X,
  PATIO_CENTER_Z,
  CONTAINMENT_CHANNEL_X,
  CALLE_ADELA_WIDTH,
  COLORS,
} from '@/lib/constants';

export default function Terrain() {
  // Lane markings
  const laneMarkings = useMemo(() => {
    const markings = [];

    // ── Inbound lane (Portón Entrada Z=5 → Romana → Muelles) ──
    // Straight from gate entry to weighbridge
    for (let x = 100; x > 80; x -= 3) {
      markings.push({
        pos: [x, 0.02, GATE_ENTRY_Z],
        size: [2, 0.02, 0.12],
        color: COLORS.accentInbound,
      });
    }
    // Lane from weighbridge down to docks
    for (let z = 12; z < 22; z += 2) {
      markings.push({
        pos: [70, 0.02, z],
        size: [0.12, 0.02, 1.2],
        color: COLORS.accentInbound,
      });
    }

    // ── Outbound lane (Portón Salida Z=39 → Muelles) ──
    for (let x = 100; x > 65; x -= 3) {
      markings.push({
        pos: [x, 0.02, GATE_EXIT_Z],
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

      {/* ── Patio surface (X=60..100) ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[PATIO_X_START + PATIO_WIDTH / 2, 0.005, TERRAIN_DEPTH / 2]}
        receiveShadow
      >
        <planeGeometry args={[PATIO_WIDTH, TERRAIN_DEPTH]} />
        <meshStandardMaterial color={COLORS.patioSurface} roughness={0.85} />
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

      {/* Labels for Identification */}
      <Text
        position={[GATE_X + CALLE_ADELA_WIDTH / 2, 0.2, 25]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={2}
        color="#ffffff"
        opacity={0.5}
        transparent
      >
        CALLE ADELA
      </Text>

      <Text
        position={[80, 0.2, 45]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.5}
        color="#ffffff"
        opacity={0.3}
        transparent
      >
        PATIO DE MANIOBRAS
      </Text>

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
      {/* East (X=100) — con gaps para portones */}
      <mesh position={[GATE_X, 0.05, GATE_ENTRY_Z / 2]}>
        <boxGeometry args={[0.15, 0.1, GATE_ENTRY_Z - 3]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[GATE_X, 0.05, (GATE_ENTRY_Z + 6 + GATE_EXIT_Z) / 2]}>
        <boxGeometry args={[0.15, 0.1, GATE_EXIT_Z - GATE_ENTRY_Z - 6]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[GATE_X, 0.05, (GATE_EXIT_Z + 6 + TERRAIN_DEPTH) / 2]}>
        <boxGeometry args={[0.15, 0.1, TERRAIN_DEPTH - GATE_EXIT_Z - 6]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>

      {/* ── Body/Patio divider line at X=60 ── */}
      <mesh position={[PATIO_X_START, 0.03, TERRAIN_DEPTH / 2]}>
        <boxGeometry args={[0.08, 0.06, TERRAIN_DEPTH]} />
        <meshStandardMaterial color="#4a90d9" emissive="#4a90d9" emissiveIntensity={0.3} transparent opacity={0.5} />
      </mesh>

      {/* ── Lane markings ── */}
      {laneMarkings.map((m, i) => (
        <mesh key={`lane-${i}`} position={m.pos}>
          <boxGeometry args={m.size} />
          <meshStandardMaterial
            color={m.color}
            emissive={m.color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* ── Turning radius circle ── */}
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
