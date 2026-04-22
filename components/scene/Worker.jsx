'use client';

import { forwardRef } from 'react';
import * as THREE from 'three';

const Worker = forwardRef(function Worker({ visible = true, color = '#3b82f6', ...props }, ref) {
  if (!visible) return null;

  return (
    <group ref={ref} {...props}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.25, 1, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      {/* Safety Vest */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.6, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
      {/* Helmet */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
});

export default Worker;
