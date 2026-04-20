'use client';

import { Text } from '@react-three/drei';
import {
  GATE_X,
  GATE_WIDTH,
  GATE_ENTRY_Z,
  GATE_EXIT_Z,
  COLORS,
} from '@/lib/constants';

const GATE_HEIGHT = 5;
const POST_RADIUS = 0.2;

function GateStructure({ z, label, color, gateRef }) {
  const halfW = GATE_WIDTH / 2;

  return (
    <group position={[GATE_X, 0, z]}>
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
      <mesh ref={gateRef} position={[0, GATE_HEIGHT, 0]}>
        <boxGeometry args={[0.2, 0.2, GATE_WIDTH + 0.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Warning stripes on floor */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[0, 0.02, -halfW + (i + 0.5) * (GATE_WIDTH / 4)]}>
          <boxGeometry args={[1.5, 0.04, GATE_WIDTH / 5]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#f59e0b' : '#1a1a2e'}
            emissive={i % 2 === 0 ? '#f59e0b' : '#000'}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {/* Sign plate */}
      <mesh position={[0.1, GATE_HEIGHT + 1, 0]}>
        <boxGeometry args={[0.12, 1.2, GATE_WIDTH + 1]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>

      <Text
        position={[0.2, GATE_HEIGHT + 1, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {label}
      </Text>

      {/* Floor label */}
      <Text
        position={[-3, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.9}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export default function Gates({ inboundGateRef, outboundGateRef }) {
  return (
    <group>
      <GateStructure
        z={GATE_ENTRY_Z}
        label="PORTÓN ENTRADA"
        color={COLORS.gateEntry}
        gateRef={inboundGateRef}
      />
      <GateStructure
        z={GATE_EXIT_Z}
        label="PORTÓN SALIDA"
        color={COLORS.gateExit}
        gateRef={outboundGateRef}
      />
    </group>
  );
}
