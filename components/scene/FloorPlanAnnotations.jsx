'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import useSimStore from '@/store/useSimStore';
import { BODEGA_WIDTH, BODEGA_DEPTH, BODEGA_ELEVATION, RESPEL_CENTER_X, RESPEL_CENTER_Z } from '@/lib/constants';

function Compass({ position }) {
  return (
    <group position={position}>
      {/* North Arrow */}
      <mesh rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 1.2, 4]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.6, 0]}>
        <coneGeometry args={[0.3, 1.2, 4]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      <Text position={[0, 1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.6} color="#333">N</Text>
    </group>
  );
}

function ZoneLabel({ position, name, color, width = 6, depth = 3 }) {
  return (
    <group position={position}>
      {/* Background rectangle with transparency and zone color */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Border (Thin) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, depth)]} />
        <lineBasicMaterial color={color} />
      </mesh>
      {/* Text Label - Elevated for visibility */}
      <group position={[0, 5, 0]}>
        <Text 
          rotation={[-Math.PI / 2, 0, 0]} 
          fontSize={Math.min(width, depth) * 0.2 + 0.5} 
          color="#1e293b" 
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
    </group>
  );
}

function ScaleBar({ position }) {
  const segments = [0, 5, 10, 15, 20];
  return (
    <group position={position}>
      {/* 20m scale bar with alternating segments */}
      {segments.slice(0, -1).map((m, i) => (
        <mesh key={`seg-${m}`} position={[m + 2.5, 0, 0]}>
          <boxGeometry args={[5, 0.15, 0.1]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#333" : "#fff"} />
        </mesh>
      ))}
      {segments.map(m => (
        <Text key={`label-${m}`} position={[m, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#333">
          {m}m
        </Text>
      ))}
    </group>
  );
}

export default function FloorPlanAnnotations() {
  const viewMode = useSimStore(s => s.viewMode);
  const is2D = viewMode === '2d';

  if (!is2D) return null;

  return (
    <group position={[0, BODEGA_ELEVATION + 0.1, 0]} renderOrder={100}>
      {/* 1. Zonas de Racks (Basado en RacksLayout.jsx) */}
      <ZoneLabel 
        position={[45.35, 0, 25]} 
        name="ZONA A: DINÁMICOS" 
        color="#1E88E5" 
        width={8.7} 
        depth={25.2} 
      />
      <ZoneLabel 
        position={[32.3, 0, 25]} 
        name="ZONA B: SELECTIVOS DP" 
        color="#FBC02D" 
        width={17.4} 
        depth={25.2} 
      />
      <ZoneLabel 
        position={[14.9, 0, 25]} 
        name="ZONA C: SELECTIVOS SP" 
        color="#ef4444" 
        width={17.4} 
        depth={25.2} 
      />

      {/* 2. Zonas Especiales Bodega */}
      <ZoneLabel 
        position={[10, 0, 1.5]} 
        name="INFLAMABLES DS43" 
        color="#ef4444" 
        width={20} 
        depth={3} 
      />
      <ZoneLabel 
        position={[5, 0, 46]} 
        name="CARGA BATERÍAS" 
        color="#FDE68A" 
        width={10} 
        depth={8} 
      />

      {/* 3. Zonas Logísticas (X: 50-60) */}
      <ZoneLabel 
        position={[55, 0, 20]} 
        name="STAGING INBOUND" 
        color="#93C5FD" 
        width={10} 
        depth={20} 
      />
      <ZoneLabel 
        position={[55, 0, 40]} 
        name="STAGING OUTBOUND" 
        color="#86EFAC" 
        width={10} 
        depth={20} 
      />
      <ZoneLabel 
        position={[55, 0, 2.5]} 
        name="ADMINISTRACIÓN" 
        color="#f8fafc" 
        width={10} 
        depth={5} 
      />

      {/* 4. Exterior y Patio */}
      <ZoneLabel 
        position={[80, 0, 25]} 
        name="PATIO DE MANIOBRAS" 
        color="#475569" 
        width={40} 
        depth={50} 
      />
      <ZoneLabel 
        position={[90, 0, 5]} 
        name="SALA RESPEL" 
        color="#b91c1c" 
        width={8} 
        depth={5} 
      />
      <ZoneLabel 
        position={[96, 0, 40]} 
        name="ROMANA DE PESAJE" 
        color="#475569" 
        width={3} 
        depth={18} 
      />
      <ZoneLabel 
        position={[62, 0, 20]} 
        name="MUELLE CARGA" 
        color="#3B82F6" 
        width={4} 
        depth={4} 
      />
      <ZoneLabel 
        position={[62, 0, 30]} 
        name="MUELLE DESCARGA" 
        color="#10B981" 
        width={4} 
        depth={4} 
      />

      <ZoneLabel 
        position={[100, 0, 25]} 
        name="PORTÓN PRINCIPAL" 
        color="#3B82F6" 
        width={1} 
        depth={10} 
      />

      {/* 5. Otros Elementos Técnicos */}
      <Compass position={[105, 0, 5]} />
      <ScaleBar position={[80, 0, 55]} />

      {/* Physical Legend (Static Position) */}
      <group position={[-15, 0, 30]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[4, -4, -0.01]}>
          <planeGeometry args={[12, 10]} />
          <meshBasicMaterial color="#fff" side={THREE.DoubleSide} />
        </mesh>
        <Text position={[0, 0, 0]} fontSize={0.8} color="#333" anchorX="left" fontWeight="bold">LEYENDA TÉCNICA</Text>
        <group position={[0, -1.5, 0]}>
          <mesh position={[0.4, 0, 0]}><planeGeometry args={[0.8, 0.4]}/><meshBasicMaterial color="#ef4444"/></mesh>
          <Text position={[1.5, 0, 0]} fontSize={0.4} color="#333" anchorX="left">EXTINTORES / RED HÚMEDA</Text>
        </group>
        <group position={[0, -2.5, 0]}>
          <mesh position={[0.4, 0, 0]}><planeGeometry args={[0.8, 0.4]}/><meshBasicMaterial color="#22c55e"/></mesh>
          <Text position={[1.5, 0, 0]} fontSize={0.4} color="#333" anchorX="left">DUCHAS / LAVAOJOS</Text>
        </group>
        <group position={[0, -3.5, 0]}>
          <mesh position={[0.4, 0, 0]}><planeGeometry args={[0.8, 0.4]}/><meshBasicMaterial color="#3b82f6"/></mesh>
          <Text position={[1.5, 0, 0]} fontSize={0.4} color="#333" anchorX="left">DRENAJE / CANALETA</Text>
        </group>
        <group position={[0, -4.5, 0]}>
          <mesh position={[0.4, 0, 0]}><planeGeometry args={[0.8, 0.4]}/><meshBasicMaterial color="#facc15"/></mesh>
          <Text position={[1.5, 0, 0]} fontSize={0.4} color="#333" anchorX="left">KITS ANTIDERRAME</Text>
        </group>
      </group>
    </group>
  );
}
