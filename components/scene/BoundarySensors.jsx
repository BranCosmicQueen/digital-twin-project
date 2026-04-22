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

function TrafficLight({ position, active, color = '#ef4444' }) {
  return (
    <group position={position}>
      {/* Post */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Box */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Light */}
      <mesh position={[0, 3.1, 0.16]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={active ? color : '#111'} 
          emissive={active ? color : '#000'} 
          emissiveIntensity={active ? 2 : 0} 
        />
      </mesh>
    </group>
  );
}

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
  const truckAtRomana = Math.abs(truckPosition[0] - ROMANA_X) < 2;

  return (
    <group>
      {/* Gate Entry Traffic Light */}
      <TrafficLight 
        position={[GATE_WAIT_X - 2, 0, GATE_MAIN_Z + 6]} 
        active={!gateEntryOpen} 
        color="#ef4444" // Red if closed
      />
      <TrafficLight 
        position={[GATE_WAIT_X - 2, 0, GATE_MAIN_Z + 6.1]} 
        active={gateEntryOpen} 
        color="#22c55e" // Green if open
      />

      {/* Stop Line at Gate */}
      <mesh position={[GATE_WAIT_X, 0.02, GATE_MAIN_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <Text
        position={[GATE_WAIT_X, 0.1, GATE_MAIN_Z + 6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
      >
        STOP / ESPERE PORTÓN
      </Text>

      {/* Laser Sensors at Romana (Recognition limits) */}
      <LaserSensor 
        position={[ROMANA_X - ROMANA_WIDTH / 2, 0, ROMANA_Z]} 
        length={ROMANA_DEPTH + 1} 
        horizontal={false} 
        active={truckAtRomana}
      />
      <LaserSensor 
        position={[ROMANA_X + ROMANA_WIDTH / 2, 0, ROMANA_Z]} 
        length={ROMANA_DEPTH + 1} 
        horizontal={false} 
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
