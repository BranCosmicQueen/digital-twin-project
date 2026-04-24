'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { BODEGA_ELEVATION } from '@/lib/constants';

function PackingTable({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Table Frame */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.5, 0.1, 1.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Table Top (Wood/Laminate) */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[2.6, 0.05, 1.3]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
      </mesh>
      {/* Legs */}
      {[[-1.2, 0.45, -0.5], [1.2, 0.45, -0.5], [-1.2, 0.45, 0.5], [1.2, 0.45, 0.5]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.1, 0.9, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}
      {/* Computer Monitor */}
      <mesh position={[-0.5, 1.2, -0.3]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* Label Printer */}
      <mesh position={[0.5, 1.05, -0.2]}>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Scale (Báscula de sobremesa) */}
      <mesh position={[0, 0.96, 0.2]}>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
    </group>
  );
}

function PalletJack({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={0.8}>
      {/* Handle */}
      <mesh position={[0, 0.6, 0.8]} rotation={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Forks */}
      <mesh position={[-0.25, 0.1, 0]}>
        <boxGeometry args={[0.15, 0.08, 1.2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.25, 0.1, 0]}>
        <boxGeometry args={[0.15, 0.08, 1.2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Body/Pump */}
      <mesh position={[0, 0.25, 0.7]}>
        <boxGeometry args={[0.6, 0.4, 0.3]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

function IndustrialBin({ position, color = "#1e293b" }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.3, 0.1, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* Wheels */}
      {[[-0.5, 0.1, -0.5], [0.5, 0.1, -0.5], [-0.5, 0.1, 0.5], [0.5, 0.1, 0.5]].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.1, 0.1, 0.1]} rotation={[0, 0, Math.PI/2]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
    </group>
  );
}

function SafetyBollard({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      {/* Stripes */}
      {[0.2, 0.6, 0.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.155, 0.02, 8, 16]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
    </group>
  );
}

export default function LogisticsEquipment() {
  return (
    <group>
      {/* 1. Consolidation & Packing Area (Near Docks/Outbound) */}
      <PackingTable position={[53.8, BODEGA_ELEVATION, 35]} rotation={Math.PI / 2} />
      <PackingTable position={[53.8, BODEGA_ELEVATION, 40]} rotation={Math.PI / 2} />
      <PackingTable position={[53.8, BODEGA_ELEVATION, 45]} rotation={Math.PI / 2} />

      {/* 2. VAS / Labeling Area (Near Inbound) */}
      <PackingTable position={[53.8, BODEGA_ELEVATION, 15]} rotation={Math.PI / 2} />
      <PackingTable position={[53.8, BODEGA_ELEVATION, 20]} rotation={Math.PI / 2} />

      {/* 3. Scattered Pallet Jacks */}
      <PalletJack position={[56, BODEGA_ELEVATION, 25]} rotation={-Math.PI / 4} />
      <PalletJack position={[55, BODEGA_ELEVATION, 12]} rotation={Math.PI / 6} />
      <PalletJack position={[52, BODEGA_ELEVATION, 48]} rotation={Math.PI} />

      {/* 4. Industrial Bins (Waste Management) - Moved away from Office */}
      <IndustrialBin position={[38, BODEGA_ELEVATION, 4]} color="#166534" /> {/* Cardboard */}
      <IndustrialBin position={[38, BODEGA_ELEVATION, 6]} color="#1e40af" /> {/* Plastic */}
      <IndustrialBin position={[2, BODEGA_ELEVATION, 48]} color="#334155" /> {/* General */}

      {/* 5. Safety Bollards around critical areas */}
      {/* Around Office */}
      <SafetyBollard position={[49, BODEGA_ELEVATION, 1]} />
      <SafetyBollard position={[49, BODEGA_ELEVATION, 6]} />
      {/* Around Battery Area */}
      <SafetyBollard position={[11, BODEGA_ELEVATION, 43]} />
      <SafetyBollard position={[11, BODEGA_ELEVATION, 49]} />
    </group>
  );
}
