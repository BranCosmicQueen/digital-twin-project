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
import FloorMarkings from './FloorMarkings';
import SimulationManager from './SimulationManager';
import { useSimulationStore } from '@/lib/store';
import { COLORS, BODEGA_ELEVATION } from '@/lib/constants';

// Sets Three.js scene background
function SceneBackground() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(COLORS.background);
  }, [scene]);
  return null;
}

// Helpers to connect Store with Scene
function SimulationTruck() {
  const { truckVisible, truckPosition, truckRotation, truckColor, truckStatus } = useSimulationStore();
  if (!truckVisible) return null;
  return (
    <Truck 
      position={truckPosition} 
      rotation={truckRotation} 
      color={truckColor} 
      status={truckStatus}
    />
  );
}

function GatesContainer() {
  const { gateEntryOpen } = useSimulationStore();
  const entryRef = useRef();

  useLayoutEffect(() => {
    if (entryRef.current) {
      gsap.to(entryRef.current.position, {
        y: gateEntryOpen ? 5 + 3 : 5,
        duration: 1,
        ease: 'power2.inOut'
      });
    }
  }, [gateEntryOpen]);

  return <Gates inboundGateRef={entryRef} />;
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
      <SceneBackground />
      <ambientLight intensity={1.1} color="#ffffff" />
      <directionalLight position={[30, 50, 25]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[100, 30, 25]} intensity={0.5} color="#cbd5e1" />

      <CameraController />

      <Suspense fallback={null}>
        <Terrain />
        <FloorMarkings />
        <Warehouse />
        <SimulationManager />
        <Docks />
        <Weighbridge />
        <RespelZone />
        <GatesContainer />
        <SimulationTruck />
        
        {/* I'll leave the lighting posts logic as it was if it was there */}
        {[70, 90, 105].map((x) => (
          <group key={x}>
            <mesh position={[x, 4, 1]}>
              <cylinderGeometry args={[0.1, 0.1, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[x, 8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.3, 0.3, 1]} />
              <meshStandardMaterial color="#ffffff" emissive="#fef3c7" emissiveIntensity={1} />
            </mesh>
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
