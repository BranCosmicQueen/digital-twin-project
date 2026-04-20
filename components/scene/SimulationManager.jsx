'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSimulationStore } from '@/lib/store';
import { 
  GATE_ENTRY_Z, 
  GATE_EXIT_Z, 
  DOCK_INBOUND_2_Z,
  ROMANA_X,
  ROMANA_Z,
  PATIO_CENTER_X,
  PATIO_CENTER_Z,
  DOCK_WALL_X
} from '@/lib/constants';

export default function SimulationManager() {
  const { 
    status, 
    setStatus, 
    setTruckVisible, 
    setTruckTransform, 
    setGateEntryOpen, 
    setGateExitOpen,
    addBarrels
  } = useSimulationStore();

  const tlRef = useRef();

  useLayoutEffect(() => {
    if (status === 'inbound') {
      runInboundSequence();
    } else if (status === 'outbound') {
      runOutboundSequence();
    }
    
    return () => {
      if (tlRef.current) tlRef.current.kill();
    };
  }, [status]);

  const runInboundSequence = () => {
    // Reset state and hide/show truck
    setTruckVisible(true);
    setGateEntryOpen(false);
    
    const tl = gsap.timeline({
      onComplete: () => setStatus('loading')
    });
    tlRef.current = tl;

    // 1. Initial State
    tl.set({}, { onStart: () => setTruckTransform([115, 0, 5], [0, -Math.PI / 2, 0]) });

    // 2. Open Gate
    tl.to({}, { duration: 1, onStart: () => setGateEntryOpen(true) });

    // 3. Move to Romana (X=100 -> X=90)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress(); 
        const x = 115 - p * 25; // 115 -> 90
        // Diagonal curve toward Romana Z=12
        const z = 5 + p * 7;
        // Approximation of rotation
        const rot = -Math.PI / 2 + (p * 0.2); 
        setTruckTransform([x, 0, z], [0, rot, 0]);
      }
    });

    // 4. Weighbridge Pause
    tl.to({}, { duration: 2 }); // Pausa pesaje

    // 5. Advance to Yard Center (X=90 -> X=80, Z=12 -> Z=25)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 90 - p * 10;
        const z = 12 + p * 13;
        const rot = -Math.PI / 2 + 0.2 + (p * 0.4);
        setTruckTransform([x, 0, z], [0, rot, 0]);
      }
    });

    // 6. U-Turn Maneuver (The hard part)
    tl.to({}, {
      duration: 4,
      onUpdate: function() {
        const p = this.progress();
        // Círculo de giro
        const angle = -Math.PI / 2 + p * Math.PI; // -90 to +90
        const x = 80 + Math.cos(angle) * 10;
        const z = 25 + Math.sin(angle) * 10;
        setTruckTransform([x, 0, z], [0, -angle + Math.PI],);
      }
    });

    // 7. Precise Docking (Reverse into Muelle 2)
    // Muelle 2 is at X=60, Z=19. Truck center should be at X=68, Z=19
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const startX = 70; // Position after turn
        const endX = 68;
        const x = startX - p * (startX - endX);
        setTruckTransform([x, 0, 19], [0, Math.PI / 2, 0]);
      }
    });

    // 8. Finished Inbound
    tl.add(() => {
      addBarrels(40);
      setGateEntryOpen(false);
    });
  };

  const runOutboundSequence = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTruckVisible(false);
        setStatus('idle');
      }
    });
    tlRef.current = tl;

    // Start at Dock
    // 1. Move forward to Center
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 68 + p * 12; // 68 -> 80
        setTruckTransform([x, 0, 19], [0, Math.PI / 2, 0]);
      }
    });

    // 2. Open Exit Gate
    tl.to({}, { duration: 1, onStart: () => setGateExitOpen(true) });

    // 3. Move to Exit (X=80 -> X=115, Z=19 -> Z=39)
    tl.to({}, {
      duration: 4,
      onUpdate: function() {
        const p = this.progress();
        const x = 80 + p * 35;
        const z = 19 + p * 20;
        setTruckTransform([x, 0, z], [0, Math.PI / 2 - 0.3, 0]);
      }
    });

    // 4. Close Exit Gate
    tl.to({}, { duration: 0.5, onStart: () => setGateExitOpen(false) });
  };

  return null; // Headless logic component
}
