'use client';

import useSimStore from '@/store/useSimStore';
import { useSimulationStore } from '@/lib/store';

export default function FloatingControls() {
  const { viewMode, toggleView, uiVisible, toggleUi, isAnimating } = useSimStore();
  const { setStatus, resetSimulation, status } = useSimulationStore();

  const buttonStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(10, 15, 30, 0.9)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'var(--text-bright)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  };

  const itemClass = "transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="fixed z-[60] bottom-6 right-6 flex flex-col gap-3">
      {/* 1. Toggle UI Button (Always visible) */}
      <button
        onClick={toggleUi}
        className={itemClass}
        style={buttonStyle}
        title={uiVisible ? 'Ocultar Interfaz' : 'Mostrar Interfaz'}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {uiVisible ? (
            /* Eye icon */
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          ) : (
            /* Eye barred icon */
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </>
          )}
          {uiVisible && <circle cx="12" cy="12" r="3" />}
        </svg>
      </button>

      {/* 2. Simulation Actions Stack (Conditional) */}
      <div 
        className={`flex flex-col gap-2 transition-all duration-500 origin-bottom ${uiVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}`}
      >
        {/* Simular Entrada */}
        <button
          onClick={() => setStatus('inbound')}
          disabled={status !== 'idle' || isAnimating}
          className={itemClass}
          style={{
            ...buttonStyle,
            borderColor: status === 'inbound' ? 'var(--accent-cyan)' : buttonStyle.border,
          }}
          title="Simular Entrada de Camión"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </button>

        {/* Simular Salida */}
        <button
          onClick={() => setStatus('outbound')}
          disabled={status !== 'idle' || isAnimating}
          className={itemClass}
          style={{
            ...buttonStyle,
            borderColor: status === 'outbound' ? 'var(--accent-orange)' : buttonStyle.border,
          }}
          title="Simular Salida de Camión"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        {/* Reset Site */}
        <button
          onClick={resetSimulation}
          className={itemClass}
          style={buttonStyle}
          title="Reiniciar Simulación"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-px bg-white/10 mx-2 my-1" />

        {/* 3. View Settings (2D/3D) */}
        <button
          onClick={toggleView}
          disabled={isAnimating}
          className={itemClass}
          style={{
            ...buttonStyle,
            background: viewMode === '3d' ? 'var(--accent-cyan)' : buttonStyle.background,
            color: viewMode === '3d' ? '#000' : buttonStyle.color,
          }}
          title={viewMode === '2d' ? 'Cambiar a Vista 3D' : 'Cambiar a Vista Cenital 2D'}
        >
          {viewMode === '2d' ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
