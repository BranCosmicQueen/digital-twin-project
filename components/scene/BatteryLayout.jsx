'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Line } from '@react-three/drei';
import { BODEGA_ELEVATION, BATTERY_ZONE } from '@/lib/constants';

function ChargingUnit({ position }) {
  return (
    <group position={position}>
      {/* Principal Cabinet */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.8, 2, 0.6]} />
        <meshStandardMaterial color="#4B5563" roughness={0.5} metalness={0.5} />
      </mesh>
      
      {/* Vents / Panel */}
      <mesh position={[0, 1.0, 0.31]}>
        <boxGeometry args={[0.6, 1.5, 0.04]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Status LEDs */}
      <mesh position={[-0.2, 1.6, 0.33]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 1.6, 0.33]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
      </mesh>

      {/* Charging Cable (Static representation) */}
      <Line
        points={[
          [0.2, 1.2, 0.3],
          [0.4, 0.8, 0.6],
          [0.6, 0.2, 0.8]
        ]}
        color="#111111"
        lineWidth={2}
      />
    </group>
  );
}

function SafetyBollard({ position }) {
  return (
    <mesh position={[position[0], BODEGA_ELEVATION + 0.5, position[2]]}>
      <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
      <meshStandardMaterial color="#FACC15" roughness={0.3} metalness={0.7} />
      {/* Stripes */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.1, 16]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.1, 16]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
    </mesh>
  );
}

export default function BatteryLayout() {
  const chargers = [
    [2, BODEGA_ELEVATION, 43],
    [4, BODEGA_ELEVATION, 43],
    [6, BODEGA_ELEVATION, 43],
    [8, BODEGA_ELEVATION, 43],
  ];

  const bollards = [
    [0.5, BODEGA_ELEVATION, 41.5],
    [9.5, BODEGA_ELEVATION, 41.5],
  ];

  const zone = BATTERY_ZONE;
  const width = zone.xMax - zone.xMin;
  const depth = zone.zMax - zone.zMin;

  return (
    <group>
      {/* Floor stripes (Hazard Pattern) */}
      <Line
        points={[
          [zone.xMin, BODEGA_ELEVATION + 0.01, zone.zMin],
          [zone.xMax, BODEGA_ELEVATION + 0.01, zone.zMin],
          [zone.xMax, BODEGA_ELEVATION + 0.01, zone.zMax],
          [zone.xMin, BODEGA_ELEVATION + 0.01, zone.zMax],
          [zone.xMin, BODEGA_ELEVATION + 0.01, zone.zMin],
        ]}
        color="#FACC15"
        lineWidth={5}
      />

      {/* Chargers */}
      {chargers.map((pos, i) => (
        <ChargingUnit key={`charger-${i}`} position={pos} />
      ))}

      {/* Safety Bollards */}
      {bollards.map((pos, i) => (
        <SafetyBollard key={`bollard-${i}`} position={pos} />
      ))}

      {/* Warning Sign */}
      <Text
        position={[5, BODEGA_ELEVATION + 0.05, 46]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.8}
        color="#B45309"
        anchorX="center"
        anchorY="middle"
      >
        ⚠ CARGA BATERÍAS ⚠
      </Text>
    </group>
  );
}
