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

const Truck = forwardRef(function Truck({ visible = true, color, ...props }, ref) {
  if (!visible) return null;

  const wheelW = 0.35;
  const cabY = TRUCK_WHEEL_RADIUS + TRUCK_CAB_HEIGHT / 2;
  const trailerY = TRUCK_WHEEL_RADIUS + TRUCK_TRAILER_HEIGHT / 2;

  return (
    <group ref={ref} {...props}>
      {/* ── Cab ── */}
      <group position={[0, 0, TRUCK_TRAILER_LENGTH / 2 + TRUCK_CAB_LENGTH / 2 + 0.5]}>
        <mesh position={[0, cabY, 0]} castShadow>
          <boxGeometry args={[TRUCK_WIDTH, TRUCK_CAB_HEIGHT, TRUCK_CAB_LENGTH]} />
          <meshStandardMaterial color={color || COLORS.truckCab} roughness={0.4} />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, cabY + 0.3, TRUCK_CAB_LENGTH / 2 + 0.01]}>
          <boxGeometry args={[TRUCK_WIDTH - 0.3, TRUCK_CAB_HEIGHT * 0.45, 0.05]} />
          <meshStandardMaterial color="#1e3a5f" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Headlights */}
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={`hl-${i}`} position={[x, cabY - 0.6, TRUCK_CAB_LENGTH / 2 + 0.05]}>
            <boxGeometry args={[0.3, 0.2, 0.05]} />
            <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={0.8} />
          </mesh>
        ))}

        {/* Cab wheels */}
        {[-1, 1].map((side) => (
          <mesh
            key={`cw-${side}`}
            position={[side * (TRUCK_WIDTH / 2 + wheelW / 2), TRUCK_WHEEL_RADIUS, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[TRUCK_WHEEL_RADIUS, TRUCK_WHEEL_RADIUS, wheelW, 12]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ── Trailer ── */}
      <group>
        <mesh position={[0, trailerY, 0]} castShadow>
          <boxGeometry args={[TRUCK_WIDTH, TRUCK_TRAILER_HEIGHT, TRUCK_TRAILER_LENGTH]} />
          <meshStandardMaterial color={COLORS.truckTrailer} roughness={0.5} />
        </mesh>

        {/* Frame */}
        <mesh position={[0, TRUCK_WHEEL_RADIUS * 1.3, 0]}>
          <boxGeometry args={[TRUCK_WIDTH + 0.1, 0.12, TRUCK_TRAILER_LENGTH]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Rear door */}
        <mesh position={[0, trailerY, -TRUCK_TRAILER_LENGTH / 2 - 0.05]}>
          <boxGeometry args={[TRUCK_WIDTH - 0.1, TRUCK_TRAILER_HEIGHT - 0.3, 0.08]} />
          <meshStandardMaterial color="#bbb" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Trailer wheels (dual axle) */}
        {[-1, 1].map((side) =>
          [-2.5, 0].map((zOff, zi) => (
            <mesh
              key={`tw-${side}-${zi}`}
              position={[
                side * (TRUCK_WIDTH / 2 + wheelW / 2),
                TRUCK_WHEEL_RADIUS,
                -TRUCK_TRAILER_LENGTH / 4 + zOff,
              ]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[TRUCK_WHEEL_RADIUS, TRUCK_WHEEL_RADIUS, wheelW, 12]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
          ))
        )}

        {/* Taillights */}
        {[-0.8, 0.8].map((x, i) => (
          <mesh key={`tl-${i}`} position={[x, trailerY - 1.2, -TRUCK_TRAILER_LENGTH / 2 - 0.08]}>
            <boxGeometry args={[0.25, 0.15, 0.05]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
});

export default Truck;
