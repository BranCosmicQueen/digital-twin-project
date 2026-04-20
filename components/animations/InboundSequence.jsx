'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import useSimStore from '@/store/useSimStore';
import Truck from '@/components/scene/Truck';
import Forklift from '@/components/scene/Forklift';
import Pallet from '@/components/scene/Pallet';
import {
  GATE_X,
  GATE_ENTRY_Z,
  ROMANA_X,
  ROMANA_Z,
  DOCK_WALL_X,
  DOCK_INBOUND_1_Z,
  PATIO_CENTER_X,
  PATIO_CENTER_Z,
  TURNING_RADIUS,
  BODEGA_ELEVATION,
  ANIM_DURATIONS,
} from '@/lib/constants';

export default function InboundSequence() {
  const simState = useSimStore((s) => s.simState);
  const setAnimationPhase = useSimStore((s) => s.setAnimationPhase);
  const setIsAnimating = useSimStore((s) => s.setIsAnimating);

  const truckRef = useRef();
  const forkliftRef = useRef();
  const palletRefs = [useRef(), useRef(), useRef()];
  const timelineRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (simState !== 'inbound') {
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
      // Truck starts outside gate entry (X > 100)
      truck.position.set(GATE_X + 20, 0, GATE_ENTRY_Z);
      truck.rotation.set(0, Math.PI / 2, 0); // Facing west (into patio)

      forklift.position.set(DOCK_WALL_X + 3, BODEGA_ELEVATION, DOCK_INBOUND_1_Z);
      forklift.rotation.set(0, -Math.PI / 2, 0);

      palletRefs.forEach((pr, i) => {
        if (pr.current) {
          pr.current.position.set(GATE_X + 20, 1, GATE_ENTRY_Z);
          pr.current.visible = false;
        }
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setAnimationPhase(0);
          setIsAnimating(false);
        },
      });

      // ═══ Phase 1: Truck enters through Portón Entrada, stops at Romana ═══
      tl.call(() => { setAnimationPhase(1); setIsAnimating(true); });

      // Drive in from gate
      tl.to(truck.position, {
        x: ROMANA_X,
        duration: ANIM_DURATIONS.truckEnter,
        ease: 'power2.inOut',
      });

      // Pause at weighbridge
      tl.to(truck.position, {
        z: ROMANA_Z,
        duration: ANIM_DURATIONS.truckWeighbridge,
        ease: 'power1.inOut',
      });

      // ═══ Phase 2: Turn in patio (25m radius) then reverse to dock ═══
      tl.call(() => setAnimationPhase(2));

      // Drive into turning area
      tl.to(truck.position, {
        x: PATIO_CENTER_X,
        z: PATIO_CENTER_Z - 5,
        duration: 1.5,
        ease: 'power1.inOut',
      });

      // Turn (rotate truck 180°)
      tl.to(truck.rotation, {
        y: -Math.PI / 2,
        duration: ANIM_DURATIONS.truckTurn,
        ease: 'power1.inOut',
      });

      // Reverse toward dock wall (truck now facing east, backing west)
      tl.to(truck.position, {
        x: DOCK_WALL_X + 12,
        z: DOCK_INBOUND_1_Z,
        duration: ANIM_DURATIONS.truckReverse,
        ease: 'power2.inOut',
      });

      // ═══ Phase 3: Unload pallets to Staging Inbound ═══
      tl.call(() => {
        setAnimationPhase(3);
        palletRefs.forEach((pr) => {
          if (pr.current) pr.current.visible = true;
        });
      });

      // Forklift approaches truck
      tl.to(forklift.position, {
        x: DOCK_WALL_X + 10,
        z: DOCK_INBOUND_1_Z,
        duration: 0.8,
        ease: 'power1.inOut',
      });

      // Move each pallet from truck to staging
      palletRefs.forEach((pr, i) => {
        const stagingX = DOCK_WALL_X - 5 - i * 2;
        const stagingZ = DOCK_INBOUND_1_Z + (i - 1) * 1.5;

        if (pr.current) {
          // Pick up from truck
          tl.set(pr.current.position, {
            x: DOCK_WALL_X + 10,
            y: BODEGA_ELEVATION + 0.5,
            z: DOCK_INBOUND_1_Z,
          });

          // Forklift carries to staging
          tl.to(forklift.position, {
            x: stagingX,
            z: stagingZ,
            duration: 0.8,
            ease: 'power1.inOut',
          });
          tl.to(pr.current.position, {
            x: stagingX,
            y: BODEGA_ELEVATION + 0.15,
            z: stagingZ,
            duration: 0.8,
            ease: 'power1.inOut',
          }, '<');

          // Return forklift
          if (i < palletRefs.length - 1) {
            tl.to(forklift.position, {
              x: DOCK_WALL_X + 10,
              z: DOCK_INBOUND_1_Z,
              duration: 0.5,
              ease: 'power1.inOut',
            });
          }
        }
      });

      // Forklift returns to rest
      tl.to(forklift.position, {
        x: DOCK_WALL_X + 3,
        z: DOCK_INBOUND_1_Z + 3,
        duration: 0.5,
        ease: 'power1.inOut',
      });

      // ═══ Phase 4: Truck exits through entry gate ═══
      tl.call(() => setAnimationPhase(4));

      tl.to(truck.rotation, {
        y: Math.PI / 2,
        duration: 0.8,
        ease: 'power1.inOut',
      });

      tl.to(truck.position, {
        x: GATE_X + 25,
        z: GATE_ENTRY_Z,
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
      <Truck ref={truckRef} visible={true} />
      <Forklift ref={forkliftRef} visible={true} />
      {palletRefs.map((ref, i) => (
        <Pallet key={`ib-pallet-${i}`} ref={ref} visible={true} />
      ))}
    </group>
  );
}
