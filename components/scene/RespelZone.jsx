'use client';

import { Text } from '@react-three/drei';
import {
  RESPEL_CENTER_X,
  RESPEL_CENTER_Z,
  RESPEL_WIDTH,
  RESPEL_DEPTH,
  RESPEL_MARGIN,
  TERRAIN_WIDTH,
  TERRAIN_DEPTH,
  COLORS,
} from '@/lib/constants';

export default function RespelZone() {
  const wallH = 3;
  const wallT = 0.2;
  const halfW = RESPEL_WIDTH / 2;  // 5
  const halfD = RESPEL_DEPTH / 2;  // 10

  // Margin distances
  const distToNorth = RESPEL_CENTER_Z - halfD; // 25-10=15
  const distToSouth = TERRAIN_DEPTH - (RESPEL_CENTER_Z + halfD); // 50-35=15
  const distToEast = TERRAIN_WIDTH - (RESPEL_CENTER_X + halfW); // 100-85=15

  return (
    <group position={[RESPEL_CENTER_X, 0, RESPEL_CENTER_Z]}>
      {/* Floor slab (slightly elevated) */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[RESPEL_WIDTH, 0.16, RESPEL_DEPTH]} />
        <meshStandardMaterial color={COLORS.respelFloor} roughness={0.7} />
      </mesh>

      {/* Containment bund (lip around perimeter — DS 148) */}
      {/* North */}
      <mesh position={[0, 0.25, -halfD]}>
        <boxGeometry args={[RESPEL_WIDTH + wallT * 2, 0.5, wallT]} />
        <meshStandardMaterial color={COLORS.respelAccent} emissive={COLORS.respelAccent} emissiveIntensity={0.2} />
      </mesh>
      {/* South */}
      <mesh position={[0, 0.25, halfD]}>
        <boxGeometry args={[RESPEL_WIDTH + wallT * 2, 0.5, wallT]} />
        <meshStandardMaterial color={COLORS.respelAccent} emissive={COLORS.respelAccent} emissiveIntensity={0.2} />
      </mesh>
      {/* West */}
      <mesh position={[-halfW, 0.25, 0]}>
        <boxGeometry args={[wallT, 0.5, RESPEL_DEPTH]} />
        <meshStandardMaterial color={COLORS.respelAccent} emissive={COLORS.respelAccent} emissiveIntensity={0.2} />
      </mesh>
      {/* East */}
      <mesh position={[halfW, 0.25, 0]}>
        <boxGeometry args={[wallT, 0.5, RESPEL_DEPTH]} />
        <meshStandardMaterial color={COLORS.respelAccent} emissive={COLORS.respelAccent} emissiveIntensity={0.2} />
      </mesh>

      {/* Shelter walls (partial height) */}
      {/* West wall */}
      <mesh position={[-halfW, wallH / 2, 0]} castShadow>
        <boxGeometry args={[wallT, wallH, RESPEL_DEPTH]} />
        <meshStandardMaterial color={COLORS.respelWall} roughness={0.6} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, wallH, 0]}>
        <boxGeometry args={[RESPEL_WIDTH, 0.1, RESPEL_DEPTH]} />
        <meshStandardMaterial
          color={COLORS.respelWall}
          transparent
          opacity={0.4}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Hazmat barrels inside */}
      {[
        [-2, 0, -3], [-2, 0, 0], [-2, 0, 3],
        [0, 0, -3],  [0, 0, 0],  [0, 0, 3],
        [2, 0, -3],  [2, 0, 0],  [2, 0, 3],
      ].map((pos, i) => (
        <mesh key={`barrel-${i}`} position={[pos[0], 0.6, pos[2]]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.0, 10]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#b71c1c' : i % 3 === 1 ? '#1565c0' : '#2e7d32'}
            roughness={0.5}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* ═══ Hazard symbol ═══ */}
      <Text
        position={[0, wallH + 0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.5}
        color={COLORS.respelAccent}
        anchorX="center"
        anchorY="middle"
      >
        ⚠ RESPEL DS148
      </Text>

      {/* Floor label */}
      <Text
        position={[0, 0.2, halfD + 1.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.7}
        color={COLORS.respelAccent}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
      >
        ZONA RESPEL
      </Text>

      {/* ═══ Margin distance indicators ═══ */}
      {/* North margin line */}
      <mesh position={[0, 0.03, -halfD - distToNorth / 2]}>
        <boxGeometry args={[0.06, 0.03, distToNorth]} />
        <meshStandardMaterial color={COLORS.respelAccent} transparent opacity={0.3} emissive={COLORS.respelAccent} emissiveIntensity={0.2} />
      </mesh>
      <Text position={[1.5, 0.05, -halfD - distToNorth / 2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color={COLORS.respelAccent} fillOpacity={0.6}>
        {`${distToNorth}m`}
      </Text>

      {/* South margin line */}
      <mesh position={[0, 0.03, halfD + distToSouth / 2]}>
        <boxGeometry args={[0.06, 0.03, distToSouth]} />
        <meshStandardMaterial color={COLORS.respelAccent} transparent opacity={0.3} emissive={COLORS.respelAccent} emissiveIntensity={0.2} />
      </mesh>
      <Text position={[1.5, 0.05, halfD + distToSouth / 2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color={COLORS.respelAccent} fillOpacity={0.6}>
        {`${distToSouth}m`}
      </Text>

      {/* East margin line */}
      <mesh position={[halfW + distToEast / 2, 0.03, 0]}>
        <boxGeometry args={[distToEast, 0.03, 0.06]} />
        <meshStandardMaterial color={COLORS.respelAccent} transparent opacity={0.3} emissive={COLORS.respelAccent} emissiveIntensity={0.2} />
      </mesh>
      <Text position={[halfW + distToEast / 2, 0.05, -1.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color={COLORS.respelAccent} fillOpacity={0.6}>
        {`${distToEast}m`}
      </Text>
    </group>
  );
}
