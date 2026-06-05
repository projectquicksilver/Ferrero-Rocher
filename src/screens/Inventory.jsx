import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Header } from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { showToast } from '../components/ui/Toast';
import { ProductIcon } from '../components/ui/ProductIcon';

export const Inventory = () => {
  const navigate = useNavigate();
  const { inventory, user, addInventoryItem, isSeeding } = useAppContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...new Set(inventory.map(p => p.cat))];
  
  const filtered = inventory.filter(p => {
    const mSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase());
    const mFilter = filter === 'all' || p.cat === filter;
    return mSearch && mFilter;
  });

  return (
    <AppLayout>
      <div className="screen active">
        <Header 
          title="Stock Ledger" 
          subtitle={`${filtered.length}/${inventory.length} products · ${user.cat ? `🏷️ ${user.cat}` : 'All categories'}`}
          rightContent={
            <div style={{ display: 'flex', gap: '.6rem' }}>
              <button 
                className="btn-icon" 
                onClick={() => navigate('/add-inventory')}
                style={{ background: 'rgba(212,165,116,.1)', border: '1px solid rgba(212,165,116,.3)', color: 'var(--g4)' }}
                title="Add Inventory"
              >
                <span className="material-symbols-outlined">add_box</span>
              </button>
              <button 
                className="btn-icon" 
                onClick={() => navigate('/sell')}
                style={{ background: 'rgba(255,208,96,.1)', border: '1px solid rgba(255,208,96,.3)', color: 'var(--o4)' }}
                title="Sell Product"
              >
                <span className="material-symbols-outlined">storefront</span>
              </button>
            </div>
          }
        />
        
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--bdr)', background: 'var(--bg0)' }}>
           <Input 
             placeholder="Search items, brands, categories..." 
             value={search}
             onChange={e => setSearch(e.target.value)}
             wrapperStyle={{ background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: 'var(--r8)', display: 'flex' }}
             prefix={<span className="material-symbols-outlined" style={{ color: 'var(--t3)', alignSelf: 'center', marginLeft: '.5rem', fontSize: '1.1rem' }}>search</span>}
             style={{ border: 'none', background: 'transparent' }}
           />
           
           <div style={{ display: 'flex', gap: '.5rem', overflowX: 'auto', paddingBottom: '2px', marginTop: '.8rem', scrollbarWidth: 'none' }}>
              {categories.map((c, i) => (
                <button 
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`ifbtn ${filter === c ? 'act' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {c}
                </button>
              ))}
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginTop: '1rem' }}>
             <button onClick={() => navigate('/add-inventory')} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr2)', borderRadius: 'var(--r8)', padding: '.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', color: 'var(--t1)', fontWeight: 700, cursor: 'pointer' }}>
               <span className="material-symbols-outlined" style={{ color: 'var(--t2)' }}>qr_code_scanner</span>
               Scan Barcode
             </button>
             <button onClick={() => navigate('/invoice')} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr2)', borderRadius: 'var(--r8)', padding: '.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', color: 'var(--t1)', fontWeight: 700, cursor: 'pointer' }}>
               <span className="material-symbols-outlined" style={{ color: 'var(--t2)' }}>receipt_long</span>
               Upload Invoice
             </button>
           </div>
        </div>

        <div className="scroller" style={{ padding: '1.25rem' }}>
          {isSeeding ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <span className="material-symbols-outlined aspin" style={{ fontSize: '3rem', color: 'var(--g4)' }}>sync</span>
              <p style={{ fontWeight: 800, marginTop: '1rem', fontSize: '1.1rem' }}>Generating Stock Ledger...</p>
              <p style={{ color: 'var(--t3)', fontSize: '.75rem', marginTop: '.4rem' }}>Optimizing inventory for your business type</p>
            </div>
          ) : !filtered.length ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--t3)' }}>inventory_2</span>
              <p style={{ color: 'var(--t2)', marginTop: '.75rem' }}>No products yet.<br/>Add items manually or upload an invoice.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/add-inventory')} 
                style={{ marginTop: '1.1rem', width: 'auto', padding: '.7rem 1.4rem', borderRadius: 'var(--r12)', background: 'var(--g4)', color: '#000', border: 'none', fontWeight: 800 }}
              >
                Add My First Product
              </button>
            </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', paddingBottom: '2rem' }}>
                {filtered.map((p, i) => (
                   <div key={p.id} className="au" style={{ animationDelay: `${i * .04}s`, background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '.85rem .95rem', display: 'flex', alignItems: 'center', gap: '.8rem' }}>
                      <div style={{ width: '2.8rem', height: '2.8rem', background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: '.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                         <ProductIcon product={p} fontSize="1.25rem" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                         <p style={{ fontWeight: 800, fontSize: '.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flexWrap: 'wrap', marginTop: '.18rem' }}>
                            <span style={{ fontSize: '.62rem', padding: '.1rem .42rem', background: 'var(--bg3)', borderRadius: '9999px', color: 'var(--t2)' }}>{p.cat}</span>
                            <span style={{ fontSize: '.62rem', color: 'var(--t3)' }}>{p.unit}</span>
                            <span style={{ fontSize: '.62rem', color: p.qty < 5 ? '#ef4444' : 'var(--t3)' }}>{p.qty} in stock {p.qty < 5 && '⚠️'}</span>
                         </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                         <p style={{ fontWeight: 800, fontSize: '.9rem' }}>₹{p.sell}</p>
                         <p style={{ fontSize: '.62rem', color: 'var(--g4)' }}>{user?.role === 'distributor' ? `margin ₹${p.earn}` : `earn ₹${p.earn}`}</p>
                         <p style={{ fontSize: '.6rem', color: 'var(--t3)' }}>{user?.role === 'distributor' ? `cost ₹${p.buy}` : `buy ₹${p.buy}`}</p>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>
        {/* Removed Modal */}
      </div>
    </AppLayout>
  );
};
