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
  COLORS,
  GLASS_STYLE
} from '@/lib/constants';
import useSimStore from '@/store/useSimStore';
import { Html } from '@react-three/drei';
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
  const w = zone.xMax - zone.xMin;
  const d = zone.zMax - zone.zMin;
  const setHoveredItem = useSimStore(s => s.setHoveredItem);
  const is2D = useSimStore(s => s.viewMode === '2d');

  return (
    <group onPointerOut={() => setHoveredItem(null)}>
      {/* Floor Pattern (Translucent red) */}
      <mesh 
        position={[(zone.xMin + zone.xMax) / 2, BODEGA_ELEVATION + 0.02, (zone.zMin + zone.zMax) / 2]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => is2D && setHoveredItem('ZONA DS43 — INFLAMABLES')}
      >
        <planeGeometry args={[w, d]} />
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



// ══════════════════════════════════════════════════════════════════════════════
// SUB: Administración (North-East Office)
// ══════════════════════════════════════════════════════════════════════════════

function AdministrationOffice({ is2D }) {
  const width = 10;
  const depth = 5;
  const height = 3.5;
  const cx = 50 + width / 2;
  const cz = 0 + depth / 2;
  const setHoveredItem = useSimStore(s => s.setHoveredItem);

  return (
    <group position={[cx, BODEGA_ELEVATION, cz]} onPointerOut={() => setHoveredItem(null)}>
      {/* Hitbox for hover */}
      <mesh 
        position={[0, height/2, 0]}
        onPointerOver={() => is2D && setHoveredItem('ADMINISTRACIÓN / OFICINA')}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* 1. Glass Structure (Open look) */}
      {/* Floor */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[width, 0.02, depth]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* Glass Walls (South/West) */}
      <mesh position={[0, height / 2, depth / 2]}>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.2} metalness={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]}>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.2} metalness={0.5} roughness={0.1} />
      </mesh>
      {/* Frame (Structural posts) */}
      {[[-5, 2.5], [5, 2.5], [-5, -2.5], [5, -2.5]].map((p, i) => (
        <mesh key={i} position={[p[0], height / 2, p[1]]}>
          <boxGeometry args={[0.2, height, 0.2]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}

      {/* 2. Furniture: Desks & Workstations */}
      {[
        { x: -3.5, z: -1.5 },
        { x: -1, z: -1.5 },
        { x: 1.5, z: -1.5 },
      ].map((d, i) => (
        <group key={`desk-${i}`} position={[d.x, 0, d.z]}>
          {/* Tabletop */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[1.5, 0.05, 0.8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Monitor */}
          <mesh position={[0, 1.1, -0.2]}>
            <boxGeometry args={[0.6, 0.4, 0.02]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Chair (Simple) */}
          <mesh position={[0, 0.4, 0.6]}>
            <cylinderGeometry args={[0.25, 0.25, 0.8, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}

      {/* 3. Logistics-Specific Gear */}
      {/* Printer Table (Labels) */}
      <group position={[4, 0, -1.5]}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[1, 0.05, 1]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.4]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Safety Vest Rack (Chalecos reflectantes) */}
      <group position={[-4, 0, 1.8]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.05, 2, 2.5]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Vests (represented as bright neon blocks) */}
        {[ -0.8, -0.4, 0, 0.4, 0.8 ].map((z, i) => (
          <mesh key={`vest-${i}`} position={[0.05, 1.2, z]}>
            <boxGeometry args={[0.05, 0.8, 0.3]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#fbbf24' : '#ea580c'} emissive={i % 2 === 0 ? '#fbbf24' : '#ea580c'} emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Radio Charging Station */}
      <group position={[4, 0, 1.5]}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        {[ -0.2, 0.2 ].map((x, i) => (
          [ -0.2, 0.2 ].map((z, j) => (
            <mesh key={`radio-${i}-${j}`} position={[x, 0.9, z]}>
              <boxGeometry args={[0.1, 0.2, 0.1]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          ))
        ))}
      </group>
      
    </group>
  );
}




// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: Warehouse Skeleton
// ══════════════════════════════════════════════════════════════════════════════

export default function Warehouse() {
  const viewMode = useSimStore(s => s.viewMode);
  const is2D = viewMode === '2d';

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


      {/* Administration & Safety */}
      <AdministrationOffice is2D={is2D} />
      <EmergencySystems />

      {/* Global Background Clearance (Lowest priority, clears labels) */}
      <mesh 
        position={[50, BODEGA_ELEVATION + 0.005, 25]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => setHoveredItem(null)}
      >
        <planeGeometry args={[150, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}
