import { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import {
  GATE_WAIT_X,
  GATE_MAIN_Z,
  ROMANA_X,
  ROMANA_Z,
  ROMANA_WIDTH,
  ROMANA_DEPTH,
  COLORS,
  GLASS_STYLE
} from '@/lib/constants';
import { useSimulationStore } from '@/lib/store';
import useSimStore from '@/store/useSimStore';


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
  const viewMode = useSimStore(s => s.viewMode);
  const is2D = viewMode === '2d';
  
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
      {is2D && truckAtGate && truckStatus === 'parked' && (
        <Html position={[truckPosition[0], 5, truckPosition[2]]} center>
          <div style={{ ...GLASS_STYLE, color: '#3b82f6', border: '1px solid #3b82f6' }}>
            [ LÍMITE RECONOCIDO: PORTÓN ]
          </div>
        </Html>
      )}
      {is2D && truckAtRomana && truckStatus === 'parked' && (
        <Html position={[truckPosition[0], 5, truckPosition[2]]} center>
          <div style={{ ...GLASS_STYLE, color: '#f59e0b', border: '1px solid #f59e0b' }}>
            [ LÍMITE RECONOCIDO: ROMANA ]
          </div>
        </Html>
      )}
    </group>
  );
}
