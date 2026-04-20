'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Line } from '@react-three/drei';
import {
  BODEGA_WIDTH,
  BODEGA_DEPTH,
  BODEGA_ELEVATION,
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
  GATE_X,
  GATE_MAIN_Z,
  CALLE_ADELA_WIDTH,
  PATIO_CENTER_X,
  PATIO_CENTER_Z,
  TURNING_RADIUS,
  PULL_ZONE_NORTH,
  PULL_ZONE_SOUTH,
  PEDESTRIAN_ZONE_Z_START,
  DOCK_WALL_X,
  DOCK_CARGA_Z,
  DOCK_DESCARGA_Z,
  ROMANA_X,
  ROMANA_Z,
  ROMANA_DEPTH
} from '@/lib/constants';

// Z-Centers from Warehouse for Aisle mapping
const AISLE_Z_CENTERS = [16.2, 23.8, 31.4];

// Helper components for the floor markings

function ReferenceGrid() {
  const lines = useMemo(() => {
    const minor = [];
    const major = [];

    // Lines along X axis (vertical in plan view)
    for (let x = 0; x <= GATE_X; x += 1) {
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
          [GATE_X, BODEGA_ELEVATION + 0.001, z],
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

function RulerLabels() {
  const labels = useMemo(() => {
    const items = [];
    for (let x = 0; x <= GATE_X; x += 10) {
      items.push({ text: `${x}m`, position: [x, ZONE_Y + 0.02, -1.5], color: COLORS.gridMajor });
    }
    for (let z = 0; z <= BODEGA_DEPTH; z += 10) {
      items.push({ text: `${z}m`, position: [-1.8, ZONE_Y + 0.02, z], color: COLORS.gridMajor });
    }
    return items;
  }, []);

  return (
    <group>
      {labels.map((lbl, i) => (
        <Text key={`ruler-${i}`} position={lbl.position} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color={lbl.color} anchorX="center" anchorY="middle" fillOpacity={0.7}>
          {lbl.text}
        </Text>
      ))}
    </group>
  );
}

function FloorZone({ zone, opacity = 0.25 }) {
  const width = zone.xMax - zone.xMin;
  const depth = zone.zMax - zone.zMin;
  const cx = zone.xMin + width / 2;
  const cz = zone.zMin + depth / 2;

  return (
    <group>
      <mesh position={[cx, ZONE_Y, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={zone.color} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      <Line
        points={[
          [zone.xMin, ZONE_Y + 0.001, zone.zMin], [zone.xMax, ZONE_Y + 0.001, zone.zMin],
          [zone.xMax, ZONE_Y + 0.001, zone.zMax], [zone.xMin, ZONE_Y + 0.001, zone.zMax], [zone.xMin, ZONE_Y + 0.001, zone.zMin],
        ]}
        color={zone.color} lineWidth={2} transparent opacity={0.7}
      />
      <Text position={[cx, ZONE_Y + 0.02, cz]} rotation={[-Math.PI / 2, 0, 0]} fontSize={Math.min(width, depth) * 0.12} color={zone.color} anchorX="center" anchorY="middle" fillOpacity={0.85}>
        {zone.label}
      </Text>
    </group>
  );
}

function DS43FloorLines() {
  const zone = DS43_ZONE;
  const cx = zone.xMin + (zone.xMax - zone.xMin) / 2;
  
  return (
    <group>
      <Line
        points={[
          [zone.xMin, ZONE_Y + 0.003, zone.zMin], [zone.xMax, ZONE_Y + 0.003, zone.zMin],
          [zone.xMax, ZONE_Y + 0.003, zone.zMax], [zone.xMin, ZONE_Y + 0.003, zone.zMax], [zone.xMin, ZONE_Y + 0.003, zone.zMin],
        ]}
        color={zone.borderColor} lineWidth={3} transparent opacity={0.9}
      />
      <Text position={[cx, ZONE_Y + 0.03, zone.zMax + 1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color={zone.borderColor} anchorX="center" anchorY="middle" fillOpacity={0.6}>
        PRETIL 0.2m
      </Text>
    </group>
  );
}

function GeneralTexts() {
  const labels = [
    { text: 'BODEGA', position: [30, ZONE_Y + 0.05, 20], fontSize: 3, color: '#666', opacity: 0.5 },
    { text: 'PATIO DE MANIOBRAS', position: [80, 0.05, 45], fontSize: 2, color: '#ffffff', opacity: 0.3 },
    { text: 'CALLE ADELA', position: [GATE_X + CALLE_ADELA_WIDTH / 2, 0.2, 25], fontSize: 2, color: '#ffffff', opacity: 0.5, rotationZ: Math.PI / 2 },
    { text: 'PORTÓN ACCESO', position: [96, 0.05, GATE_MAIN_Z], fontSize: 1, color: COLORS.gateEntry, opacity: 1 },
    { text: 'ROMANA', position: [ROMANA_X, 0.2, ROMANA_Z + ROMANA_DEPTH / 2 + 1.5], fontSize: 0.6, color: COLORS.weighbridge, fillOpacity: 0.7 },
    { text: 'MUELLE CARGA', position: [DOCK_WALL_X + 5, 0.05, DOCK_CARGA_Z], fontSize: 0.8, color: COLORS.accentOutbound, opacity: 1 },
    { text: 'MUELLE DESCARGA', position: [DOCK_WALL_X + 5, 0.05, DOCK_DESCARGA_Z], fontSize: 0.8, color: COLORS.accentInbound, opacity: 1 },
    { text: '← 60m (BODEGA) →', position: [30, ZONE_Y + 0.02, -3], fontSize: 1.2, color: '#374151', opacity: 0.8 },
    { text: '← 40m (PATIO) →', position: [80, ZONE_Y + 0.02, -3], fontSize: 1.2, color: '#374151', opacity: 0.8 },
    { text: '← 100m (BASE TOTAL) →', position: [50, ZONE_Y + 0.02, -6], fontSize: 1.5, color: '#1f2937', opacity: 0.9 },
    { text: '← 50m →', position: [-3.5, ZONE_Y + 0.02, 25], fontSize: 1.2, color: '#374151', opacity: 0.8, rotationZ: Math.PI / 2 },
  ];

  return (
    <group>
      {labels.map((lbl, i) => (
        <Text
          key={i}
          position={lbl.position}
          rotation={[-Math.PI / 2, 0, lbl.rotationZ || 0]}
          fontSize={lbl.fontSize}
          color={lbl.color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={lbl.opacity || lbl.fillOpacity}
        >
          {lbl.text}
        </Text>
      ))}
    </group>
  );
}

function StagingFloors() {
  return (
    <group>
      {/* Staging Inbound Floor */}
      <mesh position={[DOCK_WALL_X - 7, ZONE_Y, DOCK_DESCARGA_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color={COLORS.stagingInbound} transparent opacity={0.06} emissive={COLORS.stagingInbound} emissiveIntensity={0.15} />
      </mesh>
      {/* Staging Outbound Floor */}
      <mesh position={[DOCK_WALL_X - 7, ZONE_Y, DOCK_CARGA_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color={COLORS.stagingOutbound} transparent opacity={0.06} emissive={COLORS.stagingOutbound} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function AisleCorridors() {
  const aisles = AISLE_Z_CENTERS.map((zCenter, i) => ({
    cx: 25, cz: zCenter,
    width: 50, depth: AISLE_WIDTH,
    label: i % 2 === 0 ? 'PASILLO ENTRADA →' : '← PASILLO SALIDA'
  }));

  return (
    <group>
      {aisles.map((aisle, i) => (
        <group key={`aisle-${i}`}>
          <mesh position={[aisle.cx, ZONE_Y + 0.005, aisle.cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[aisle.width, aisle.depth]} />
            <meshBasicMaterial color={COLORS.aisleLines} transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
          <Line points={[[0, ZONE_Y + 0.006, aisle.cz - aisle.depth / 2], [50, ZONE_Y + 0.006, aisle.cz - aisle.depth / 2]]} color={COLORS.aisleLines} lineWidth={1.5} transparent opacity={0.5} dashed dashSize={0.5} gapSize={0.3} />
          <Line points={[[0, ZONE_Y + 0.006, aisle.cz + aisle.depth / 2], [50, ZONE_Y + 0.006, aisle.cz + aisle.depth / 2]]} color={COLORS.aisleLines} lineWidth={1.5} transparent opacity={0.5} dashed dashSize={0.5} gapSize={0.3} />
          <Text position={[25, ZONE_Y + 0.02, aisle.cz]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#B45309" anchorX="center" anchorY="middle" fillOpacity={0.7}>
            {aisle.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

// === NEW MASTER DOC COMPONENTS ===

function PedestrianZone() {
  const zStart = PEDESTRIAN_ZONE_Z_START; // 40
  const zEnd = BODEGA_DEPTH; // 50
  const width = BODEGA_WIDTH;
  const depth = zEnd - zStart;
  const cx = width / 2;
  const cz = zStart + depth / 2;

  // Stripes for warning
  const stripes = [];
  for (let x = 0; x < width; x += 2) {
    stripes.push(
      <Line key={x} points={[[x, ZONE_Y + 0.005, zStart], [x + 2, ZONE_Y + 0.005, zEnd]]} color="#eab308" lineWidth={2} transparent opacity={0.5} />
    );
  }

  return (
    <group>
      <mesh position={[cx, ZONE_Y + 0.002, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.1} />
      </mesh>
      <Line points={[[0, ZONE_Y + 0.006, zStart], [width, ZONE_Y + 0.006, zStart]]} color="#eab308" lineWidth={4} dashed={false} />
      {stripes}
      <Text position={[cx, ZONE_Y + 0.02, cz]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.5} color="#eab308" anchorX="center" anchorY="middle" fillOpacity={0.8}>
        ZONA DE PICKING PEATONAL (SIN GRÚAS)
      </Text>
    </group>
  );
}

function SacredCircle() {
  return (
    <group>
      {/* Highlighted Sacred Mutex Circle */}
      <mesh position={[PATIO_CENTER_X, 0.015, PATIO_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[TURNING_RADIUS - 0.2, TURNING_RADIUS, 64]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
      </mesh>
      <mesh position={[PATIO_CENTER_X, 0.01, PATIO_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[TURNING_RADIUS, 64]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.05} />
      </mesh>
      <Text position={[PATIO_CENTER_X, 0.05, PATIO_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1} color="#ef4444" anchorX="center" anchorY="middle" fillOpacity={0.5}>
        [ MUTEX ] GIRO CAMIONES
      </Text>
    </group>
  );
}

function PullZones() {
  const zones = [PULL_ZONE_NORTH, PULL_ZONE_SOUTH];
  const width = 30; // X from 65 to 95
  const cx = 80;

  return (
    <group>
      {zones.map((z, i) => {
        const depth = z.zMax - z.zMin;
        const cz = z.zMin + depth / 2;
        return (
          <group key={`pull-${i}`}>
            <mesh position={[cx, 0.02, cz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[width, depth]} />
              <meshBasicMaterial color={z.color} transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
            <Line
              points={[
                [cx - width/2, 0.03, z.zMin], [cx + width/2, 0.03, z.zMin],
                [cx + width/2, 0.03, z.zMax], [cx - width/2, 0.03, z.zMax], [cx - width/2, 0.03, z.zMin],
              ]}
              color={z.color} lineWidth={2} transparent opacity={0.8}
            />
            <Text position={[cx, 0.04, cz]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color={z.color} anchorX="center" anchorY="middle" fillOpacity={0.9}>
              {z.label} (ENCOLAMIENTO)
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export default function FloorMarkings() {
  return (
    <group>
      {/* Inside Bodega Grid and Rulers */}
      <ReferenceGrid />
      <RulerLabels />
      
      {/* Floor painted zones */}
      <FloorZone zone={ZONE_A} opacity={0.1} />
      <FloorZone zone={ZONE_B} opacity={0.06} />
      <FloorZone zone={ZONE_C} opacity={0.06} />
      <FloorZone zone={BATTERY_ZONE} opacity={0.3} />
      
      <FloorZone zone={STAGING_INBOUND} opacity={0.2} />
      <FloorZone zone={STAGING_OUTBOUND} opacity={0.2} />

      <DS43FloorLines />
      <AisleCorridors />
      <StagingFloors />
      
      {/* Master Doc Constrained Zones */}
      <PedestrianZone />
      <PullZones />
      <SacredCircle />

      {/* Free floating texts and labels across the whole site */}
      <GeneralTexts />
    </group>
  );
}
