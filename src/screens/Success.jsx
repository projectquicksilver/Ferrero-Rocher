import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || { custName: 'Customer', ct: 1, total: 100, earned: 5, firstItem: 'Product' };

  useEffect(() => {
    // start confetti
    const canvas = document.getElementById('confetti-c');
    const shell = document.getElementById('shell');
    if (canvas && shell) {
      canvas.width = shell.offsetWidth;
      canvas.height = shell.offsetHeight;
      canvas.style.display = 'block';
      const ctx = canvas.getContext('2d');
      const colors = ['#d4a574','#c41e3a','#8b6f47','#f9f7f3'];
      const P = Array.from({length:70}, () => ({
        x: Math.random() * canvas.width, y: Math.random() * -canvas.height,
        w: 5 + Math.random() * 8, h: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - .5) * 3, vy: 2.5 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2, rv: (Math.random() - .5) * .14, op: 1
      }));
      let f = 0;
      let requestID;
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        P.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.rot += p.rv;
          if (f > 50) p.op -= .012;
          ctx.save(); ctx.globalAlpha = Math.max(0, p.op);
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        f++;
        if (f < 130) requestID = requestAnimationFrame(draw);
        else canvas.style.display = 'none';
      };
      draw();
      return () => { cancelAnimationFrame(requestID); canvas.style.display = 'none'; };
    }
  }, []);

  return (
    <div className="screen active" style={{ backgroundColor: 'var(--bg1)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(212,165,116,.15), transparent 60%)', pointerEvents: 'none' }}></div>
      <div className="scroller" style={{ display: 'flex', flexDirection: 'column', padding: '2rem 1.4rem' }}>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="asp" style={{ width: '5.5rem', height: '5.5rem', background: 'rgba(255,208,96,.1)', border: '1px solid rgba(255,208,96,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <span className="material-symbols-outlined fi" style={{ fontSize: '3rem', color: 'var(--o4)' }}>verified</span>
            <div style={{ position: 'absolute', inset: -10, border: '1px dashed rgba(255,208,96,.4)', borderRadius: '50%', animation: 'spin 10s linear infinite' }}></div>
          </div>
          
          <h1 className="au d1" style={{ fontSize: '2rem', fontFamily: 'var(--fd)', fontWeight: 800, textAlign: 'center', lineHeight: 1.1, marginBottom: '.75rem', letterSpacing: '-.03em' }}>
            ₹{state.total.toLocaleString('en-IN')} Received
          </h1>
          <p className="au d2" style={{ fontSize: '.85rem', color: 'var(--t2)', marginBottom: '1.5rem' }}>OTP verified ✓ · Sale complete for {state.custName.split(' ')[0]}</p>
          
          <div className="au d3" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1.25rem', width: '100%' }}>
            <p style={{ fontSize: '.68rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.4rem' }}>Reward Credited</p>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--fd)', fontWeight: 800, color: 'var(--o4)', marginBottom: '.8rem' }}>+₹{state.earned.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2>
            <div style={{ height: '1px', background: 'var(--bdr2)', margin: '.8rem 0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.75rem', color: 'var(--t2)' }}>{state.firstItem} {state.ct > 1 ? `and ${state.ct - 1} items` : ''}</span>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--t1)' }}>{state.ct} items</span>
            </div>
          </div>
        </div>

        <div className="au d4" style={{ marginTop: '2rem' }}>
          <Button onClick={() => navigate('/home')}>Back to Home</Button>
          <button onClick={() => navigate('/sell')} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.82rem', cursor: 'pointer', textAlign: 'center', marginTop: '.8rem', padding: '.4rem', fontFamily: 'var(--fd)', fontWeight: 700 }}>New Sale</button>
        </div>
      </div>
    </div>
  );
};
