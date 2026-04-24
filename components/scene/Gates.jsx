'use client';

import { forwardRef } from 'react';
import { GATE_MAIN_Z, COLORS } from '@/lib/constants';

const Gate = forwardRef(({ position, rotation = [0, 0, 0], isOpen = false }, ref) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Marco Fijo (Riel Superior e Inferior) - ELEVADO PARA CAMIONES ALTOS */}
      <mesh position={[0, 4.8, 0]}>
        <boxGeometry args={[0.2, 0.1, 10]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      
      {/* Pilares de Soporte */}
      {[-5, 5].map((z, i) => (
        <mesh key={i} position={[0, 2.4, z]}>
          <boxGeometry args={[0.3, 4.8, 0.3]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}

      {/* Hoja del Portón (La parte que se mueve) */}
      <group ref={ref}>
        {/* Estructura del Portón */}
        <mesh position={[0.05, 2.3, 0]} castShadow>
          <boxGeometry args={[0.1, 4.4, 9.8]} />
          <meshStandardMaterial 
            color="#94a3b8" 
            metalness={0.8} 
            roughness={0.2} 
            transparent 
            opacity={0.6}
          />
        </mesh>
        {/* Barras Horizontales y Verticales */}
        {[...Array(10)].map((_, i) => (
          <mesh key={`v-${i}`} position={[0.06, 2.3, -4.5 + i * 1]}>
            <boxGeometry args={[0.05, 4.4, 0.05]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
        {[-2, -1, 0, 1, 2].map((y, i) => (
          <mesh key={`h-${i}`} position={[0.06, 2.3 + y * 1, 0]}>
            <boxGeometry args={[0.05, 0.05, 9.8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
      </group>
    </group>
  );
});

export default function Gates({ inboundGateRef }) {
  return (
    <group>
      {/* Portón de Entrada (Principal) - UBICADO EN EL LÍMITE X=100 */}
      <Gate 
        position={[100, 0, 25]} 
        rotation={[0, 0, 0]} 
        ref={inboundGateRef}
      />
      
      {/* Caseta de Guardia - INTEGRADA EN EL PERÍMETRO */}
      <mesh position={[97, 1.25, 18]} castShadow>
        <boxGeometry args={[3, 2.5, 3]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}
