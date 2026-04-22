'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import {
  GATE_WAIT_X,
  GATE_MAIN_Z,
  ROMANA_X,
  ROMANA_Z,
  ROMANA_WIDTH,
  ROMANA_DEPTH,
  COLORS,
} from '@/lib/constants';
import { useSimulationStore } from '@/lib/store';


function LaserSensor({ position, length, horizontal = true, active = false }) {
  return (
    <group position={position}>
      {/* Emitters */}
      <mesh position={[horizontal ? -length / 2 : 0, 0.2, horizontal ? 0 : -length / 2]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[horizontal ? length / 2 : 0, 0.2, horizontal ? 0 : length / 2]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Laser Beam */}
      <mesh position={[0, 0.2, 0]} rotation={[0, horizontal ? Math.PI / 2 : 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, length, 8]} />
        <meshBasicMaterial 
          color={active ? '#ef4444' : '#22c55e'} 
          transparent 
          opacity={0.6} 
        />
      </mesh>
    </group>
  );
}

export default function BoundarySensors() {
  const { truckPosition, gateEntryOpen, truckStatus } = useSimulationStore();
  
  // Logic to "detect" truck at gate
  const truckAtGate = truckPosition[0] < GATE_WAIT_X + 2 && truckPosition[0] > GATE_WAIT_X - 5;
  const truckAtRomana = 
    Math.abs(truckPosition[0] - ROMANA_X) < 2 &&
    truckPosition[2] > ROMANA_Z - ROMANA_DEPTH / 2 - 2 &&
    truckPosition[2] < ROMANA_Z + ROMANA_DEPTH / 2 + 2;

  return (
    <group>

      {/* Laser Sensors at Romana (Recognition limits - North/South Ends) */}
      <LaserSensor 
        position={[ROMANA_X, 0, ROMANA_Z - ROMANA_DEPTH / 2]} 
        length={ROMANA_WIDTH + 1} 
        horizontal={true} 
        active={truckAtRomana}
      />
      <LaserSensor 
        position={[ROMANA_X, 0, ROMANA_Z + ROMANA_DEPTH / 2]} 
        length={ROMANA_WIDTH + 1} 
        horizontal={true} 
        active={truckAtRomana}
      />

      {/* Boundary Recognition UI (Floating labels when near limits) */}
      {truckAtGate && truckStatus === 'parked' && (
        <Text
          position={[truckPosition[0], 5, truckPosition[2]]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.8}
          color="#3b82f6"
        >
          [ LÍMITE RECONOCIDO: PORTÓN ]
        </Text>
      )}
      {truckAtRomana && truckStatus === 'parked' && (
        <Text
          position={[truckPosition[0], 5, truckPosition[2]]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.8}
          color="#f59e0b"
        >
          [ LÍMITE RECONOCIDO: ROMANA ]
        </Text>
      )}
    </group>
  );
}
