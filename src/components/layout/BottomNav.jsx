import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, user } = useAppContext();
  
  const isDist = user?.role === 'distributor';
  const homePath = isDist ? '/distributor-home' : '/home';

  const getNavClass = (path) => {
    return `nb ${location.pathname === path ? 'active' : ''}`;
  };

  return (
    <div className="bnav">
      <button className={getNavClass(homePath)} onClick={() => navigate(homePath)}>
        <span className="material-symbols-outlined">home</span>Home
      </button>
      <button className={getNavClass('/invoice')} onClick={() => navigate('/invoice')}>
        <span className="material-symbols-outlined">upload_file</span>Invoice
      </button>
      
      <button className={getNavClass('/sell')} onClick={() => navigate('/sell')}>
        <span className="material-symbols-outlined">storefront</span>Sell
      </button>
      <button className={getNavClass('/cart')} onClick={() => navigate('/cart')} style={{ position: 'relative' }}>
        <span className="material-symbols-outlined">shopping_cart</span>Cart
        {cart.length > 0 && (
          <div style={{
            position: 'absolute', top: '-4px', right: '2px', background: '#dc2626', color: '#fff',
            width: '1.2rem', height: '1.2rem', borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, border: '1px solid rgba(0,0,0,0.3)'
          }}>
            {cart.length > 9 ? '9+' : cart.length}
          </div>
        )}
      </button>

      {isDist && (
        <button className={getNavClass('/dist-retailers')} onClick={() => navigate('/dist-retailers')}>
          <span className="material-symbols-outlined">groups</span>Clients
        </button>
      )}

      <button className={getNavClass('/earnings')} onClick={() => navigate('/earnings')}>
        <span className="material-symbols-outlined">analytics</span>Earnings
      </button>
      <button className={getNavClass('/inventory')} onClick={() => navigate('/inventory')}>
        <span className="material-symbols-outlined">inventory_2</span>Stock
      </button>
    </div>
  );
});

BottomNav.displayName = 'BottomNav';
