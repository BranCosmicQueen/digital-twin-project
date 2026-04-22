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
      runFullSequence();
    }
    
    return () => {
      if (tlRef.current) tlRef.current.kill();
    };
  }, [status]);

  const runFullSequence = () => {
    // ══════════════════════════════════════════════════════════════════════════════
    // FLUJO COMPLETO: Entrada (Vacío) -> Carga (Worker) -> Salida (Pesado)
    // ══════════════════════════════════════════════════════════════════════════════
    
    setTruckVisible(true);
    setGateEntryOpen(false);
    setWorkerVisible(false);
    
    const tl = gsap.timeline({
      onComplete: () => {
        setStatus('idle');
      }
    });
    tlRef.current = tl;

    // ── 1. ENTRADA (VACÍO - NO SE PESA) ──
    tl.set({}, { onStart: () => setTruckTransform([130, 0, 25], [0, -Math.PI / 2, 0], 'driving') });

    // Llegada a Portón
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const x = 130 - p * 22; // 130 -> 108
        setTruckTransform([x, 0, 25], [0, -Math.PI / 2, 0], 'driving');
      }
    });

    // Reconocimiento y Apertura
    tl.to({}, { 
      duration: 1.5, 
      onStart: () => setTruckStatus('parked'),
      onComplete: () => setGateEntryOpen(true) 
    });

    // Ingreso Directo al Mutex (SALTANDO ROMANA)
    tl.to({}, {
      duration: 2.5,
      onStart: () => setTruckStatus('driving'),
      onUpdate: function() {
        const p = this.progress();
        const x = 108 - p * 30; // 108 -> 78
        setTruckTransform([x, 0, 25], [0, -Math.PI / 2, 0], 'driving');
      }
    });

    // Giro en Mutex
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const angle = -Math.PI / 2 + p * Math.PI; 
        const x = 78 - Math.sin(p * Math.PI) * 4; 
        setTruckTransform([x, 0, 25], [0, angle, 0], 'driving');
      }
    });

    // Posicionamiento en Outbound (Muelle Carga Z=20)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 78 - p * 16; // 78 -> 62
        const z = 25 - p * 5;  // 25 -> 20
        setTruckTransform([x, 0, z], [0, Math.PI / 2, 0], 'reversing');
      }
    });

    // ── 2. PROCESO DE CARGA (WORKER DESDE ZONA A) ──
    tl.to({}, { 
      duration: 1, 
      onStart: () => {
        setTruckStatus('loading');
        setWorkerVisible(true);
        setWorkerTransform([45, 1.2, 20]); // En Zona A
      }
    });

    // Worker va al camión
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const x = 45 + p * 12; // 45 -> 57 (Cerca del muelle)
        setWorkerTransform([x, 1.2, 20]);
      }
    });

    // Simulación de carga (Espera)
    tl.to({}, { duration: 2 });

    // Worker vuelve a Zona A
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const x = 57 - p * 12; 
        setWorkerTransform([x, 1.2, 20]);
      },
      onComplete: () => setWorkerVisible(false)
    });

    // ── 3. SALIDA (CARGADO - DEBE PESARSE) ──
    tl.to({}, {
      duration: 2,
      onStart: () => setTruckStatus('driving'),
      onUpdate: function() {
        const p = this.progress();
        const x = 62 + p * 16; // 62 -> 78
        const z = 20 + p * 5;  // 20 -> 25
        setTruckTransform([x, 0, z], [0, 0, 0], 'driving');
      }
    });

    // Hacia la Romana
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const x = 78 + p * 2;
        const z = 25 - p * 19;
        setTruckTransform([x, 0, z], [0, 0, 0], 'driving');
      }
    });

    // Detención en Romana para Pesaje (Obligatorio por estar cargado)
    tl.to({}, { 
      duration: 3, 
      onStart: () => setTruckStatus('parked'),
      onComplete: () => {
        setTruckStatus('driving');
        setGateEntryOpen(true);
      }
    });

    // Salida por Calle Adela
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 80 + p * 50; 
        const z = 6 + p * 19; 
        setTruckTransform([x, 0, z], [0, Math.PI / 2, 0], 'driving');
      }
    });

    tl.to({}, { duration: 1, onStart: () => {
      setGateEntryOpen(false);
      setTruckVisible(false);
    }});
  };

  const runInboundSequence = () => { /* legacy fallback */ };
  const runOutboundSequence = () => { /* legacy fallback */ };

  return null;
}
