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
import SafeZones from './SafeZones';
import YardSafety from './YardSafety';
import FloorPlanAnnotations from './FloorPlanAnnotations';
import Gates from './Gates';
import Truck from './Truck';
import AnimatedWorker from './AnimatedWorker';
import FloorMarkings from './FloorMarkings';
import BoundarySensors from './BoundarySensors';
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
  const { truckVisible, truckPosition, truckRotation, truckColor, truckStatus, truckSteeringAngle, truckDoorsOpen } = useSimulationStore();
  if (!truckVisible) return null;
  return (
    <Truck 
      position={truckPosition} 
      rotation={truckRotation} 
      color={truckColor} 
      status={truckStatus}
      steeringAngle={truckSteeringAngle}
      doorsOpen={truckDoorsOpen}
    />
  );
}

function SimulationWorker() {
  const { workerVisible, workerPosition, workerRotation, workerCarrying } = useSimulationStore();
  if (!workerVisible) return null;
  return (
    <AnimatedWorker 
      position={workerPosition} 
      rotation={workerRotation}
      isCarrying={workerCarrying}
    />
  );
}

function GatesContainer() {
  const { gateEntryOpen } = useSimulationStore();
  const entryRef = useRef();

  useLayoutEffect(() => {
    if (entryRef.current) {
      gsap.to(entryRef.current.position, {
        z: gateEntryOpen ? 10 : 0, // Desliza 10m para abrir
        duration: 2,
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
        <SafeZones />
        <YardSafety />
        <FloorPlanAnnotations />
        <GatesContainer />
        <BoundarySensors />
        <SimulationTruck />
        <SimulationWorker />
      </Suspense>
    </Canvas>
  );
}
