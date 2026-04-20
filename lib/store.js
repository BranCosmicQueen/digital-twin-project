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

  setTruckVisible: (visible) => set({ truckVisible: visible }),
  setTruckTransform: (pos, rot) => set({ 
    truckPosition: pos, 
    truckRotation: rot 
  }),
  setTruckColor: (color) => set({ truckColor: color }),

  // --- Automated Gate Status ---
  gateEntryOpen: false,
  gateExitOpen: false,
  setGateEntryOpen: (open) => set({ gateEntryOpen: open }),
  setGateExitOpen: (open) => set({ gateExitOpen: open }),

  // --- KPI / Stats ---
  barrelsDelivered: 0,
  addBarrels: (count) => set((state) => ({ barrelsDelivered: state.barrelsDelivered + count })),

  // --- Global Reset ---
  resetSimulation: () => set({
    status: 'idle',
    truckVisible: false,
    truckPosition: [115, 0, 5],
    truckRotation: [0, -Math.PI / 2, 0],
    gateEntryOpen: false,
    gateExitOpen: false,
  }),
}));
