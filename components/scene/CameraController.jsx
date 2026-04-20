'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import {
  MapControls,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei';
import * as THREE from 'three';
import useSimStore from '@/store/useSimStore';
import {
  CAMERA_PRESETS,
  BODEGA_WIDTH,
  BODEGA_DEPTH,
  BODEGA_ELEVATION,
} from '@/lib/constants';

// Center of the warehouse
const CENTER_X = BODEGA_WIDTH / 2;   // 30
const CENTER_Z = BODEGA_DEPTH / 2;   // 25

export default function CameraController() {
  const { set, size } = useThree();
  const controlsRef = useRef();
  const perspCamRef = useRef();
  const orthoCamRef = useRef();

  const viewMode = useSimStore((s) => s.viewMode);

  // ── Setup ortho camera to fit warehouse ──
  const setupOrtho = useCallback(() => {
    const cam = orthoCamRef.current;
    if (!cam) return;

    // Position directly above center of bodega
    cam.position.set(CENTER_X, 100, CENTER_Z);
    cam.up.set(0, 0, -1); // Z-negative is "up" in plan view (North at top)
    cam.lookAt(CENTER_X, 0, CENTER_Z);

    // Calculate zoom to fit the full bodega with margins
    const marginX = 10; // meters of margin (for ruler labels)
    const marginZ = 8;
    const totalWidth = BODEGA_WIDTH + marginX;
    const totalDepth = BODEGA_DEPTH + marginZ;

    const zoomW = size.width / totalWidth;
    const zoomH = size.height / totalDepth;
    cam.zoom = Math.min(zoomW, zoomH) * 0.92;

    cam.updateProjectionMatrix();
    set({ camera: cam });

    if (controlsRef.current) {
      controlsRef.current.target.set(CENTER_X, 0, CENTER_Z);
      controlsRef.current.update();
    }
  }, [set, size.width, size.height]);

  // ── Camera Switching ──
  useEffect(() => {
    if (viewMode === '2d') {
      setupOrtho();
    } else if (viewMode === '3d' && perspCamRef.current) {
      const preset = CAMERA_PRESETS.perspective;
      perspCamRef.current.position.set(...preset.position);
      perspCamRef.current.lookAt(...preset.lookAt);
      set({ camera: perspCamRef.current });

      if (controlsRef.current) {
        controlsRef.current.target.set(...preset.lookAt);
        controlsRef.current.update();
      }
    }
  }, [viewMode, set, setupOrtho]);

  return (
    <>
      {/* Perspective Camera (3D inspection) */}
      <PerspectiveCamera
        ref={perspCamRef}
        makeDefault={viewMode === '3d'}
        position={CAMERA_PRESETS.perspective.position}
        fov={50}
        near={0.1}
        far={500}
      />

      {/* Orthographic Camera (2D cenital — default for validation) */}
      <OrthographicCamera
        ref={orthoCamRef}
        makeDefault={viewMode === '2d'}
        position={[CENTER_X, 100, CENTER_Z]}
        zoom={10}
        near={0.1}
        far={500}
      />

      {/* MapControls: pan + zoom enabled, rotation only in 3D */}
      <MapControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.1}
        enableRotate={viewMode === '3d'}
        enablePan={true}
        panSpeed={1.5}
        zoomSpeed={1.2}
        minZoom={3}
        maxZoom={60}
        minDistance={5}
        maxDistance={300}
        screenSpacePanning={true}
        target={[CENTER_X, 0, CENTER_Z]}
      />
    </>
  );
}
