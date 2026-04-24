'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Forklift from './Forklift';
import Worker from './Worker';
import { BODEGA_ELEVATION } from '@/lib/constants';

function MovingForklift({ startPos, path, speed = 0.05 }) {
  const ref = useRef();
  const targetIdx = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const target = path[targetIdx.current];
    const currentPos = ref.current.position;
    
    const dx = target[0] - currentPos.x;
    const dz = target[1] - currentPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.2) {
      targetIdx.current = (targetIdx.current + 1) % path.length;
    } else {
      const angle = Math.atan2(dx, dz);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, angle, 0.1);
      ref.current.position.x += (dx / dist) * speed * delta * 60;
      ref.current.position.z += (dz / dist) * speed * delta * 60;
    }
  });

  return <Forklift ref={ref} position={[startPos[0], BODEGA_ELEVATION, startPos[1]]} />;
}

function WalkingWorker({ startPos, path, speed = 0.03, color }) {
  const ref = useRef();
  const targetIdx = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const target = path[targetIdx.current];
    const currentPos = ref.current.position;
    
    const dx = target[0] - currentPos.x;
    const dz = target[1] - currentPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.1) {
      targetIdx.current = (targetIdx.current + 1) % path.length;
    } else {
      const angle = Math.atan2(dx, dz);
      ref.current.rotation.y = angle;
      ref.current.position.x += (dx / dist) * speed * delta * 60;
      ref.current.position.z += (dz / dist) * speed * delta * 60;
      
      // Walking bobbing effect
      ref.current.position.y = BODEGA_ELEVATION + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.05;
    }
  });

  return <Worker ref={ref} position={[startPos[0], BODEGA_ELEVATION, startPos[1]]} color={color} scale={0.8} />;
}

export default function OperationalSim() {
  // Paths for forklifts
  const forkliftPath1 = useMemo(() => [[25, 12], [25, 38], [22, 38], [22, 12]], []);
  const forkliftPath2 = useMemo(() => [[45, 15], [45, 45], [48, 45], [48, 15]], []);
  
  // Paths for workers
  const workerPath1 = useMemo(() => [[5, 45], [55, 45], [55, 47], [5, 47]], []);
  const workerPath2 = useMemo(() => [[58, 15], [58, 45], [56, 45], [56, 15]], []);

  return (
    <group>
      {/* Forklifts */}
      <MovingForklift startPos={[25, 12]} path={forkliftPath1} speed={0.08} />
      <MovingForklift startPos={[45, 15]} path={forkliftPath2} speed={0.06} />

      {/* Personnel */}
      <WalkingWorker startPos={[5, 45]} path={workerPath1} color="#3b82f6" />
      <WalkingWorker startPos={[58, 20]} path={workerPath2} color="#10b981" />
    </group>
  );
}
