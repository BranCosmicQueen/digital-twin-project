'use client';

import {
  RESPEL_CENTER_X,
  RESPEL_CENTER_Z,
  RESPEL_SIZE_X,
  RESPEL_SIZE_Z,
  COLORS,
} from '@/lib/constants';

function Building({ pos, size, color, label }) {
  return (
    <group position={pos}>
      <mesh position={[0, size[1] / 2, 0]} castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, size[1] + 0.1, 0]}>
        <boxGeometry args={[size[0] + 0.4, 0.2, size[2] + 0.4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

export default function SafeZones() {
  return (
    <group>
      {/* 1. Sala RESPEL (Residuos Peligrosos - DS 148) */}
      <group position={[RESPEL_CENTER_X, 0, RESPEL_CENTER_Z]}>
        <Building 
          pos={[0, 0, 0]} 
          size={[RESPEL_SIZE_X, 3.5, RESPEL_SIZE_Z]} 
          color="#991b1b" // Rojo oscuro normativo
        />
        {/* Contención perimetral propia */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[RESPEL_SIZE_X + 2, 0.2, RESPEL_SIZE_Z + 2]} />
          <meshStandardMaterial color="#991b1b" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* 2. Sistema de Agua Contra Incendio (NFPA) */}
      <group position={[RESPEL_CENTER_X - 15, 0, RESPEL_CENTER_Z]}>
        {/* Estanque de Agua (Cilindro Azul) */}
        <mesh position={[0, 4, 0]} castShadow>
          <cylinderGeometry args={[4, 4, 8, 24]} />
          <meshStandardMaterial color="#1e40af" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Sala de Bombas */}
        <Building 
          pos={[6, 0, 0]} 
          size={[5, 3.5, 6]} 
          color="#cbd5e1" 
        />
      </group>
    </group>
  );
}
