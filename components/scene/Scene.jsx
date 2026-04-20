'use client';

import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import CameraController from './CameraController';
import Warehouse from './Warehouse';
import { COLORS } from '@/lib/constants';

// ══════════════════════════════════════════════════════════════════
// HARD RESET — Scene: Lienzo en blanco con esqueleto de bodega
// ══════════════════════════════════════════════════════════════════

// Sets Three.js scene background to match the light gray canvas
function SceneBackground() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(COLORS.background);
  }, [scene]);
  return null;
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
      tabIndex={0}
    >
      {/* Set scene background color */}
      <SceneBackground />

      {/* Clean, uniform lighting — no shadows for skeleton mode */}
      <ambientLight intensity={0.9} color="#ffffff" />
      <directionalLight position={[30, 50, 25]} intensity={0.5} color="#ffffff" />

      {/* No fog — full visibility for dimensional validation */}

      {/* Camera */}
      <CameraController />

      <Suspense fallback={null}>
        <Warehouse />
      </Suspense>
    </Canvas>
  );
}
