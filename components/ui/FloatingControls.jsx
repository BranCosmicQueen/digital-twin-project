'use client';

import { Icon } from '@iconify/react';
import useSimStore from '@/store/useSimStore';
import { useSimulationStore } from '@/lib/store';

export default function FloatingControls() {
  const { viewMode, toggleView, uiVisible, toggleUi, isAnimating } = useSimStore();
  const { setStatus, resetSimulation, status } = useSimulationStore();

  const buttonStyle = {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    color: '#1e293b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
  };

  const itemClass = "transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="fixed z-[9999] bottom-6 right-6 flex flex-col gap-3">
      {/* 1. Toggle UI Button (Always visible) */}
      <button
        onClick={toggleUi}
        className={itemClass}
        style={buttonStyle}
        title={uiVisible ? 'Ocultar Interfaz' : 'Mostrar Interfaz'}
      >
        <Icon 
          icon={uiVisible ? "mdi:eye-outline" : "mdi:eye-off-outline"} 
          width="24" 
        />
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
            borderColor: status === 'inbound' ? '#0ea5e9' : buttonStyle.border,
            color: status === 'inbound' ? '#0ea5e9' : buttonStyle.color,
          }}
          title="Simular Entrada de Camión (Recepción)"
        >
          <Icon icon="mdi:truck-check-outline" width="24" />
        </button>

        {/* Simular Salida */}
        <button
          onClick={() => setStatus('outbound')}
          disabled={status !== 'idle' || isAnimating}
          className={itemClass}
          style={{
            ...buttonStyle,
            borderColor: status === 'outbound' ? '#10b981' : buttonStyle.border,
            color: status === 'outbound' ? '#10b981' : buttonStyle.color,
          }}
          title="Simular Salida de Camión (Despacho)"
        >
          <Icon icon="mdi:truck-fast-outline" width="24" />
        </button>

        {/* Reset Site */}
        <button
          onClick={resetSimulation}
          className={itemClass}
          style={buttonStyle}
          title="Reiniciar Simulación"
        >
          <Icon icon="mdi:refresh" width="24" />
        </button>

        {/* Divider */}
        <div className="h-px bg-black/10 mx-2 my-1" />

        {/* 3. View Settings (2D/3D) */}
        <button
          onClick={toggleView}
          disabled={isAnimating}
          className={itemClass}
          style={{
            ...buttonStyle,
            background: viewMode === '3d' ? '#3B82F6' : buttonStyle.background,
            color: viewMode === '3d' ? '#ffffff' : buttonStyle.color,
            borderColor: viewMode === '3d' ? '#2563EB' : buttonStyle.border,
          }}
          title={viewMode === '2d' ? 'Cambiar a Vista 3D' : 'Cambiar a Vista Cenital 2D'}
        >
          <Icon 
            icon={viewMode === '2d' ? "mdi:cube-outline" : "mdi:grid"} 
            width="24" 
          />
        </button>
      </div>
    </div>
  );
}
