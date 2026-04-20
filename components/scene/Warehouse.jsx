'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
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




// ══════════════════════════════════════════════════════════════════════════════
// SUB: DS 43 Inflamables — Pretil (20cm berm at corner X=0, Z=0)
// ══════════════════════════════════════════════════════════════════════════════

function DS43FlammableZoneWalls() {
  const zone = DS43_ZONE;
  const width = zone.xMax - zone.xMin;
  const depth = zone.zMax - zone.zMin;
  const cx = zone.xMin + width / 2;
  const cz = zone.zMin + depth / 2;
  const pretilH = zone.pretilHeight;
  const pretilThick = 0.15;

  return (
    <group>
      {/* Pretil / Berm — 4 walls of 20cm height (Floor markings moved to FloorMarkings.jsx) */}
      <mesh position={[cx, BODEGA_ELEVATION + pretilH / 2, zone.zMin]}>
        <boxGeometry args={[width + pretilThick, pretilH, pretilThick]} />
        <meshStandardMaterial color={zone.borderColor} roughness={0.5} />
      </mesh>
      <mesh position={[cx, BODEGA_ELEVATION + pretilH / 2, zone.zMax]}>
        <boxGeometry args={[width + pretilThick, pretilH, pretilThick]} />
        <meshStandardMaterial color={zone.borderColor} roughness={0.5} />
      </mesh>
      <mesh position={[zone.xMin, BODEGA_ELEVATION + pretilH / 2, cz]}>
        <boxGeometry args={[pretilThick, pretilH, depth]} />
        <meshStandardMaterial color={zone.borderColor} roughness={0.5} />
      </mesh>
      <mesh position={[zone.xMax, BODEGA_ELEVATION + pretilH / 2, cz]}>
        <boxGeometry args={[pretilThick, pretilH, depth]} />
        <meshStandardMaterial color={zone.borderColor} roughness={0.5} />
      </mesh>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: Warehouse Skeleton
// ══════════════════════════════════════════════════════════════════════════════

export default function Warehouse() {
  return (
    <group>
      {/* 1. LOSA BASE — Plano a Y=1.2m (nivel operativo) */}
      <mesh
        position={[centerX, BODEGA_ELEVATION, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[BODEGA_WIDTH, BODEGA_DEPTH]} />
        <meshStandardMaterial
          color={COLORS.slab}
          roughness={0.8}
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

      {/* DS43 Walls */}
      <DS43FlammableZoneWalls />
    </group>
  );
}
