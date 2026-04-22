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
    // FLUJO FÍSICO ESTRICTO: Inbound por calle Z, Romana en Sur y Escape Reversa
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

    // ── 1. ENTRADA (INBOUND CALLE ADELA) ──
    // Aparece en el Norte de Calle Adela, orientado al Sur
    tl.set({}, { onStart: () => setTruckTransform([108, 0, -10], [0, 0, 0], 'driving', 0) });

    // Avanza por la calle hasta antes del portón
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const z = -10 + p * 25; // -10 -> 15
        setTruckTransform([108, 0, z], [0, 0, 0], 'driving', 0);
      }
    });

    // Maniobra vertical-diagonal para ingresar por el portón (Radio de giro cerrado)
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const x = 108 - p * 8; // 108 -> 100
        const z = 15 + p * 10; // 15 -> 25
        
        // Gira de Sur (0) a Oeste (-Math.PI/2) doblando a la derecha
        const angle = -p * (Math.PI / 2);
        const steering = Math.sin(p * Math.PI) * 0.6; // Volante a la derecha
        setTruckTransform([x, 0, z], [0, angle, 0], 'driving', steering);
      }
    });

    // Espera apertura de portón
    tl.to({}, { 
      duration: 1.5, 
      onStart: () => setTruckStatus('parked'),
      onComplete: () => setGateEntryOpen(true) 
    });

    // Ingreso hacia el Mutex
    tl.to({}, {
      duration: 2.5,
      onStart: () => setTruckStatus('driving'),
      onUpdate: function() {
        const p = this.progress();
        const x = 100 - p * 22; // 100 -> 78
        setTruckTransform([x, 0, 25], [0, -Math.PI / 2, 0], 'driving', 0);
      }
    });

    // Giro 180° en Mutex (U-Turn hacia la izquierda)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const angle = -Math.PI / 2 + p * Math.PI; // -90 -> 90 (Este)
        const x = 78 - Math.sin(p * Math.PI) * 4; 
        const steering = -Math.sin(p * Math.PI) * 0.6; // Volante izquierda
        setTruckTransform([x, 0, 25], [0, angle, 0], 'driving', steering);
      }
    });

    // Reversa hacia el muelle de carga
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 78 - p * 11; // 78 -> 67 (Evita cruzar la línea azul en X=60)
        const z = 25 - p * 5;  // 25 -> 20
        const steering = -Math.sin(p * Math.PI) * 0.3; // Corrección sutil
        setTruckTransform([x, 0, z], [0, Math.PI / 2, 0], 'reversing', steering);
      }
    });

    // ── 2. PROCESO DE CARGA ──
    tl.to({}, { 
      duration: 1, 
      onStart: () => {
        setTruckStatus('loading');
        setWorkerVisible(true);
        setWorkerTransform([45, 1.2, 20]);
      }
    });

    tl.to({}, { duration: 2, onUpdate: function() {
        const p = this.progress();
        const x = 45 + p * 12; 
        setWorkerTransform([x, 1.2, 20]);
      }
    });

    tl.to({}, { duration: 2 }); // Loading

    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const x = 57 - p * 12; 
        setWorkerTransform([x, 1.2, 20]);
      },
      onComplete: () => setWorkerVisible(false)
    });

    // ── 3. SALIDA (ROMANA EN Z Y ESCAPE REVERSA) ──
    // Salir del muelle en línea recta
    tl.to({}, {
      duration: 1.5,
      onStart: () => setTruckStatus('driving'),
      onUpdate: function() {
        const p = this.progress();
        const x = 67 + p * 13; // 67 -> 80
        setTruckTransform([x, 0, 20], [0, Math.PI / 2, 0], 'driving', 0);
      }
    });

    // Curva Sur-Este para ingresar a Romana (Giro Derecha)
    tl.to({}, {
      duration: 2.5,
      onUpdate: function() {
        const p = this.progress();
        const x = 80 + p * 16; // 80 -> 96
        const z = 20 + p * 10; // 20 -> 30 (Alineándose a la Romana)
        
        // De Este (Math.PI/2) a Sur (0)
        const angle = Math.PI / 2 - p * (Math.PI / 2);
        const steering = Math.sin(p * Math.PI) * 0.6; // Volante derecha
        setTruckTransform([x, 0, z], [0, angle, 0], 'driving', steering);
      }
    });

    // Ingreso recto a la Romana (Hacia el Sur)
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const z = 30 + p * 8; // 30 -> 38 (Evita que la cabina sobresalga del límite 49)
        setTruckTransform([96, 0, z], [0, 0, 0], 'driving', 0);
      }
    });

    // Detención en Romana para pesaje (Restringido por muro en Z=50)
    tl.to({}, { 
      duration: 3, 
      onStart: () => setTruckStatus('parked'),
      onComplete: () => {
        setTruckStatus('driving');
        setGateEntryOpen(true);
      }
    });

    // Maniobra de Escape en Reversa (Pivote hacia Noroeste)
    tl.to({}, {
      duration: 3.5,
      onUpdate: function() {
        const p = this.progress();
        const x = 96 - p * 16; // 96 -> 80
        const z = 38 - p * 13; // 38 -> 25
        
        // Gira de Sur (0) a Este (Math.PI/2) en reversa. Volante izquierda para botar cola al Oeste.
        const angle = p * (Math.PI / 2); 
        const steering = -Math.sin(p * Math.PI) * 0.8; // Volante a tope izquierda
        setTruckTransform([x, 0, z], [0, angle, 0], 'reversing', steering);
      }
    });

    // Avance recto por el Portón hacia la calle
    tl.to({}, {
      duration: 2.5,
      onStart: () => setTruckStatus('driving'),
      onUpdate: function() {
        const p = this.progress();
        const x = 80 + p * 28; // 80 -> 108
        setTruckTransform([x, 0, 25], [0, Math.PI / 2, 0], 'driving', 0);
      }
    });

    // Doblar al Sur por Calle Adela (Salida contraria a la entrada)
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const z = 25 + p * 35; // 25 -> 60 (Hacia el Sur)
        
        // De Este (Math.PI/2) a Sur (0) doblando a la derecha
        const angle = Math.PI / 2 - p * (Math.PI / 2);
        const steering = Math.sin(p * Math.PI) * 0.5; // Derecha
        setTruckTransform([108, 0, z], [0, angle, 0], 'driving', steering);
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
