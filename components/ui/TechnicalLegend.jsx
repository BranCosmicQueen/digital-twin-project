'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import useSimStore from '@/store/useSimStore';

export default function TechnicalLegend() {
  const { viewMode } = useSimStore();
  const [isOpen, setIsOpen] = useState(true);

  if (viewMode !== '2d') return null;

  const zones = [
    { color: '#1E88E5', label: 'Zona A - Dinámico (FIFO)' },
    { color: '#FBC02D', label: 'Zona B - Selectivo Doble Prof.' },
    { color: '#ef4444', label: 'Zona C - Selectivo Estándar' },
    { color: '#ef4444', label: 'Zona DS 43 - Inflamables' },
    { color: '#991b1b', label: 'Zona DS 148 - RESPEL' },
    { color: '#FDE68A', label: 'Zona Carga Baterías' },
    { color: '#0ea5e9', label: 'Zona de Espera (Pull Zone)' },
    { color: '#94a3b8', label: 'Picking / Consolidación' },
    { color: '#f8fafc', label: 'Administración y Servicios' },
  ];

  const symbols = [
    { color: '#ef4444', label: 'Extintor / Red Húmeda' },
    { color: '#166534', label: 'Salida de Emergencia' },
    { color: '#22c55e', label: 'Ducha / Lavaojos' },
    { color: '#facc15', label: 'Kit Antiderrame' },
    { color: '#b91c1c', label: 'Señal de Peligro' },
    { color: '#333', label: 'Muro Cortafuego RF-120' },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: '24px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 9999,
      width: isOpen ? '280px' : '56px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'rgba(255, 255, 255, 0.35)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      overflow: 'hidden',
    }}>
      {/* Header / Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid #f1f5f9' : 'none',
        }}
      >
        {isOpen && <span style={{ fontWeight: 800, fontSize: '13px', color: '#1e293b', letterSpacing: '0.05em' }}>LEYENDA TÉCNICA</span>}
        <Icon icon={isOpen ? "mdi:chevron-left" : "mdi:format-list-bulleted"} width="20" color="#64748b" />
      </button>

      {isOpen && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section: Zonas */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Zonificación</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {zones.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '10px', backgroundColor: item.color, borderRadius: '2px' }} />
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Simbología */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Simbología de Objetos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {symbols.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '50%' }} />
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontStyle: 'italic' }}>
            Normativa Planta Maipú - ESMAX
          </div>
        </div>
      )}
    </div>
  );
}
