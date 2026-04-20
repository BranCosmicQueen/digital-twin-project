'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { RACK_WIDTH, RACK_DEPTH, BODEGA_ELEVATION } from '@/lib/constants';

// Z-centers for the 7 rack lines
const LINE_Z_CENTERS = [13.6, 18.8, 21.2, 26.4, 28.8, 34.0, 36.4];

const NUM_BODIES = 15;
const START_X = 48.5;
const RACK_HEIGHT = 11.5;

// Dimensiones Estructurales
const POST_W = 0.12; 
const BEAM_H = 0.15; 
const BEAM_D = 0.08; 
const LEVELS = [2.0, 4.0, 6.0, 8.0, 10.0, 11.5]; // 6 Niveles

// Colors
const COLOR_ZONE_A = '#0284C7'; // Cyan oscuro
const COLOR_ZONE_B = '#EA580C'; // Naranja industrial
const COLOR_ZONE_C = '#4B5563'; // Gris oscuro
const COLOR_POST = '#1E3A8A';   // Azul marino para pilares

// Dimensiones estándar Pallet
const PALLET_W = 1.0; 
const PALLET_D = 1.2;
const PALLET_H = 0.15;

// ══════════════════════════════════════════════════════════════════════════════
// Componentes de InstancedMesh
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
      {/* Añadir ejes para resaltar bordes */}
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
      // Aplicar rotaciones
      dummy.rotation.x = 0;
      dummy.rotation.y = rotY; 
      dummy.rotation.z = tilt; 
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

function InstancedDrums({ positions }) {
  const meshRef = useRef();
  // Tambor estandar (200L): Diámetro ~0.6m, Alto ~0.9m
  const geom = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), []);
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
      <meshStandardMaterial color="#047857" roughness={0.3} metalness={0.6} />
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
      dummy.rotation.x = 0;
      // Pequeño jitter para darle imperfección realista
      dummy.rotation.y = rotY + (Math.random() - 0.5) * 0.1;
      dummy.rotation.z = tilt;
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

function InstancedSafetyMesh({ positions, rotY = 0 }) {
  const meshRef = useRef();
  // Malla plana que recorrerá la espalda del rack (Ancho de body x Alto de Rack)
  const geom = useMemo(() => new THREE.PlaneGeometry(RACK_WIDTH, RACK_HEIGHT), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.rotation.x = 0;
      dummy.rotation.y = rotY;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, rotY, dummy]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length]}>
      <meshBasicMaterial color="#FBBF24" transparent opacity={0.4} wireframe side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ══════════════════════════════════════════════════════════════════════════════

export default function RacksLayout() {
  const layoutData = useMemo(() => {
    const data = {
      posts: [],
      beamsA: [],
      beamsB: [],
      beamsC: [],
      palletsA: [],
      palletsB: [],
      palletsC: [],
      drums: [],
      safetyMeshes: [],
    };


    const halfDepth = RACK_DEPTH / 2;
    const postOffset = halfDepth - (POST_W / 2);

      // === MATRIZ DE COORDENADAS Rígidas (Para respetar bordes de zonas exactamente) ===
      // Zona A (X: 40-50). Centro = 45. 3 cuerpos = 8.7m.
      const centersA = [47.9, 45.0, 42.1];
      
      // Zona B (X: 20-40). Centro = 30. 6 cuerpos = 17.4m.
      const centersB = [37.25, 34.35, 31.45, 28.55, 25.65, 22.75];
      
      // Zona C (X: 0-20). Centro = 10. 6 cuerpos = 17.4m.
      const centersC = [18.7, 15.8, 12.9, 10.0, 7.1, 4.2];

      const allCentersX = [...centersA, ...centersB, ...centersC]; // 15 cuerpos totales

    LINE_Z_CENTERS.forEach((cz, lineIndex) => {
      // --- CALCULAR PILARES (POSTS) ---
      // Distribuir pórticos en los extremos de cada cuerpo individual en lugar de compartir contigüamente a través de todas las zonas
      // --- CALCULAR VIGAS (BEAMS) Y PALLETS ---
      allCentersX.forEach((cx, i) => {
        const isZoneA = i < 3;
        const isZoneB = i >= 3 && i < 9;
        const isZoneC = i >= 9;

        // La Zona C Horizontal ya NO existe
        if (isZoneC) return;

        let targetBeamArray;
        if (isZoneA) targetBeamArray = data.beamsA;
        else if (isZoneB) targetBeamArray = data.beamsB;
        else return;
        
        // Por cada nivel añadir 4 vigas y 4 pallets (2 al frente paralelos, 2 atrás paralelos)
        LEVELS.forEach((levelY) => {
          const by = BODEGA_ELEVATION + levelY;
          // Z posiciones para las vigas: frontal, medio1, medio2, trasero
          const front1 = cz - halfDepth + 0.1;
          const front2 = cz - 0.2;
          const rear1 = cz + 0.2;
          const rear2 = cz + halfDepth - 0.1;

          targetBeamArray.push(
            [cx, by, front1],
            [cx, by, front2],
            [cx, by, rear1],
            [cx, by, rear2]
          );

          // Generación de 4 Pallets por nivel 
          const palletY = by + (BEAM_H / 2) + (PALLET_H / 2);
          const palletZFront = (front1 + front2) / 2;
          const palletZRear = (rear1 + rear2) / 2;

          const pxLeft = cx - 0.7; 
          const pxRight = cx + 0.7;

          let targetPalletArray;
          if (isZoneA) targetPalletArray = data.palletsA;
          else if (isZoneB) targetPalletArray = data.palletsB;

          targetPalletArray.push([pxLeft, palletY, palletZFront]);
          targetPalletArray.push([pxRight, palletY, palletZFront]);
          targetPalletArray.push([pxLeft, palletY, palletZRear]);
          targetPalletArray.push([pxRight, palletY, palletZRear]);
        });

      });
    });

    // ======= GENERACIÓN ESPECIAL: RACK VERTICAL DS43 (ZONA C) =======
    // Vertical -> Posicionado a lo largo de Z, pegado a la pared X=0
    const DS43_Z_CENTERS = [11.95, 14.85, 17.75, 20.65, 23.55, 26.45, 29.35, 32.25, 35.15, 38.05];
    const cxC = 1.35; // Pegado al fondo X=0 (Centro del cuerpo Depth 2.4m + offset al muro)

    DS43_Z_CENTERS.forEach((czC) => {
       // --- PILARES VERTICALES ---
       // El ancho del body ahora corre a lo largo del eje Z
       const postZLeft = czC - (RACK_WIDTH / 2);
       const postZRight = czC + (RACK_WIDTH / 2);
       const postY = BODEGA_ELEVATION + RACK_HEIGHT / 2;
       
       // Generar los 3 Pilares en Eje X porque el marco corre profundo en X
       [postZLeft, postZRight].forEach(postZ => {
          data.posts.push(
             [cxC - halfDepth, postY, postZ],
             [cxC, postY, postZ],
             [cxC + halfDepth, postY, postZ]
          );
       });

       // --- VIGAS Y PALLETS VERTICALES ---
       // Malla de seguridad centrada cortando Z
       data.safetyMeshes.push([cxC, BODEGA_ELEVATION + RACK_HEIGHT / 2, czC]);
       
       LEVELS.forEach(levelY => {
         const by = BODEGA_ELEVATION + levelY;
         // Posiciones de vigas ahora varían en el Eje X (Profundidad)
         const front1 = cxC - halfDepth + 0.1;
         const front2 = cxC - 0.2;
         const rear1 = cxC + 0.2;
         const rear2 = cxC + halfDepth - 0.1;

         data.beamsC.push(
           [front1, by, czC],
           [front2, by, czC],
           [rear1, by, czC],
           [rear2, by, czC]
         );

         const palletY = by + (BEAM_H / 2) + (PALLET_H / 2);
         const palletXFront = (front1 + front2) / 2;
         const palletXRear = (rear1 + rear2) / 2;
         
         const pzLeft = czC - 0.7;
         const pzRight = czC + 0.7;

         data.palletsC.push([palletXFront, palletY, pzLeft]);
         data.palletsC.push([palletXFront, palletY, pzRight]);
         data.palletsC.push([palletXRear, palletY, pzLeft]);
         data.palletsC.push([palletXRear, palletY, pzRight]);

         const drumY = palletY + (PALLET_H / 2) + 0.45;

         // Pallets frontales (tambores de fondo según Z)
         data.drums.push([palletXFront, drumY, czC - 0.9]);
         data.drums.push([palletXFront, drumY, czC - 0.5]);
         data.drums.push([palletXFront, drumY, czC + 0.5]);
         data.drums.push([palletXFront, drumY, czC + 0.9]);

         // Pallets traseros (tambores de fondo según Z)
         data.drums.push([palletXRear, drumY, czC - 0.9]);
         data.drums.push([palletXRear, drumY, czC - 0.5]);
         data.drums.push([palletXRear, drumY, czC + 0.5]);
         data.drums.push([palletXRear, drumY, czC + 0.9]);
       });
    });

    return data;
  }, []);

  return (
    <group>
      {/* 1. Geometría Estructural (Marcos y Vigas horizontales) */}
      <InstancedPosts positions={layoutData.posts} />
      <InstancedBeams color={COLOR_ZONE_A} positions={layoutData.beamsA} tilt={-0.03} /> {/* Flow-thru tilt */}
      <InstancedBeams color={COLOR_ZONE_B} positions={layoutData.beamsB} />

      {/* RACK VERTICAL ZONA C */}
      <InstancedBeams color={COLOR_ZONE_C} positions={layoutData.beamsC} rotY={Math.PI / 2} />
      <InstancedSafetyMesh positions={layoutData.safetyMeshes} rotY={Math.PI / 2} />

      {/* 2. Objetos de Almacenamiento */}
      <InstancedRackPallets positions={layoutData.palletsA} tilt={-0.03} />
      <InstancedRackPallets positions={layoutData.palletsB} />
      <InstancedRackPallets positions={layoutData.palletsC} rotY={Math.PI / 2} />

      {/* 3. Objetos de Emergencia (Tambores DS43) */}
      <InstancedDrums positions={layoutData.drums} />

      {/* 3. Etiquetas Flotantes Alineadas por Zonas Exactas */}
      <Text
        position={[45, BODEGA_ELEVATION + RACK_HEIGHT + 1, LINE_Z_CENTERS[6]]}
        rotation={[-Math.PI/2, 0, 0]}
        fontSize={1}
        color={COLOR_ZONE_A}
        anchorX="center"
        anchorY="bottom"
      >
        ZONA A (FLOW-THRU)
      </Text>
      <Text
        position={[30, BODEGA_ELEVATION + RACK_HEIGHT + 1, LINE_Z_CENTERS[6]]}
        rotation={[-Math.PI/2, 0, 0]}
        fontSize={1}
        color={COLOR_ZONE_B}
        anchorX="center"
        anchorY="bottom"
      >
        ZONA B (SELECTIVE)
      </Text>
      <Text
        position={[10, BODEGA_ELEVATION + RACK_HEIGHT + 1, LINE_Z_CENTERS[6]]}
        rotation={[-Math.PI/2, 0, 0]}
        fontSize={1}
        color={COLOR_ZONE_C}
        anchorX="center"
        anchorY="bottom"
      >
        ZONA C (DS43)
      </Text>
    </group>
  );
}
