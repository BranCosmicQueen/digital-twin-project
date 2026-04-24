'use client';

import useSimStore from '@/store/useSimStore';

export default function HoverTooltip() {
  const hoveredItem = useSimStore((s) => s.hoveredItem);
  const viewMode = useSimStore((s) => s.viewMode);

  if (!hoveredItem || viewMode !== '2d') return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 px-8 py-4 rounded-2xl shadow-2xl transition-all duration-150 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
          <span className="text-white font-bold tracking-widest text-base uppercase">
            {hoveredItem}
          </span>
        </div>
      </div>
    </div>
  );
}
