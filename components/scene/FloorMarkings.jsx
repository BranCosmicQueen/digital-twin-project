import { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Line, Html } from '@react-three/drei';
import useSimStore from '@/store/useSimStore';
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
  ROMANA_WIDTH,
  ROMANA_DEPTH,
  GLASS_STYLE
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

function RulerLabels({ is2D }) {
  if (!is2D) return null;
  const horizontal = [];
  for (let x = 0; x <= 100; x += 10) {
    horizontal.push({ text: `${x}m`, position: [x, ZONE_Y + 0.05, -2] });
  }
  const vertical = [];
  for (let z = 10; z <= 50; z += 10) {
    vertical.push({ text: `${z}m`, position: [-2, ZONE_Y + 0.05, z] });
  }

  return (
    <group>
      {[...horizontal, ...vertical].map((lbl, i) => (
        <Text
          key={`ruler-${i}`}
          position={lbl.position}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={1.2}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {lbl.text}
        </Text>
      ))}
    </group>
  );
}

function FloorZone({ zone, opacity = 0.25, is2D }) {
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
    </group>
  );
}

function DS43FloorLines({ is2D }) {
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
    </group>
  );
}

function GeneralTexts({ is2D }) {
  if (!is2D) return null;
  const labels = [
    { text: 'STA. ADELA', position: [GATE_X + CALLE_ADELA_WIDTH / 2, 0.1, 25], fontSize: 2.5, color: '#94a3b8', rotation: [-Math.PI / 2, 0, Math.PI / 2] },
    { text: '← 60m (BODEGA) →', position: [30, ZONE_Y + 0.05, -5], fontSize: 2, color: '#334155', rotation: [-Math.PI / 2, 0, 0] },
    { text: '← 40m (PATIO DE MANIOBRAS) →', position: [80, ZONE_Y + 0.05, -5], fontSize: 2, color: '#334155', rotation: [-Math.PI / 2, 0, 0] },
    { text: '← 100m (BASE TOTAL) →', position: [60, ZONE_Y + 0.05, 54], fontSize: 2.5, color: '#1e293b', rotation: [-Math.PI / 2, 0, 0] },
  ];

  return (
    <group>
      {labels.map((lbl, i) => (
        <Text
          key={i}
          position={lbl.position}
          rotation={lbl.rotation}
          fontSize={lbl.fontSize}
          color={lbl.color}
          anchorX="center"
          anchorY="middle"
          depthOffset={-1}
        >
          {lbl.text}
        </Text>
      ))}
    </group>
  );
}

function AisleCorridors({ is2D }) {
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
        </group>
      ))}
    </group>
  );
}

function PedestrianZone({ is2D }) {
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
  const setHoveredItem = useSimStore(s => s.setHoveredItem);

  return (
    <group onPointerOut={() => setHoveredItem(null)}>
      {/* Invisible Hover Trigger */}
      <mesh 
        position={[cx, ZONE_Y + 0.3, cz]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (is2D) setHoveredItem('ZONA PEATONAL / SALIDA DE EMERGENCIA');
        }}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function SacredCircle({ is2D }) {
  const setHoveredItem = useSimStore(s => s.setHoveredItem);
  return (
    <group onPointerOut={() => setHoveredItem(null)}>
      {/* Highlighted Sacred Mutex Circle */}
      <mesh 
        position={[PATIO_CENTER_X, 0.015, PATIO_CENTER_Z]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => is2D && setHoveredItem('RADIO DE GIRO REGLAMENTARIO (25m)')}
      >
        <ringGeometry args={[TURNING_RADIUS - 0.2, TURNING_RADIUS, 64]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
      </mesh>
      <mesh position={[PATIO_CENTER_X, 0.01, PATIO_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[TURNING_RADIUS, 64]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

function PullZones({ is2D }) {
  const zones = [PULL_ZONE_NORTH, PULL_ZONE_SOUTH];
  const width = 20; // Ajustado para evitar tope con Canaleta API (X:60) y RESPEL (X:90)
  const cx = 75;    // Posición segura: X=65 a X=85

  return (
    <group onPointerOut={() => setHoveredItem(null)}>
      {zones.map((z, i) => {
        const depth = z.zMax - z.zMin;
        const cz = z.zMin + depth / 2;
        return (
          <group key={`pull-${i}`}>
            <mesh 
              position={[cx, 0.02, cz]} 
              rotation={[-Math.PI / 2, 0, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (is2D) setHoveredItem(`ZONA DE ESPERA CAMIONES (PULL ZONE ${i === 0 ? 'NORTE' : 'SUR'})`);
              }}
            >
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
          </group>
        );
      })}
    </group>
  );
}

function RomanaMarkings({ is2D }) {
  const cx = ROMANA_X;
  const cz = ROMANA_Z;
  const halfW = ROMANA_WIDTH / 2;
  const halfD = ROMANA_DEPTH / 2;
  const setHoveredItem = useSimStore(s => s.setHoveredItem);

  return (
    <group onPointerOut={() => setHoveredItem(null)}>
      {/* Hitbox para Hover Romana */}
      <mesh 
        position={[cx, 0.05, cz]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (is2D) setHoveredItem('ROMANA DE PESAJE CERTIFICADA');
        }}
      >
        <planeGeometry args={[ROMANA_WIDTH + 1, ROMANA_DEPTH + 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Perimeter safety lines around the weighbridge */}
      <Line
        points={[
          [cx - halfW - 0.5, 0.02, cz - halfD - 0.5],
          [cx + halfW + 0.5, 0.02, cz - halfD - 0.5],
          [cx + halfW + 0.5, 0.02, cz + halfD + 0.5],
          [cx - halfW - 0.5, 0.02, cz + halfD + 0.5],
          [cx - halfW - 0.5, 0.02, cz - halfD - 0.5],
        ]}
        color="#f59e0b"
        lineWidth={1.5}
        transparent
        opacity={0.4}
      />
    </group>
  );
}

export default function FloorMarkings() {
  const viewMode = useSimStore(s => s.viewMode);
  const is2D = viewMode === '2d';

  return (
    <group>
      <ReferenceGrid />
      <RulerLabels is2D={is2D} />
      <GeneralTexts is2D={is2D} />
      <SacredCircle is2D={is2D} />
      <RomanaMarkings is2D={is2D} />
      <PedestrianZone is2D={is2D} />
      <AisleCorridors is2D={is2D} />
      <PullZones is2D={is2D} />
    </group>
  );
}
