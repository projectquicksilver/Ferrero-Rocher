import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { showToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';

export const DistHome = () => {
  const navigate = useNavigate();
  const { user, walletBalance, inventory, distOrders, myRetailers, approveB2BOrder, deliverB2BOrder, rejectB2BOrder, globalPopup, showGlobalPopup } = useAppContext();
  
  const [fulfillingId, setFulfillingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [deliveringOrder, setDeliveringOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [orderPopup, setOrderPopup] = useState(null);

  // Track the count of pending orders seen so far.
  // When a NEW pending order appears, show the popup immediately.
  const prevPendingCount = useRef(distOrders.filter(o => o.status === 'pending').length);

  useEffect(() => {
    const pendingOrders = distOrders.filter(o => o.status === 'pending');
    const newCount = pendingOrders.length;
    if (newCount > prevPendingCount.current) {
      // A new order just arrived — show popup
      const newest = pendingOrders[0];
      setOrderPopup(newest);
    }
    prevPendingCount.current = newCount;
  }, [distOrders]);

  const handleApprove = (id) => {
    setFulfillingId(id);
    setTimeout(() => {
      approveB2BOrder(id);
      setFulfillingId(null);
      showToast('✅ Order Approved! Retailer has received their OTP.');
    }, 1000);
  };

  const handleDeliver = (id) => {
    setDeliveringOrder(id);
    setOtpInput('');
  };

  const submitOtp = () => {
    if (otpInput.length >= 4) {
      const success = deliverB2BOrder(deliveringOrder, otpInput.trim());
      if (success) {
        showToast('🎉 OTP Verified! Order Delivered & Funds added.');
        setDeliveringOrder(null);
      } else {
        showToast('❌ Incorrect OTP! Delivery failed.');
      }
    } else {
      showToast('⚠️ Please enter a 4-digit OTP.');
    }
  };

  const handleReject = (id) => {
    setRejectingId(id);
    setTimeout(() => {
      rejectB2BOrder(id);
      setRejectingId(null);
      showToast('❌ Order Rejected (Out of Stock)');
    }, 1000);
  };

  const pendingCount = distOrders.filter(o => o.status === 'pending').length;
  const lowStockCount = inventory.filter(i => i.qty < 10).length;

  return (
    <div className="screen active">
      <Header title={`Hi, ${user.name?.split(' ')[0] || 'Distributor'}`} subtitle="Wholesale Dashboard" />
      
      <div className="scroller" style={{ padding: '1rem', paddingBottom: '6rem' }}>
        
        {/* Top Wallet Summary */}
        <div style={{ background: 'var(--g4)', borderRadius: 'var(--r12)', padding: '1.5rem', marginBottom: '1.5rem', color: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <p style={{ fontSize: '.8rem', fontWeight: 700, opacity: 0.8 }}>Available Credit Balance</p>
             <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '.2rem' }}>₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
           </div>
           <button style={{ background: '#000', color: 'var(--g4)', border: 'none', padding: '.6rem 1rem', borderRadius: '2rem', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer' }}>Withdraw</button>
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginBottom: '1.5rem' }}>
          <div onClick={() => navigate('/sell')} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--g4)', fontSize: '2rem' }}>add_business</span>
            <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--t1)' }}>Sell Items</p>
          </div>
          <div onClick={() => navigate('/inventory')} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--g4)', fontSize: '2rem' }}>inventory_2</span>
            <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--t1)' }}>Stock Page</p>
          </div>
          <div onClick={() => navigate('/dist-retailers')} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--g4)', fontSize: '2rem' }}>group</span>
            <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--t1)' }}>Clients</p>
          </div>
          <div onClick={() => navigate('/earnings')} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--g4)', fontSize: '2rem' }}>payments</span>
            <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--t1)' }}>Ledger</p>
          </div>
        </div>

        {/* Business Insights Mini */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div style={{ flex: 1 }}>
             <p style={{ fontSize: '.75rem', color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Receivables</p>
             <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--t1)' }}>₹45,200 <span style={{ fontSize: '.75rem', color: 'var(--t3)', fontWeight: 500 }}>from {myRetailers.length} Retailers</span></p>
           </div>
           <div style={{ width: '60px', height: '40px', background: 'linear-gradient(90deg, rgba(255,208,96,0.1) 0%, rgba(255,208,96,0.3) 100%)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
             {/* Fake sparkline */}
             <svg viewBox="0 0 60 40" style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
               <path d="M0,40 L0,30 L10,25 L20,35 L30,15 L40,20 L50,5 L60,10 L60,40 Z" fill="rgba(255,208,96,0.2)" />
               <polyline points="0,30 10,25 20,35 30,15 40,20 50,5 60,10" fill="none" stroke="var(--g4)" strokeWidth="2" />
             </svg>
           </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginTop: '1.5rem' }}>
          <Card style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--t3)', fontSize: '1.2rem' }}>inventory</span>
              <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>Inventory Value</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{inventory.reduce((sum, i) => sum + (i.buy * i.qty), 0).toLocaleString('en-IN')}</h3>
          </Card>
          <Card style={{ padding: '1rem', background: lowStockCount > 0 ? 'rgba(255,107,107,0.1)' : 'var(--bg2)', borderColor: lowStockCount > 0 ? 'rgba(255,107,107,0.3)' : 'var(--bdr)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: lowStockCount > 0 ? 'var(--e4)' : 'var(--t3)', fontSize: '1.2rem' }}>warning</span>
              <span style={{ fontSize: '.8rem', color: lowStockCount > 0 ? 'var(--e4)' : 'var(--t3)' }}>Low Stock</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: lowStockCount > 0 ? 'var(--e4)' : 'var(--t1)' }}>{lowStockCount} items</h3>
          </Card>
        </div>

        {/* Incoming Orders */}
        <div id="orders-section" className="au d4" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Incoming Orders {pendingCount > 0 && <span style={{ background: 'var(--o4)', color: '#000', fontSize: '.7rem', padding: '.1rem .4rem', borderRadius: '.5rem', verticalAlign: 'middle', marginLeft: '.4rem' }}>{pendingCount} New</span>}</h3>
             <span style={{ fontSize: '.8rem', color: 'var(--g4)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
            {distOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '.85rem', padding: '2rem 0' }}>No incoming orders yet.</p>
            ) : (
              distOrders.map(order => (
                <div key={order.id} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.6rem' }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: '.95rem' }}>{order.retailer}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{order.id} • {order.items} items</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--g4)' }}>₹{order.total.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{order.time}</p>
                      </div>
                   </div>
                   
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--bdr2)' }}>
                      {order.status === 'pending' ? (
                        <Chip variant="o">Pending Review</Chip>
                      ) : order.status === 'rejected' ? (
                        <span style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--e4)', border: '1px solid rgba(255,107,107,0.3)', padding: '.2rem .6rem', borderRadius: '1rem', fontSize: '.75rem', fontWeight: 700 }}>Rejected</span>
                      ) : order.status === 'approved' ? (
                        <Chip variant="o">Approved (Awaiting Delivery)</Chip>
                      ) : (
                        <Chip variant="g">Fulfilled</Chip>
                      )}
                      
                      {order.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                          <button 
                            onClick={() => handleReject(order.id)}
                            disabled={rejectingId === order.id || fulfillingId === order.id}
                            style={{ background: 'transparent', border: '1px solid var(--e4)', color: 'var(--e4)', padding: '.4rem .8rem', borderRadius: 'var(--r8)', fontSize: '.8rem', fontWeight: 700, cursor: (rejectingId === order.id || fulfillingId === order.id) ? 'not-allowed' : 'pointer' }}>
                            {rejectingId === order.id ? '...' : 'Reject'}
                          </button>
                          <button 
                            onClick={() => handleApprove(order.id)}
                            disabled={fulfillingId === order.id || rejectingId === order.id}
                            style={{ background: fulfillingId === order.id ? 'var(--bg3)' : 'var(--g4)', color: fulfillingId === order.id ? 'var(--t2)' : '#000', border: 'none', padding: '.4rem 1rem', borderRadius: 'var(--r8)', fontSize: '.8rem', fontWeight: 800, cursor: (fulfillingId === order.id || rejectingId === order.id) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                            {fulfillingId === order.id ? (
                              <><span className="material-symbols-outlined aspin" style={{ fontSize: '1rem' }}>sync</span> Processing</>
                            ) : 'Approve'}
                          </button>
                        </div>
                      )}

                      {order.status === 'approved' && (
                        <button 
                          onClick={() => handleDeliver(order.id)}
                          style={{ background: 'var(--g4)', color: '#000', border: 'none', padding: '.4rem 1rem', borderRadius: 'var(--r8)', fontSize: '.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>local_shipping</span>
                          Deliver Order
                        </button>
                      )}
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {deliveringOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
          <div className="au d1" style={{ background: 'var(--bg1)', border: '1px solid var(--bdr2)', borderRadius: 'var(--r12)', padding: '2rem 1.5rem', width: '90%', maxWidth: '320px', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--g4)', marginBottom: '1rem' }}>verified_user</span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '.5rem' }}>Enter Delivery OTP</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--t2)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Ask the Retailer for the 4-digit OTP from their dashboard to confirm delivery.
            </p>
            <Input 
              type="number" 
              maxLength={4}
              placeholder="0000" 
              value={otpInput} 
              onChange={e => setOtpInput(e.target.value)} 
              wrapperStyle={{ marginBottom: '1.5rem' }}
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 900 }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setDeliveringOrder(null)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--bdr)', color: 'var(--t2)', padding: '.8rem', borderRadius: 'var(--r8)', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitOtp} style={{ flex: 1, background: 'var(--g4)', border: 'none', color: '#000', padding: '.8rem', borderRadius: 'var(--r8)', fontWeight: 800, cursor: 'pointer' }}>Verify</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW ORDER RECEIVED POPUP ── shown directly here on the distributor screen */}
      {orderPopup && (
        <div
          onClick={() => setOrderPopup(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg1)', border: '1.5px solid rgba(255,208,96,0.5)',
              borderRadius: '24px', padding: '2rem 1.5rem 1.5rem',
              margin: '1rem', width: '100%', maxWidth: '320px', textAlign: 'center',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 100px rgba(255,208,96,0.1)',
              animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <button
              onClick={() => setOrderPopup(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'var(--bg2)', border: '1px solid var(--bdr)',
                color: 'var(--t3)', cursor: 'pointer', borderRadius: '50%',
                width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
            </button>

            <div style={{
              width: '5rem', height: '5rem', margin: '0 auto 1.25rem',
              background: 'rgba(212,165,116,0.12)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(212,165,116,0.5)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#d4a574' }}>shopping_bag</span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '.6rem', color: 'var(--t1)' }}>
              🛍️ New Order Received!
            </h2>
            <p style={{ fontSize: '.9rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              <strong style={{ color: 'var(--t1)' }}>{orderPopup.retailer}</strong> just placed a new order for{' '}
              <strong style={{ color: '#d4a574' }}>{orderPopup.items} items</strong> worth{' '}
              <strong style={{ color: '#d4a574' }}>₹{orderPopup.total?.toLocaleString('en-IN')}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button
                onClick={() => setOrderPopup(null)}
                style={{
                  flex: 1, background: 'transparent', border: '1px solid var(--bdr)',
                  color: 'var(--t2)', padding: '.8rem', borderRadius: '14px',
                  fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--fm)'
                }}
              >
                Later
              </button>
              <button
                onClick={() => { setOrderPopup(null); document.getElementById('orders-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                style={{
                  flex: 2, background: 'linear-gradient(135deg, #d4a574, #c41e3a)', border: 'none', color: '#fff',
                  padding: '.8rem', borderRadius: '14px',
                  fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--fm)'
                }}
              >
                View Order
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};
