'use client';

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { BODEGA_WIDTH, BODEGA_DEPTH, BODEGA_ELEVATION } from '@/lib/constants';

function ExitSign({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Background Plate (Green) */}
      <mesh>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial color="#166534" emissive="#166534" emissiveIntensity={0.5} />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        EXIT / SALIDA
      </Text>
      {/* Arrow icon (simplified) */}
      <mesh position={[0.45, 0, 0.01]}>
        <planeGeometry args={[0.1, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

function DangerSign({ position, rotation = [0, 0, 0], text = "PELIGRO" }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color="#b91c1c" />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.12}
        color="white"
        maxWidth={0.6}
        textAlign="center"
      >
        {text}
      </Text>
    </group>
  );
}

export default function SafetySignage() {
  const signs = useMemo(() => [
    // 1. Docks (X=60)
    { pos: [59.9, BODEGA_ELEVATION + 3, 20], rot: [0, -Math.PI / 2, 0], type: 'exit' },
    { pos: [59.9, BODEGA_ELEVATION + 3, 30], rot: [0, -Math.PI / 2, 0], type: 'exit' },
    
    // 2. West Wall Corners (X=0)
    { pos: [0.1, BODEGA_ELEVATION + 3, 2], rot: [0, Math.PI / 2, 0], type: 'exit' },
    { pos: [0.1, BODEGA_ELEVATION + 3, 48], rot: [0, Math.PI / 2, 0], type: 'exit' },
    
    // 3. Admin Area
    { pos: [48, BODEGA_ELEVATION + 3, 5.9], rot: [0, 0, 0], type: 'exit' },
    
    // 4. Dangerous Zones
    { pos: [11.5, BODEGA_ELEVATION + 2, 2.6], rot: [0, 0, 0], type: 'danger', text: 'INFLAMABLE DS43' },
    { pos: [91, BODEGA_ELEVATION + 2, 5], rot: [0, -Math.PI / 2, 0], type: 'danger', text: 'RESPEL DS148' },
  ], []);

  return (
    <group>
      {signs.map((s, i) => (
        s.type === 'exit' ? (
          <ExitSign key={i} position={s.pos} rotation={s.rot} />
        ) : (
          <DangerSign key={i} position={s.pos} rotation={s.rot} text={s.text} />
        )
      ))}
    </group>
  );
}
