'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import useSimStore from '@/store/useSimStore';
import { 
  RACK_WIDTH, 
  RACK_DEPTH, 
  BODEGA_ELEVATION, 
  DS43_ZONE, 
  DS43_BUFFER, 
  PEDESTRIAN_ZONE_Z_START,
  ZONE_A,
  ZONE_B,
  ZONE_C,
  LEVELS
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

// Dimensiones Pallet Real
const PALLET_W = 1.0; 
const PALLET_D = 1.2;
const PALLET_H = 0.144;
const BOARD_H = 0.022;
const BLOCK_H = 0.1;
const BLOCK_W = 0.145;

// Dimensiones de Productos
const BOX_TYPES = [
  { size: [0.4, 0.3, 0.4], color: '#c29a6b' }, // Cartón Corrugado Estándar
  { size: [0.5, 0.4, 0.4], color: '#d4a373' }, // Cartón Claro
  { size: [0.3, 0.2, 0.3], color: '#a0785a' }, // Cartón Kraft Oscuro
];
const BUCKET_RADIUS = 0.15;
const BUCKET_HEIGHT = 0.4;
const DRUM_RADIUS = 0.22;
const DRUM_HEIGHT = 0.9;

// ══════════════════════════════════════════════════════════════════════════════
// 1. MODELOS INSTANCIADOS
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

function InstancedBoxes({ positions, typeIdx = 0 }) {
  const meshRef = useRef();
  const type = BOX_TYPES[typeIdx % BOX_TYPES.length];
  const geom = useMemo(() => new THREE.BoxGeometry(...type.size), [type]);
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
    <instancedMesh ref={meshRef} args={[geom, null, positions.length || 0]}>
      <meshStandardMaterial color={type.color} roughness={0.8} />
    </instancedMesh>
  );
}

function InstancedBuckets({ positions }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.CylinderGeometry(BUCKET_RADIUS, BUCKET_RADIUS * 0.8, BUCKET_HEIGHT, 10), []);
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
    <instancedMesh ref={meshRef} args={[geom, null, positions.length || 0]}>
      <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
    </instancedMesh>
  );
}

function InstancedDrums({ positions }) {
  const meshRef = useRef();
  const geom = useMemo(() => new THREE.CylinderGeometry(DRUM_RADIUS, DRUM_RADIUS, DRUM_HEIGHT, 12), []);
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
    <instancedMesh ref={meshRef} args={[geom, null, positions.length || 0]}>
      <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.8} />
    </instancedMesh>
  );
}

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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ══════════════════════════════════════════════════════════════════════════════

export default function RacksLayout() {
  const layoutData = useMemo(() => {
    const data = {
      selPosts: [],
      selBeamsB: [], selBeamsC: [],
      dynPosts: [], dynRails: [], dynRollers: [],
      pallets: [],
      drums: [],
      boxes: [[], [], []], // 3 types
      buckets: [],
    };

    const distributeLoad = (pos, type = 'standard') => {
      const seed = Math.sin(pos[0] * 12.98 + pos[2] * 78.23) * 43758;
      const rand = seed - Math.floor(seed);
      if (rand < 0.25) return; // 25% empty slot
      data.pallets.push(pos);
      if (rand < 0.4) return; // 15% wood pallet only
      const loadRand = (rand * 10) % 1;
      if (type === 'drums' || loadRand < 0.25) {
        data.drums.push(
          [pos[0]-0.25, pos[1]+0.5, pos[2]-0.25], [pos[0]-0.25, pos[1]+0.5, pos[2]+0.25],
          [pos[0]+0.25, pos[1]+0.5, pos[2]-0.25], [pos[0]+0.25, pos[1]+0.5, pos[2]+0.25]
        );
      } else if (loadRand < 0.7) {
        const bt = Math.floor(loadRand * 10) % 3;
        const bh = BOX_TYPES[bt].size[1];
        for(let y=0; y<2; y++) {
          for(let x=-0.3; x<=0.3; x+=0.35) {
            for(let z=-0.4; z<=0.4; z+=0.45) data.boxes[bt].push([pos[0]+x, pos[1]+0.2+y*bh, pos[2]+z]);
          }
        }
      } else {
        for(let x=-0.3; x<=0.3; x+=0.3) {
          for(let z=-0.4; z<=0.4; z+=0.4) data.buckets.push([pos[0]+x, pos[1]+0.3, pos[2]+z]);
        }
      }
    };

    const postY = BODEGA_ELEVATION + RACK_HEIGHT / 2;
    // Zona C
    const verticalX = [1.4, 6.8]; 
    const vZ = [];
    for(let i=0; i<11; i++) { let cz=11.45+i*3; if(cz<=38.5) vZ.push(cz); }
    verticalX.forEach(cx => {
      vZ.forEach(cz => {
        [cz-RACK_WIDTH/2, cz+RACK_WIDTH/2].forEach(pz => data.selPosts.push([cx-1.2, postY, pz], [cx, postY, pz], [cx+1.2, postY, pz]));
        LEVELS.forEach(ly => {
          const by = BODEGA_ELEVATION+ly;
          data.selBeamsC.push([cx-1.1, by, cz], [cx-0.2, by, cz], [cx+0.2, by, cz], [cx+1.1, by, cz]);
          if(ly<11) [[cx-0.62, by+0.1, cz-0.72], [cx-0.62, by+0.1, cz+0.72], [cx+0.62, by+0.1, cz-0.72], [cx+0.62, by+0.1, cz+0.72]].forEach(p=>distributeLoad(p, 'standard'));
        });
      });
    });
    // Zona B
    const hXB = []; for(let i=0; i<9; i++) hXB.push(12.45+i*3);
    HORIZONTAL_Z_CENTERS_B.forEach(cz => {
      hXB.forEach(cx => {
        [cx-RACK_WIDTH/2, cx+RACK_WIDTH/2].forEach(px => data.selPosts.push([px, postY, cz-1.2], [px, postY, cz], [px, postY, cz+1.2]));
        LEVELS.forEach(ly => {
          const by = BODEGA_ELEVATION+ly;
          data.selBeamsB.push([cx, by, cz-1.1], [cx, by, cz-0.2], [cx, by, cz+0.2], [cx, by, cz+1.1]);
          if(ly<11) [[cx-0.72, by+0.1, cz-0.62], [cx+0.72, by+0.1, cz-0.62], [cx-0.72, by+0.1, cz+0.62], [cx+0.72, by+0.1, cz+0.62]].forEach(p=>distributeLoad(p, 'drums'));
        });
      });
    });
    // Zona A
    const hXA = []; for(let i=0; i<4; i++) hXA.push(42.35+i*3);
    const zLen = 25*1.2; const zC = 10+zLen/2;
    hXA.forEach(cx => {
      [10, 10+zLen/2, 10+zLen].forEach(cz => [cx-RACK_WIDTH/2, cx+RACK_WIDTH/2].forEach(px => data.dynPosts.push([px, postY, cz])));
      LEVELS.forEach(ly => {
        const by = BODEGA_ELEVATION+ly+0.6; data.dynRails.push([cx-0.75, by, zC], [cx+0.75, by, zC]);
        for(let z=10; z<=10+zLen; z+=ROLLER_SPACING) data.dynRollers.push([cx, by-((z-zC)*DYN_SLOPE), z]);
        if(ly<11) { for(let i=0; i<25; i++){ let cz=10.6+i*1.2; distributeLoad([cx-0.7, by+0.1-((cz-zC)*DYN_SLOPE), cz], 'standard'); distributeLoad([cx+0.7, by+0.1-((cz-zC)*DYN_SLOPE), cz], 'standard'); }}
      });
    });
    return data;
  }, []);

  const setHoveredItem = useSimStore(s => s.setHoveredItem);
  const is2D = useSimStore(s => s.viewMode === '2d');

  return (
    <group>
      {[ZONE_A, ZONE_B, ZONE_C].map((z, i) => (
        <mesh key={`hitbox-${i}`} position={[(z.xMin+z.xMax)/2, BODEGA_ELEVATION+0.3, (z.zMin+z.zMax)/2]} rotation={[-Math.PI/2, 0, 0]} onPointerOver={(e) => { e.stopPropagation(); if(is2D) setHoveredItem(z.label); }}>
          <planeGeometry args={[z.xMax-z.xMin, z.zMax-z.zMin]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      ))}
      <InstancedSelectivePosts positions={layoutData.selPosts} />
      <InstancedSelectiveBeams color="#ef4444" positions={layoutData.selBeamsC} rotY={Math.PI/2} />
      <InstancedSelectiveBeams color="#FBC02D" positions={layoutData.selBeamsB} />
      <InstancedSelectivePosts positions={layoutData.dynPosts} /> 
      <InstancedDynamicRails positions={layoutData.dynRails} length={17*1.2} />
      <InstancedDynamicRollers positions={layoutData.dynRollers} />
      <InstancedRealisticPallets positions={layoutData.pallets} />
      <InstancedDrums positions={layoutData.drums} />
      <InstancedBuckets positions={layoutData.buckets} />
      <InstancedBoxes positions={layoutData.boxes[0]} typeIdx={0} />
      <InstancedBoxes positions={layoutData.boxes[1]} typeIdx={1} />
      <InstancedBoxes positions={layoutData.boxes[2]} typeIdx={2} />
    </group>
  );
}
