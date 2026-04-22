'use client';

import { KeyboardControls } from '@react-three/drei';
import dynamic from 'next/dynamic';
import useSimStore from '@/store/useSimStore';

import FloatingControls from '@/components/ui/FloatingControls';
const Scene = dynamic(() => import('@/components/scene/Scene'), { ssr: false });

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export default function Home() {
  const { uiVisible } = useSimStore();

  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ background: '#F3F4F6' }}>
      <KeyboardControls map={keyboardMap}>
        <Scene />
      </KeyboardControls>

      {/* Unified minimalist controls (Google Maps Style) */}
      <FloatingControls />

      {/* Toggleable Overlays */}
      {uiVisible && (
        <>
          {/* Header Title */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 10,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: 10,
              padding: '8px 16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', letterSpacing: '0.04em' }}>
              GEMELO DIGITAL ESMAX — PLANTA MAIPÚ
            </span>
          </div>

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
              maxWidth: 240,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 11, color: '#6B7280', letterSpacing: '0.05em', borderBottom: '1px solid #eee', paddingBottom: 4 }}>
              LEYENDA LOGÍSTICA
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-300" />
              <span>Zona Recepción</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-300" />
              <span>Zona Despacho</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-300" />
              <span>Zona A (Dinámico)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-300" />
              <span>Zona B (Selectivo)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
              <span>DS 43 — Inflamables</span>
            </div>
          </div>

          {/* Scale reference */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              right: 80,
              zIndex: 10,
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(4px)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 10,
              color: '#9CA3AF',
              fontWeight: 600,
            }}
          >
            📏 1m = 1u
          </div>
        </>
      )}
    </main>
  );
}

