'use client';

import { Text } from '@react-three/drei';
import {
  RESPEL_CENTER_X,
  RESPEL_CENTER_Z,
  RESPEL_SIZE,
  COLORS,
} from '@/lib/constants';

import useSimStore from '@/store/useSimStore';

export default function RespelZone() {
  const setHoveredItem = useSimStore(s => s.setHoveredItem);
  const is2D = useSimStore(s => s.viewMode === '2d');
  const wallH = 3;
  const wallT = 0.2;
  const halfW = RESPEL_SIZE / 2;  // 5
  const halfD = RESPEL_SIZE / 2;  // 5


  return (
    <group 
      position={[RESPEL_CENTER_X, 0, RESPEL_CENTER_Z]}
      onPointerOut={() => setHoveredItem(null)}
    >
      {/* Hitbox para Hover RESPEL */}
      <mesh 
        position={[0, 1.5, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (is2D) setHoveredItem('ZONA RESPEL — ALMACENAMIENTO DE RESIDUOS PELIGROSOS');
        }}
      >
        <boxGeometry args={[RESPEL_SIZE, 3, RESPEL_SIZE]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* Floor slab */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[RESPEL_SIZE, 0.16, RESPEL_SIZE]} />
        <meshStandardMaterial color={COLORS.respelFloor} roughness={0.7} />
      </mesh>

      {/* Muros Cortafuego perimetrales RF-180 (DS 148 EXCEPCIÓN) */}
      {/* North Wall */}
      <mesh position={[0, wallH / 2, -halfD]}>
        <boxGeometry args={[RESPEL_SIZE, wallH, wallT]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.9} /> {/* Rojo oscuro RF-180 */}
      </mesh>
      {/* South Wall */}
      <mesh position={[0, wallH / 2, halfD]}>
        <boxGeometry args={[RESPEL_SIZE, wallH, wallT]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.9} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-halfW, wallH / 2, 0]}>
        <boxGeometry args={[wallT, wallH, RESPEL_SIZE]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.9} />
      </mesh>
      {/* East Wall */}
      <mesh position={[halfW, wallH / 2, 0]}>
        <boxGeometry args={[wallT, wallH, RESPEL_SIZE]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.9} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, wallH, 0]}>
        <boxGeometry args={[RESPEL_SIZE, 0.2, RESPEL_SIZE]} />
        <meshStandardMaterial color="#b91c1c" transparent opacity={0.6} roughness={0.4} />
      </mesh>

      {/* Hazmat barrels inside */}
      {[
        [-2, 0, -3], [-2, 0, 0], [-2, 0, 3],
        [0, 0, -3],  [0, 0, 0],  [0, 0, 3],
        [2, 0, -3],  [2, 0, 0],  [2, 0, 3],
      ].map((pos, i) => (
        <mesh key={`barrel-${i}`} position={[pos[0], 0.6, pos[2]]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.0, 10]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#b71c1c' : i % 3 === 1 ? '#1565c0' : '#2e7d32'} roughness={0.5} />
        </mesh>
      ))}

      {/* Labels removed per strict clean base instructions */}
    </group>
  );
}
