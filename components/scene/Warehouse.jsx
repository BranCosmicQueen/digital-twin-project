'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Line } from '@react-three/drei';
import {
  BODEGA_WIDTH,
  BODEGA_DEPTH,
  BODEGA_ELEVATION,
  WALL_HEIGHT,
  ZONE_Y,
  STAGING_INBOUND,
  STAGING_OUTBOUND,
  ZONE_A,
  ZONE_B,
  ZONE_C,
  BATTERY_ZONE,
  DS43_ZONE,
  COLORS,
  AISLE_WIDTH,
  RACK_PITCH
} from '@/lib/constants';
import RacksLayout from './RacksLayout';
import StagingLayout from './StagingLayout';
import BatteryLayout from './BatteryLayout';

// ══════════════════════════════════════════════════════════════════════════════
// BODEGA ESMAX — Layout Paramétrico (Flujo en "U")
// 105 cuerpos exactos de Alta Densidad divididos en Zonas A, B, y C.
// ══════════════════════════════════════════════════════════════════════════════

// ── Helpers ──
const centerX = BODEGA_WIDTH / 2;   // 30
const centerZ = BODEGA_DEPTH / 2;   // 25


// ══════════════════════════════════════════════════════════════════════════════
// SUB: Grilla de Referencia en el Suelo
// Subdivisiones cada 1m, marcas resaltadas cada 10m
// ══════════════════════════════════════════════════════════════════════════════

function ReferenceGrid() {
  const lines = useMemo(() => {
    const minor = [];
    const major = [];

    // Lines along X axis (vertical in plan view)
    for (let x = 0; x <= BODEGA_WIDTH; x += 1) {
      const isMajor = x % 10 === 0;
      (isMajor ? major : minor).push({
        points: [
          [x, BODEGA_ELEVATION + 0.001, 0],
          [x, BODEGA_ELEVATION + 0.001, BODEGA_DEPTH],
        ],
      });
    }

    // Lines along Z axis (horizontal in plan view)
    for (let z = 0; z <= BODEGA_DEPTH; z += 1) {
      const isMajor = z % 10 === 0;
      (isMajor ? major : minor).push({
        points: [
          [0, BODEGA_ELEVATION + 0.001, z],
          [BODEGA_WIDTH, BODEGA_ELEVATION + 0.001, z],
        ],
      });
    }

    return { minor, major };
  }, []);

  return (
    <group>
      {/* Minor grid (1m) */}
      {lines.minor.map((line, i) => (
        <Line
          key={`grid-minor-${i}`}
          points={line.points}
          color={COLORS.gridMinor}
          lineWidth={0.5}
          transparent
          opacity={0.3}
        />
      ))}
      {/* Major grid (10m) */}
      {lines.major.map((line, i) => (
        <Line
          key={`grid-major-${i}`}
          points={line.points}
          color={COLORS.gridMajor}
          lineWidth={1.5}
          transparent
          opacity={0.6}
        />
      ))}
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// SUB: Axis Ruler Labels (metro marks along edges)
// ══════════════════════════════════════════════════════════════════════════════

function RulerLabels() {
  const labels = useMemo(() => {
    const items = [];

    // X-axis labels (along Z=0 edge, every 10m)
    for (let x = 0; x <= BODEGA_WIDTH; x += 10) {
      items.push({
        text: `${x}m`,
        position: [x, BODEGA_ELEVATION + 0.02, -1.5],
        color: COLORS.gridMajor,
      });
    }

    // Z-axis labels (along X=0 edge, every 10m)
    for (let z = 0; z <= BODEGA_DEPTH; z += 10) {
      items.push({
        text: `${z}m`,
        position: [-1.8, BODEGA_ELEVATION + 0.02, z],
        color: COLORS.gridMajor,
      });
    }

    return items;
  }, []);

  return (
    <group>
      {labels.map((lbl, i) => (
        <Text
          key={`ruler-${i}`}
          position={lbl.position}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.8}
          color={lbl.color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.7}
        >
          {lbl.text}
        </Text>
      ))}
    </group>
  );
}


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
    // Muro Este (X=60)
    { pos: [BODEGA_WIDTH, BODEGA_ELEVATION + WALL_HEIGHT / 2, centerZ], size: [0.1, WALL_HEIGHT, BODEGA_DEPTH] },
    // Muro Norte (Z=0)
    { pos: [centerX, BODEGA_ELEVATION + WALL_HEIGHT / 2, 0], size: [BODEGA_WIDTH, WALL_HEIGHT, 0.1] },
    // Muro Sur (Z=50)
    { pos: [centerX, BODEGA_ELEVATION + WALL_HEIGHT / 2, BODEGA_DEPTH], size: [BODEGA_WIDTH, WALL_HEIGHT, 0.1] },
  ];

  return (
    <group>
      {walls.map((w, i) => (
        <mesh key={`wall-${i}`} position={w.pos} material={wallMaterial}>
          <boxGeometry args={w.size} />
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
// SUB: Zona Pintada en Suelo (Floor Zone)
// ══════════════════════════════════════════════════════════════════════════════

function FloorZone({ zone, opacity = 0.25 }) {
  const width = zone.xMax - zone.xMin;
  const depth = zone.zMax - zone.zMin;
  const cx = zone.xMin + width / 2;
  const cz = zone.zMin + depth / 2;

  return (
    <group>
      {/* Colored area */}
      <mesh position={[cx, ZONE_Y, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color={zone.color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Border lines */}
      <Line
        points={[
          [zone.xMin, ZONE_Y + 0.001, zone.zMin],
          [zone.xMax, ZONE_Y + 0.001, zone.zMin],
          [zone.xMax, ZONE_Y + 0.001, zone.zMax],
          [zone.xMin, ZONE_Y + 0.001, zone.zMax],
          [zone.xMin, ZONE_Y + 0.001, zone.zMin],
        ]}
        color={zone.color}
        lineWidth={2}
        transparent
        opacity={0.7}
      />

      {/* Label */}
      <Text
        position={[cx, ZONE_Y + 0.02, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={Math.min(width, depth) * 0.12}
        color={zone.color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.85}
      >
        {zone.label}
      </Text>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// SUB: Pasillos de Grúas Retráctiles (2.8m Rule) -> Flujo Horizontal en U
// ══════════════════════════════════════════════════════════════════════════════

function AisleCorridors() {
  const aisles = useMemo(() => {
    const result = [];
    
    // Los pasillos corren paralelos al eje X desde el fondo (X=0) hasta Staging (X=50).
    // Tenemos 4 pasillos intercalados con las 7 líneas de racks.
    // Centros Z de las 7 líneas: [13.6, 18.8, 21.2, 26.4, 28.8, 34.0, 36.4]
    // Pasillo 1: entre Línea 1 (13.6) y Línea 2 (18.8) -> Centro = 16.2
    // Pasillo 2: entre Línea 3 (21.2) y Línea 4 (26.4) -> Centro = 23.8
    // Pasillo 3: entre Línea 5 (28.8) y Línea 6 (34.0) -> Centro = 31.4
    // Opcional: un pasillo perimetral al fondo en X=2.5 y un pasillo transversal en Z=50
    const AISLE_Z_CENTERS = [16.2, 23.8, 31.4];

    AISLE_Z_CENTERS.forEach((zCenter, i) => {
      // Pasillo longitudinal ancho 2.8m, de X=0 a X=50
      result.push({
        cx: 25, cz: zCenter,
        width: 50, depth: AISLE_WIDTH, // Swapped for horizontal span
        label: i % 2 === 0 ? 'PASILLO ENTRADA →' : '← PASILLO SALIDA'
      });
    });

    return result;
  }, []);

  return (
    <group>
      {aisles.map((aisle, i) => (
        <group key={`aisle-${i}`}>
          <mesh
            position={[aisle.cx, ZONE_Y + 0.005, aisle.cz]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[aisle.width, aisle.depth]} />
            <meshBasicMaterial
              color={COLORS.aisleLines}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Edge lines */}
          <Line
            points={[
              [0, ZONE_Y + 0.006, aisle.cz - aisle.depth / 2],
              [50, ZONE_Y + 0.006, aisle.cz - aisle.depth / 2],
            ]}
            color={COLORS.aisleLines}
            lineWidth={1.5}
            transparent opacity={0.5} dashed dashSize={0.5} gapSize={0.3}
          />
          <Line
            points={[
              [0, ZONE_Y + 0.006, aisle.cz + aisle.depth / 2],
              [50, ZONE_Y + 0.006, aisle.cz + aisle.depth / 2],
            ]}
            color={COLORS.aisleLines}
            lineWidth={1.5}
            transparent opacity={0.5} dashed dashSize={0.5} gapSize={0.3}
          />

          {/* Label */}
          {aisle.label && (
            <Text
              position={[25, ZONE_Y + 0.02, aisle.cz]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.8}
              color="#B45309"
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.7}
            >
              {aisle.label}
            </Text>
          )}
        </group>
      ))}
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// SUB: DS 43 Inflamables — Pretil (20cm berm at corner X=0, Z=0)
// ══════════════════════════════════════════════════════════════════════════════

function DS43FlammableZone() {
  const zone = DS43_ZONE;
  const width = zone.xMax - zone.xMin;
  const depth = zone.zMax - zone.zMin;
  const cx = zone.xMin + width / 2;
  const cz = zone.zMin + depth / 2;
  const pretilH = zone.pretilHeight;
  const pretilThick = 0.15;

  return (
    <group>
      {/* Floor marking */}
      <mesh
        position={[cx, ZONE_Y + 0.002, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color={zone.color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pretil / Berm — 4 walls of 20cm height */}
      {/* Norte (Z=0 side) */}
      <mesh position={[cx, BODEGA_ELEVATION + pretilH / 2, zone.zMin]}>
        <boxGeometry args={[width + pretilThick, pretilH, pretilThick]} />
        <meshStandardMaterial color={zone.borderColor} roughness={0.5} />
      </mesh>
      {/* Sur (Z=15) */}
      <mesh position={[cx, BODEGA_ELEVATION + pretilH / 2, zone.zMax]}>
        <boxGeometry args={[width + pretilThick, pretilH, pretilThick]} />
        <meshStandardMaterial color={zone.borderColor} roughness={0.5} />
      </mesh>
      {/* Oeste (X=0 side) */}
      <mesh position={[zone.xMin, BODEGA_ELEVATION + pretilH / 2, cz]}>
        <boxGeometry args={[pretilThick, pretilH, depth]} />
        <meshStandardMaterial color={zone.borderColor} roughness={0.5} />
      </mesh>
      {/* Este (X=10) */}
      <mesh position={[zone.xMax, BODEGA_ELEVATION + pretilH / 2, cz]}>
        <boxGeometry args={[pretilThick, pretilH, depth]} />
        <meshStandardMaterial color={zone.borderColor} roughness={0.5} />
      </mesh>

      {/* Border outline */}
      <Line
        points={[
          [zone.xMin, ZONE_Y + 0.003, zone.zMin],
          [zone.xMax, ZONE_Y + 0.003, zone.zMin],
          [zone.xMax, ZONE_Y + 0.003, zone.zMax],
          [zone.xMin, ZONE_Y + 0.003, zone.zMax],
          [zone.xMin, ZONE_Y + 0.003, zone.zMin],
        ]}
        color={zone.borderColor}
        lineWidth={3}
        transparent
        opacity={0.9}
      />

      {/* Warning label */}
      <Text
        position={[cx, ZONE_Y + 0.03, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1}
        color={zone.borderColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.85}
      >
        {zone.label}
      </Text>

      {/* Pretil height label */}
      <Text
        position={[cx, ZONE_Y + 0.03, zone.zMax + 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color={zone.borderColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        PRETIL 0.2m
      </Text>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// SUB: Dimension Annotations (key measurements)
// ══════════════════════════════════════════════════════════════════════════════

function DimensionAnnotations() {
  return (
    <group>
      {/* Bodega overall dimensions */}
      {/* Width: 60m along X */}
      <Text
        position={[centerX, ZONE_Y + 0.02, -3]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.2}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.8}
      >
        ← 60m →
      </Text>

      {/* Depth: 50m along Z */}
      <Text
        position={[-3.5, ZONE_Y + 0.02, centerZ]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={1.2}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.8}
      >
        ← 50m →
      </Text>

      {/* Height annotation */}
      <Text
        position={[BODEGA_WIDTH + 2, BODEGA_ELEVATION + WALL_HEIGHT / 2, 0]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={0.8}
        color="#9CA3AF"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        12m ALTURA
      </Text>

      {/* Elevation annotation */}
      <Text
        position={[-3, BODEGA_ELEVATION / 2, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#9CA3AF"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        LOSA Y=1.2m
      </Text>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: Warehouse Skeleton
// ══════════════════════════════════════════════════════════════════════════════

export default function Warehouse() {
  return (
    <group>
      {/* ══════════════════════════════════════════════════════════
          1. LOSA BASE — Plano a Y=1.2m (nivel operativo)
          ══════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════
          2. GRILLA DE REFERENCIA (1m subdivisión, 10m resaltadas)
          ══════════════════════════════════════════════════════════ */}
      <ReferenceGrid />
      <RulerLabels />

      {/* ══════════════════════════════════════════════════════════
          3. MUROS PERIMETRALES (wireframe, opacity: 0.1)
          ══════════════════════════════════════════════════════════ */}
      <PerimeterWalls />

      {/* ══════════════════════════════════════════════════════════
          4. TECHO FANTASMA (12m)
          ══════════════════════════════════════════════════════════ */}
      <GhostCeiling />

      {/* ══════════════════════════════════════════════════════════
          5. DELIMITACIÓN DE ZONAS Y RACKS (105 CUERPOS)
          ══════════════════════════════════════════════════════════ */}
      {/* Background painted zones */}
      <FloorZone zone={ZONE_A} opacity={0.1} />
      <FloorZone zone={ZONE_B} opacity={0.06} />
      <FloorZone zone={ZONE_C} opacity={0.06} />
      
      <FloorZone zone={STAGING_INBOUND} opacity={0.2} />
      <FloorZone zone={STAGING_OUTBOUND} opacity={0.2} />

      {/* Racks Layout - Geometría paramétrica exacta (X: 0-50 delimitado) */}
      <RacksLayout />

      {/* Staging Layout - Pallets en las zonas de Inbound/Outbound (X: 50-60) */}
      <StagingLayout />

      {/* Battery Charging Zone (Esquina inferior izquierda) */}
      <FloorZone zone={BATTERY_ZONE} opacity={0.3} />
      <BatteryLayout />

      {/* ══════════════════════════════════════════════════════════════════════════════
          6. PASILLOS DE GRÚAS RETRÁCTILES (2.8m Rule)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <AisleCorridors />

      {/* ══════════════════════════════════════════════════════════
          7. DS 43 — ZONA INFLAMABLES (Pretil en ZONA C)
          ══════════════════════════════════════════════════════════ */}
      <DS43FlammableZone />

      {/* ══════════════════════════════════════════════════════════
          8. ANOTACIONES DE DIMENSIONES
          ══════════════════════════════════════════════════════════ */}
      <DimensionAnnotations />
    </group>
  );
}
