'use client';

import { Text } from '@react-three/drei';
import {
  DOCK_WALL_X,
  DOCK_WIDTH,
  DOCK_DEPTH,
  DOCK_INBOUND_1_Z,
  DOCK_INBOUND_2_Z,
  DOCK_OUTBOUND_3_Z,
  DOCK_OUTBOUND_4_Z,
  BODEGA_ELEVATION,
  CONTAINMENT_CHANNEL_X,
  CONTAINMENT_CHANNEL_WIDTH,
  CONTAINMENT_CHANNEL_DEPTH,
  TERRAIN_DEPTH,
  COLORS,
} from '@/lib/constants';

const docks = [
  { z: DOCK_INBOUND_1_Z, label: 'MUELLE 1', type: 'inbound' },
  { z: DOCK_INBOUND_2_Z, label: 'MUELLE 2', type: 'inbound' },
  { z: DOCK_OUTBOUND_3_Z, label: 'MUELLE 3', type: 'outbound' },
  { z: DOCK_OUTBOUND_4_Z, label: 'MUELLE 4', type: 'outbound' },
];

export default function Docks() {
  return (
    <group>
      {docks.map((dock, i) => {
        const isInbound = dock.type === 'inbound';
        const color = isInbound ? COLORS.dockInbound : COLORS.dockOutbound;
        const accent = isInbound ? COLORS.accentInbound : COLORS.accentOutbound;

        return (
          <group key={i}>
            {/* Dock ramp (patio side, extending from X=60 toward X=63.5) */}
            <mesh
              position={[
                DOCK_WALL_X + DOCK_DEPTH / 2,
                BODEGA_ELEVATION / 2,
                dock.z,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[DOCK_DEPTH, BODEGA_ELEVATION, DOCK_WIDTH]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>

            {/* Leveler plate */}
            <mesh position={[DOCK_WALL_X + 0.5, BODEGA_ELEVATION + 0.05, dock.z]}>
              <boxGeometry args={[1.5, 0.08, DOCK_WIDTH - 0.5]} />
              <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Bollards */}
            {[-DOCK_WIDTH / 2 + 0.3, DOCK_WIDTH / 2 - 0.3].map((dz, bi) => (
              <mesh key={bi} position={[DOCK_WALL_X + DOCK_DEPTH + 0.3, BODEGA_ELEVATION + 0.4, dock.z + dz]}>
                <cylinderGeometry args={[0.12, 0.12, 0.8, 8]} />
                <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
              </mesh>
            ))}

            {/* Glowing edge strip */}
            <mesh position={[DOCK_WALL_X + DOCK_DEPTH + 0.5, BODEGA_ELEVATION + 0.02, dock.z]}>
              <boxGeometry args={[0.3, 0.04, DOCK_WIDTH]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={0.6}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Label on patio floor */}
            <Text
              position={[DOCK_WALL_X + DOCK_DEPTH + 2, 0.05, dock.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.8}
              color={accent}
              anchorX="center"
              anchorY="middle"
            >
              {dock.label}
            </Text>
          </group>
        );
      })}

      {/* ── Staging Areas (inside bodega, near dock wall) ── */}
      {/* Staging Inbound */}
      <mesh
        position={[DOCK_WALL_X - 7, BODEGA_ELEVATION + 0.02, (DOCK_INBOUND_1_Z + DOCK_INBOUND_2_Z) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial
          color={COLORS.stagingInbound}
          transparent
          opacity={0.06}
          emissive={COLORS.stagingInbound}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Staging Outbound */}
      <mesh
        position={[DOCK_WALL_X - 7, BODEGA_ELEVATION + 0.02, (DOCK_OUTBOUND_3_Z + DOCK_OUTBOUND_4_Z) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial
          color={COLORS.stagingOutbound}
          transparent
          opacity={0.06}
          emissive={COLORS.stagingOutbound}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* ═══ Canaleta de Contención DS 43 (X=63) ═══ */}
      <mesh position={[CONTAINMENT_CHANNEL_X, 0, TERRAIN_DEPTH / 2]}>
        <boxGeometry args={[CONTAINMENT_CHANNEL_WIDTH, CONTAINMENT_CHANNEL_DEPTH, TERRAIN_DEPTH]} />
        <meshStandardMaterial
          color={COLORS.containmentChannel}
          emissive={COLORS.containmentChannel}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
