'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import useSimStore from '@/store/useSimStore';
import { BODEGA_WIDTH, BODEGA_DEPTH, BODEGA_ELEVATION, RESPEL_CENTER_X, RESPEL_CENTER_Z, GLASS_STYLE } from '@/lib/constants';

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
      <Html center position={[0, 1.2, 0]}>
        <div style={{ ...GLASS_STYLE, padding: '4px 8px', borderRadius: '4px' }}>N</div>
      </Html>
    </group>
  );
}

function ZoneLabel({ position, name, color }) {
  return (
    <group position={position}>
      <Html center position={[0, 0, 0]}>
        <div style={{ ...GLASS_STYLE, borderLeft: `4px solid ${color}`, paddingLeft: '10px' }}>
          {name}
        </div>
      </Html>
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
      <Html position={[10, 0.8, 0]} center>
        <div style={{ ...GLASS_STYLE, fontSize: '10px', padding: '2px 8px' }}>ESCALA GRÁFICA (METROS)</div>
      </Html>
    </group>
  );
}

export default function FloorPlanAnnotations() {
  const viewMode = useSimStore(s => s.viewMode);
  const is2D = viewMode === '2d';

  if (!is2D) return null;

  return (
    <group position={[0, BODEGA_ELEVATION + 0.5, 0]} renderOrder={100}>
      {/* Labels for Zones */}
      <Html position={[10, 0, 1.5]} center>
        <div style={GLASS_STYLE}>DS 43 INFLAMABLES</div>
      </Html>


      {/* Racks Zone Labels */}
      <ZoneLabel position={[45, 0, 25]} name="ZONA A" color="#1E88E5" />
      <ZoneLabel position={[30.75, 0, 25]} name="ZONA B" color="#FBC02D" />
      <ZoneLabel position={[15.25, 0, 25]} name="ZONA C" color="#ef4444" />

      {/* Yard and Logistics */}
      <Html position={[80, 0, 25]} center>
        <div style={{ ...GLASS_STYLE, fontSize: '16px', padding: '10px 20px' }}>PATIO DE MANIOBRAS</div>
      </Html>

      <Html position={[90, 0, 9]} center>
        <div style={GLASS_STYLE}>SALA RESPEL</div>
      </Html>
      <Html position={[96, 0, 48]} center>
        <div style={GLASS_STYLE}>ROMANA</div>
      </Html>

      {/* Technical Elements */}
      <Compass position={[95, 0, 55]} />
      <ScaleBar position={[70, 0, 59]} />

      {/* Physical Legend replaced with Modern Glass Legend */}
      <Html position={[-15, 0, 30]} center>
        <div style={{ 
          ...GLASS_STYLE, 
          display: 'flex',
          flexDirection: 'column', 
          alignItems: 'flex-start', 
          padding: '20px', 
          gap: '12px',
          width: '220px'
        }}>
          <div style={{ fontWeight: 800, marginBottom: '4px', color: '#1e293b' }}>LEYENDA DE PLANO</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '16px', height: '8px', background: '#ef4444', borderRadius: '2px' }} />
            <span style={{ fontSize: '11px' }}>EXTINTORES / RED HÚMEDA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '16px', height: '8px', background: '#22c55e', borderRadius: '2px' }} />
            <span style={{ fontSize: '11px' }}>DUCHAS / LAVAOJOS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '16px', height: '8px', background: '#3b82f6', borderRadius: '2px' }} />
            <span style={{ fontSize: '11px' }}>DRENAJE API / CANALETA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '16px', height: '8px', background: '#facc15', borderRadius: '2px' }} />
            <span style={{ fontSize: '11px' }}>KITS ANTIDERRAME</span>
          </div>
          
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
            PLANO TÉCNICO V1.2
          </div>
        </div>
      </Html>
    </group>
  );
}
