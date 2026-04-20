'use client';

import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import CameraController from './CameraController';
import Warehouse from './Warehouse';
import Terrain from './Terrain';
import Docks from './Docks';
import Weighbridge from './Weighbridge';
import RespelZone from './RespelZone';
import Gates from './Gates';
import Truck from './Truck';
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
        {/* Environmental Foundation */}
        <Terrain />

        {/* Indoor Logic (Warehouse X: 0-60) */}
        <Warehouse />

        {/* Outdoor Logic (Patio X: 60-100) */}
        <Docks />
        <Weighbridge />
        <RespelZone />
        <Gates />

        {/* Operational Vehicles (Camiones) */}
        {/* Truck 1: Entering via North Portón */}
        <Truck 
          position={[110, 0, 5]} 
          rotation={[0, -Math.PI / 2, 0]} 
          color="#be123c" 
        />
        
        {/* Truck 2: Docked at Muelle 2 */}
        <Truck 
          position={[68, 0, 19]} 
          rotation={[0, Math.PI / 2, 0]} 
          color="#1e293b" 
        />

        {/* Industrial Lighting Posts */}
        {[70, 90, 105].map((x) => (
          <group key={x}>
            {/* North side lights */}
            <mesh position={[x, 4, 1]}>
              <cylinderGeometry args={[0.1, 0.1, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[x, 8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.3, 0.3, 1]} />
              <meshStandardMaterial color="#ffffff" emissive="#fef3c7" emissiveIntensity={1} />
            </mesh>
            
            {/* South side lights */}
            <mesh position={[x, 4, 49]}>
              <cylinderGeometry args={[0.1, 0.1, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[x, 8, 48.5]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.3, 0.3, 1]} />
              <meshStandardMaterial color="#ffffff" emissive="#fef3c7" emissiveIntensity={1} />
            </mesh>
          </group>
        ))}
      </Suspense>
    </Canvas>
  );
}
