import React from 'react';
import { Header } from '../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Wallet = () => {
    const navigate = useNavigate();
    const { transactions, walletBalance, pointCredits, pointTransactions, redeemPointCredits } = useAppContext();
    const [tabActive, setTabActive] = React.useState('wallet');
    
    return (
        <div className="screen active" style={{ background: 'var(--bg0)' }}>
            <Header title="Wallet" backTo="/home" />
            <div className="scroller" style={{ padding: '1.25rem' }}>
                 <div className="au d1 wallet-hero-card" style={{ borderRadius: 'var(--r16)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--sh)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at top right, rgba(212,165,116,.15), transparent 70%)' }}></div>
                    <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '.5rem', position: 'relative', zIndex: 2 }}>Total Balance</p>
                    <h2 style={{ fontSize: '3rem', fontFamily: 'var(--fd)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
                        <span style={{ fontSize: '1.5rem' }}>₹</span>{walletBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    </h2>
                     <div style={{ display: 'flex', gap: '.6rem', position: 'relative', zIndex: 2 }}>
                        <button onClick={() => navigate('/wallet/add')} className="btn btn-primary" style={{ flex: 1, padding: '.8rem' }}>
                            <span className="material-symbols-outlined">add</span>Add
                        </button>
                        <button onClick={() => navigate('/wallet/withdraw')} className="btn btn-ghost" style={{ flex: 1, padding: '.8rem' }}>
                            Withdraw<span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* TAB SWITCHER */}
                <div className="au d2" style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', borderBottom: '2px solid rgba(212,165,116,.2)' }}>
                   <button
                     onClick={() => setTabActive('wallet')}
                     style={{
                       flex: 1,
                       padding: '.75rem',
                       background: tabActive === 'wallet' ? 'linear-gradient(135deg, #d4a574, #c41e3a)' : 'transparent',
                       color: tabActive === 'wallet' ? '#fff' : 'var(--t2)',
                       border: 'none',
                       borderRadius: '8px 8px 0 0',
                       fontWeight: 800,
                       fontSize: '.9rem',
                       cursor: 'pointer'
                     }}
                   >
                      💳 Wallet
                   </button>
                   <button
                     onClick={() => setTabActive('points')}
                     style={{
                       flex: 1,
                       padding: '.75rem',
                       background: tabActive === 'points' ? 'linear-gradient(135deg, #d4a574, #c41e3a)' : 'transparent',
                       color: tabActive === 'points' ? '#fff' : 'var(--t2)',
                       border: 'none',
                       borderRadius: '8px 8px 0 0',
                       fontWeight: 800,
                       fontSize: '.9rem',
                       cursor: 'pointer'
                     }}
                   >
                      🏆 Points
                   </button>
                </div>

                {/* WALLET TAB */}
                {tabActive === 'wallet' && (
                  <>
                    <div className="au d2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.8rem' }}>
                       <h3 style={{ fontSize: '.95rem', fontWeight: 800 }}>Wallet History</h3>
                       <span style={{ fontSize: '.7rem', color: 'var(--t2)' }}>Last 30 days</span>
                    </div>

                    <div className="au d3" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                      {transactions.map(t => (
                         <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.7rem .875rem', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r8)' }}>
                            <div style={{ width: '2.4rem', height: '2.4rem', background: 'var(--bg3)', borderRadius: '.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                               <span className="material-symbols-outlined fi" style={{ fontSize: '1.1rem', color: t.clr }}>{t.icon}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                               <p style={{ fontSize: '.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</p>
                               <p style={{ fontSize: '.65rem', color: 'var(--t3)' }}>{t.sub} · {t.date}</p>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '.9rem', color: t.clr, flexShrink: 0 }}>{t.amt}</span>
                         </div>
                      ))}
                    </div>
                  </>
                )}

                {/* POINTS TAB */}
                {tabActive === 'points' && (
                  <>
                    <div className="au d2" style={{ background: '#fff', border: '2px solid #d4a574', borderRadius: 'var(--r12)', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '.75rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', margin: '0 0 .5rem 0' }}>Your Ferrero Points</p>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d4a574', margin: '0 0 1rem 0' }}>
                         {pointCredits.toLocaleString('en-IN')} <span style={{ fontSize: '1.2rem', color: '#999' }}>pts</span>
                      </h2>
                      <p style={{ fontSize: '.8rem', color: '#666', margin: '0 0 1rem 0' }}>Earn 1 point for every ₹1 earned from campaigns</p>
                      <button
                        onClick={() => redeemPointCredits(Math.min(100, pointCredits))}
                        disabled={pointCredits < 100}
                        style={{
                          padding: '.7rem 1.5rem',
                          background: pointCredits >= 100 ? 'linear-gradient(135deg, #d4a574, #c41e3a)' : '#ccc',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '9999px',
                          fontWeight: 900,
                          cursor: pointCredits >= 100 ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Redeem 100 Points
                      </button>
                    </div>

                    <div className="au d2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.8rem' }}>
                       <h3 style={{ fontSize: '.95rem', fontWeight: 800 }}>Points History</h3>
                       <span style={{ fontSize: '.7rem', color: 'var(--t2)' }}>All time</span>
                    </div>

                    <div className="au d3" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                      {pointTransactions && pointTransactions.length > 0 ? (
                        pointTransactions.map(t => (
                           <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.7rem .875rem', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r8)' }}>
                              <div style={{ width: '2.4rem', height: '2.4rem', background: t.type === 'credit' ? 'rgba(212,165,116,.12)' : 'rgba(196,30,58,.12)', borderRadius: '.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                 <span style={{ fontSize: '1.1rem' }}>{t.type === 'credit' ? '📈' : '📉'}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                 <p style={{ fontSize: '.85rem', fontWeight: 700 }}>{t.description}</p>
                                 <p style={{ fontSize: '.65rem', color: 'var(--t3)' }}>{t.timestamp}</p>
                              </div>
                              <span style={{ fontWeight: 800, fontSize: '.9rem', color: t.type === 'credit' ? '#d4a574' : '#c41e3a', flexShrink: 0 }}>
                                 {t.type === 'credit' ? '+' : '-'}{t.amount} pts
                              </span>
                           </div>
                        ))
                      ) : (
                        <p style={{ textAlign: 'center', color: 'var(--t3)', padding: '2rem 1rem' }}>No point transactions yet</p>
                      )}
                    </div>
                  </>
                )}
            </div>
        </div>
    );
};
