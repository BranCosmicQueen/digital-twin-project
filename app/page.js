'use client';

import { KeyboardControls } from '@react-three/drei';
import dynamic from 'next/dynamic';
import useSimStore from '@/store/useSimStore';

const Scene = dynamic(() => import('@/components/scene/Scene'), { ssr: false });

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export default function Home() {
  const viewMode = useSimStore((s) => s.viewMode);
  const toggleView = useSimStore((s) => s.toggleView);

  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ background: '#F3F4F6' }}>
      {/* 3D Canvas with Keyboard Support */}
      <KeyboardControls map={keyboardMap}>
        <Scene />
      </KeyboardControls>

      {/* Minimal overlay: View Toggle + Title */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: 10,
            padding: '8px 16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', letterSpacing: '0.02em' }}>
            ESQUELETO BODEGA — VALIDACIÓN DIMENSIONAL
          </span>
        </div>
      </div>

      {/* View toggle button */}
      <button
        onClick={toggleView}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          background: viewMode === '2d' ? '#3B82F6' : '#6B7280',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          transition: 'all 0.2s ease',
          letterSpacing: '0.03em',
        }}
      >
        {viewMode === '2d' ? '🔍 CAMBIAR A 3D' : '📐 VISTA CENITAL 2D'}
      </button>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 10,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          fontSize: 11,
          color: '#374151',
          lineHeight: 1.8,
          maxWidth: 260,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12, letterSpacing: '0.02em' }}>
          LEYENDA — ZONAS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#93C5FD' }} />
          Staging Inbound (X: 50–60, Z: 10–30)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#86EFAC' }} />
          Staging Outbound (X: 50–60, Z: 30–50)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#7DD3FC' }} />
          Zona A — Racks Dinámicos (X: 40–50)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#FCD34D' }} />
          Zona B — Selectivos Doble Prof. (X: 20–40)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#D1D5DB' }} />
          Zona C — Almacenamiento a Piso (X: 0–20)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#FCA5A5', border: '1px solid #EF4444' }} />
          DS 43 — Inflamables
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 3, borderRadius: 1, background: '#FDE68A' }} />
          Pasillos 2.8m (Grúas Retráctiles)
        </div>
      </div>

      {/* Scale reference */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 10,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: 10,
          padding: '8px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          fontSize: 11,
          color: '#6B7280',
          fontWeight: 500,
        }}
      >
        📏 1 unidad = 1 metro &nbsp;|&nbsp; Nave: 60m × 50m × 12m &nbsp;|&nbsp; Losa: Y=1.2m
      </div>
    </main>
  );
}
