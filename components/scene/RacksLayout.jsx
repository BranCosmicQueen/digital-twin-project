'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { 
  RACK_WIDTH, 
  RACK_DEPTH, 
  BODEGA_ELEVATION, 
  DS43_ZONE, 
  DS43_BUFFER, 
  PEDESTRIAN_ZONE_Z_START 
} from '@/lib/constants';

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL LAYOUT (2,500+ Posiciones, Normativa Altura)
// ══════════════════════════════════════════════════════════════════════════════

// 8 líneas organizadas en 4 baterías dobles con pasillos de 3.2m
const LINE_Z_CENTERS = [11.2, 13.6, 19.2, 21.6, 27.2, 29.6, 35.2, 37.6];

const NUM_BODIES = 16;
// Estructura a 11 metros exactos (Cumple < 11m y permite > 60cm de holgura con techo de 12m)
const RACK_HEIGHT = 11.0; 

// Dimensiones Estructurales
const POST_W = 0.12; 
const BEAM_H = 0.15; 
const BEAM_D = 0.08; 

// Niveles ajustados para que el nivel 5 de carga permita holgura de 70-75cm al techo
// El nivel 6 es puramente estructural (viga de cierre)
const LEVELS = [0.15, 2.35, 4.55, 6.75, 8.95, 11.0]; 

// Colores Normativos
const COLOR_ZONE_A = '#1E88E5'; // Azul Técnico (Alta Rotación)
const COLOR_ZONE_B = '#FBC02D'; // Amarillo Tráfico (Mediana Rotación)
const COLOR_ZONE_C = '#ef4444'; // Rojo (Baja Rotación)
const COLOR_POST = '#1E3A8A';   // Azul marino para pilares

// Dimensiones Pallet
const PALLET_W = 1.0; 
const PALLET_D = 1.2;
const PALLET_H = 0.15;

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES INSTANCIADOS (Optimización)
// ══════════════════════════════════════════════════════════════════════════════

function InstancedPosts({ positions }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.BoxGeometry(POST_W, RACK_HEIGHT, POST_W), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length]}>
      <meshStandardMaterial color={COLOR_POST} roughness={0.6} metalness={0.4} />
      <lineSegments>
        <edgesGeometry args={[geom]} />
        <lineBasicMaterial color="#0F172A" opacity={0.3} transparent />
      </lineSegments>
    </instancedMesh>
  );
}

function InstancedBeams({ color, positions, tilt = 0, rotY = 0 }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.BoxGeometry(RACK_WIDTH - POST_W, BEAM_H, BEAM_D), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.rotation.set(0, rotY, tilt);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, tilt, rotY, dummy]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length]}>
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </instancedMesh>
  );
}

function InstancedRackPallets({ positions, tilt = 0, rotY = 0 }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.BoxGeometry(PALLET_W, PALLET_H, PALLET_D), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.rotation.set(0, rotY + (Math.random() - 0.5) * 0.1, tilt);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, tilt, rotY, dummy]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length]}>
      <meshStandardMaterial color="#DEB887" roughness={0.9} metalness={0.0} />
      <lineSegments>
        <edgesGeometry args={[geom]} />
        <lineBasicMaterial color="#000000" opacity={0.2} transparent />
      </lineSegments>
    </instancedMesh>
  );
}

function InstancedDrums({ positions }) {
  const meshRef = useRef();
  const cageRef = useRef();
  const geom = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), []);
  const cageGeom = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 1.0, 4, 1, true), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || !cageRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.rotation.y = 0;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      dummy.rotation.y = Math.PI / 4;
      dummy.updateMatrix();
      cageRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    cageRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geom, null, positions.length || 0]}>
        <meshStandardMaterial color="#047857" roughness={0.3} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={cageRef} args={[cageGeom, null, positions.length || 0]}>
        <meshBasicMaterial color="#9CA3AF" wireframe transparent opacity={0.6} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

function InstancedAccessories({ positions, color, size }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.BoxGeometry(...size), [size]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length]}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </instancedMesh>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LÓGICA PRINCIPAL DEL LAYOUT
// ══════════════════════════════════════════════════════════════════════════════

export default function RacksLayout() {
  const layoutData = useMemo(() => {
    const data = {
      posts: [],
      beamsA: [], beamsB: [], beamsC: [],
      palletsA: [], palletsB: [], palletsC: [],
      drums: [],
      spillTrays: [],
      sprinklers: [],
    };

    const halfDepth = RACK_DEPTH / 2;

    // --- COORDENADAS X (16 cuerpos con gaps de 3m entre zonas) ---
    const centersX = [];
    for (let i = 0; i < 6; i++) centersX.push(6 + i * 3.0); // C
    for (let i = 0; i < 6; i++) centersX.push(27 + i * 3.0); // B
    for (let i = 0; i < 4; i++) centersX.push(48 + i * 3.0); // A

    LINE_Z_CENTERS.forEach((cz) => {
      const isPedestrianZone = cz > PEDESTRIAN_ZONE_Z_START - 2;

      centersX.forEach((cx, bodyIdx) => {
        const inDS43Aura = (cx < (DS43_ZONE.xMax + DS43_BUFFER)) && (cz < (DS43_ZONE.zMax + DS43_BUFFER));
        if (inDS43Aura || isPedestrianZone) return;

        // 1. Pilares
        const postY = BODEGA_ELEVATION + RACK_HEIGHT / 2;
        [cx - RACK_WIDTH / 2, cx + RACK_WIDTH / 2].forEach(px => {
          data.posts.push([px, postY, cz - halfDepth], [px, postY, cz], [px, postY, cz + halfDepth]);
        });

        // 2. Vigas y Pallets
        const isZoneA = bodyIdx >= 12;
        const isZoneB = bodyIdx >= 6 && bodyIdx < 12;
        const isZoneC = bodyIdx < 6;

        const targetBeamArray = isZoneA ? data.beamsA : isZoneB ? data.beamsB : data.beamsC;
        const targetPalletArray = isZoneA ? data.palletsA : isZoneB ? data.palletsB : data.palletsC;

        LEVELS.forEach((levelY) => {
          const by = BODEGA_ELEVATION + levelY;
          const front1 = cz - halfDepth + 0.1;
          const front2 = cz - 0.2;
          const rear1 = cz + 0.2;
          const rear2 = cz + halfDepth - 0.1;

          targetBeamArray.push([cx, by, front1], [cx, by, front2], [cx, by, rear1], [cx, by, rear2]);

          // NO PONER PALLETS EN EL NIVEL 6 (Nivel 11.0m es estructural)
          if (levelY >= 11.0) return;

          // Posiciones de Pallets (4 por nivel)
          const palletY = by + (BEAM_H / 2) + (PALLET_H / 2);
          const pxL = cx - 0.7;
          const pxR = cx + 0.7;
          const pzF = (front1 + front2) / 2;
          const pzR = (rear1 + rear2) / 2;

          targetPalletArray.push([pxL, palletY, pzF], [pxR, palletY, pzF], [pxL, palletY, pzR], [pxR, palletY, pzR]);

          // Accesorios Zona A
          if (isZoneA) {
            if (levelY === 0.15) data.spillTrays.push([cx, BODEGA_ELEVATION + 0.1, cz]);
            data.sprinklers.push([cx, by + 1.8, cz]);
          }
        });
      });
    });

    // --- JAULA DS43 ---
    const ds43X = [];
    for (let x = 1; x <= 19; x += 1.5) ds43X.push(x); 
    ds43X.forEach(cx => {
      const palletY = BODEGA_ELEVATION + PALLET_H / 2;
      data.palletsC.push([cx, palletY, 1.5]);
      const drumY = palletY + (PALLET_H / 2) + 0.45;
      data.drums.push([cx - 0.25, drumY, 1.25], [cx - 0.25, drumY, 1.75], [cx + 0.25, drumY, 1.25], [cx + 0.25, drumY, 1.75]);
    });

    return data;
  }, []);

  return (
    <group>
      <InstancedPosts positions={layoutData.posts} />
      <InstancedBeams color={COLOR_ZONE_A} positions={layoutData.beamsA} tilt={-0.03} />
      <InstancedBeams color={COLOR_ZONE_B} positions={layoutData.beamsB} />
      <InstancedBeams color={COLOR_ZONE_C} positions={layoutData.beamsC} />
      <InstancedRackPallets positions={layoutData.palletsA} tilt={-0.03} />
      <InstancedRackPallets positions={layoutData.palletsB} />
      <InstancedRackPallets positions={layoutData.palletsC} />
      <InstancedDrums positions={layoutData.drums} />
      <InstancedAccessories positions={layoutData.spillTrays} color="#475569" size={[RACK_WIDTH - 0.2, 0.05, RACK_DEPTH - 0.2]} />
      <InstancedAccessories positions={layoutData.sprinklers} color="#ef4444" size={[RACK_WIDTH, 0.05, 0.05]} />
    </group>
  );
}
