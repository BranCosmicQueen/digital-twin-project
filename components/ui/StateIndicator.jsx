'use client';

import useSimStore from '@/store/useSimStore';
import useLayoutStore from '@/store/useLayoutStore';

const stateLabels = {
  global: { text: 'Layout Global', color: 'var(--accent-green)' },
  inbound: { text: 'Simulación Recepción', color: 'var(--accent-cyan)' },
  outbound: { text: 'Simulación Despacho', color: 'var(--accent-orange)' },
};

export default function StateIndicator() {
  const simState = useSimStore((s) => s.simState);
  const viewMode = useSimStore((s) => s.viewMode);
  const animationPhase = useSimStore((s) => s.animationPhase);
  const isAnimating = useSimStore((s) => s.isAnimating);

  const { text, color } = stateLabels[simState] || stateLabels.global;
  const editMode = useLayoutStore((s) => s.editMode);

  return (
    <div
      className="fixed z-50 animate-slide-in"
      style={{
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-2.5"
        style={{
          background: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          boxShadow: isAnimating
            ? `0 0 20px ${color}33, 0 4px 15px rgba(0,0,0,0.3)`
            : '0 4px 15px rgba(0,0,0,0.3)',
        }}
      >
        {/* State name */}
        <span
          className="text-xs font-semibold"
          style={{ color }}
        >
          {text}
        </span>

        {/* Divider */}
        <div
          className="w-px h-4"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        />

        {/* View mode badge */}
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-md"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--text-muted)',
          }}
        >
          {viewMode === '2d' ? 'Cenital' : 'Perspectiva'}
        </span>

        {/* Edit mode badge */}
        {editMode && (
          <>
            <div
              className="w-px h-4"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            />
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-md"
              style={{
                background: 'rgba(0, 229, 255, 0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
              }}
            >
              ✏️ Edición
            </span>
          </>
        )}

        {/* Phase indicator (during simulation) */}
        {animationPhase > 0 && (
          <>
            <div
              className="w-px h-4"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            />
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                Fase {animationPhase}/4
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
