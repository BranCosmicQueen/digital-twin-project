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
  label: '',
};

// Staging Outbound (X: 50→60, Z: 30→50)
export const STAGING_OUTBOUND = {
  xMin: 50, xMax: 60,
  zMin: 30, zMax: 50,
  color: '#86EFAC', // Verde claro pastel
  label: '',
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
  color: '#1E88E5',  // Azul Técnico
  label: 'ZONA A — RACKS DINÁMICOS',
  ghostHeight: 8,
};

export const ZONE_B = {
  xMin: 23.5, xMax: 38.0,
  zMin: 0, zMax: 50,
  color: '#FBC02D',  // Amarillo Tráfico
  label: 'ZONA B — SELECTIVOS DOBLE PROF.',
  ghostHeight: 11,
  rackWidth: 2.4,
};

export const DS43_ZONE = {
  xMin: 0, xMax: 20,
  zMin: 0, zMax: 3,
  pretilHeight: 0.2,
  color: '#FCA5A5', 
  borderColor: '#EF4444', 
  floorColor: '#ef4444', // Trama roja
  label: '⚠ INFLAMABLES DS43',
};
export const DS43_BUFFER = 2.8;

export const PEDESTRIAN_ZONE_Z_START = 40; // Desde Z=40 exclusivo peatonal (DS 594)

export const BATTERY_ZONE = {
  xMin: 0, xMax: 10,
  zMin: 42, zMax: 50,
  color: '#FDE68A', // Amarillo suave
  label: 'CARGA BATERÍAS',
};

export const ZONE_C = {
  xMin: 8.0, xMax: 22.5,
  zMin: 0, zMax: 50,
  color: '#ef4444',  // Rojo (Cambiado de Naranja a pedido del usuario)
  label: 'ZONA C — SELECTIVO',
  ghostHeight: 11,
};

// ── Grilla de Referencia ──
export const GRID = {
  minorStep: 1,     // Subdivisión cada 1m
  majorStep: 10,    // Marca resaltada cada 10m
  minorColor: '#D1D5DB',
  majorColor: '#6B7280',
};

// ── Patio y Exterior (60m → 100m) ──
export const TERRAIN_WIDTH = 115;     // 60 (Bodega) + 40 (Patio) + 15 (Calle Adela)
export const TERRAIN_DEPTH = 50;
export const PATIO_X_START = 60;
export const PATIO_WIDTH = 40;
export const PATIO_CENTER_X = 78; // Centro exacto del giro sagrado X=78
export const PATIO_CENTER_Z = 25;
export const TURNING_RADIUS = 12.5;   // Diámetro 25m

export const PULL_ZONE_NORTH = { zMin: 2, zMax: 5, color: '#0ea5e9', label: 'PULL ZONE N' };
export const PULL_ZONE_SOUTH = { zMin: 45, zMax: 48, color: '#0ea5e9', label: 'PULL ZONE S' };

// ── Calle Adela (Exremo Este X:100 → 115) ──
export const CALLE_ADELA_WIDTH = 15;

// ── Portón Principal y Guardia (X=100) ──
export const GATE_X = 100;
export const GATE_WIDTH = 10;
export const GATE_MAIN_Z = 25; // Centrado exacto
export const GATE_WAIT_X = 108; // Punto de detención antes de entrar
export const GATE_ENTRY_Z = 25;

export const GUARDHOUSE_X = 100;
export const GUARDHOUSE_Z = 16.5; // Pegado al muro, al lado del portón
export const GUARDHOUSE_WIDTH = 8;
export const GUARDHOUSE_DEPTH = 10;

// ── Romana de Pesaje (X:96, Z:40) — Alineada Norte-Sur (Paralela a la salida) ──
export const ROMANA_X = 96;
export const ROMANA_Z = 40;
export const ROMANA_WIDTH = 3;
export const ROMANA_DEPTH = 18;

// ── Zona RESPEL (Esquina Nor-Este) ──
export const RESPEL_CENTER_X = 90;
export const RESPEL_CENTER_Z = 5;
export const RESPEL_SIZE_X = 8;
export const RESPEL_SIZE_Z = 5;
export const RESPEL_MARGIN = 15;

// ── Andenes y Muelles (X=60) — Modificado a 2 muelles ──
export const DOCK_WALL_X = 60;
export const DOCK_WIDTH = 3.5;
export const DOCK_DEPTH = 3.5;
export const DOCK_CARGA_Z = 20;     // Muelle Carga
export const DOCK_DESCARGA_Z = 30;  // Muelle Descarga

// ── Canaleta de Contención DS43 (X=63) ──
export const CONTAINMENT_CHANNEL_X = 63.5;
export const CONTAINMENT_CHANNEL_WIDTH = 0.5;
export const CONTAINMENT_CHANNEL_DEPTH = 0.3;

// ── Colores Generales y de Zonificación ──
export const COLORS = {
  background: '#F3F4F6',    
  slab: '#E5E7EB',          
  wallWireframe: '#9CA3AF', 
  roofGhost: '#D1D5DB',     
  gridMinor: '#D1D5DB',
  gridMajor: '#6B7280',
  aisleLines: '#FDE68A',    
  terrain: '#CBD5E1',       
  patioSurface: '#475569',  
  asphaltCalle: '#1E293B',  
  terrainGrid: '#94A3B8',
  dockInbound: '#3B82F6',   
  dockOutbound: '#10B981',  
  accentInbound: '#0ea5e9',
  accentOutbound: '#10b981',
  stagingInbound: '#93C5FD',
  stagingOutbound: '#86EFAC',
  turningRadius: '#FCD34D', 
  containmentChannel: '#0ea5e9',
  weighbridge: '#475569',
  respelFloor: '#94A3B8',
  respelAccent: '#E11D48',
  respelWall: '#64748B',
  gateEntry: '#3B82F6',
  gateExit: '#EF4444',
  truckCab: '#EF4444',     // Rojo ESMAX
  truckTrailer: '#f8fafc', // Blanco
  streetLight: '#ffffff',
  lightGlow: '#fef3c7',
};

// ── Camión (Dimensiones 18m x 2.6m x 4m) ──
export const TRUCK_CAB_LENGTH = 3.5;
export const TRUCK_CAB_HEIGHT = 2.8;
export const TRUCK_TRAILER_LENGTH = 13.5;
export const TRUCK_TRAILER_HEIGHT = 4.0;
export const TRUCK_WIDTH = 2.6;
export const TRUCK_WHEEL_RADIUS = 0.5;

// ── Pathfinding / Nodes ──
export const PATHS = {
  inbound: [
    { x: 120, z: 25, label: 'STREET' },
    { x: 108, z: 25, label: 'PRE-GATE', wait: true },
    { x: 95, z: 25, label: 'ENTRY' },
    { x: 85, z: 44, label: 'ROMANA', wait: true },
    { x: 78, z: 25, label: 'MUTEX_IN' },
  ],
  outbound: [
    { x: 62, z: 20, label: 'DOCK_CARGA' },
    { x: 78, z: 25, label: 'MUTEX_OUT' },
    { x: 85, z: 44, label: 'ROMANA_EXIT', wait: true },
    { x: 100, z: 25, label: 'GATE_EXIT' },
    { x: 120, z: 25, label: 'STREET_EXIT' },
  ]
};

// ── Camera — Presets Actualizados para el sitio completo ──
export const CAMERA_PRESETS = {
  ortho: {
    position: [57, 100, 25],
    lookAt: [57, 0, 25],
    zoom: 10,
  },
  perspective: {
    position: [130, 60, 25],
    lookAt: [57, 0, 25],
  },
};
