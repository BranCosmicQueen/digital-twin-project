'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import useSimStore from '@/store/useSimStore';
import Truck from '@/components/scene/Truck';
import Forklift from '@/components/scene/Forklift';
import Pallet from '@/components/scene/Pallet';
import {
  GATE_X,
  GATE_EXIT_Z,
  DOCK_WALL_X,
  DOCK_OUTBOUND_3_Z,
  PATIO_CENTER_X,
  PATIO_CENTER_Z,
  BODEGA_ELEVATION,
  ANIM_DURATIONS,
  COLORS,
} from '@/lib/constants';

export default function OutboundSequence() {
  const simState = useSimStore((s) => s.simState);
  const setAnimationPhase = useSimStore((s) => s.setAnimationPhase);
  const setIsAnimating = useSimStore((s) => s.setIsAnimating);

  const truckRef = useRef();
  const forkliftRef = useRef();
  const palletRefs = [useRef(), useRef(), useRef()];
  const timelineRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (simState !== 'outbound') {
      setShow(false);
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      return;
    }

    setShow(true);

    const initTimeout = setTimeout(() => {
      if (!truckRef.current || !forkliftRef.current) return;

      const truck = truckRef.current;
      const forklift = forkliftRef.current;

      // ── Initial positions ──
      truck.position.set(GATE_X + 20, 0, GATE_EXIT_Z);
      truck.rotation.set(0, Math.PI / 2, 0); // Facing west

      forklift.position.set(DOCK_WALL_X + 3, BODEGA_ELEVATION, DOCK_OUTBOUND_3_Z);
      forklift.rotation.set(0, -Math.PI / 2, 0);

      // Pallets start in staging outbound
      palletRefs.forEach((pr, i) => {
        if (pr.current) {
          pr.current.position.set(
            DOCK_WALL_X - 5 - i * 2,
            BODEGA_ELEVATION + 0.15,
            DOCK_OUTBOUND_3_Z + (i - 1) * 1.5
          );
          pr.current.visible = true;
        }
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setAnimationPhase(0);
          setIsAnimating(false);
        },
      });

      // ═══ Phase 1: Empty truck enters through Portón Salida ═══
      tl.call(() => { setAnimationPhase(1); setIsAnimating(true); });

      tl.to(truck.position, {
        x: PATIO_CENTER_X + 5,
        duration: ANIM_DURATIONS.truckEnter,
        ease: 'power2.inOut',
      });

      // ═══ Phase 2: Turn and reverse to dock 3 ═══
      tl.call(() => setAnimationPhase(2));

      // Move to turning area
      tl.to(truck.position, {
        x: PATIO_CENTER_X,
        z: PATIO_CENTER_Z + 5,
        duration: 1.2,
        ease: 'power1.inOut',
      });

      // Turn 180°
      tl.to(truck.rotation, {
        y: -Math.PI / 2,
        duration: ANIM_DURATIONS.truckTurn,
        ease: 'power1.inOut',
      });

      // Reverse to dock
      tl.to(truck.position, {
        x: DOCK_WALL_X + 12,
        z: DOCK_OUTBOUND_3_Z,
        duration: ANIM_DURATIONS.truckReverse,
        ease: 'power2.inOut',
      });

      // ═══ Phase 3: Load pallets from staging ═══
      tl.call(() => setAnimationPhase(3));

      palletRefs.forEach((pr, i) => {
        if (pr.current) {
          // Forklift goes to pallet
          tl.to(forklift.position, {
            x: DOCK_WALL_X - 5 - i * 2,
            z: DOCK_OUTBOUND_3_Z + (i - 1) * 1.5,
            duration: 0.6,
            ease: 'power1.inOut',
          });

          // Lift pallet
          tl.to(pr.current.position, {
            y: BODEGA_ELEVATION + 1.2,
            duration: 0.3,
            ease: 'power1.out',
          });

          // Carry to truck
          tl.to(forklift.position, {
            x: DOCK_WALL_X + 10,
            z: DOCK_OUTBOUND_3_Z,
            duration: 0.8,
            ease: 'power1.inOut',
          });
          tl.to(pr.current.position, {
            x: DOCK_WALL_X + 10 + (i - 1) * 2,
            y: 1.2,
            z: DOCK_OUTBOUND_3_Z,
            duration: 0.8,
            ease: 'power1.inOut',
          }, '<');

          // Lower pallet
          tl.to(pr.current.position, {
            y: 0.8,
            duration: 0.2,
            ease: 'power1.in',
          });
        }
      });

      // Forklift returns
      tl.to(forklift.position, {
        x: DOCK_WALL_X + 3,
        z: DOCK_OUTBOUND_3_Z + 3,
        duration: 0.5,
        ease: 'power1.inOut',
      });

      // ═══ Phase 4: Loaded truck exits through Portón Salida ═══
      tl.call(() => setAnimationPhase(4));

      tl.to(truck.rotation, {
        y: Math.PI / 2,
        duration: 0.8,
        ease: 'power1.inOut',
      });

      tl.to(truck.position, {
        x: GATE_X + 25,
        z: GATE_EXIT_Z,
        duration: ANIM_DURATIONS.truckExit,
        ease: 'power2.in',
      });

      timelineRef.current = tl;
    }, 200);

    return () => {
      clearTimeout(initTimeout);
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [simState, setAnimationPhase, setIsAnimating]);

  if (!show) return null;

  return (
    <group>
      <Truck ref={truckRef} visible={true} color={COLORS.accentOutbound} />
      <Forklift ref={forkliftRef} visible={true} />
      {palletRefs.map((ref, i) => (
        <Pallet key={`ob-pallet-${i}`} ref={ref} visible={true} />
      ))}
    </group>
  );
}
