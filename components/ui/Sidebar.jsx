'use client';

import useSimStore from '@/store/useSimStore';
import useLayoutStore from '@/store/useLayoutStore';

const states = [
  {
    id: 'global',
    label: 'Layout Global',
    description: 'Vista completa del recinto',
    icon: '🏗️',
    accentColor: 'var(--accent-green)',
    accentRgb: '0, 230, 118',
    glowClass: 'glow-green',
  },
  {
    id: 'inbound',
    label: 'Simulación Recepción',
    description: 'Flujo de entrada de inventario',
    icon: '📥',
    accentColor: 'var(--accent-cyan)',
    accentRgb: '0, 229, 255',
    glowClass: 'glow-cyan',
    phases: [
      'Entrada por portón Norte → Parada en Romana',
      'Giro en patio (r=25m) → Reversa a Muelle 1',
      'Descarga de pallets al Staging Inbound',
      'Camión sale por portón de entrada',
    ],
  },
  {
    id: 'outbound',
    label: 'Simulación Despacho',
    description: 'Flujo de salida de inventario',
    icon: '📤',
    accentColor: 'var(--accent-orange)',
    accentRgb: '255, 109, 0',
    glowClass: 'glow-orange',
    phases: [
      'Camión vacío entra por portón Sur',
      'Giro en patio (r=25m) → Reversa a Muelle 3',
      'Carga de pallets desde Staging Outbound',
      'Camión pesado sale por portón Sur',
    ],
  },
];

export default function Sidebar() {
  const simState = useSimStore((s) => s.simState);
  const isAnimating = useSimStore((s) => s.isAnimating);
  const animationPhase = useSimStore((s) => s.animationPhase);
  const setSimState = useSimStore((s) => s.setSimState);

  const editMode = useLayoutStore((s) => s.editMode);
  const toggleEditMode = useLayoutStore((s) => s.toggleEditMode);

  const activeStateConfig = states.find((s) => s.id === simState);

  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col"
      style={{ width: '320px' }}
    >
      <div
        className="glass m-4 flex-1 flex flex-col overflow-hidden"
        style={{
          background: 'rgba(10, 15, 30, 0.85)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-orange))',
              }}
            >
              <span className="text-lg">🏭</span>
            </div>
            <div>
              <h1
                className="text-base font-bold"
                style={{ color: 'var(--text-bright)' }}
              >
                Digital Twin
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Centro de Distribución
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div
            className="glass-subtle flex items-center gap-2 px-3 py-2 mt-3"
            style={{ borderRadius: '8px' }}
          >
            <div
              className="pulse-dot"
              style={{
                backgroundColor: activeStateConfig?.accentColor || 'var(--accent-green)',
                color: activeStateConfig?.accentColor || 'var(--accent-green)',
              }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {isAnimating ? 'Simulación en curso...' : 'Listo'}
            </span>
          </div>
        </div>

        {/* Edit Mode Toggle */}
        <div className="px-4 pt-3">
          <button
            onClick={toggleEditMode}
            disabled={isAnimating}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
              editMode ? 'glow-cyan' : ''
            }`}
            style={{
              background: editMode
                ? 'rgba(0, 229, 255, 0.12)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${
                editMode ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255,255,255,0.08)'
              }`,
              color: editMode ? 'var(--accent-cyan)' : 'var(--text-primary)',
            }}
          >
            <span className="text-base">{editMode ? '✏️' : '🔒'}</span>
            <div>
              <div>{editMode ? 'Modo Edición Activo' : 'Activar Modo Edición'}</div>
              <div className="text-xs font-normal mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {editMode ? 'Clic en racks para mover' : 'Mover y reorganizar racks'}
              </div>
            </div>
          </button>
        </div>

        {/* State Buttons */}
        <div className={`p-4 flex-1 overflow-y-auto flex flex-col gap-3 ${editMode ? 'opacity-40 pointer-events-none' : ''}`}>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1 px-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Control de Simulación
          </p>

          {states.map((state) => {
            const isActive = simState === state.id;

            return (
              <button
                key={state.id}
                className={`state-btn ${isActive ? 'active' : ''} ${isActive ? state.glowClass : ''}`}
                style={{
                  '--active-color': state.accentColor,
                  '--active-rgb': state.accentRgb,
                }}
                onClick={() => setSimState(state.id)}
                disabled={isAnimating}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{state.icon}</span>
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: isActive ? state.accentColor : 'var(--text-primary)' }}
                    >
                      {state.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {state.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Phase Progress (shown during Inbound/Outbound) */}
        {activeStateConfig?.phases && (
          <div className="px-4 pb-4">
            <div className="glass-subtle p-3">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Fases de la Simulación
              </p>
              {activeStateConfig.phases.map((phase, i) => {
                const phaseNum = i + 1;
                const isCurrentPhase = animationPhase === phaseNum;
                const isCompletedPhase = animationPhase > phaseNum;

                return (
                  <div
                    key={i}
                    className={`phase-step ${isCurrentPhase ? 'active' : ''} ${isCompletedPhase ? 'completed' : ''}`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: isCompletedPhase
                          ? 'var(--accent-green)'
                          : isCurrentPhase
                            ? activeStateConfig.accentColor
                            : 'rgba(255,255,255,0.1)',
                        color: isCompletedPhase || isCurrentPhase ? '#000' : 'var(--text-muted)',
                      }}
                    >
                      {isCompletedPhase ? '✓' : phaseNum}
                    </div>
                    <span className="text-xs">{phase}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Terreno: 100×50m</span>
            <span>Bodega: 3.000 m² | Patio: 2.000 m²</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
