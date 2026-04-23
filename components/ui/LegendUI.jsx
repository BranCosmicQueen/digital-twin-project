'use client';

import useSimStore from '@/store/useSimStore';

export default function LegendUI() {
  const { viewMode } = useSimStore();
  
  if (viewMode !== '2d') return null;

  const items = [
    { color: '#ef4444', label: 'Extintor Portátil (PQS)' },
    { color: '#22c55e', label: 'Ducha / Lavaojos Emergencia' },
    { color: '#3b82f6', label: 'Red Húmeda / API Canaleta' },
    { color: '#facc15', label: 'Kit Antiderrame' },
    { color: '#1e293b', label: 'Muro Cortafuego RF-120' },
    { color: '#1e88e5', label: 'Zona A (FIFO / Dinámico)' },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(8px)',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.1)',
      zIndex: 1000,
      width: '240px',
      pointerEvents: 'none'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
        LEYENDA TÉCNICA
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '20px', height: '12px', backgroundColor: item.color, borderRadius: '2px' }} />
            <span style={{ fontSize: '12px', color: '#444', fontWeight: '500' }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
        Planta Maipú - ESMAX <br/>
        Gemelo Digital v1.1
      </div>
    </div>
  );
}
