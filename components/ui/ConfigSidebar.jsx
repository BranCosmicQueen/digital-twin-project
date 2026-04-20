'use client';

import { useState } from 'react';
import useLayoutStore from '@/store/useLayoutStore';

export default function ConfigSidebar() {
  const editMode = useLayoutStore((s) => s.editMode);
  const selectedObjectId = useLayoutStore((s) => s.selectedObjectId);
  const layoutObjects = useLayoutStore((s) => s.layoutObjects);
  const isDirty = useLayoutStore((s) => s.isDirty);
  const addObject = useLayoutStore((s) => s.addObject);
  const removeObject = useLayoutStore((s) => s.removeObject);
  const updateObjectPosition = useLayoutStore((s) => s.updateObjectPosition);
  const updateObjectRotation = useLayoutStore((s) => s.updateObjectRotation);
  const saveLayout = useLayoutStore((s) => s.saveLayout);
  const resetLayout = useLayoutStore((s) => s.resetLayout);
  const deselectObject = useLayoutStore((s) => s.deselectObject);

  const [saveMessage, setSaveMessage] = useState('');

  if (!editMode) return null;

  const selectedObj = layoutObjects.find((o) => o.id === selectedObjectId);
  const totalObjects = layoutObjects.length;
  const violationCount = layoutObjects.filter((o) => !o.validation.valid).length;
  const hasViolations = violationCount > 0;

  const handlePositionChange = (axis, value) => {
    if (!selectedObj) return;
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;

    const newPos = [...selectedObj.position];
    if (axis === 'x') newPos[0] = numVal;
    if (axis === 'z') newPos[2] = numVal;
    updateObjectPosition(selectedObj.id, newPos);
  };

  const handleRotationChange = (value) => {
    if (!selectedObj) return;
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;
    const radians = (numVal * Math.PI) / 180;
    updateObjectRotation(selectedObj.id, [0, radians, 0]);
  };

  const handleSave = () => {
    const success = saveLayout();
    if (success) {
      setSaveMessage('✓ Layout guardado');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('✗ No se puede guardar con violaciones');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <aside
      className="fixed right-0 top-0 h-full z-40 flex flex-col"
      style={{ width: '340px' }}
    >
      <div
        className="glass m-4 flex-1 flex flex-col overflow-hidden"
        style={{
          background: 'rgba(10, 15, 30, 0.92)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* ═══ Header ═══ */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(0, 229, 255, 0.15)' }}
              >
                <span className="text-sm">✏️</span>
              </div>
              <h2
                className="text-sm font-bold"
                style={{ color: 'var(--text-bright)' }}
              >
                Modo Edición
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {totalObjects} objetos
              </span>
            </div>
          </div>

          {/* Violation alert */}
          {hasViolations && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(255, 23, 68, 0.12)',
                border: '1px solid rgba(255, 23, 68, 0.3)',
              }}
            >
              <span className="text-sm">⚠️</span>
              <span className="text-xs font-medium" style={{ color: '#ff1744' }}>
                {violationCount} objeto{violationCount > 1 ? 's' : ''} en zona prohibida
              </span>
            </div>
          )}

          {/* Save message */}
          {saveMessage && (
            <div
              className="mt-2 text-xs font-medium px-3 py-2 rounded-lg"
              style={{
                background: saveMessage.startsWith('✓')
                  ? 'rgba(0, 230, 118, 0.12)'
                  : 'rgba(255, 23, 68, 0.12)',
                color: saveMessage.startsWith('✓') ? '#00e676' : '#ff1744',
              }}
            >
              {saveMessage}
            </div>
          )}
        </div>

        {/* ═══ Add Object ═══ */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Agregar Objeto
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => addObject('selective')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                color: 'var(--accent-cyan)',
              }}
            >
              <span>📦</span> Rack Selectivo
            </button>
            <button
              onClick={() => addObject('drum')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                color: '#a78bfa',
              }}
            >
              <span>🛢️</span> Rack Tambores
            </button>
          </div>
        </div>

        {/* ═══ Selected Object Panel ═══ */}
        <div className="p-4 flex-1 overflow-y-auto">
          {selectedObj ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Objeto Seleccionado
                </p>
                <button
                  onClick={() => deselectObject()}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-muted)',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Object info */}
              <div className="glass-subtle p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedObj.type === 'selective' ? '📦 Rack Selectivo' : '🛢️ Rack Tambores'}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: selectedObj.validation.valid
                        ? 'rgba(0, 230, 118, 0.15)'
                        : 'rgba(255, 23, 68, 0.15)',
                      color: selectedObj.validation.valid ? '#00e676' : '#ff1744',
                    }}
                  >
                    {selectedObj.validation.valid ? '✓ Válido' : '✗ Violación'}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ID: {selectedObj.id}
                </span>
              </div>

              {/* Violation details */}
              {!selectedObj.validation.valid && (
                <div
                  className="mb-3 p-3 rounded-lg text-xs"
                  style={{
                    background: 'rgba(255, 23, 68, 0.08)',
                    border: '1px solid rgba(255, 23, 68, 0.2)',
                    color: '#ff5252',
                  }}
                >
                  <p className="font-semibold mb-1">Violaciones normativas:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {selectedObj.validation.violations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Position inputs */}
              <div className="space-y-3 mb-4">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Posición (metros)
                </p>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                      X (Oeste→Este)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedObj.position[0].toFixed(1)}
                      onChange={(e) => handlePositionChange('x', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-mono"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'var(--text-bright)',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                      Z (Norte→Sur)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedObj.position[2].toFixed(1)}
                      onChange={(e) => handlePositionChange('z', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-mono"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'var(--text-bright)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Rotación Y (grados)
                  </label>
                  <input
                    type="number"
                    step="15"
                    value={((selectedObj.rotation[1] * 180) / Math.PI).toFixed(0)}
                    onChange={(e) => handleRotationChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'var(--text-bright)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => removeObject(selectedObj.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'rgba(255, 23, 68, 0.1)',
                  border: '1px solid rgba(255, 23, 68, 0.25)',
                  color: '#ff1744',
                }}
              >
                🗑️ Eliminar Objeto
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <div className="text-3xl mb-3">👆</div>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Haz clic en un rack para seleccionarlo y editarlo
              </p>
            </div>
          )}
        </div>

        {/* ═══ Footer Actions ═══ */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={hasViolations || !isDirty}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: hasViolations
                  ? 'rgba(255, 23, 68, 0.1)'
                  : 'rgba(0, 230, 118, 0.15)',
                border: `1px solid ${hasViolations ? 'rgba(255, 23, 68, 0.3)' : 'rgba(0, 230, 118, 0.3)'}`,
                color: hasViolations ? '#ff1744' : '#00e676',
              }}
            >
              💾 {hasViolations ? 'Corregir Violaciones' : 'Guardar Layout'}
            </button>
            <button
              onClick={resetLayout}
              className="px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
              }}
            >
              ↺
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
