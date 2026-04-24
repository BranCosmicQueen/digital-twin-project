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
  truckSteeringAngle: 0,
  truckColor: '#be123c',
  truckStatus: 'idle', // 'idle' | 'driving' | 'reversing' | 'loading'
  truckDoorsOpen: 0, // 0 to 1

  setTruckVisible: (visible) => set({ truckVisible: visible }),
  setTruckTransform: (pos, rot, status = null, steering = 0) => set((state) => ({ 
    truckPosition: pos, 
    truckRotation: rot,
    truckSteeringAngle: steering,
    truckStatus: status || state.truckStatus
  })),
  setTruckStatus: (status) => set({ truckStatus: status }),
  setTruckColor: (color) => set({ truckColor: color }),
  setTruckDoorsOpen: (open) => set({ truckDoorsOpen: open }),

  // --- Automated Gate Status ---
  gateEntryOpen: false,
  setGateEntryOpen: (open) => set({ gateEntryOpen: open }),

  // --- Worker State ---
  workerVisible: false,
  workerPosition: [45, 0, 20],
  workerRotation: 0,
  workerCarrying: false,
  setWorkerVisible: (visible) => set({ workerVisible: visible }),
  setWorkerTransform: (pos, rot) => set({ workerPosition: pos, workerRotation: rot }),
  setWorkerCarrying: (carrying) => set({ workerCarrying: carrying }),

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
    truckDoorsOpen: 0,
    gateEntryOpen: false,
    workerVisible: false,
    workerCarrying: false,
  }),
}));
