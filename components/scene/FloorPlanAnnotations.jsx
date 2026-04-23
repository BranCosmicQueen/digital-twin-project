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

function ZoneLabel({ position, name, color }) {
  return (
    <group position={position}>
      {/* Background square with transparency and zone color */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.9, 3, 4]} rotation={[0, 0, Math.PI / 4]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Text */}
      <Text position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.2} color="#333" fontWeight="bold">
        {name}
      </Text>
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
    <group position={[0, BODEGA_ELEVATION + 0.5, 0]} renderOrder={100}>
      {/* Labels for Zones - Simplified names */}
      <Text position={[10, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#333">
        DS 43 INFLAMABLES
      </Text>
      <Text position={[5, 0, 48]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#333">
        CARGA BATERÍAS
      </Text>

      {/* Racks Zone Labels with Backgrounds */}
      <ZoneLabel position={[45, 0, 25]} name="ZONA A" color="#1E88E5" />
      <ZoneLabel position={[30.75, 0, 25]} name="ZONA B" color="#FBC02D" />
      <ZoneLabel position={[15.25, 0, 25]} name="ZONA C" color="#ef4444" />

      {/* Yard and Logistics */}
      <Text position={[80, 0, 25]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.5} color="#333">
        PATIO DE MANIOBRAS
      </Text>
      <Text position={[100, 0, 40]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#333">
        BLOQUE ADMINISTRATIVO
      </Text>
      <Text position={[90, 0, 9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#333">
        SALA RESPEL
      </Text>
      <Text position={[96, 0, 48]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#333">
        ROMANA
      </Text>

      {/* Technical Elements */}
      <Compass position={[95, 0, 55]} />
      <ScaleBar position={[70, 0, 59]} />

      {/* Physical Legend on Canvas - Physical Print style */}
      <group position={[-15, 0, 30]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[4, -4, -0.01]}>
          <planeGeometry args={[12, 10]} />
          <meshBasicMaterial color="#fff" side={THREE.DoubleSide} />
        </mesh>
        <Text position={[0, 0, 0]} fontSize={0.8} color="#333" anchorX="left" fontWeight="bold">LEYENDA DE PLANO</Text>
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
          <Text position={[1.5, 0, 0]} fontSize={0.4} color="#333" anchorX="left">DRENAJE API / CANALETA</Text>
        </group>
        <group position={[0, -4.5, 0]}>
          <mesh position={[0.4, 0, 0]}><planeGeometry args={[0.8, 0.4]}/><meshBasicMaterial color="#facc15"/></mesh>
          <Text position={[1.5, 0, 0]} fontSize={0.4} color="#333" anchorX="left">KITS ANTIDERRAME</Text>
        </group>
      </group>
    </group>
  );
}
