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

function InstancedBeams({ color, positions, tilt = 0 }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.BoxGeometry(RACK_WIDTH - POST_W, BEAM_H, BEAM_D), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      // Aplicar inclinación si es Flow-Thru (Dynamic Rack)
      dummy.rotation.z = tilt; 
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, tilt, dummy]);

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
      drums: [],
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

    LINE_Z_CENTERS.forEach((cz) => {
      // --- CALCULAR PILARES (POSTS) ---
      // Distribuir pórticos en los extremos de cada cuerpo individual en lugar de compartir contigüamente a través de todas las zonas
      allCentersX.forEach((cx) => {
        const postXLeft = cx - (RACK_WIDTH / 2);
        const postXRight = cx + (RACK_WIDTH / 2);
        const postY = BODEGA_ELEVATION + RACK_HEIGHT / 2;
        
        // Cada pórtico tiene 3 pilares de fondo (Frontal, Medio, Trasero) en las baterías
        [postXLeft, postXRight].forEach(postX => {
          data.posts.push(
            [postX, postY, cz - halfDepth],
            [postX, postY, cz],
            [postX, postY, cz + halfDepth]
          );
        });
      });

      // --- CALCULAR VIGAS (BEAMS) Y TAMBORES ---
      allCentersX.forEach((cx, i) => {
        const isZoneA = i < 3;
        const isZoneB = i >= 3 && i < 9;
        const isZoneC = i >= 9;

        let targetBeamArray;
        if (isZoneA) targetBeamArray = data.beamsA;
        else if (isZoneB) targetBeamArray = data.beamsB;
        else targetBeamArray = data.beamsC;

        // Por cada nivel añadir 4 vigas 
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
        });

        // TAMBORES (Solamente en Zona C, en el nivel base a suelo y nivel 1)
        if (isZoneC) {
          // Sobre piso (Losa Y=1.2) + radio del tambor (0.45)
          const drumY0 = BODEGA_ELEVATION + 0.45;
          const drumY1 = BODEGA_ELEVATION + LEVELS[0] + 0.45 + (BEAM_H/2); // Sobre nivel 1
          
          // Generar 8 tambores por cuerpo por nivel
          for (const dy of [drumY0, drumY1]) {
            // Fila Fontal
            data.drums.push([cx - 0.8, dy, cz - 0.6]);
            data.drums.push([cx + 0.0, dy, cz - 0.6]);
            data.drums.push([cx + 0.8, dy, cz - 0.6]);
            // Fila Centro
            data.drums.push([cx - 0.4, dy, cz + 0.0]);
            data.drums.push([cx + 0.4, dy, cz + 0.0]);
            // Fila Trasera
            data.drums.push([cx - 0.8, dy, cz + 0.6]);
            data.drums.push([cx + 0.0, dy, cz + 0.6]);
            data.drums.push([cx + 0.8, dy, cz + 0.6]);
          }
        }
      });
    });

    return data;
  }, []);

  return (
    <group>
      {/* 1. Geometría Estructural (Marcos y Vigas) */}
      <InstancedPosts positions={layoutData.posts} />
      <InstancedBeams color={COLOR_ZONE_A} positions={layoutData.beamsA} tilt={-0.03} /> {/* Flow-thru tilt */}
      <InstancedBeams color={COLOR_ZONE_B} positions={layoutData.beamsB} />
      <InstancedBeams color={COLOR_ZONE_C} positions={layoutData.beamsC} />

      {/* 2. Objetos de Emergencia (Tambores DS43) */}
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
