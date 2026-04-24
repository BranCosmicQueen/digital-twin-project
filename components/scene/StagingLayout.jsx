'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import useSimStore from '@/store/useSimStore';
import { BODEGA_ELEVATION, STAGING_INBOUND, STAGING_OUTBOUND } from '@/lib/constants';

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
  const setHoveredItem = useSimStore(s => s.setHoveredItem);
  const viewMode = useSimStore(s => s.viewMode);
  const is2D = viewMode === '2d';

  const stagingData = useMemo(() => {
    const data = {
      inbound: [],
      outbound: [],
    };

    const y = BODEGA_ELEVATION + (PALLET_H / 2) + 0.02;

    // INBOUND (Sincronizado con constants)
    const inB = STAGING_INBOUND;
    for (let x = inB.xMin + 0.5; x <= inB.xMax - 1; x += 2.5) {
      for (let z = inB.zMin + 2; z <= inB.zMax - 2; z += 3) {
        data.inbound.push([x, y, z]);
        data.inbound.push([x + 1.1, y, z]);
      }
    }

    // OUTBOUND (Sincronizado con constants)
    const outB = STAGING_OUTBOUND;
    for (let x = outB.xMin + 0.5; x <= outB.xMax - 1; x += 2.5) {
      for (let z = outB.zMin + 2; z <= outB.zMax - 2; z += 3) {
        data.outbound.push([x, y, z]);
        data.outbound.push([x + 1.1, y, z]);
      }
    }

    return data;
  }, []);

  return (
    <group>
      {/* Hitboxes para Hover (Ligeramente elevados para prioridad) */}
      <mesh 
        position={[(STAGING_INBOUND.xMin + STAGING_INBOUND.xMax)/2, BODEGA_ELEVATION + 0.3, (STAGING_INBOUND.zMin + STAGING_INBOUND.zMax)/2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (is2D) setHoveredItem('RECEPCIÓN / INBOUND');
        }}
      >
        <planeGeometry args={[STAGING_INBOUND.xMax - STAGING_INBOUND.xMin, STAGING_INBOUND.zMax - STAGING_INBOUND.zMin]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh 
        position={[(STAGING_OUTBOUND.xMin + STAGING_OUTBOUND.xMax)/2, BODEGA_ELEVATION + 0.3, (STAGING_OUTBOUND.zMin + STAGING_OUTBOUND.zMax)/2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (is2D) setHoveredItem('DESPACHO / OUTBOUND');
        }}
      >
        <planeGeometry args={[STAGING_OUTBOUND.xMax - STAGING_OUTBOUND.xMin, STAGING_OUTBOUND.zMax - STAGING_OUTBOUND.zMin]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* INBOUND: Pallets vacíos o en revisión (Madera clara) */}
      <InstancedPallets positions={stagingData.inbound} color="#D4A373" />
      {/* OUTBOUND: Pallets listos para despacho (Madera oscura o film) */}
      <InstancedPallets positions={stagingData.outbound} color="#FAEDCD" />
    </group>
  );
}
