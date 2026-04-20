'use client';

import {
  DOCK_WALL_X,
  DOCK_WIDTH,
  DOCK_DEPTH,
  DOCK_CARGA_Z,
  DOCK_DESCARGA_Z,
  BODEGA_ELEVATION,
  CONTAINMENT_CHANNEL_X,
  CONTAINMENT_CHANNEL_WIDTH,
  CONTAINMENT_CHANNEL_DEPTH,
  TERRAIN_DEPTH,
  COLORS,
} from '@/lib/constants';

const docks = [
  { z: DOCK_CARGA_Z, type: 'outbound' },
  { z: DOCK_DESCARGA_Z, type: 'inbound' },
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
          </group>
        );
      })}

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
