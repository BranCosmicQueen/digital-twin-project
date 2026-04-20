'use client';

import { useSimulationStore } from '@/lib/store';

export default function SimulationUI() {
  const { 
    status, 
    setStatus, 
    resetSimulation, 
    barrelsDelivered,
    truckPosition
  } = useSimulationStore();

  const isBusy = status !== 'idle';

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-4">
      {/* --- Main Control Panel --- */}
      <div className="w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl overflow-hidden relative group">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10 group-hover:bg-blue-500/20 transition-all" />
        
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          SIMULACIÓN ESMAX
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setStatus('inbound')}
            disabled={isBusy}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isBusy 
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                : 'bg-blue-600/80 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border border-blue-400/30 active:scale-95'
            }`}
          >
            <span>▶</span> Simular Entrada
          </button>

          <button
            onClick={() => setStatus('outbound')}
            disabled={isBusy}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isBusy 
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                : 'bg-emerald-600/80 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border border-emerald-400/30 active:scale-95'
            }`}
          >
            <span>◀</span> Simular Salida
          </button>

          <button
            onClick={resetSimulation}
            className="w-full py-2 text-white/40 hover:text-white/80 text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>⏹</span> Reset Site
          </button>
        </div>

        {/* --- Activity Monitor --- */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/50 text-xs uppercase tracking-widest font-medium">Estado</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
              status === 'idle' ? 'text-white/30' : 'text-blue-400 bg-blue-400/10'
            }`}>
              {status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-white/40 text-[10px] uppercase font-bold">Barrels</p>
              <p className="text-white text-xl font-mono leading-none">{barrelsDelivered}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-white/40 text-[10px] uppercase font-bold">X-Position</p>
              <p className="text-white text-xl font-mono leading-none tracking-tight">
                {truckPosition[0].toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Legend/Help (Subtle) --- */}
      <div className="bg-black/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
        <p className="text-[10px] text-white/30 leading-relaxed italic">
          * Los camioneros deben realizar pesaje obligatorio en romana antes de descarga.
        </p>
      </div>
    </div>
  );
}
