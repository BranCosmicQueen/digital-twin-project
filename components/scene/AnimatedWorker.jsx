'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AnimatedWorker({ position, rotation = 0, isCarrying = false }) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const headRef = useRef();

  // Materiales realistas
  const skinMat = new THREE.MeshStandardMaterial({ color: '#ffdbac' }); 
  const vestMat = new THREE.MeshStandardMaterial({ color: '#facc15' }); // Chaleco amarillo
  const reflectiveMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', emissive: '#ffffff', emissiveIntensity: 0.5 }); // Bandas reflectantes
  const pantsMat = new THREE.MeshStandardMaterial({ color: '#1e293b' }); // Azul marino industrial
  const helmetMat = new THREE.MeshStandardMaterial({ color: '#ffffff' }); // Casco blanco (supervisor/operario)
  const bootsMat = new THREE.MeshStandardMaterial({ color: '#451a03' }); // Botas café/negro
  const boxMat = new THREE.MeshStandardMaterial({ color: '#c29a6b' }); // Caja de cartón

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const walkSpeed = 4.5;
    const walkAmp = 0.35;

    // Animación de Caminata Sincronizada (Fase invertida para avance natural)
    leftLegRef.current.rotation.x = -Math.sin(t * walkSpeed) * walkAmp;
    rightLegRef.current.rotation.x = -Math.sin(t * walkSpeed + Math.PI) * walkAmp;
    
    if (isCarrying) {
      // Brazos sosteniendo la caja (Fijos al frente)
      leftArmRef.current.rotation.x = -Math.PI / 2.5;
      rightArmRef.current.rotation.x = -Math.PI / 2.5;
    } else {
      // Brazos balanceándose (Opuestos a las piernas)
      leftArmRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmp;
      rightArmRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp;
    }

    // Cabeza con ligero movimiento
    headRef.current.rotation.y = Math.sin(t * 2) * 0.1;
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* CADERAS */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.35, 0.2, 0.2]} />
        <primitive object={pantsMat} attach="material" />
      </mesh>

      {/* TORSO (Pecho) */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[0.45, 0.5, 0.25]} />
        <primitive object={vestMat} attach="material" />
      </mesh>

      {/* BANDAS REFLECTANTES */}
      <mesh position={[0, 1.35, 0.13]}>
        <boxGeometry args={[0.46, 0.05, 0.01]} />
        <primitive object={reflectiveMat} attach="material" />
      </mesh>
      <mesh position={[0, 1.15, 0.13]}>
        <boxGeometry args={[0.46, 0.05, 0.01]} />
        <primitive object={reflectiveMat} attach="material" />
      </mesh>

      {/* CABEZA Y CASCO */}
      <group ref={headRef} position={[0, 1.55, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Casco */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={helmetMat} attach="material" />
        </mesh>
        <mesh position={[0, 0.02, 0.05]}>
          <boxGeometry args={[0.22, 0.02, 0.25]} />
          <primitive object={helmetMat} attach="material" />
        </mesh>
      </group>

      {/* BRAZO IZQUIERDO */}
      <group ref={leftArmRef} position={[-0.25, 1.45, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
      </group>

      {/* BRAZO DERECHO */}
      <group ref={rightArmRef} position={[0.25, 1.45, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
      </group>

      {/* PIERNA IZQUIERDA */}
      <group ref={leftLegRef} position={[-0.12, 0.85, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.7, 4, 8]} />
          <primitive object={pantsMat} attach="material" />
        </mesh>
        {/* Bota */}
        <mesh position={[0, -0.8, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <primitive object={bootsMat} attach="material" />
        </mesh>
      </group>

      {/* PIERNA DERECHA */}
      <group ref={rightLegRef} position={[0.12, 0.85, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.7, 4, 8]} />
          <primitive object={pantsMat} attach="material" />
        </mesh>
        {/* Bota */}
        <mesh position={[0, -0.8, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <primitive object={bootsMat} attach="material" />
        </mesh>
      </group>

      {/* CARGA (Caja) */}
      {isCarrying && (
        <mesh position={[0, 1.25, 0.4]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <primitive object={boxMat} attach="material" />
        </mesh>
      )}
    </group>
  );
}
