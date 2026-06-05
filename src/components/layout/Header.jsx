import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

export const Header = React.memo(({ title, subtitle, backTo, rightContent }) => {
  const navigate = useNavigate();
  const { user, notifications } = useAppContext() || {};
  
  const unreadCount = (notifications || []).filter(n => n.role === user?.role && !n.isRead).length;

  return (
    <div className="ghead" style={{ padding: '.875rem 1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
          {backTo && (
            <IconButton isBack={true} onClick={() => navigate(backTo)}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.05rem' }}>arrow_back</span>
            </IconButton>
          )}
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: '.65rem', color: 'var(--t2)' }}>{subtitle}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
          {rightContent && <div>{rightContent}</div>}
          
          {user?.role && (
            <button
              onClick={() => navigate('/notifications')}
              style={{ background: unreadCount > 0 ? 'rgba(212,165,116,.1)' : 'var(--bg2)', border: unreadCount > 0 ? '1px solid rgba(212,165,116,.3)' : '1px solid var(--bdr)', color: unreadCount > 0 ? '#d4a574' : 'var(--t1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '.4rem', borderRadius: '50%', position: 'relative', transition: 'all .2s' }}
              title="Notifications"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>notifications</span>
              {unreadCount > 0 && (
                <>
                  <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#c41e3a', borderRadius: '50%', boxShadow: '0 0 6px rgba(196,30,58,.6)' }}></span>
                  <span style={{ position: 'absolute', top: -6, right: -6, background: '#c41e3a', color: '#fff', fontSize: '.6rem', fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
                </>
              )}
            </button>
          )}

          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'rgba(239,68,68,.1)', 
              border: '1px solid rgba(239,68,68,.2)', 
              color: 'var(--e4)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              padding: '.4rem',
              borderRadius: '50%'
            }}
            title="Logout / Switch Role"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>logout</span>
          </button>
        </div>
      </div>
    </div>
  );
});

Header.displayName = 'Header';
