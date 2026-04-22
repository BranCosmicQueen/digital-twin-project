'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSimulationStore } from '@/lib/store';
import { 
  GATE_MAIN_Z, 
  DOCK_CARGA_Z,
  DOCK_DESCARGA_Z,
  ROMANA_X,
  ROMANA_Z,
} from '@/lib/constants';

export default function SimulationManager() {
  const { 
    status, 
    setStatus, 
    setTruckVisible, 
    setTruckTransform, 
    setGateEntryOpen, 
    setTruckStatus,
    setWorkerVisible,
    setWorkerTransform,
    addBarrels,
    simSpeed
  } = useSimulationStore();

  const tlRef = useRef();

  useLayoutEffect(() => {
    if (tlRef.current) {
      tlRef.current.timeScale(simSpeed);
    }
  }, [simSpeed]);

  useLayoutEffect(() => {
    if (status === 'inbound') {
      runRecepcionSequence();
    } else if (status === 'outbound') {
      runDespachoSequence();
    }
    
    return () => {
      if (tlRef.current) tlRef.current.kill();
    };
  }, [status]);

  const runRecepcionSequence = () => {
    // ══════════════════════════════════════════════════════════════════════════════
    // RECEPCIÓN (INBOUND): Entra Lleno -> Pesa -> Descarga -> Sale Vacío
    // ══════════════════════════════════════════════════════════════════════════════
    setTruckVisible(true);
    setGateEntryOpen(false);
    setWorkerVisible(false);
    const tl = gsap.timeline({ onComplete: () => setStatus('idle') });
    tlRef.current = tl;

    // 1. Entrada y Portón
    tl.set({}, { onStart: () => setTruckTransform([108, 0, -10], [0, 0, 0], 'driving', 0) });
    tl.to({}, { duration: 2, onUpdate: function() { setTruckTransform([108, 0, -10 + this.progress() * 25], [0, 0, 0], 'driving', 0); } });
    tl.to({}, { duration: 2, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([108 - p * 8, 0, 15 + p * 10], [0, -p * (Math.PI / 2), 0], 'driving', Math.sin(p * Math.PI) * 0.6);
    }});
    tl.to({}, { duration: 1, onStart: () => setTruckStatus('parked'), onComplete: () => setGateEntryOpen(true) });

    // 2. A la Romana (Pesaje de entrada - Camión Lleno)
    tl.to({}, { duration: 2, onStart: () => setTruckStatus('driving'), onUpdate: function() {
        const p = this.progress();
        const x = 100 - p * 4; // 100 -> 96
        const z = 25 + p * 5; // 25 -> 30
        const angle = -Math.PI/2 + p * (Math.PI/2); // -90 -> 0 (Sur)
        setTruckTransform([x, 0, z], [0, angle, 0], 'driving', -Math.sin(p * Math.PI) * 0.5);
    }});
    tl.to({}, { duration: 1.5, onUpdate: function() { setTruckTransform([96, 0, 30 + this.progress() * 8], [0, 0, 0], 'driving', 0); } });
    tl.to({}, { duration: 2.5, onStart: () => setTruckStatus('parked'), onComplete: () => setTruckStatus('driving') });

    // 3. Escape Reversa para ir al muelle
    tl.to({}, { duration: 3, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([96 - p * 16, 0, 38 - p * 13], [0, p * (Math.PI/2), 0], 'reversing', -Math.sin(p * Math.PI) * 0.8);
    }});

    // 4. Reversa al muelle de DESCARGA (Z=30)
    tl.to({}, { duration: 2.5, onUpdate: function() {
        const p = this.progress();
        const x = 80 - p * 10; // 80 -> 70
        const z = 25 + p * 5;  // 25 -> 30
        setTruckTransform([x, 0, z], [0, Math.PI / 2, 0], 'reversing', Math.sin(p * Math.PI) * 0.3);
    }});

    // 5. Descarga
    tl.to({}, { duration: 1, onStart: () => { setTruckStatus('unloading'); setWorkerVisible(true); setWorkerTransform([45, 1.2, 30]); } });
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([45 + this.progress() * 16, 1.2, 30]); } });
    tl.to({}, { duration: 2 }); // Unloading barrels...
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([61 - this.progress() * 16, 1.2, 30]); }, onComplete: () => setWorkerVisible(false) });

    // 6. Salida Directa (Sin pesar de nuevo ya que va vacío)
    tl.to({}, { duration: 2, onStart: () => setTruckStatus('driving'), onUpdate: function() { setTruckTransform([70 + this.progress() * 38, 0, 30 - this.progress() * 5], [0, Math.PI/2, 0], 'driving', 0); } });
    tl.to({}, { duration: 2, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([108, 0, 25 + p * 35], [0, Math.PI/2 - p * (Math.PI/2), 0], 'driving', Math.sin(p * Math.PI) * 0.5);
    }});
    tl.to({}, { duration: 1, onStart: () => { setGateEntryOpen(false); setTruckVisible(false); } });
  };

  const runDespachoSequence = () => {
    // ══════════════════════════════════════════════════════════════════════════════
    // DESPACHO (OUTBOUND): Entra Vacío -> Carga -> Pesa -> Sale Lleno
    // ══════════════════════════════════════════════════════════════════════════════
    setTruckVisible(true);
    setGateEntryOpen(false);
    setWorkerVisible(false);
    const tl = gsap.timeline({ onComplete: () => setStatus('idle') });
    tlRef.current = tl;

    // 1. Entrada y Portón
    tl.set({}, { onStart: () => setTruckTransform([108, 0, -10], [0, 0, 0], 'driving', 0) });
    tl.to({}, { duration: 2, onUpdate: function() { setTruckTransform([108, 0, -10 + this.progress() * 25], [0, 0, 0], 'driving', 0); } });
    tl.to({}, { duration: 2, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([108 - p * 8, 0, 15 + p * 10], [0, -p * (Math.PI / 2), 0], 'driving', Math.sin(p * Math.PI) * 0.6);
    }});
    tl.to({}, { duration: 1, onStart: () => setTruckStatus('parked'), onComplete: () => setGateEntryOpen(true) });

    // 2. Al Mutex (No pesa porque entra vacío)
    tl.to({}, { duration: 2.5, onStart: () => setTruckStatus('driving'), onUpdate: function() { setTruckTransform([100 - this.progress() * 22, 0, 25], [0, -Math.PI/2, 0], 'driving', 0); } });
    tl.to({}, { duration: 3, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([78 - Math.sin(p * Math.PI) * 4, 0, 25], [0, -Math.PI/2 + p * Math.PI, 0], 'driving', -Math.sin(p * Math.PI) * 0.6);
    }});

    // 3. Reversa al muelle de CARGA (Z=20)
    tl.to({}, { duration: 3, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([78 - p * 8, 0, 25 - p * 5], [0, Math.PI/2, 0], 'reversing', -Math.sin(p * Math.PI) * 0.3);
    }});

    // 4. Carga
    tl.to({}, { duration: 1, onStart: () => { setTruckStatus('loading'); setWorkerVisible(true); setWorkerTransform([45, 1.2, 20]); } });
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([45 + this.progress() * 16, 1.2, 20]); } });
    tl.to({}, { duration: 2 }); // Loading...
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([61 - this.progress() * 16, 1.2, 20]); }, onComplete: () => setWorkerVisible(false) });

    // 5. Salida y Pesaje de Salida (Camión Lleno)
    tl.to({}, { duration: 1.5, onStart: () => setTruckStatus('driving'), onUpdate: function() { setTruckTransform([70 + this.progress() * 10, 0, 20], [0, Math.PI/2, 0], 'driving', 0); } });
    tl.to({}, { duration: 2.5, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([80 + p * 16, 0, 20 + p * 10], [0, Math.PI/2 - p * (Math.PI/2), 0], 'driving', Math.sin(p * Math.PI) * 0.6);
    }});
    tl.to({}, { duration: 2, onUpdate: function() { setTruckTransform([96, 0, 30 + this.progress() * 8], [0, 0, 0], 'driving', 0); } });
    tl.to({}, { duration: 3, onStart: () => setTruckStatus('parked'), onComplete: () => setTruckStatus('driving') });

    // 6. Escape Reversa y Salida
    tl.to({}, { duration: 3.5, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([96 - p * 16, 0, 38 - p * 13], [0, p * (Math.PI/2), 0], 'reversing', -Math.sin(p * Math.PI) * 0.8);
    }});
    tl.to({}, { duration: 2.5, onUpdate: function() { setTruckTransform([80 + this.progress() * 28, 0, 25], [0, Math.PI/2, 0], 'driving', 0); } });
    tl.to({}, { duration: 2, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([108, 0, 25 + p * 35], [0, Math.PI/2 - p * (Math.PI/2), 0], 'driving', Math.sin(p * Math.PI) * 0.5);
    }});
    tl.to({}, { duration: 1, onStart: () => { setGateEntryOpen(false); setTruckVisible(false); } });
  };

  return null;
}
