'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { BODEGA_ELEVATION } from '@/lib/constants';

// Dimensiones estándar Pallet
const PALLET_W = 1.0; 
const PALLET_D = 1.2;
const PALLET_H = 0.15;

function InstancedPallets({ positions, color }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.BoxGeometry(PALLET_W, PALLET_H, PALLET_D), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      // Leve rotación aleatoria para realismo en preparación
      dummy.rotation.y = (Math.random() - 0.5) * 0.1;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length]}>
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.0} />
      {/* Bordes para distinguir volumen */}
      <lineSegments>
        <edgesGeometry args={[geom]} />
        <lineBasicMaterial color="#000000" opacity={0.2} transparent />
      </lineSegments>
    </instancedMesh>
  );
}

export default function StagingLayout() {
  const stagingData = useMemo(() => {
    const data = {
      inbound: [],
      outbound: [],
    };

    const y = BODEGA_ELEVATION + (PALLET_H / 2);

    // INBOUND (X: 52 a 58, Z: 12 a 28) - Dejando margen
    // Lotes de 2x2 pallets a la espera de ser procesados
    for (let x = 52.5; x <= 57.5; x += 2.5) {
      for (let z = 13; z <= 27; z += 3) {
        data.inbound.push([x, y, z]);
        data.inbound.push([x + 1.1, y, z]);
      }
    }

    // OUTBOUND (X: 52 a 58, Z: 32 a 48)
    for (let x = 52.5; x <= 57.5; x += 2.5) {
      for (let z = 33; z <= 47; z += 3) {
        data.outbound.push([x, y, z]);
        data.outbound.push([x + 1.1, y, z]);
      }
    }

    return data;
  }, []);

  return (
    <group>
      {/* INBOUND: Pallets vacíos o en revisión (Madera clara) */}
      <InstancedPallets positions={stagingData.inbound} color="#D4A373" />
      {/* OUTBOUND: Pallets listos para despacho (Madera oscura o film) */}
      <InstancedPallets positions={stagingData.outbound} color="#FAEDCD" />
    </group>
  );
}
