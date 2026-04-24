'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSimulationStore } from '@/lib/store';
import { 
  DOCK_CARGA_Z,
  DOCK_DESCARGA_Z,
  BODEGA_ELEVATION,
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
    setWorkerCarrying,
    setTruckDoorsOpen,
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
    setTruckVisible(true);
    setGateEntryOpen(false);
    setWorkerVisible(false);
    const tl = gsap.timeline({ onComplete: () => setStatus('idle') });
    tlRef.current = tl;

    // 1. Entrada por Calle (RESTAURADA) y Espera en Portón
    tl.set({}, { onStart: () => setTruckTransform([108, 0, -10], [0, 0, 0], 'driving', 0) });
    tl.to({}, { duration: 2.5, onUpdate: function() { setTruckTransform([108, 0, -10 + this.progress() * 25], [0, 0, 0], 'driving', 0); } }); // Llega a Z=15
    tl.to({}, { duration: 1, onStart: () => setTruckStatus('parked') }); 
    tl.to({}, { duration: 2, onStart: () => setGateEntryOpen(true) }); // Abre portón
    tl.to({}, { duration: 1 });

    // 2. Ingreso y Romana
    tl.to({}, { duration: 2, onStart: () => setTruckStatus('driving'), onUpdate: function() {
        const p = this.progress();
        setTruckTransform([108 - p * 12, 0, 15 + p * 15], [0, -p * (Math.PI / 2), 0], 'driving', Math.sin(p * Math.PI) * 0.6);
    }});
    tl.to({}, { duration: 1.5, onUpdate: function() { setTruckTransform([96, 0, 30 + this.progress() * 8], [0, 0, 0], 'driving', 0); } }); 
    tl.to({}, { duration: 3, onStart: () => setTruckStatus('parked'), onComplete: () => setTruckStatus('driving') });

    // 3. Reversa al muelle de DESCARGA (Z=30)
    tl.to({}, { duration: 3, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([96 - p * 16, 0, 38 - p * 13], [0, p * (Math.PI/2), 0], 'reversing', -Math.sin(p * Math.PI) * 0.8);
    }});
    tl.to({}, { duration: 2.5, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([80 - p * 9.75, 0, 25 + p * 5], [0, Math.PI / 2, 0], 'reversing', Math.sin(p * Math.PI) * 0.3);
    }});

    // 4. Descarga
    tl.to({}, { duration: 1, onStart: () => setTruckStatus('parked') });
    tl.to({}, { duration: 1, onUpdate: function() { setTruckDoorsOpen(this.progress()); } }); 
    
    // El trabajador sale a recibir (Waypoints de Pasillos)
    tl.to({}, { duration: 0.1, onStart: () => { setWorkerVisible(true); setWorkerCarrying(false); setWorkerTransform([45, BODEGA_ELEVATION, 33.7], Math.PI/2); } });
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([45 + this.progress() * 12, BODEGA_ELEVATION, 33.7], Math.PI/2); } }); 
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([57, BODEGA_ELEVATION, 33.7 - this.progress() * 3.7], 0); } }); 
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([57 + this.progress() * 10, BODEGA_ELEVATION, 30], Math.PI/2); } }); 
    
    tl.to({}, { duration: 1.5, onStart: () => setWorkerCarrying(true) }); 
    
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([67 - this.progress() * 10, BODEGA_ELEVATION, 30], -Math.PI/2); } }); 
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([57, BODEGA_ELEVATION, 30 + this.progress() * 3.7], Math.PI); } }); 
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([57 - this.progress() * 12, BODEGA_ELEVATION, 33.7], -Math.PI/2); } }); 
    
    tl.to({}, { duration: 0.5, onComplete: () => setWorkerVisible(false) });
    tl.to({}, { duration: 1, onUpdate: function() { setTruckDoorsOpen(1 - this.progress()); } }); 

    // 5. Salida
    tl.to({}, { duration: 2, onStart: () => setTruckStatus('driving'), onUpdate: function() { setTruckTransform([70.25 + this.progress() * 37.75, 0, 30], [0, Math.PI/2, 0], 'driving', 0); } });
    tl.to({}, { duration: 1, onStart: () => { setGateEntryOpen(false); setTruckVisible(false); } });
  };

  const runDespachoSequence = () => {
    setTruckVisible(true);
    setGateEntryOpen(false);
    setWorkerVisible(false);
    const tl = gsap.timeline({ onComplete: () => setStatus('idle') });
    tlRef.current = tl;

    // 1. Entrada por Calle (RESTAURADA)
    tl.set({}, { onStart: () => setTruckTransform([108, 0, -10], [0, 0, 0], 'driving', 0) });
    tl.to({}, { duration: 2.5, onUpdate: function() { setTruckTransform([108, 0, -10 + this.progress() * 25], [0, 0, 0], 'driving', 0); } }); 
    tl.to({}, { duration: 1, onStart: () => setTruckStatus('parked') }); 
    tl.to({}, { duration: 2, onStart: () => setGateEntryOpen(true) }); 
    tl.to({}, { duration: 1 });

    // 2. Ingreso y Mutex
    tl.to({}, { duration: 3, onStart: () => setTruckStatus('driving'), onUpdate: function() {
        const p = this.progress();
        setTruckTransform([108 - p * 30, 0, 15 + p * 10], [0, -p * Math.PI/2, 0], 'driving', 0); 
    }});
    tl.to({}, { duration: 3, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([78 - Math.sin(p * Math.PI) * 4, 0, 25], [0, -Math.PI/2 + p * Math.PI, 0], 'driving', -Math.sin(p * Math.PI) * 0.6);
    }});

    // 3. Reversa al muelle de CARGA (Z=20)
    tl.to({}, { duration: 3, onUpdate: function() {
        const p = this.progress();
        setTruckTransform([78 - p * 7.75, 0, 25 - p * 5], [0, Math.PI/2, 0], 'reversing', -Math.sin(p * Math.PI) * 0.3); 
    }});

    // 4. Carga
    tl.to({}, { duration: 1, onStart: () => setTruckStatus('parked') });
    tl.to({}, { duration: 1, onUpdate: function() { setTruckDoorsOpen(this.progress()); } }); 
    
    tl.to({}, { duration: 0.1, onStart: () => { setWorkerVisible(true); setWorkerCarrying(true); setWorkerTransform([45, BODEGA_ELEVATION, 18.7], Math.PI/2); } });
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([45 + this.progress() * 12, BODEGA_ELEVATION, 18.7], Math.PI/2); } }); 
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([57, BODEGA_ELEVATION, 18.7 + this.progress() * 1.3], Math.PI); } }); 
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([57 + this.progress() * 10, BODEGA_ELEVATION, 20], Math.PI/2); } }); 
    
    tl.to({}, { duration: 1.5, onStart: () => setWorkerCarrying(false) }); 
    
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([67 - this.progress() * 10, BODEGA_ELEVATION, 20], -Math.PI/2); } }); 
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([57, BODEGA_ELEVATION, 20 - this.progress() * 1.3], 0); } }); 
    tl.to({}, { duration: 2, onUpdate: function() { setWorkerTransform([57 - this.progress() * 12, BODEGA_ELEVATION, 18.7], -Math.PI/2); } }); 
    
    tl.to({}, { duration: 0.5, onComplete: () => setWorkerVisible(false) });
    tl.to({}, { duration: 1, onUpdate: function() { setTruckDoorsOpen(1 - this.progress()); } }); 

    // 5. Salida y Pesaje
    tl.to({}, { duration: 1.5, onStart: () => setTruckStatus('driving'), onUpdate: function() { setTruckTransform([70.25 + this.progress() * 10, 0, 20], [0, Math.PI/2, 0], 'driving', 0); } });
    tl.to({}, { duration: 2, onUpdate: function() { setTruckTransform([96, 0, 30 + this.progress() * 8], [0, 0, 0], 'driving', 0); } });
    tl.to({}, { duration: 3, onStart: () => setTruckStatus('parked'), onComplete: () => setTruckStatus('driving') });
    tl.to({}, { duration: 2, onUpdate: function() { setTruckTransform([96 + this.progress() * 24, 0, 25], [0, Math.PI/2, 0], 'driving', 0); } });
    tl.to({}, { duration: 1, onStart: () => { setGateEntryOpen(false); setTruckVisible(false); } });
  };

  return null;
}
