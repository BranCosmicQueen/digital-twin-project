'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { RACK_WIDTH, RACK_DEPTH, BODEGA_ELEVATION, DS43_ZONE, DS43_BUFFER, PEDESTRIAN_ZONE_Z_START } from '@/lib/constants';

// Z-centers for the 7 rack lines
const LINE_Z_CENTERS = [13.6, 18.8, 21.2, 26.4, 28.8, 34.0, 36.4];

const NUM_BODIES = 15;
const START_X = 48.5;
const RACK_HEIGHT = 10.15; // Rebajado a tope del piso 5

// Dimensiones Estructurales
const POST_W = 0.12; 
const BEAM_H = 0.15; 
const BEAM_D = 0.08; 
const LEVELS = [0.15, 2.0, 4.0, 6.0, 8.0, 10.0]; // 6 Niveles de vigas (Base y Techo estéticos)

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
  const cageRef = useRef();
  
  // Tambor estandar (200L): Diámetro ~0.6m, Alto ~0.9m
  const geom = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), []);
  
  // Jaula "Abierta" (sin tapa): Usamos un cilindro de 4 caras abierto en los extremos (openEnded)
  // Al rotarlo 45 grados en el loop, se convierte en un marco cuadrado sin tapa ni base.
  const cageGeom = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 1.0, 4, 1, true), []);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || !cageRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      // Drum
      dummy.position.set(...pos);
      dummy.rotation.y = 0;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Cage (Rotada 45deg para ser cuadrada)
      dummy.rotation.y = Math.PI / 4;
      dummy.updateMatrix();
      cageRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    cageRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (positions.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geom, null, positions.length]}>
        <meshStandardMaterial color="#047857" roughness={0.3} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={cageRef} args={[cageGeom, null, positions.length]}>
        <meshBasicMaterial color="#9CA3AF" wireframe transparent opacity={0.6} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
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
      // === MATRIZ DE COORDENADAS Rígidas (Para alcanzar 105 cuerpos exactos: 15 per línea) ===
      // Paso de rack = 2.9m. 
      // Zona C (X: 6.2 - 23.6). 6 cuerpos.
      const centersC = [7.65, 10.55, 13.45, 16.35, 19.25, 22.15];
      
      // Zona B (X: 23.6 - 41.0). 6 cuerpos.
      const centersB = [25.05, 27.95, 30.85, 33.75, 36.65, 39.55];
      
      // Zona A (X: 41.0 - 49.7). 3 cuerpos.
      const centersA = [42.45, 45.35, 48.25];

      const allCentersX = [...centersA, ...centersB, ...centersC]; 

    LINE_Z_CENTERS.forEach((cz, lineIndex) => {
      // Bounding Box checks for exclusions
      const isPedestrianZone = cz > PEDESTRIAN_ZONE_Z_START - 2;

      // --- CALCULAR PILARES (POSTS) ---
      allCentersX.forEach((cx) => {
        // DS43 Buffer check: DS43 occupies X 0..20, Z 0..10. Plus 2.8m buffer -> X < 22.8 AND Z < 12.8
        const inDS43Aura = (cx < (DS43_ZONE.xMax + DS43_BUFFER)) && (cz < (DS43_ZONE.zMax + DS43_BUFFER));
        if (inDS43Aura || isPedestrianZone) return;

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

      // --- CALCULAR VIGAS (BEAMS) Y PALLETS ---
      allCentersX.forEach((cx, i) => {
        const inDS43Aura = (cx < (DS43_ZONE.xMax + DS43_BUFFER)) && (cz < (DS43_ZONE.zMax + DS43_BUFFER));
        if (inDS43Aura || isPedestrianZone) return;

        // Is it adjancent to the DS43 Aura? Put a safety mesh on its back!
        // The aura boundary is roughly X=22.8 or Z=12.8.
        const isNeighborToAura = (cx >= (DS43_ZONE.xMax + DS43_BUFFER) && cx < (DS43_ZONE.xMax + DS43_BUFFER + 3)) || 
                                 (cz >= (DS43_ZONE.zMax + DS43_BUFFER) && cz < (DS43_ZONE.zMax + DS43_BUFFER + 3));

        if (isNeighborToAura && cx < 30 && cz < 20) {
          // Put basic safety mesh back of rack
          data.safetyMeshes.push([cx, BODEGA_ELEVATION + RACK_HEIGHT / 2, cz]);
        }

        const isZoneA = i < 3;
        const isZoneB = i >= 3 && i < 9;
        const isZoneC = i >= 9;

        let targetBeamArray;
        if (isZoneA) targetBeamArray = data.beamsA;
        else if (isZoneB) targetBeamArray = data.beamsB;
        else targetBeamArray = data.beamsC;
        
        // Usar la cantidad igual de niveles para que no le falte la parte de arriba
        const targetLevels = LEVELS;

        // Por cada nivel añadir 4 vigas y 4 pallets
        targetLevels.forEach((levelY) => {
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

          // Si es el nivel superior (10.0m), dejamos las vigas "cierras" pero no ponemos pallets por estética
          if (levelY === 10.0) return;

          // Generación de 4 Pallets por nivel 
          const palletY = by + (BEAM_H / 2) + (PALLET_H / 2);
          const palletZFront = (front1 + front2) / 2;
          const palletZRear = (rear1 + rear2) / 2;

          const pxLeft = cx - 0.7; 
          const pxRight = cx + 0.7;

          let targetPalletArray;
          if (isZoneA) targetPalletArray = data.palletsA;
          else if (isZoneB) targetPalletArray = data.palletsB;
          else targetPalletArray = data.palletsC;

          targetPalletArray.push([pxLeft, palletY, palletZFront]);
          targetPalletArray.push([pxRight, palletY, palletZFront]);
          targetPalletArray.push([pxLeft, palletY, palletZRear]);
          targetPalletArray.push([pxRight, palletY, palletZRear]);
        });
      });
    });

    // ======= GENERACIÓN ESPECIAL: JAULA DS43 (CAGE) =======
    // "La ds43 debe medir 6 metros de ancho de la izquierda a la derecha... en una jaula sin tapa"
    // "Los tambores no deben estar en rack pero si sobre pallets"
    // Zona de la jaula: X=0 a X=6, Z=10 a Z=40.
    
    // Mismo material que usábamos para SafetyMesh pero formará una caja hueca sin tapa.
    // Renderizamos las paredes en Scene con componentes fijos. Instanciamos solo los pallets y tambores aquí.
    
    // Grid de pallets en el piso dentro de la jaula DS43
    // La jaula DS43 ahora mide 20m de ancho x 10m de fondo (X: 0 a 20, Z: 0 a 10)
    // Solo una fila a lo largo del muro (eje X)
    const ds43Z = [1.5];
    
    // Columnas adaptadas a los 20m
    const ds43X = [];
    for (let x = 1; x <= 19; x += 1.5) ds43X.push(x); 

    // Niveles de apilado (1 nivel por seguridad y visibilidad)
    const ds43Levels = [
      BODEGA_ELEVATION + PALLET_H / 2, // Nivel 1 (Suelo)
    ];

    ds43Z.forEach(cz => {
      ds43X.forEach(cx => {
        ds43Levels.forEach(palletY => {
          data.palletsC.push([cx, palletY, cz]);

          const drumY = palletY + (PALLET_H / 2) + 0.45;
          // 4 tambores por pallet
          data.drums.push([cx - 0.25, drumY, cz - 0.25]);
          data.drums.push([cx - 0.25, drumY, cz + 0.25]);
          data.drums.push([cx + 0.25, drumY, cz - 0.25]);
          data.drums.push([cx + 0.25, drumY, cz + 0.25]);
        });
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
      <InstancedBeams color={COLOR_ZONE_C} positions={layoutData.beamsC} />



      {/* 2. Objetos de Almacenamiento */}
      <InstancedRackPallets positions={layoutData.palletsA} tilt={-0.03} />
      <InstancedRackPallets positions={layoutData.palletsB} />
      <InstancedRackPallets positions={layoutData.palletsC} />

      {/* 3. Objetos de Emergencia (Tambores DS43) y Anti-caídas */}
      <InstancedDrums positions={layoutData.drums} />
      <InstancedSafetyMesh positions={layoutData.safetyMeshes} rotY={0} />

      {/* Texts removed per clean base requirement */}
    </group>
  );
}
