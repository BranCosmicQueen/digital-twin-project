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
              top: 24,
              left: 24,
              zIndex: 9999,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 12,
              padding: '10px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.04em' }}>
              GEMELO DIGITAL ESMAX — PLANTA MAIPÚ
            </span>
          </div>

          {/* Technical Legend Overlay */}
          <TechnicalLegend />

          {/* Scale reference */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: 88,
              zIndex: 9999,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 11,
              color: '#64748b',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            📏 1m = 1u
          </div>
        </>
      )}
    </main>
  );
}

