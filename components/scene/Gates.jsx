'use client';

import {
  GATE_X,
  GATE_WIDTH,
  GATE_MAIN_Z,
  COLORS,
  GUARDHOUSE_X,
  GUARDHOUSE_Z,
  GUARDHOUSE_WIDTH,
  GUARDHOUSE_DEPTH
} from '@/lib/constants';

import useSimStore from '@/store/useSimStore';

const GATE_HEIGHT = 5;
const POST_RADIUS = 0.2;

export default function Gates({ inboundGateRef }) {
  const setHoveredItem = useSimStore(s => s.setHoveredItem);
  const is2D = useSimStore(s => s.viewMode === '2d');
  const halfW = GATE_WIDTH / 2;

  return (
    <group>
      {/* ── Main Access Gate ── */}
      <group 
        position={[GATE_X, 0, GATE_MAIN_Z]}
        onPointerOut={() => setHoveredItem(null)}
      >
        {/* Hitbox para Hover Portón */}
        <mesh 
          position={[0, 2.5, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (is2D) setHoveredItem('ACCESO PRINCIPAL ESMAX / PORTÓN');
          }}
        >
          <boxGeometry args={[1, 5, GATE_WIDTH]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {/* Posts */}
        <mesh position={[0, GATE_HEIGHT / 2, -halfW]} castShadow>
          <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, GATE_HEIGHT, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, GATE_HEIGHT / 2, halfW]} castShadow>
          <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, GATE_HEIGHT, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Barrier bar (horizontal, animatable) */}
        <mesh ref={inboundGateRef} position={[0, GATE_HEIGHT, 0]}>
          <boxGeometry args={[0.2, 0.2, GATE_WIDTH + 0.4]} />
          <meshStandardMaterial
            color={COLORS.gateEntry}
            emissive={COLORS.gateEntry}
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Warning stripes on floor */}
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[0, 0.02, -halfW + (i + 0.5) * (GATE_WIDTH / 6)]}>
            <boxGeometry args={[1.5, 0.04, GATE_WIDTH / 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#f59e0b' : '#1a1a2e'}
              emissive={i % 2 === 0 ? '#f59e0b' : '#000'}
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}

        {/* Sign plate on gate */}
        <mesh position={[0.1, GATE_HEIGHT + 1, 0]}>
          <boxGeometry args={[0.12, 1.2, GATE_WIDTH - 2]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
      </group>

      {/* ── Admin Block (Bloque Administrativo y Servicios) ── */}
      <group 
        position={[GUARDHOUSE_X - GUARDHOUSE_WIDTH / 2, 0, GUARDHOUSE_Z]}
        onPointerOut={() => setHoveredItem(null)}
      >
        {/* Hitbox para Hover Caseta */}
        <mesh 
          position={[0, 1.75, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (is2D) setHoveredItem('CASETA DE SEGURIDAD Y CONTROL DE ACCESO');
          }}
        >
          <boxGeometry args={[GUARDHOUSE_WIDTH, 3.5, GUARDHOUSE_DEPTH]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {/* Main cabin structure */}
        <mesh position={[0, 1.75, 0]} castShadow>
          <boxGeometry args={[GUARDHOUSE_WIDTH, 3.5, GUARDHOUSE_DEPTH]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Roof with overhang */}
        <mesh position={[0, 3.6, 0]} castShadow>
          <boxGeometry args={[GUARDHOUSE_WIDTH + 1.0, 0.3, GUARDHOUSE_DEPTH + 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Large Windows (Facing North and Gate) */}
        <mesh position={[0, 1.8, GUARDHOUSE_DEPTH / 2 + 0.01]}>
          <boxGeometry args={[GUARDHOUSE_WIDTH - 1.0, 1.5, 0.1]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
