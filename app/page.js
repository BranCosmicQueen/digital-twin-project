'use client';

import { KeyboardControls } from '@react-three/drei';
import dynamic from 'next/dynamic';
import useSimStore from '@/store/useSimStore';

import FloatingControls from '@/components/ui/FloatingControls';
import TechnicalLegend from '@/components/ui/TechnicalLegend';
const Scene = dynamic(() => import('@/components/scene/Scene'), { ssr: false });

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export default function Home() {
  const { uiVisible, viewMode } = useSimStore();

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

          {/* Technical Legend Overlay */}
          <TechnicalLegend />

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

