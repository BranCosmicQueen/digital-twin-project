'use client';

import { forwardRef } from 'react';
import {
  TRUCK_CAB_LENGTH,
  TRUCK_CAB_HEIGHT,
  TRUCK_TRAILER_LENGTH,
  TRUCK_TRAILER_HEIGHT,
  TRUCK_WIDTH,
  TRUCK_WHEEL_RADIUS,
  COLORS,
} from '@/lib/constants';

const Truck = forwardRef(function Truck({ 
  visible = true, 
  color, 
  status = 'idle', 
  steeringAngle = 0, 
  doorsOpen = 0, // 0 to 1
  ...props 
}, ref) {
  if (!visible) return null;

  const wheelW = 0.35;
  const cabY = TRUCK_WHEEL_RADIUS + TRUCK_CAB_HEIGHT / 2;
  const trailerY = TRUCK_WHEEL_RADIUS + TRUCK_TRAILER_HEIGHT / 2;

  // Blinking logic for reversing
  const isReversing = status === 'reversing';
  const intensity = isReversing ? (Math.sin(Date.now() * 0.01) > 0 ? 2 : 0.2) : 1;

  const doorAngle = (Math.PI * 0.8) * doorsOpen;

  return (
    <group ref={ref} {...props}>
      {/* ... (Cab code remains the same) */}
      <group position={[0, 0, TRUCK_TRAILER_LENGTH / 2 + TRUCK_CAB_LENGTH / 2 + 0.1]}>
        {/* Cab Parts... (Existing code) */}
        <mesh position={[0, cabY, 0]} castShadow>
          <boxGeometry args={[TRUCK_WIDTH, TRUCK_CAB_HEIGHT, TRUCK_CAB_LENGTH]} />
          <meshStandardMaterial color={color || '#ef4444'} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, cabY + 0.4, TRUCK_CAB_LENGTH / 2 + 0.02]}>
          <boxGeometry args={[TRUCK_WIDTH - 0.2, TRUCK_CAB_HEIGHT * 0.4, 0.05]} />
          <meshStandardMaterial color="#2dd4bf" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, cabY + TRUCK_CAB_HEIGHT / 2 - 0.1, TRUCK_CAB_LENGTH / 2 + 0.1]}>
          <boxGeometry args={[TRUCK_WIDTH + 0.1, 0.2, 0.4]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={`mirror-${side}`} position={[side * (TRUCK_WIDTH / 2 + 0.1), cabY + 0.2, TRUCK_CAB_LENGTH / 4]}>
            <boxGeometry args={[0.1, 0.6, 0.2]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        ))}
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={`hl-${i}`} position={[x, cabY - 0.7, TRUCK_CAB_LENGTH / 2 + 0.05]}>
            <boxGeometry args={[0.4, 0.25, 0.05]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={status === 'parked' ? 0.2 : 1.5} />
          </mesh>
        ))}
        <mesh position={[0, cabY - 0.6, TRUCK_CAB_LENGTH / 2 + 0.02]}>
          <boxGeometry args={[TRUCK_WIDTH - 0.8, 0.6, 0.05]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={`cw-${side}`} position={[side * (TRUCK_WIDTH / 2 + wheelW / 4), TRUCK_WHEEL_RADIUS, 0.8]} rotation={[0, steeringAngle, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[TRUCK_WHEEL_RADIUS, TRUCK_WHEEL_RADIUS, wheelW, 16]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Trailer (Hollow Structure) ── */}
      <group>
        {/* 1. Interior / Floor */}
        <mesh position={[0, TRUCK_WHEEL_RADIUS + 0.05, 0]} receiveShadow>
          <boxGeometry args={[TRUCK_WIDTH - 0.1, 0.1, TRUCK_TRAILER_LENGTH]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>

        {/* 2. Side Walls */}
        {[-1, 1].map(side => (
          <mesh key={`wall-${side}`} position={[side * (TRUCK_WIDTH / 2 - 0.05), trailerY, 0]} castShadow>
            <boxGeometry args={[0.1, TRUCK_TRAILER_HEIGHT, TRUCK_TRAILER_LENGTH]} />
            <meshStandardMaterial color={COLORS.truckTrailer} />
          </mesh>
        ))}

        {/* 3. Roof */}
        <mesh position={[0, TRUCK_WHEEL_RADIUS + TRUCK_TRAILER_HEIGHT, 0]} castShadow>
          <boxGeometry args={[TRUCK_WIDTH, 0.1, TRUCK_TRAILER_LENGTH]} />
          <meshStandardMaterial color={COLORS.truckTrailer} />
        </mesh>

        {/* 4. Front Wall (Close to cab) */}
        <mesh position={[0, trailerY, TRUCK_TRAILER_LENGTH / 2 - 0.05]} castShadow>
          <boxGeometry args={[TRUCK_WIDTH, TRUCK_TRAILER_HEIGHT, 0.1]} />
          <meshStandardMaterial color={COLORS.truckTrailer} />
        </mesh>

        {/* 5. Animated Rear Doors with Detailed Hinges */}
        {[-1, 1].map(side => (
          <group key={`door-group-${side}`} position={[side * (TRUCK_WIDTH / 2), trailerY, -TRUCK_TRAILER_LENGTH / 2 - 0.01]} rotation={[0, side === 1 ? -doorAngle : doorAngle, 0]}>
            <mesh position={[side === 1 ? -TRUCK_WIDTH / 4 : TRUCK_WIDTH / 4, 0, 0.06]}>
              <boxGeometry args={[TRUCK_WIDTH / 2 - 0.05, TRUCK_TRAILER_HEIGHT - 0.2, 0.1]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Door Bars */}
            <mesh position={[side === 1 ? -TRUCK_WIDTH / 8 : TRUCK_WIDTH / 8, 0, 0.12]}>
              <cylinderGeometry args={[0.03, 0.03, TRUCK_TRAILER_HEIGHT - 0.4]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Chassis & Suspension Details */}
        <mesh position={[0, TRUCK_WHEEL_RADIUS * 1.1, 0]}>
          <boxGeometry args={[TRUCK_WIDTH - 0.4, 0.15, TRUCK_TRAILER_LENGTH + TRUCK_CAB_LENGTH]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Side Protection Bars */}
        {[-1, 1].map(side => (
          <mesh key={`guard-${side}`} position={[side * (TRUCK_WIDTH/2 - 0.1), TRUCK_WHEEL_RADIUS * 1.5, -2]}>
            <boxGeometry args={[0.1, 0.1, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        ))}

        {/* Trailer Wheels */}
        {[-1, 1].map((side) =>
          [-2, -3.2].map((zOff, zi) => (
            <mesh key={`tw-${side}-${zi}`} position={[side * (TRUCK_WIDTH / 2 + wheelW / 4), TRUCK_WHEEL_RADIUS, -TRUCK_TRAILER_LENGTH / 2 + 2 + zOff]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[TRUCK_WHEEL_RADIUS, TRUCK_WHEEL_RADIUS, wheelW, 16]} />
              <meshStandardMaterial color="#111" roughness={1} />
            </mesh>
          ))
        )}

        {/* Taillights & Rear Bumper */}
        <group position={[0, TRUCK_WHEEL_RADIUS, -TRUCK_TRAILER_LENGTH / 2 - 0.15]}>
          <mesh>
            <boxGeometry args={[TRUCK_WIDTH, 0.2, 0.1]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          {[-0.9, 0.9].map((x, i) => (
            <mesh key={`tl-${i}`} position={[x, 0.15, 0.06]}>
              <boxGeometry args={[0.3, 0.15, 0.05]} />
              <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={intensity} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
});

export default Truck;
