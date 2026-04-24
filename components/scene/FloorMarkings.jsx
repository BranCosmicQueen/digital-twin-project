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
  const labels = [
    { text: '0m', position: [0, ZONE_Y + 0.02, -1.5] },
    { text: '10m', position: [10, ZONE_Y + 0.02, -1.5] },
    { text: '20m', position: [20, ZONE_Y + 0.02, -1.5] },
    { text: '30m', position: [30, ZONE_Y + 0.02, -1.5] },
    { text: '40m', position: [40, ZONE_Y + 0.02, -1.5] },
    { text: '50m', position: [50, ZONE_Y + 0.02, -1.5] },
    { text: '60m', position: [60, ZONE_Y + 0.02, -1.5] },
    { text: '0m', position: [-1.8, ZONE_Y + 0.02, 0] },
    { text: '10m', position: [-1.8, ZONE_Y + 0.02, 10] },
    { text: '20m', position: [-1.8, ZONE_Y + 0.02, 20] },
    { text: '30m', position: [-1.8, ZONE_Y + 0.02, 30] },
    { text: '40m', position: [-1.8, ZONE_Y + 0.02, 40] },
    { text: '50m', position: [-1.8, ZONE_Y + 0.02, 50] },
  ];

  return (
    <group>
      {labels.map((lbl, i) => (
        <Html key={`ruler-${i}`} position={lbl.position} center>
          <div style={{ ...GLASS_STYLE, fontSize: '9px', padding: '2px 4px', background: 'transparent', border: 'none', boxShadow: 'none', color: '#64748b' }}>
            {lbl.text}
          </div>
        </Html>
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
      {is2D && (
        <Html position={[cx, ZONE_Y + 0.02, cz]} center>
          <div style={{ ...GLASS_STYLE, borderLeft: `3px solid ${zone.color}` }}>
            {zone.label}
          </div>
        </Html>
      )}
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
      {is2D && (
        <Html position={[cx, ZONE_Y + 0.03, zone.zMax + 1]} center>
          <div style={{ ...GLASS_STYLE, fontSize: '9px', color: zone.borderColor }}>PRETIL 0.2m</div>
        </Html>
      )}
    </group>
  );
}

function GeneralTexts({ is2D }) {
  if (!is2D) return null;
  const labels = [
    { text: 'STA. ADELA', position: [GATE_X + CALLE_ADELA_WIDTH / 2, 0.2, 25], fontSize: 2, color: '#ffffff', opacity: 0.5, rotationZ: Math.PI / 2 },
    { text: 'PORTÓN ACCESO', position: [102, 0.05, GATE_MAIN_Z], fontSize: 1, color: COLORS.gateEntry, opacity: 1 },
    { text: '← 60m (BODEGA) →', position: [30, ZONE_Y + 0.02, -3.5], fontSize: 1.2, color: '#374151', opacity: 0.8 },
    { text: '← 100m (BASE TOTAL) →', position: [50, ZONE_Y + 0.02, -7], fontSize: 1.5, color: '#1f2937', opacity: 0.9 },
    { text: 'INBOUND', position: [65, 0.02, 30], fontSize: 1.2, color: COLORS.accentInbound, opacity: 0.8 },
    { text: 'OUTBOUND', position: [65, 0.02, 20], fontSize: 1.2, color: COLORS.accentOutbound, opacity: 0.8 },
  ];

  return (
    <group>
      {labels.map((lbl, i) => (
        <Html key={i} position={lbl.position} center>
          <div style={{ 
            ...GLASS_STYLE, 
            transform: lbl.rotationZ ? `rotate(${lbl.rotationZ}rad)` : 'none',
            fontSize: lbl.text.includes('100m') ? '14px' : '11px',
            background: lbl.text.includes('STA. ADELA') ? 'rgba(30, 41, 59, 0.6)' : GLASS_STYLE.background,
            color: lbl.text.includes('STA. ADELA') ? '#fff' : GLASS_STYLE.color,
            borderColor: lbl.color || GLASS_STYLE.borderColor
          }}>
            {lbl.text}
          </div>
        </Html>
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
          {is2D && (
            <Html position={[25, ZONE_Y + 0.02, aisle.cz]} center>
              <div style={{ ...GLASS_STYLE, fontSize: '10px', color: '#92400e', background: 'rgba(254, 243, 199, 0.4)' }}>{aisle.label}</div>
            </Html>
          )}
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

  return (
    <group>
      <mesh position={[cx, ZONE_Y + 0.002, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.1} />
      </mesh>
      <Line points={[[0, ZONE_Y + 0.006, zStart], [width, ZONE_Y + 0.006, zStart]]} color="#eab308" lineWidth={4} dashed={false} />
      {stripes}
      {is2D && (
        <Html position={[cx, ZONE_Y + 0.02, cz]} center>
          <div style={{ ...GLASS_STYLE, background: 'rgba(254, 240, 138, 0.4)', color: '#854d0e' }}>ZONA DE PICKING PEATONAL (SIN GRÚAS)</div>
        </Html>
      )}
    </group>
  );
}

function SacredCircle({ is2D }) {
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
      {is2D && (
        <Html position={[PATIO_CENTER_X, 0.05, PATIO_CENTER_Z]} center>
          <div style={{ ...GLASS_STYLE, color: '#b91c1c', background: 'rgba(254, 226, 226, 0.4)' }}>[ MUTEX ] GIRO CAMIONES</div>
        </Html>
      )}
    </group>
  );
}

function PullZones({ is2D }) {
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
            {is2D && (
              <Html position={[cx, 0.04, cz]} center>
                <div style={{ ...GLASS_STYLE, color: z.color }}>{z.label} (ENCOLAMIENTO)</div>
              </Html>
            )}
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

  return (
    <group>
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
      {/* Dimension Label */}
      {is2D && (
        <Html position={[cx, 0.05, cz + halfD + 2]} center>
          <div style={{ ...GLASS_STYLE, color: '#b45309', background: 'rgba(255, 251, 235, 0.4)' }}>ROMANA PESANE [ 18.0m ]</div>
        </Html>
      )}
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
    </group>
  );
}
