'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { BODEGA_WIDTH, BODEGA_DEPTH, BODEGA_ELEVATION } from '@/lib/constants';

function InstancedElements({ positions, geom, color, scale = [1,1,1] }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.scale.set(...scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy, scale]);

  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length]}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </instancedMesh>
  );
}

export default function EmergencySystems() {
  const elements = useMemo(() => {
    const data = {
      extinguishers: [],
      spillKits: [],
      showers: [],
      lights: [],
    };

    // 1. Extintores (Cada 15m por el perímetro)
    for (let x = 0; x <= BODEGA_WIDTH; x += 15) {
      data.extinguishers.push([x, BODEGA_ELEVATION + 1.2, 0.1]);
      data.extinguishers.push([x, BODEGA_ELEVATION + 1.2, BODEGA_DEPTH - 0.1]);
    }
    for (let z = 15; z < BODEGA_DEPTH; z += 15) {
      data.extinguishers.push([0.1, BODEGA_ELEVATION + 1.2, z]);
    }

    // 2. Kits Antiderrame (Esquinas y zonas críticas)
    data.spillKits.push([5, BODEGA_ELEVATION + 0.3, 5]);
    data.spillKits.push([55, BODEGA_ELEVATION + 0.3, 15]);
    data.spillKits.push([55, BODEGA_ELEVATION + 0.3, 45]);

    // 3. Duchas de Emergencia (Verdes)
    data.showers.push([22, BODEGA_ELEVATION, 2]);
    data.showers.push([58, BODEGA_ELEVATION, 25]);

    // 4. Luces ATEX (Techo)
    for (let x = 10; x < BODEGA_WIDTH; x += 15) {
      for (let z = 10; z < BODEGA_DEPTH; z += 15) {
        data.lights.push([x, BODEGA_ELEVATION + 11.8, z]);
      }
    }

    return data;
  }, []);

  const extGeom = useMemo(() => new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8), []);
  const kitGeom = useMemo(() => new THREE.BoxGeometry(0.6, 0.6, 0.6), []);
  const showerGeom = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8), []);
  const lightGeom = useMemo(() => new THREE.BoxGeometry(1.2, 0.1, 0.3), []);

  return (
    <group>
      <InstancedElements positions={elements.extinguishers} geom={extGeom} color="#ef4444" />
      <InstancedElements positions={elements.spillKits} geom={kitGeom} color="#facc15" />
      <InstancedElements positions={elements.showers} geom={showerGeom} color="#22c55e" />
      <InstancedElements positions={elements.lights} geom={lightGeom} color="#f8fafc" />
      
      {/* Visual glow for lights (optional/simplified) */}
      {elements.lights.map((pos, i) => (
        <pointLight key={i} position={pos} intensity={0.5} distance={15} color="#fef3c7" />
      ))}
    </group>
  );
}
