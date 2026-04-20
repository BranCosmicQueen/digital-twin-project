'use client';

import { Suspense, useEffect, useRef, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

import CameraController from './CameraController';
import Warehouse from './Warehouse';
import Terrain from './Terrain';
import Docks from './Docks';
import Weighbridge from './Weighbridge';
import RespelZone from './RespelZone';
import Gates from './Gates';
import Truck from './Truck';
import SimulationManager from './SimulationManager';
import SimulationUI from '../ui/SimulationUI';
import { useSimulationStore } from '@/lib/store';
import { COLORS, BODEGA_ELEVATION } from '@/lib/constants';

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

// ── Helpers para conectar el Store con la Escena ──
function SimulationTruck() {
  const { truckVisible, truckPosition, truckRotation, truckColor } = useSimulationStore();
  if (!truckVisible) return null;
  return (
    <Truck 
      position={truckPosition} 
      rotation={truckRotation} 
      color={truckColor} 
    />
  );
}

function GatesContainer() {
  const { gateEntryOpen, gateExitOpen } = useSimulationStore();
  const entryRef = useRef();
  const exitRef = useRef();

  // Animación suave de los portones basado en el estado
  useLayoutEffect(() => {
    if (entryRef.current) {
      gsap.to(entryRef.current.position, {
        y: gateEntryOpen ? 5 + 3 : 5, // Sube para abrir
        duration: 1,
        ease: 'power2.inOut'
      });
    }
  }, [gateEntryOpen]);

  useLayoutEffect(() => {
    if (exitRef.current) {
      gsap.to(exitRef.current.position, {
        y: gateExitOpen ? 5 + 3 : 5,
        duration: 1,
        ease: 'power2.inOut'
      });
    }
  }, [gateExitOpen]);

  return <Gates inboundGateRef={entryRef} outboundGateRef={exitRef} />;
}

export default function Scene() {
  return (
    <>
      <SimulationUI />
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
      <ambientLight intensity={1.1} color="#ffffff" />
      <directionalLight position={[30, 50, 25]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[100, 30, 25]} intensity={0.5} color="#cbd5e1" />

      {/* No fog — full visibility for dimensional validation */}

      {/* Camera */}
      <CameraController />

      <Suspense fallback={null}>
        {/* Environmental Foundation */}
        <Terrain />

        {/* Indoor Logic (Warehouse X: 0-60) */}
        <Warehouse />

        {/* --- Simulation Logic & Manager --- */}
        <SimulationManager />

        {/* Outdoor Logic (Patio X: 60-100) */}
        <Docks />
        <Weighbridge />
        <RespelZone />
        
        {/* State-driven automated Gates */}
        <GatesContainer />

        {/* State-driven Simulation Truck */}
        <SimulationTruck />

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
    </>
  );
}
