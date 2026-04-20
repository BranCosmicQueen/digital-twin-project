import { create } from 'zustand';
import {
  BODEGA_ELEVATION,
  RACK_WIDTH,
  RACK_DEPTH,
  RESPEL_CENTER_X,
  RESPEL_CENTER_Z,
  RESPEL_WIDTH,
  RESPEL_DEPTH,
  RESPEL_MARGIN,
  TERRAIN_WIDTH,
  TERRAIN_DEPTH,
  DOCK_WALL_X,
  DOCK_INBOUND_1_Z,
  DOCK_INBOUND_2_Z,
  DOCK_OUTBOUND_3_Z,
  DOCK_OUTBOUND_4_Z,
  DOCK_WIDTH,
  DOCK_DEPTH,
  BODEGA_X_END,
} from '@/lib/constants';

// ══════════════════════════════════════════════════════════════════
// Normative Validation
// ══════════════════════════════════════════════════════════════════

// RESPEL exclusion zone (15m from Z=0, Z=50, X=100)
const RESPEL_EXCLUSION = {
  xMin: RESPEL_CENTER_X - RESPEL_WIDTH / 2 - 2,
  xMax: RESPEL_CENTER_X + RESPEL_WIDTH / 2 + 2,
  zMin: RESPEL_CENTER_Z - RESPEL_DEPTH / 2 - 2,
  zMax: RESPEL_CENTER_Z + RESPEL_DEPTH / 2 + 2,
};

// Dock clearance zones (no objects within 3m of dock faces)
const DOCK_ZONES = [
  DOCK_INBOUND_1_Z,
  DOCK_INBOUND_2_Z,
  DOCK_OUTBOUND_3_Z,
  DOCK_OUTBOUND_4_Z,
].map((z) => ({
  xMin: DOCK_WALL_X - 1,
  xMax: DOCK_WALL_X + DOCK_DEPTH + 3,
  zMin: z - DOCK_WIDTH / 2 - 1,
  zMax: z + DOCK_WIDTH / 2 + 1,
}));

function validatePosition(x, z, objWidth = RACK_WIDTH, objDepth = RACK_DEPTH) {
  const violations = [];

  // 1. Must be inside bodega (X=0..60)
  if (x - objWidth / 2 < 0.5) violations.push('Fuera del límite Oeste');
  if (x + objWidth / 2 > BODEGA_X_END - 0.5) violations.push('Fuera del límite Este bodega');
  if (z - objDepth / 2 < 0.5) violations.push('Fuera del límite Norte');
  if (z + objDepth / 2 > TERRAIN_DEPTH - 0.5) violations.push('Fuera del límite Sur');

  // 2. RESPEL exclusion zone check
  if (
    x + objWidth / 2 > RESPEL_EXCLUSION.xMin &&
    x - objWidth / 2 < RESPEL_EXCLUSION.xMax &&
    z + objDepth / 2 > RESPEL_EXCLUSION.zMin &&
    z - objDepth / 2 < RESPEL_EXCLUSION.zMax
  ) {
    violations.push('Zona de seguridad RESPEL (DS 148)');
  }

  // 3. Dock clearance check
  for (const dock of DOCK_ZONES) {
    if (
      x + objWidth / 2 > dock.xMin &&
      x - objWidth / 2 < dock.xMax &&
      z + objDepth / 2 > dock.zMin &&
      z - objDepth / 2 < dock.zMax
    ) {
      violations.push('Bloqueo de andén');
      break;
    }
  }

  // 4. Wall margin (structural columns at X=0)
  if (x < 2) violations.push('Margen muro estructural');

  return {
    valid: violations.length === 0,
    violations,
  };
}

// ══════════════════════════════════════════════════════════════════
// Generate initial rack positions from Planta Maipú
// ══════════════════════════════════════════════════════════════════

function generateInitialObjects() {
  const objects = [];
  const baseY = BODEGA_ELEVATION;
  const rackSpacing = RACK_WIDTH + 0.5;
  const aisleWidth = 3;
  let id = 1;

  // Main storage rows (Z=6..20)
  for (let row = 0; row < 5; row++) {
    const z = 6 + row * (RACK_DEPTH + aisleWidth);
    if (z > 44) break;
    for (let col = 0; col < 8; col++) {
      const x = 5 + col * rackSpacing;
      if (x > 48) break;
      const validation = validatePosition(x, z);
      objects.push({
        id: `rack-${id++}`,
        type: 'selective',
        position: [x, baseY, z],
        rotation: [0, 0, 0],
        validation,
      });
    }
  }

  // Additional rows (Z=26..45)
  for (let row = 0; row < 4; row++) {
    const z = 26 + row * (RACK_DEPTH + aisleWidth);
    if (z > 45) break;
    for (let col = 0; col < 8; col++) {
      const x = 5 + col * rackSpacing;
      if (x > 48) break;
      const validation = validatePosition(x, z);
      objects.push({
        id: `rack-${id++}`,
        type: 'selective',
        position: [x, baseY, z],
        rotation: [0, 0, 0],
        validation,
      });
    }
  }

  // Drum racks
  for (let col = 0; col < 4; col++) {
    const x = 5 + col * (RACK_WIDTH + 1.5);
    const validation = validatePosition(x, 3);
    objects.push({
      id: `drum-${id++}`,
      type: 'drum',
      position: [x, baseY, 3],
      rotation: [0, 0, 0],
      validation,
    });
  }

  return objects;
}

// ══════════════════════════════════════════════════════════════════
// Store
// ══════════════════════════════════════════════════════════════════

const useLayoutStore = create((set, get) => ({
  // ── Edit mode ──
  editMode: false,
  selectedObjectId: null,

  // ── Layout objects ──
  layoutObjects: generateInitialObjects(),

  // ── Next ID counter ──
  nextId: 200,

  // ── Dirty flag (unsaved changes) ──
  isDirty: false,

  // ── Has any violations? ──
  hasViolations: () => {
    return get().layoutObjects.some((obj) => !obj.validation.valid);
  },

  // ── Actions ──
  toggleEditMode: () => {
    const current = get();
    set({
      editMode: !current.editMode,
      selectedObjectId: null,
    });
  },

  selectObject: (id) => {
    set({ selectedObjectId: id });
  },

  deselectObject: () => {
    set({ selectedObjectId: null });
  },

  updateObjectPosition: (id, position) => {
    set((state) => ({
      isDirty: true,
      layoutObjects: state.layoutObjects.map((obj) => {
        if (obj.id !== id) return obj;
        const validation = validatePosition(position[0], position[2]);
        return { ...obj, position: [...position], validation };
      }),
    }));
  },

  updateObjectRotation: (id, rotation) => {
    set((state) => ({
      isDirty: true,
      layoutObjects: state.layoutObjects.map((obj) =>
        obj.id === id ? { ...obj, rotation: [...rotation] } : obj
      ),
    }));
  },

  addObject: (type = 'selective') => {
    const { nextId, layoutObjects } = get();
    const newId = `rack-new-${nextId}`;
    const x = 25;
    const z = 25;
    const validation = validatePosition(x, z);

    set({
      nextId: nextId + 1,
      isDirty: true,
      selectedObjectId: newId,
      layoutObjects: [
        ...layoutObjects,
        {
          id: newId,
          type,
          position: [x, BODEGA_ELEVATION, z],
          rotation: [0, 0, 0],
          validation,
        },
      ],
    });
  },

  removeObject: (id) => {
    set((state) => ({
      isDirty: true,
      selectedObjectId: null,
      layoutObjects: state.layoutObjects.filter((obj) => obj.id !== id),
    }));
  },

  saveLayout: () => {
    const { hasViolations } = get();
    if (hasViolations()) return false;
    set({ isDirty: false });
    // In production: persist to Supabase or localStorage
    console.log('[Layout] Saved', get().layoutObjects.length, 'objects');
    return true;
  },

  resetLayout: () => {
    set({
      layoutObjects: generateInitialObjects(),
      selectedObjectId: null,
      isDirty: false,
    });
  },
}));

export default useLayoutStore;
