// ══════════════════════════════════════════════════════════════════════════════
// HARD RESET — ESQUELETO DE BODEGA (Warehouse Skeleton)
// Solo geometría de la nave, zonas y volúmenes fantasma.
// 1 unidad Three.js = 1 metro
// ══════════════════════════════════════════════════════════════════════════════

// ── Nave Industrial (60m × 50m) ──
export const BODEGA_WIDTH = 60;     // Eje X: 0 → 60
export const BODEGA_DEPTH = 50;     // Eje Z: 0 → 50
export const BODEGA_ELEVATION = 1.2; // Losa operativa a Y=1.2m
export const WALL_HEIGHT = 12;       // Techo fantasma a 12m
export const WALL_THICKNESS = 0.15;  // Grosor muros wireframe

// ── Zonas de Suelo (Y = BODEGA_ELEVATION + 0.01 para evitar z-fighting) ──
export const ZONE_Y = BODEGA_ELEVATION + 0.01;

// Staging Inbound (X: 50→60, Z: 10→30)
export const STAGING_INBOUND = {
  xMin: 50, xMax: 60,
  zMin: 10, zMax: 30,
  color: '#93C5FD', // Azul claro pastel
  label: 'STAGING INBOUND',
};

// Staging Outbound (X: 50→60, Z: 30→50)
export const STAGING_OUTBOUND = {
  xMin: 50, xMax: 60,
  zMin: 30, zMax: 50,
  color: '#86EFAC', // Verde claro pastel
  label: 'STAGING OUTBOUND',
};

// ── Componentes Estructurales del Rack ──
export const RACK_WIDTH = 2.9;     // Ancho de un cuerpo (módulo)
export const RACK_DEPTH = 2.4;     // Profundidad de batería doble
export const AISLE_WIDTH = 2.8;    // Pasillos grúas retráctiles
export const RACK_PITCH = 5.2;     // RACK_DEPTH + AISLE_WIDTH

// ── Zonas de Almacenamiento (Rack Lines) ──
// Distribución matemática exacta por cluster: 105 cuerpos (7 líneas × 15 cuerpos)
// Separados por pequeños pasillos transversales entre zonas.
export const ZONE_A = {
  xMin: 40.65, xMax: 49.35,
  zMin: 0, zMax: 50,
  color: '#7DD3FC',  // Celeste pastel
  label: 'ZONA A — RACKS DINÁMICOS',
  ghostHeight: 8,
};

export const ZONE_B = {
  xMin: 23.5, xMax: 38.0,
  zMin: 0, zMax: 50,
  color: '#FCD34D',  // Amarillo pastel
  label: 'ZONA B — SELECTIVOS DOBLE PROF.',
  ghostHeight: 11,
  rackWidth: 2.4,
};

export const ZONE_C = {
  xMin: 8.0, xMax: 22.5,
  zMin: 0, zMax: 50,
  color: '#D1D5DB',  // Gris claro
  label: 'ZONA C — SELECTIVO',
  ghostHeight: 11,
};

// ── DS 43 — Zona Inflamables (Dique Contención perimetral) ──
// Centrado estrictamente en X=0 a 6
export const DS43_ZONE = {
  xMin: 0, xMax: 6.0,
  zMin: 10, zMax: 40,
  pretilHeight: 0.2,
  color: '#FCA5A5',  // Rojo pastel advertencia
  borderColor: '#EF4444', 
  label: '⚠ INFLAMABLES DS43',
};

// ── Grilla de Referencia ──
export const GRID = {
  minorStep: 1,     // Subdivisión cada 1m
  majorStep: 10,    // Marca resaltada cada 10m
  minorColor: '#D1D5DB',
  majorColor: '#6B7280',
};

// ── Colores Generales ──
export const COLORS = {
  background: '#F3F4F6',    // Gris neutro muy claro
  slab: '#E5E7EB',          // Losa base gris claro
  wallWireframe: '#9CA3AF', // Muros wireframe gris medio
  roofGhost: '#D1D5DB',     // Techo fantasma
  gridMinor: '#D1D5DB',
  gridMajor: '#6B7280',
  aisleLines: '#FDE68A',    // Pasillos amarillo suave
};

// ── Camera — Vista Cenital por defecto ──
export const CAMERA_PRESETS = {
  // Vista cenital perfecta (2D validation)
  ortho: {
    position: [30, 80, 25],
    lookAt: [30, 0, 25],
    zoom: 10,
  },
  // Vista 3D para inspección
  perspective: {
    position: [70, 40, -15],
    lookAt: [30, 0, 25],
  },
};
