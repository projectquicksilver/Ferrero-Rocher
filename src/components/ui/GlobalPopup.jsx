import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export const GlobalPopup = () => {
  const { globalPopup, showGlobalPopup } = useAppContext();

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!globalPopup) return;
    const t = setTimeout(() => showGlobalPopup(null), 8000);
    return () => clearTimeout(t);
  }, [globalPopup]);

  if (!globalPopup) return null;

  const getTheme = (type) => {
    switch (type) {
      case 'approved':  return { bg: 'rgba(212,165,116,0.12)', border: 'rgba(212,165,116,0.5)', btnBg: '#d4a574', icon: '#d4a574' };
      case 'pending':   return { bg: 'rgba(212,165,116,0.12)',  border: 'rgba(212,165,116,0.5)',  btnBg: '#d4a574', icon: '#d4a574' };
      case 'rejected':  return { bg: 'rgba(196,30,58,0.12)',   border: 'rgba(196,30,58,0.5)',   btnBg: '#c41e3a', icon: '#c41e3a' };
      case 'fulfilled': return { bg: 'rgba(212,165,116,0.12)',  border: 'rgba(212,165,116,0.5)',  btnBg: '#d4a574', icon: '#d4a574' };
      default:          return { bg: 'rgba(212,165,116,0.08)', border: 'rgba(212,165,116,0.3)', btnBg: '#d4a574', icon: '#d4a574' };
    }
  };

  const t = getTheme(globalPopup.type);

  return (
    <div
      onClick={() => showGlobalPopup(null)}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg1)',
          border: `1.5px solid ${t.border}`,
          borderRadius: '24px',
          padding: '2rem 1.5rem 1.5rem',
          margin: '1rem',
          width: '100%',
          maxWidth: '320px',
          textAlign: 'center',
          boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 100px ${t.bg}`,
          position: 'relative',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Close button */}
        <button
          onClick={() => showGlobalPopup(null)}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'var(--bg2)', border: '1px solid var(--bdr)',
            color: 'var(--t3)', cursor: 'pointer', borderRadius: '50%',
            width: '2rem', height: '2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
        </button>

        {/* Icon circle */}
        <div style={{
          width: '5rem', height: '5rem', margin: '0 auto 1.25rem',
          background: t.bg, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${t.border}`
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: t.icon }}>
            {globalPopup.icon || 'notifications'}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.25rem', fontWeight: 900,
          marginBottom: '.6rem', color: 'var(--t1)', lineHeight: 1.25
        }}>
          {globalPopup.title}
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '.9rem', color: 'var(--t2)',
          lineHeight: 1.6, marginBottom: '1.5rem'
        }}>
          {globalPopup.message}
        </p>

        {/* OK Button */}
        <button
          onClick={() => showGlobalPopup(null)}
          style={{
            width: '100%', background: t.btnBg,
            border: 'none', color: '#000',
            padding: '.85rem', borderRadius: '14px',
            fontWeight: 900, fontSize: '.95rem',
            cursor: 'pointer', fontFamily: 'var(--fm)'
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
};
