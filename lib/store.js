import { create } from 'zustand';

export const useSimulationStore = create((set) => ({
  // --- Simulation Status ---
  // status: 'idle' | 'inbound' | 'outbound' | 'loading'
  status: 'idle',
  setStatus: (status) => set({ status }),

  // --- Simulation Speed ---
  simSpeed: 1,
  setSimSpeed: (speed) => set({ simSpeed: speed }),

  // --- Real-time Truck Transform (Driven by GSAP) ---
  truckVisible: false,
  truckPosition: [115, 0, 5],
  truckRotation: [0, -Math.PI / 2, 0],
  truckColor: '#be123c',
  truckStatus: 'idle', // 'idle' | 'driving' | 'reversing' | 'loading'

  setTruckVisible: (visible) => set({ truckVisible: visible }),
  setTruckTransform: (pos, rot, status = null) => set((state) => ({ 
    truckPosition: pos, 
    truckRotation: rot,
    truckStatus: status || state.truckStatus
  })),
  setTruckStatus: (status) => set({ truckStatus: status }),
  setTruckColor: (color) => set({ truckColor: color }),

  // --- Automated Gate Status ---
  gateEntryOpen: false,
  setGateEntryOpen: (open) => set({ gateEntryOpen: open }),

  // --- Worker State ---
  workerVisible: false,
  workerPosition: [45, 1.2, 20],
  setWorkerVisible: (visible) => set({ workerVisible: visible }),
  setWorkerTransform: (pos) => set({ workerPosition: pos }),

  // --- KPI / Stats ---
  barrelsDelivered: 0,
  addBarrels: (count) => set((state) => ({ barrelsDelivered: state.barrelsDelivered + count })),

  // --- Global Reset ---
  resetSimulation: () => set({
    status: 'idle',
    truckVisible: false,
    truckPosition: [115, 0, 5],
    truckRotation: [0, -Math.PI / 2, 0],
    truckStatus: 'idle',
    gateEntryOpen: false,
  }),
}));
