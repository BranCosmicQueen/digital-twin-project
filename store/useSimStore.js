import { create } from 'zustand';

const useSimStore = create((set, get) => ({
  // Default to 2D cenital for dimensional validation
  viewMode: '2d',
  isAnimating: false,
  uiVisible: true,

  toggleView: () => {
    const current = get();
    if (current.isAnimating) return;
    set({ viewMode: current.viewMode === '2d' ? '3d' : '2d' });
  },

  toggleUi: () => set((state) => ({ uiVisible: !state.uiVisible })),

  setIsAnimating: (value) => set({ isAnimating: value }),


  reset: () => set({ viewMode: '2d', isAnimating: false }),
}));

export default useSimStore;
