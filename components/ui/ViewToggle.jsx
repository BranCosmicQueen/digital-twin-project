'use client';

import useSimStore from '@/store/useSimStore';

export default function ViewToggle() {
  const viewMode = useSimStore((s) => s.viewMode);
  const isAnimating = useSimStore((s) => s.isAnimating);
  const toggleView = useSimStore((s) => s.toggleView);

  return (
    <button
      onClick={toggleView}
      disabled={isAnimating}
      className="fixed z-50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: 'rgba(10, 15, 30, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        color: 'var(--text-bright)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: viewMode === '2d'
          ? '0 0 20px rgba(0, 229, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.4)'
          : '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
      title={viewMode === '2d' ? 'Cambiar a Vista 3D' : 'Cambiar a Vista Cenital 2D'}
    >
      <div className="flex flex-col items-center gap-0.5">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {viewMode === '2d' ? (
            /* 3D cube icon */
            <>
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </>
          ) : (
            /* 2D square icon (top-down) */
            <>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </>
          )}
        </svg>
        <span
          className="font-bold"
          style={{ fontSize: '9px', letterSpacing: '0.5px' }}
        >
          {viewMode === '2d' ? '3D' : '2D'}
        </span>
      </div>
    </button>
  );
}
