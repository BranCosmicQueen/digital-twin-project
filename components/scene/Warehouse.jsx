'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import {
  BODEGA_WIDTH,
  BODEGA_DEPTH,
  BODEGA_ELEVATION,
  WALL_HEIGHT,
  DS43_ZONE,
  COLORS
} from '@/lib/constants';
import RacksLayout from './RacksLayout';
import StagingLayout from './StagingLayout';
import BatteryLayout from './BatteryLayout';
import EmergencySystems from './EmergencySystems';

// ══════════════════════════════════════════════════════════════════════════════
// BODEGA ESMAX — Layout Paramétrico (Flujo en "U")
// ══════════════════════════════════════════════════════════════════════════════

const centerX = BODEGA_WIDTH / 2;
const centerZ = BODEGA_DEPTH / 2;


// ══════════════════════════════════════════════════════════════════════════════
// SUB: Muros Perimetrales (Wireframe / opacity: 0.1)
// ══════════════════════════════════════════════════════════════════════════════

function PerimeterWalls() {
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: COLORS.wallWireframe,
        transparent: true,
        opacity: 0.1,
        wireframe: true,
        side: THREE.DoubleSide,
      }),
    []
  );

  const walls = [
    // Muro Oeste (X=0)
    { pos: [0, BODEGA_ELEVATION + WALL_HEIGHT / 2, centerZ], size: [0.1, WALL_HEIGHT, BODEGA_DEPTH] },
    
    // Muro Norte (Z=0)
    { pos: [centerX, BODEGA_ELEVATION + WALL_HEIGHT / 2, 0], size: [BODEGA_WIDTH, WALL_HEIGHT, 0.1] },
    
    // Muro Sur (Z=50)
    { pos: [centerX, BODEGA_ELEVATION + WALL_HEIGHT / 2, BODEGA_DEPTH], size: [BODEGA_WIDTH, WALL_HEIGHT, 0.1] },
  ];

  // ── Muro Este (X=60) con Huecos para 2 Muelles ──
  // Z-centers: 20 (Carga), 30 (Descarga). Ancho = 3.5. (Mitad = 1.75)
  // Hueco 1: Z=18.25 a 21.75
  // Hueco 2: Z=28.25 a 31.75
  // Segmentos de muro sólido:
  // 1. [0, 18.25]
  // 2. [21.75, 28.25]
  // 3. [31.75, 50]
  const wallSegmentsZ = [
    { start: 0, end: 18.25 },
    { start: 21.75, end: 28.25 },
    { start: 31.75, end: 50 },
  ];

  wallSegmentsZ.forEach(seg => {
    const depth = seg.end - seg.start;
    const cz = seg.start + depth / 2;
    walls.push({
      pos: [BODEGA_WIDTH, BODEGA_ELEVATION + WALL_HEIGHT / 2, cz],
      size: [0.1, WALL_HEIGHT, depth]
    });
  });

  return (
    <group>
      {walls.map((w, i) => (
        <mesh key={`wall-${i}`} position={w.pos} material={wallMaterial}>
          <boxGeometry args={w.size} />
        </mesh>
      ))}
      
      {/* Lintels (Dintel) above the 2 dock openings (from 4.5m up to 12m) */}
      {[20, 30].map((dz, i) => (
        <mesh key={`lintel-${i}`} position={[BODEGA_WIDTH, BODEGA_ELEVATION + 4.5 + 3.75, dz]} material={wallMaterial}>
          <boxGeometry args={[0.1, 7.5, 3.5]} />
        </mesh>
      ))}
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// SUB: Techo Fantasma (Ghost Ceiling at 12m)
// ══════════════════════════════════════════════════════════════════════════════

function GhostCeiling() {
  return (
    <mesh position={[centerX, BODEGA_ELEVATION + WALL_HEIGHT, centerZ]}>
      <boxGeometry args={[BODEGA_WIDTH, 0.05, BODEGA_DEPTH]} />
      <meshBasicMaterial
        color={COLORS.roofGhost}
        transparent
        opacity={0.08}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}




function DS43FlammableZoneWalls() {
  const zone = DS43_ZONE;
  const h = 3.0; 

  return (
    <group>
      {/* Floor Pattern (Translucent red/blue) */}
      <mesh position={[10, BODEGA_ELEVATION + 0.02, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 3]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function InternalBerm() {
  const h = 0.2;
  const thick = 0.15;
  const material = new THREE.MeshStandardMaterial({ color: "#ef4444" });

  return (
    <group>
      {/* North */}
      <mesh position={[BODEGA_WIDTH / 2, BODEGA_ELEVATION + h / 2, thick / 2]}>
        <boxGeometry args={[BODEGA_WIDTH, h, thick]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* South */}
      <mesh position={[BODEGA_WIDTH / 2, BODEGA_ELEVATION + h / 2, BODEGA_DEPTH - thick / 2]}>
        <boxGeometry args={[BODEGA_WIDTH, h, thick]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* West */}
      <mesh position={[thick / 2, BODEGA_ELEVATION + h / 2, BODEGA_DEPTH / 2]}>
        <boxGeometry args={[thick, h, BODEGA_DEPTH]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* East (partial due to docks) */}
      <mesh position={[BODEGA_WIDTH - thick / 2, BODEGA_ELEVATION + h / 2, 10]}>
        <boxGeometry args={[thick, h, 20]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[BODEGA_WIDTH - thick / 2, BODEGA_ELEVATION + h / 2, 40]}>
        <boxGeometry args={[thick, h, 20]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

function BatteryWall() {
  const h = 3.0;
  const x = 10;
  const zStart = 40;
  const zEnd = 50;
  
  return (
    <mesh position={[x, BODEGA_ELEVATION + h / 2, (zStart + zEnd) / 2]}>
      <boxGeometry args={[0.15, h, zEnd - zStart]} />
      <meshStandardMaterial color="#f1f5f9" />
    </mesh>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// SUB: Administración (North-East Office)
// ══════════════════════════════════════════════════════════════════════════════

function AdministrationOffice() {
  const width = 10; // X: 50 -> 60
  const depth = 5;  // Z: 0 -> 5
  const height = 3.5;
  const cx = 50 + width / 2;
  const cz = 0 + depth / 2;

  return (
    <group position={[cx, BODEGA_ELEVATION, cz]}>
      {/* Office Box */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Windows (Facing South) */}
      <mesh position={[0, height / 2, depth / 2 + 0.01]}>
        <boxGeometry args={[width - 2, 1.2, 0.05]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Label */}
      <group position={[0, height - 0.5, depth / 2 + 0.06]}>
        <mesh>
          <boxGeometry args={[4, 0.6, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.35}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ADMINISTRACIÓN
        </Text>
      </group>
    </group>
  );
}




// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: Warehouse Skeleton
// ══════════════════════════════════════════════════════════════════════════════

export default function Warehouse() {
  return (
    <group>
      {/* 1. LOSA BASE — Plano a Y=1.2m (nivel operativo) — Acabado Epóxico */}
      <mesh
        position={[centerX, BODEGA_ELEVATION, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[BODEGA_WIDTH, BODEGA_DEPTH]} />
        <meshStandardMaterial
          color="#94a3b8" // Gris acero epóxico
          roughness={0.05} // Liso y brillante
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. MUROS PERIMETRALES */}
      <PerimeterWalls />

      {/* 3. TECHO FANTASMA */}
      <GhostCeiling />

      {/* Racks Layout - Geometría paramétrica exacta (X: 0-50 delimitado) */}
      <RacksLayout />

      {/* Staging Layout - Pallets en las zonas de Inbound/Outbound (X: 50-60) */}
      <StagingLayout />

      <BatteryLayout />

      {/* Internal Containment Berm (DS 43) */}
      <InternalBerm />

      {/* DS43 Firewall and Zone */}
      <DS43FlammableZoneWalls />

      {/* Battery RF-60 Wall */}
      <BatteryWall />

      {/* Administration & Safety */}
      <AdministrationOffice />
      <EmergencySystems />
    </group>
  );
}
