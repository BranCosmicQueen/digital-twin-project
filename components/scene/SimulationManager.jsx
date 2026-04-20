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
      runInboundSequence();
    } else if (status === 'outbound') {
      runOutboundSequence();
    }
    
    return () => {
      if (tlRef.current) tlRef.current.kill();
    };
  }, [status]);

  const runInboundSequence = () => {
    // Escenario: Camión entra de Cabeza -> Pesa en Romana (X=80) -> Maniobra en Mutex -> Reversa a Muelle Descarga
    setTruckVisible(true);
    setGateEntryOpen(false);
    
    const tl = gsap.timeline({
      onComplete: () => {
        setTruckStatus('loading');
        setStatus('loading');
      }
    });
    tlRef.current = tl;

    // 1. Initial State en Calle Adela (Mirando al Oeste -Cabeza-)
    tl.set({}, { onStart: () => setTruckTransform([115, 0, GATE_MAIN_Z], [0, -Math.PI / 2, 0], 'driving') });

    // 2. Abrir Portón
    tl.to({}, { duration: 1, onStart: () => setGateEntryOpen(true) });

    // 3. Entrar de Cabeza hasta la Romana (X=80, Z=6)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress(); 
        const x = 115 - p * 35; // 115 -> 80
        const z = GATE_MAIN_Z - p * (GATE_MAIN_Z - ROMANA_Z); // 25 -> 6
        setTruckTransform([x, 0, z], [0, -Math.PI / 2, 0], 'driving');
      }
    });

    // 4. Pesaje en Romana (X=80, Z=6)
    tl.to({}, { duration: 1.5, onStart: () => setTruckStatus('parked') }); 

    // 5. Moverse al Centro del Mutex (X=78, Z=25) para iniciar giro
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress();
        const x = 80 - p * 2;
        const z = 6 + p * 19;
        setTruckTransform([x, 0, z], [0, -Math.PI / 2, 0], 'driving');
      }
    });

    // 6. GIRO EN MUTEX (Girar 180° para quedar de espaldas a los andenes)
    tl.to({}, {
      duration: 4,
      onUpdate: function() {
        const p = this.progress();
        const angle = -Math.PI / 2 + p * Math.PI; 
        const x = 78 - Math.sin(p * Math.PI) * 4; 
        setTruckTransform([x, 0, 25], [0, angle, 0], 'driving');
      }
    });

    // 7. REVERSA HACIA MUELLE (Z=25 -> Z=30, X=78 -> X=62)
    tl.to({}, {
      duration: 4,
      onUpdate: function() {
        const p = this.progress();
        const startX = 78;
        const x = startX - p * 16; 
        const z = 25 + p * 5; 
        setTruckTransform([x, 0, z], [0, Math.PI / 2, 0], 'reversing');
      }
    });

    // 8. Cierre y Descarga
    tl.add(() => {
      addBarrels(40);
      setGateEntryOpen(false);
      setTruckStatus('loading');
    });
  };

  const runOutboundSequence = () => {
    // Escenario: Camión sale de Muelle Carga -> Mutex -> Romana -> Salida
    const tl = gsap.timeline({
      onComplete: () => {
        setTruckVisible(false);
        setTruckStatus('idle');
        setStatus('idle');
      }
    });
    tlRef.current = tl;

    // 1. Initial State en Muelle Carga (Mirando al Este -Listo para salir-)
    tl.set({}, { onStart: () => {
      setTruckVisible(true);
      setTruckTransform([62, 0, DOCK_CARGA_Z], [0, Math.PI / 2, 0], 'driving');
    }});

    // 2. Salir del muelle hacia el Mutex (X=78, Z=25)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 62 + p * 16;
        const z = DOCK_CARGA_Z + p * 5;
        const rot = Math.PI / 2 - p * (Math.PI / 2); 
        setTruckTransform([x, 0, z], [0, rot, 0], 'driving');
      }
    });

    // 3. Del Mutex a la Romana (X=80, Z=6)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 78 + p * 2;
        const z = 25 - p * 19;
        setTruckTransform([x, 0, z], [0, 0, 0], 'driving');
      }
    });

    // 4. Pesaje (1.5s)
    tl.to({}, { duration: 1.5, onStart: () => setTruckStatus('parked') });

    // 5. Girar hacia la salida (Z=25, X=115) - Mirar al Este (PI/2)
    tl.to({}, {
      duration: 2,
      onStart: () => setGateEntryOpen(true),
      onUpdate: function() {
        const p = this.progress();
        const rot = p * (Math.PI / 2); 
        setTruckTransform([80, 0, 6], [0, rot, 0], 'driving');
      }
    });

    // 6. Salir por Portón Principal
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 80 + p * 35; 
        const z = 6 + p * 19; 
        setTruckTransform([x, 0, z], [0, Math.PI / 2, 0], 'driving');
      }
    });

    tl.to({}, { duration: 1, onStart: () => setGateEntryOpen(false) });
  };

  return null;
}
