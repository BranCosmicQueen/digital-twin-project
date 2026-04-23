'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import {
  MapControls,
  OrthographicCamera,
  PerspectiveCamera,
  useKeyboardControls,
} from '@react-three/drei';
import * as THREE from 'three';
import useSimStore from '@/store/useSimStore';
import {
  CAMERA_PRESETS,
  BODEGA_WIDTH,
  BODEGA_DEPTH,
  BODEGA_ELEVATION,
} from '@/lib/constants';

// Center points
const WAREHOUSE_CENTER_X = BODEGA_WIDTH / 2; // 30
const SITE_CENTER_X = 60; // User request: Center at 60
const SITE_CENTER_Z = BODEGA_DEPTH / 2; // 25
const TOTAL_SITE_WIDTH = 100;

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

    // Position directly above center of site
    cam.position.set(SITE_CENTER_X, 100, SITE_CENTER_Z);
    cam.up.set(0, 0, -1); // Z-negative is "up" in plan view (North at top)
    cam.lookAt(SITE_CENTER_X, 0, SITE_CENTER_Z);

    // Calculate zoom to fit the full 100m site with margins
    const marginX = 20; // meters of margin for full site
    const marginZ = 10;
    const totalWidth = TOTAL_SITE_WIDTH + marginX;
    const totalDepth = BODEGA_DEPTH + marginZ;

    const zoomW = size.width / totalWidth;
    const zoomH = size.height / totalDepth;
    cam.zoom = Math.min(zoomW, zoomH) * 0.95;

    cam.updateProjectionMatrix();
    set({ camera: cam });

    if (controlsRef.current) {
      controlsRef.current.target.set(SITE_CENTER_X, 0, SITE_CENTER_Z);
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

  // ── WASD Movement Logic (Phase 1 Requirement) ──
  const [, getKeys] = useKeyboardControls();
  const MOVEMENT_SPEED = 15; // meters per second

  useFrame((state, delta) => {
    if (viewMode !== '3d') return;
    
    const { forward, backward, left, right } = getKeys();
    const camera = state.camera;
    const controls = controlsRef.current;

    if (!camera || !controls) return;

    // Direct translation
    const moveZ = (forward ? 1 : 0) - (backward ? 1 : 0);
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);

    if (moveZ !== 0 || moveX !== 0) {
      // Create movement vector relative to camera rotation (flattened to Y=0)
      const moveVector = new THREE.Vector3(moveX, 0, -moveZ);
      moveVector.applyQuaternion(camera.quaternion);
      moveVector.y = 0; // Keep movement on the ground
      moveVector.normalize().multiplyScalar(MOVEMENT_SPEED * delta);

      camera.position.add(moveVector);
      
      // Crucial: Update control target to follow camera position shift
      controls.target.add(moveVector);
      controls.update();
    }
  });

  return (
    <>
      {/* Perspective Camera (3D inspection) */}
      <PerspectiveCamera
        ref={perspCamRef}
        makeDefault={viewMode === '3d'}
        position={CAMERA_PRESETS.perspective.position}
        fov={45}
        near={0.1}
        far={1000}
      />

      {/* Orthographic Camera (2D cenital) */}
      <OrthographicCamera
        ref={orthoCamRef}
        makeDefault={viewMode === '2d'}
        position={[SITE_CENTER_X, 100, SITE_CENTER_Z]}
        zoom={10}
        near={0.1}
        far={500}
      />

      {/* MapControls: pan + zoom enabled, rotation only in 3D */}
      <MapControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.15}
        enableRotate={viewMode === '3d'}
        enablePan={true}
        panSpeed={1.5}
        zoomSpeed={1.2}
        minZoom={3}
        maxZoom={60}
        minDistance={2}
        maxDistance={400}
        screenSpacePanning={true}
        target={[SITE_CENTER_X, 0, SITE_CENTER_Z]}
      />
    </>
  );
}
