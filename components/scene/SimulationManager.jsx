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
    // Escenario: Camión entra por Puerta Central -> Pesa en Romana -> Espera en Pull Zone North -> Maniobra en Círculo Mutex -> Atrasa a Muelle Descarga
    setTruckVisible(true);
    setGateEntryOpen(false);
    
    const tl = gsap.timeline({
      onComplete: () => setStatus('loading')
    });
    tlRef.current = tl;

    // 1. Initial State en Calle Adela
    tl.set({}, { onStart: () => setTruckTransform([115, 0, GATE_MAIN_Z], [0, -Math.PI / 2, 0]) });

    // 2. Open Gate
    tl.to({}, { duration: 1, onStart: () => setGateEntryOpen(true) });

    // 3. Cruzar Portón hacia el interior
    tl.to({}, {
      duration: 2,
      onUpdate: function() {
        const p = this.progress(); 
        const x = 115 - p * 15; // 115 -> 100
        setTruckTransform([x, 0, GATE_MAIN_Z], [0, -Math.PI / 2, 0]);
      }
    });

    // 4. Curva estricta hacia Romana (X=100, Z=25 -> X=96, Z=12)
    tl.to({}, {
      duration: 2.5,
      onUpdate: function() {
        const p = this.progress();
        const x = 100 - p * 4;
        const z = GATE_MAIN_Z - p * 13;
        const rot = -Math.PI / 2 + p * (Math.PI / 2); // Gira perpendicular al Norte (0)
        setTruckTransform([x, 0, z], [0, rot, 0]);
      }
    });

    // 5. Pesaje en Romana (X=96, Z=12)
    tl.to({}, { duration: 2 }); 

    // 6. Avanzar a Pull Zone North (X=80, Z=4) [Encolamiento de espera]
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 96 - p * 16;
        const z = 12 - p * 8;
        const rot = 0 + p * (Math.PI / 2); // North -> West
        setTruckTransform([x, 0, z], [0, rot, 0]);
      }
    });

    // 7. Espera en Pull Zone (Cola simulada)
    tl.to({}, { duration: 1.5 });

    // 8. Ingreso al círculo Mutex Sagrado (X=78, Z=25) para dar la vuelta en U
    tl.to({}, {
      duration: 4,
      onUpdate: function() {
        const p = this.progress();
        // Círculo de giro en el MUTEX
        const angle = p * Math.PI; // media vuelta
        const x = 80 - Math.sin(angle) * 12.5;
        const z = 4 + p * 21; // Mueve el centro de masa hacia Z=25
        const rot = Math.PI / 2 + angle; // Gira de West a East pasando por South
        setTruckTransform([x, 0, z], [0, rot, 0]);
      }
    });

    // 9. Retroceso en reversa exacto al Muelle Descarga (Z=30, X=68)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const startX = 80;
        const x = startX - p * 12; // Del patio hacia el muelle de X=68
        const z = 25 + p * 5; // Curva reversa de Z=25 a Z=30
        setTruckTransform([x, 0, z], [0, Math.PI / 2, 0]); // Mantiene chasis mirando al Este, reversando al Oeste
      }
    });

    // 10. Cierre y Descarga
    tl.add(() => {
      addBarrels(40);
      setGateEntryOpen(false);
    });
  };

  const runOutboundSequence = () => {
    // Escenario: Camión sale de Muelle Carga -> Pide Mutex -> Romana -> Puerta Central -> Sale
    const tl = gsap.timeline({
      onComplete: () => {
        setTruckVisible(false);
        setStatus('idle');
      }
    });
    tlRef.current = tl;

    // 1. Initial State en Muelle Carga
    tl.set({}, { onStart: () => setTruckTransform([68, 0, DOCK_CARGA_Z], [0, Math.PI / 2, 0]) });

    // 2. Salir del muelle hacia el Círculo Mutex (X=78, Z=25)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 68 + p * 10; // 68 -> 78
        const z = DOCK_CARGA_Z + p * 5; // 20 -> 25
        const rot = Math.PI / 2 - p * (Math.PI / 4); // Gira un poco hacia el Norte-Este (Norte es 0, Este es PI/2)
        setTruckTransform([x, 0, z], [0, rot, 0]);
      }
    });

    // 3. Del Mutex a la Romana (X=96, Z=12)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 78 + p * 18; // 78 -> 96
        const z = 25 - p * 13; // 25 -> 12
        const rot = Math.PI / 4 - p * (Math.PI / 4); // Termina mirando al Norte (0)
        setTruckTransform([x, 0, z], [0, rot, 0]);
      }
    });

    // 4. Pesaje (Esperar 2s)
    tl.to({}, { duration: 2 });

    // 5. Girar hacia la salida y abrir portón (Hacia Z=25)
    tl.to({}, {
      duration: 2,
      onStart: () => setGateEntryOpen(true),
      onUpdate: function() {
        const p = this.progress();
        const rot = p * (-Math.PI / 2); // De North(0) a East/Salida(-PI/2)
        setTruckTransform([ROMANA_X, 0, ROMANA_Z], [0, rot, 0]);
      }
    });

    // 6. Salir por Portón Principal (X=115, Z=25)
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const p = this.progress();
        const x = 96 + p * 19; // 96 -> 115
        const z = ROMANA_Z + p * 13; // 12 -> 25
        setTruckTransform([x, 0, z], [0, -Math.PI / 2, 0]);
      }
    });

    tl.to({}, { duration: 1, onStart: () => setGateEntryOpen(false) });
  };

  return null;
}
