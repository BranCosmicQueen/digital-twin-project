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

import useSimStore from '@/store/useSimStore';

const docks = [
  { z: DOCK_CARGA_Z, type: 'outbound', label: 'MUELLE DE CARGA / DESPACHO' },
  { z: DOCK_DESCARGA_Z, type: 'inbound', label: 'MUELLE DE DESCARGA / RECEPCIÓN' },
];

export default function Docks() {
  const setHoveredItem = useSimStore(s => s.setHoveredItem);
  const is2D = useSimStore(s => s.viewMode === '2d');
  return (
    <group>
      {docks.map((dock, i) => {
        const isInbound = dock.type === 'inbound';
        const color = isInbound ? COLORS.dockInbound : COLORS.dockOutbound;
        const accent = isInbound ? COLORS.accentInbound : COLORS.accentOutbound;

        return (
          <group key={i}>
            {/* 1. Dock Shelter (Abrigo de Muelle) - PROPORCIONA PROFUNDIDAD */}
            <group position={[DOCK_WALL_X + 0.2, BODEGA_ELEVATION + 1.5, dock.z]}>
              {/* Top Seal */}
              <mesh position={[0, 1.8, 0]}>
                <boxGeometry args={[0.5, 0.2, DOCK_WIDTH + 0.4]} />
                <meshStandardMaterial color="#111" roughness={0.9} />
              </mesh>
              {/* Side Seals */}
              {[-1, 1].map(side => (
                <mesh key={side} position={[0, 0, side * (DOCK_WIDTH / 2 + 0.1)]}>
                  <boxGeometry args={[0.4, 3.8, 0.2]} />
                  <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
              ))}
            </group>

            {/* 2. Recessed Door removed to improve visibility */}

            {/* 3. Dock Ramp & Leveler with Volume */}
            <mesh
              position={[DOCK_WALL_X + DOCK_DEPTH / 2, BODEGA_ELEVATION / 2, dock.z]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[DOCK_DEPTH, BODEGA_ELEVATION, DOCK_WIDTH]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>

            {/* Leveler Plate (With micro-offset to avoid ramp fighting) */}
            <mesh position={[DOCK_WALL_X + 0.75, BODEGA_ELEVATION + 0.08, dock.z]}>
              <boxGeometry args={[1.5, 0.1, DOCK_WIDTH - 0.5]} />
              <meshStandardMaterial color="#444" metalness={0.8} />
            </mesh>

            {/* 4. Safety Accessories */}
            {/* Bollards */}
            {[-DOCK_WIDTH / 2 - 0.5, DOCK_WIDTH / 2 + 0.5].map((dz, bi) => (
              <mesh key={bi} position={[DOCK_WALL_X + DOCK_DEPTH + 0.3, BODEGA_ELEVATION + 0.4, dock.z + dz]}>
                <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
                <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
              </mesh>
            ))}

            {/* Bumpers with Depth */}
            {[-DOCK_WIDTH / 2 + 0.5, DOCK_WIDTH / 2 - 0.5].map((dz, bi) => (
              <mesh key={`bumper-${bi}`} position={[DOCK_WALL_X + DOCK_DEPTH + 0.1, BODEGA_ELEVATION / 2, dock.z + dz]}>
                <boxGeometry args={[0.3, BODEGA_ELEVATION * 0.8, 0.4]} />
                <meshStandardMaterial color="#000" roughness={0.1} />
              </mesh>
            ))}

            {/* Traffic Light with Offset from wall */}
            <group position={[DOCK_WALL_X + 0.5, BODEGA_ELEVATION + 2.5, dock.z + DOCK_WIDTH / 2 + 0.6]}>
              <mesh>
                <boxGeometry args={[0.15, 0.6, 0.2]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0.1, 0.15, 0]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
              </mesh>
              <mesh position={[0.1, -0.15, 0]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Exterior Emergency Shower */}
      <group 
        position={[62, 0, 40]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (is2D) setHoveredItem('DUCHA DE EMERGENCIA Y LAVAOJOS (DS 594)');
        }}
        onPointerOut={() => setHoveredItem(null)}
      >
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2.5]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0, 2.4, 0.3]}>
          <boxGeometry args={[0.4, 0.1, 0.6]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      </group>
    </group>
  );
}
