'use client';

import { Text } from '@react-three/drei';
import {
  ROMANA_X,
  ROMANA_Z,
  ROMANA_WIDTH,
  ROMANA_DEPTH,
  COLORS,
} from '@/lib/constants';

export default function Weighbridge() {
  return (
    <group position={[ROMANA_X, 0, ROMANA_Z]}>
      {/* Platform slab */}
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROMANA_WIDTH, 0.16, ROMANA_DEPTH]} />
        <meshStandardMaterial color={COLORS.weighbridge} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Surface plates (steel look) */}
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[ROMANA_WIDTH - 0.2, 0.02, ROMANA_DEPTH - 0.2]} />
        <meshStandardMaterial color="#78909c" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Edge rails */}
      {[-ROMANA_WIDTH / 2, ROMANA_WIDTH / 2].map((dx, i) => (
        <mesh key={`rail-${i}`} position={[dx, 0.25, 0]}>
          <boxGeometry args={[0.08, 0.3, ROMANA_DEPTH + 0.5]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Control cabin */}
      <mesh position={[-ROMANA_WIDTH / 2 - 1.5, 1, 0]} castShadow>
        <boxGeometry args={[2, 2, 2.5]} />
        <meshStandardMaterial color="#37474f" roughness={0.5} />
      </mesh>
      {/* Cabin window */}
      <mesh position={[-ROMANA_WIDTH / 2 - 0.49, 1.2, 0]}>
        <boxGeometry args={[0.05, 0.8, 1.5]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.2, ROMANA_DEPTH / 2 + 1.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.6}
        color={COLORS.weighbridge}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
      >
        ROMANA
      </Text>
    </group>
  );
}
