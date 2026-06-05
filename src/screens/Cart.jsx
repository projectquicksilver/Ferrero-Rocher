import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input, OtpInput } from '../components/ui/Input';
import { useAppContext } from '../context/AppContext';
import { showToast } from '../components/ui/Toast';

export const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateCartQty, completeSale } = useAppContext();
  
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [saleOtp, setSaleOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const total = cart.reduce((s, c) => s + c.sell * c.qty, 0);
  const baseEarned = cart.reduce((s, c) => s + c.earn * c.qty, 0);
  const earned = +(baseEarned + 5).toFixed(2); // Preview total with bonus
  const ct = cart.reduce((s, c) => s + c.qty, 0);

  const handleCheckout = () => {
    if (!cart.length) { showToast('⚠️ Cart is empty'); return; }
    if (!custName) { showToast('⚠️ Enter customer name'); return; }
    if (!custPhone || custPhone.length < 10) { showToast('⚠️ Enter 10-digit WhatsApp number'); return; }
    
    setGeneratedOtp(Math.floor(1000 + Math.random() * 9000).toString());
    setShowOtpPopup(true);
  };

  const handleVerifyOTP = async () => {
    if (saleOtp === generatedOtp || saleOtp === '1234') {
      try {
        const e = await completeSale(custName, custPhone, true);
        navigate('/success', { state: { custName, ct, total, earned: e, firstItem: cart[0]?.name }});
      } catch (err) {
        console.error(err);
        showToast('❌ Error completing sale');
      }
    } else {
      showToast(`❌ Wrong OTP. Demo code: ${generatedOtp}`);
      setSaleOtp('');
    }
  };

  if (!cart.length && !showOtpPopup) {
    return (
      <div className="screen active">
        <Header title="Cart" backTo="/sell" />
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '.75rem' }}>🛒</div>
          <p style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: '.35rem' }}>Cart is empty</p>
          <p style={{ fontSize: '.82rem', color: 'var(--t2)', marginBottom: '1.25rem' }}>Add products from the sell screen</p>
          <Button onClick={() => navigate('/sell')} style={{ width: 'auto', padding: '.7rem 1.5rem', borderRadius: 'var(--r12)' }}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <Header title="Cart" subtitle={`${ct} items · ₹${total.toLocaleString('en-IN')}`} backTo="/sell" />

      <div className="scroller" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          {cart.map((c, i) => (
            <div key={c.id} className="au" style={{ animationDelay: `${i*.06}s`, background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '.875rem', display: 'flex', gap: '.75rem', marginBottom: '.55rem' }}>
              <div style={{ width: '3rem', height: '3rem', background: 'var(--bg3)', borderRadius: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined fi" style={{ fontSize: '1.3rem', color: c.clr }}>{c.icon}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '.18rem' }}>{c.name}</p>
                <p style={{ fontSize: '.65rem', color: 'var(--t3)', marginBottom: '.45rem' }}>{c.unit} · earn ₹{c.earn}/unit</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 'var(--r8)', padding: '.2rem .35rem' }}>
                    <button onClick={() => updateCartQty(c.id, -1)} style={{ width: '1.75rem', height: '1.75rem', borderRadius: 'var(--r4)', background: 'var(--bg4)', border: 'none', color: 'var(--g4)', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'var(--fd)' }}>−</button>
                    <span style={{ fontSize: '.95rem', fontWeight: 800, minWidth: '1.5rem', textAlign: 'center' }}>{c.qty}</span>
                    <button onClick={() => updateCartQty(c.id, 1)} style={{ width: '1.75rem', height: '1.75rem', borderRadius: 'var(--r4)', background: 'var(--bg4)', border: 'none', color: 'var(--g4)', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'var(--fd)' }}>+</button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, fontSize: '.95rem' }}>₹{(c.sell * c.qty).toLocaleString('en-IN')}</p>
                    <p style={{ fontSize: '.62rem', color: 'var(--g4)' }}>earn ₹{+(c.earn * c.qty).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => updateCartQty(c.id, -c.qty)} 
                style={{ alignSelf: 'flex-start', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.18)', borderRadius: 'var(--r4)', color: '#ef4444', cursor: 'pointer', padding: '.25rem', flexShrink: 0, width: '1.75rem', height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '.85rem' }}>close</span>
              </button>
            </div>
          ))}
        </div>

        <div className="au d4" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: '1rem' }}>Customer Details</h3>
          <Input placeholder="Customer Name" value={custName} onChange={e => setCustName(e.target.value)} wrapperClass="margin-bottom-875" />
          <Input type="tel" maxLength="10" placeholder="WhatsApp Number" value={custPhone} onChange={e => setCustPhone(e.target.value)} />
          <p style={{ fontSize: '.65rem', color: 'var(--t3)', marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
            <span className="material-symbols-outlined fi" style={{ fontSize: '.8rem' }}>verified_user</span> OTP will be sent to verify purchase
          </p>
        </div>
      </div>

      <div className="au d5" style={{ padding: '1rem', borderTop: '1px solid var(--bdr)', background: 'var(--bg1)' }}>
        <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--g4)', textAlign: 'center', marginBottom: '.6rem' }}>You will earn ₹{earned.toLocaleString('en-IN')} on this sale</p>
        <Button onClick={handleCheckout} className="btn-gold">Checkout · ₹{total.toLocaleString('en-IN')}</Button>
      </div>

      {showOtpPopup && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(14px)', zIndex: 9998, display: 'flex', alignItems: 'flex-end', animation: 'fadein .2s both' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr2)', borderRadius: '1.5rem 1.5rem 0 0', width: '100%', padding: '1.5rem 1.25rem 2rem', animation: 'slideUpIn .32s cubic-bezier(.25,1,.5,1) both' }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--bg4)', borderRadius: '9999px', margin: '0 auto 1.25rem' }}></div>
            <div style={{ textAlign: 'center', marginBottom: '1.1rem' }}>
              <div style={{ width: '3.8rem', height: '3.8rem', background: 'rgba(212,165,116,.1)', border: '1px solid rgba(212,165,116,.22)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .65rem', position: 'relative' }}>
                <span className="material-symbols-outlined fi" style={{ fontSize: '1.9rem', color: 'var(--g4)' }}>sms</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '.28rem' }}>Verify Sale with OTP</h3>
              <p style={{ fontSize: '.78rem', color: 'var(--t2)' }}>Sent to <strong style={{ color: 'var(--t1)' }}>+91 {custPhone}</strong></p>
            </div>
            
            <div style={{ background: 'rgba(212,165,116,.05)', border: '1.5px dashed rgba(212,165,116,.3)', borderRadius: 'var(--r8)', padding: '.7rem 1rem', marginBottom: '.875rem', textAlign: 'center' }}>
              <p style={{ fontSize: '.62rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.25rem' }}>Demo OTP</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '.4em', color: 'var(--g4)', fontFamily: 'var(--fm)' }}>{generatedOtp}</p>
            </div>

            <OtpInput length={4} value={saleOtp} onChange={setSaleOtp} />
            
            <Button onClick={handleVerifyOTP} style={{ marginTop: '.875rem', marginBottom: '.5rem' }}>
              <span className="material-symbols-outlined fi">verified</span> Verify & Complete
            </Button>
            <button onClick={() => setShowOtpPopup(false)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.8rem', cursor: 'pointer', padding: '.4rem' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
