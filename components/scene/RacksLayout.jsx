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
// CONFIGURACIÓN DINÁMICA DE ALTA CAPACIDAD (> 2500 Posiciones)
// ══════════════════════════════════════════════════════════════════════════════

const HORIZONTAL_Z_CENTERS_B = [11.2, 16.2, 21.2, 26.2, 31.2, 36.2];
const RACK_HEIGHT = 11.0; 

// Estructura Dinámica
const DYN_SLOPE = 0.04; 
const DYN_COLOR = '#0EA5E9'; 
const ROLLER_SPACING = 0.15; 
const ROLLER_RADIUS = 0.025; 
const ROLLER_WIDTH = 1.35; 

// Estructura Selectiva
const POST_W = 0.12; 
const BEAM_H = 0.15; 
const LEVELS = [0.15, 2.35, 4.55, 6.75, 8.95, 11.0]; 

// Dimensiones Pallet Real
const PALLET_W = 1.0; 
const PALLET_D = 1.2;
const PALLET_H = 0.144;
const BOARD_H = 0.022;
const BLOCK_H = 0.1;
const BLOCK_W = 0.145;

// ══════════════════════════════════════════════════════════════════════════════
// 1. MODELO DE PALLET DETALLADO
// ══════════════════════════════════════════════════════════════════════════════

function InstancedRealisticPallets({ positions, rotY = 0, slope = 0 }) {
  const topBoardRef = useRef();
  const blockRef = useRef();
  const bottomBoardRef = useRef();
  const topGeom = useMemo(() => new THREE.BoxGeometry(0.12, BOARD_H, PALLET_D), []);
  const blockGeom = useMemo(() => new THREE.BoxGeometry(BLOCK_W, BLOCK_H, BLOCK_W), []);
  const bottomGeom = useMemo(() => new THREE.BoxGeometry(0.15, BOARD_H, PALLET_D), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!topBoardRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      const cos = Math.cos(rotY);
      const sin = Math.sin(rotY);

      dummy.rotation.set(slope, rotY, 0);
      const boardSpacing = 0.22;
      for (let b = 0; b < 5; b++) {
        const localX = (b - 2) * boardSpacing;
        const ox = localX * cos;
        const oz = -localX * sin;
        dummy.position.set(pos[0] + ox, pos[1] + 0.06, pos[2] + oz);
        dummy.updateMatrix();
        topBoardRef.current.setMatrixAt(i * 5 + b, dummy.matrix);
      }
      const xPos = [-0.4, 0, 0.4];
      const zPos = [-0.5, 0, 0.5];
      let blockIdx = 0;
      xPos.forEach(lx => {
        zPos.forEach(lz => {
          // Rotate local [lx, lz]
          const ox = lx * cos + lz * sin;
          const oz = -lx * sin + lz * cos;
          dummy.position.set(pos[0] + ox, pos[1] - 0.01, pos[2] + oz);
          dummy.updateMatrix();
          blockRef.current.setMatrixAt(i * 9 + blockIdx, dummy.matrix);
          blockIdx++;
        });
      });
      const bottomX = [-0.4, 0, 0.4];
      bottomX.forEach((lx, bi) => {
        const ox = lx * cos;
        const oz = -lx * sin;
        dummy.position.set(pos[0] + ox, pos[1] - 0.07, pos[2] + oz);
        dummy.updateMatrix();
        bottomBoardRef.current.setMatrixAt(i * 3 + bi, dummy.matrix);
      });
    });
    topBoardRef.current.instanceMatrix.needsUpdate = true;
    blockRef.current.instanceMatrix.needsUpdate = true;
    bottomBoardRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, rotY, slope, dummy]);

  return (
    <group>
      <instancedMesh ref={topBoardRef} args={[topGeom, null, positions.length * 5]}>
        <meshStandardMaterial color="#DEB887" roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={blockRef} args={[blockGeom, null, positions.length * 9]}>
        <meshStandardMaterial color="#C19A6B" roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={bottomBoardRef} args={[bottomGeom, null, positions.length * 3]}>
        <meshStandardMaterial color="#DEB887" roughness={1} metalness={0} />
      </instancedMesh>
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. OTROS MODELOS
// ══════════════════════════════════════════════════════════════════════════════

function InstancedSelectivePosts({ positions }) {
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
  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length || 0]}>
      <meshStandardMaterial color="#1E3A8A" roughness={0.6} metalness={0.4} />
    </instancedMesh>
  );
}

function InstancedSelectiveBeams({ color, positions, rotY = 0 }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.BoxGeometry(RACK_WIDTH - POST_W, BEAM_H, 0.08), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.rotation.y = rotY;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, rotY, dummy]);
  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length || 0]}>
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </instancedMesh>
  );
}

function InstancedDynamicRollers({ positions }) {
  const meshRef = useRef();
  const geom = useMemo(() => {
    const g = new THREE.CylinderGeometry(ROLLER_RADIUS, ROLLER_RADIUS, ROLLER_WIDTH, 8);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
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
  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length || 0]}>
      <meshStandardMaterial color="#94A3B8" roughness={0.1} metalness={1.0} />
    </instancedMesh>
  );
}

function InstancedDynamicRails({ positions, length }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.BoxGeometry(0.05, 0.12, length), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.rotation.x = -DYN_SLOPE;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, length, dummy]);
  return (
    <instancedMesh ref={meshRef} args={[geom, null, positions.length || 0]}>
      <meshStandardMaterial color={DYN_COLOR} roughness={0.3} metalness={0.6} />
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ══════════════════════════════════════════════════════════════════════════════

export default function RacksLayout() {
  const layoutData = useMemo(() => {
    const data = {
      selPosts: [],
      selBeamsB: [], selBeamsC: [],
      dynPosts: [], dynRails: [], dynRollers: [],
      palletsB: [], palletsCVert: [], palletsA: [],
      drums: [],
      spillTrays: [],
      sprinklers: [],
    };
    const postY = BODEGA_ELEVATION + RACK_HEIGHT / 2;

    // --- 1. ZONA C VERTICAL (Edge aligned, 3m Gap to B) ---
    const verticalX = [1.45, 4.45]; 
    const vZCenters = [];
    for (let i = 0; i < 11; i++) {
      const cz = 11.45 + i * 3.0; // 10.0 + (2.9 / 2)
      if (cz <= 38.55) vZCenters.push(cz);
    }
    verticalX.forEach((cx) => {
      vZCenters.forEach((cz) => {
        [cz - RACK_WIDTH / 2, cz + RACK_WIDTH / 2].forEach(pz => {
          data.selPosts.push([cx - 1.2, postY, pz], [cx, postY, pz], [cx + 1.2, postY, pz]);
        });
        LEVELS.forEach((levelY) => {
          const by = BODEGA_ELEVATION + levelY;
          data.selBeamsC.push([cx - 1.1, by, cz], [cx - 0.2, by, cz], [cx + 0.2, by, cz], [cx + 1.1, by, cz]);
          if (levelY >= 11.0) return;
          // Doble Profundidad: 2 pallets por lado del rack (Total 4 por cuerpo por nivel)
          data.palletsCVert.push(
            [cx, by + 0.1, cz - 0.9], [cx, by + 0.1, cz - 0.3],
            [cx, by + 0.1, cz + 0.3], [cx, by + 0.1, cz + 0.9]
          );
        });
      });
    });

    // --- 2. ZONA B HORIZONTAL (3m Gap between C and A) ---
    const startHorizontalX = 10.45; 
    const cXB = [];
    for (let i = 0; i < 9; i++) cXB.push(startHorizontalX + i * 3.0); 
    HORIZONTAL_Z_CENTERS_B.forEach((cz) => {
      cXB.forEach((cx) => {
        [cx - RACK_WIDTH / 2, cx + RACK_WIDTH / 2].forEach(px => {
          data.selPosts.push([px, postY, cz - 1.2], [px, postY, cz], [px, postY, cz + 1.2]);
        });
        LEVELS.forEach((levelY) => {
          const by = BODEGA_ELEVATION + levelY;
          data.selBeamsB.push([cx, by, cz - 1.1], [cx, by, cz - 0.2], [cx, by, cz + 0.2], [cx, by, cz + 1.1]);
          if (levelY >= 11.0) return;
          // Doble Profundidad: 2 pallets de fondo (Total 4 por cuerpo por nivel)
          data.palletsB.push(
            [cx - 0.9, by + 0.1, cz], [cx - 0.3, by + 0.1, cz],
            [cx + 0.3, by + 0.1, cz], [cx + 0.9, by + 0.1, cz]
          );
        });
      });
    });

    const startAX = 40.35; 
    const cXA = [];
    for (let i = 0; i < 4; i++) cXA.push(startAX + i * 3.0); 
    const startZA = 10.0;
    const linesA = 25; // Reajustado para el fondo de 50m
    const bLen = linesA * 1.2;
    const zC = startZA + bLen / 2;
    cXA.forEach((cx) => {
      [startZA, startZA + bLen/2, startZA + bLen].forEach(cz => {
        [cx - RACK_WIDTH / 2, cx + RACK_WIDTH / 2].forEach(px => data.dynPosts.push([px, postY, cz]));
      });
      LEVELS.forEach((levelY) => {
        const by = BODEGA_ELEVATION + levelY;
        data.dynRails.push([cx - 0.75, by, zC], [cx + 0.75, by, zC]);
        for (let z = startZA; z <= startZA + bLen; z += ROLLER_SPACING) {
          const zOff = z - zC;
          data.dynRollers.push([cx, by - (zOff * DYN_SLOPE), z]);
        }
        if (levelY >= 11.0) return;
        for (let i = 0; i < linesA; i++) {
          const cz = startZA + i * 1.2 + 0.6;
          const zOff = cz - zC;
          const tiltedY = by + 0.1 - (zOff * DYN_SLOPE);
          data.palletsA.push([cx - 0.7, tiltedY, cz], [cx + 0.7, tiltedY, cz]);
        }
      });
    });

    // --- 4. JAULA DS43 ---
    for (let x = 12; x <= 30; x += 1.5) {
      data.palletsB.push([x, BODEGA_ELEVATION + 0.1, 1.5]);
      data.drums.push([x - 0.25, BODEGA_ELEVATION + 0.65, 1.25], [x - 0.25, BODEGA_ELEVATION + 0.65, 1.75], [x + 0.25, BODEGA_ELEVATION + 0.65, 1.25], [x + 0.25, BODEGA_ELEVATION + 0.65, 1.75]);
    }

    return data;
  }, []);

  return (
    <group>
      <InstancedSelectivePosts positions={layoutData.selPosts} />
      <InstancedSelectiveBeams color="#ef4444" positions={layoutData.selBeamsC} rotY={Math.PI / 2} />
      <InstancedSelectiveBeams color="#FBC02D" positions={layoutData.selBeamsB} />
      <InstancedSelectivePosts positions={layoutData.dynPosts} /> 
      <InstancedDynamicRails positions={layoutData.dynRails} length={17 * 1.2} />
      <InstancedDynamicRollers positions={layoutData.dynRollers} />
      <InstancedRealisticPallets positions={layoutData.palletsCVert} rotY={Math.PI / 2} />
      <InstancedRealisticPallets positions={layoutData.palletsB} />
      <InstancedRealisticPallets positions={layoutData.palletsA} slope={-DYN_SLOPE} />
      <InstancedDrums positions={layoutData.drums} />
    </group>
  );
}
