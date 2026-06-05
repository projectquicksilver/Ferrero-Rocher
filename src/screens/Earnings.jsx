import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Header } from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import { TierBadge } from '../components/ui/Chip';

export const Earnings = () => {
  const { transactions } = useAppContext();
  
  const purchases = 73450;
  let pct = 0;
  let tier = 'bronze';
  if (purchases >= 100000) { pct = 2.5; tier = 'diamond'; }
  else if (purchases >= 50000) { pct = 1.75; tier = 'gold'; }
  else if (purchases >= 10000) { pct = 1.0; tier = 'silver'; }
  
  const width = Math.min(100, (purchases / 100000) * 100);

  return (
    <AppLayout>
      <div className="screen active">
        <Header title="Rewards Engine" subtitle="Maximize your payouts" />
        
        <div className="scroller" style={{ padding: '1.25rem' }}>
          <div className="au d1" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r16)', padding: '1.4rem 1.25rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at top right, rgba(212,165,116,.12), transparent)' }}></div>
             <div style={{ position: 'relative', zIndex: 10 }}>
                <TierBadge tier={tier} />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                   <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '.68rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Purchase Cashback</p>
                      <p style={{ fontSize: '1.8rem', fontFamily: 'var(--fd)', fontWeight: 800, color: 'var(--g4)' }}>{pct}%</p>
                      <p style={{ fontSize: '.68rem', color: 'var(--t2)', marginTop: '4px' }}>₹2,156 earned</p>
                   </div>
                   <div style={{ width: '1px', background: 'var(--bdr)' }}></div>
                   <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '.68rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Sales Rewards</p>
                      <p style={{ fontSize: '1.8rem', fontFamily: 'var(--fd)', fontWeight: 800, color: 'var(--o4)' }}>Flat</p>
                      <p style={{ fontSize: '.68rem', color: 'var(--t2)', marginTop: '4px' }}>₹1,326 earned</p>
                   </div>
                </div>
                
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--bdr2)', borderRadius: 'var(--r8)', padding: '.875rem', marginTop: '1.25rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.6rem' }}>
                      <span style={{ fontSize: '.75rem', fontWeight: 700 }}>₹{purchases.toLocaleString('en-IN')} / month</span>
                      <span style={{ fontSize: '.75rem', color: 'var(--t2)' }}>₹1,00,000</span>
                   </div>
                   <div className="pbar">
                      <div className="pfill pfill-gold" style={{ width: `${width}%` }}></div>
                   </div>
                   <p style={{ fontSize: '.68rem', color: 'var(--t2)', marginTop: '.6rem', textAlign: 'center' }}>Buy ₹26,550 more to reach Diamond (2.5%)</p>
                </div>
             </div>
          </div>

          <h3 className="au d2" style={{ fontSize: '.9rem', fontWeight: 800, marginBottom: '1rem' }}>Earning Transactions</h3>
          
          <div className="au d3" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', paddingBottom: '2rem' }}>
             {transactions.filter(t => t.type !== 'withdraw').map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.7rem .875rem', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r8)' }}>
                   <div style={{ width: '2.1rem', height: '2.1rem', background: 'rgba(255,255,255,.04)', borderRadius: '.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined fi" style={{ fontSize: '.85rem', color: t.clr }}>{t.icon}</span>
                   </div>
                   <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</p>
                      <p style={{ fontSize: '.62rem', color: 'var(--t3)' }}>{t.sub}</p>
                      <p style={{ fontSize: '.6rem', color: 'var(--t3)', opacity: .7 }}>{t.date}</p>
                   </div>
                   <span style={{ fontWeight: 700, fontSize: '.85rem', color: t.clr, flexShrink: 0 }}>{t.amt}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
