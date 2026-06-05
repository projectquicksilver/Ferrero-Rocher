import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../context/AppContext';

export const Ready = () => {
  const navigate = useNavigate();
  const { user, linkedDists, initializeAIStore } = useAppContext();
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // start confetti
    const canvas = document.getElementById('confetti-c');
    const shell = document.getElementById('shell');
    if (canvas && shell) {
      canvas.width = shell.offsetWidth;
      canvas.height = shell.offsetHeight;
      canvas.style.display = 'block';
      const ctx = canvas.getContext('2d');
      const colors = ['#d4a574','#c41e3a','#8b6f47','#f9f7f3','#ffd060','#cc8a5a'];
      const P = Array.from({length:90}, () => ({
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
      
      // Cleanup
      return () => { cancelAnimationFrame(requestID); canvas.style.display = 'none'; };
    }
  }, []);

  useEffect(() => {
    // Generate AI products in background
    initializeAIStore(user.cat);

    // Simulate AI greeting fetch
    const tId = setTimeout(() => {
      setLoading(false);
      const isDist = user?.role === 'distributor';
      setWelcomeMsg(isDist 
        ? `Welcome ${user.name.split(' ')[0]}! Your wholesale dashboard is ready. Upload your inventory, track incoming orders, and fulfill them easily to start earning.` 
        : `Welcome ${user.name.split(' ')[0]}! Your dual-earning account is ready. Upload your first distributor invoice to earn purchase cashback, then start selling to earn sale rewards. Your Gold tier (1.75%) kicks in at ₹50,000/month.`
      );
    }, 1500);
    
    return () => clearTimeout(tId);
  }, [user.name, user.cat, initializeAIStore]);

  return (
    <div className="screen active">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(212,165,116,.15), transparent 60%)', pointerEvents: 'none' }}></div>
       
       <div className="scroller" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.4rem' }}>
          <div className="asp" style={{ width: '5.5rem', height: '5.5rem', background: 'rgba(212,165,116,.1)', border: '1px solid rgba(212,165,116,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <span className="material-symbols-outlined fi" style={{ fontSize: '3rem', color: 'var(--g4)' }}>verified</span>
            <div style={{ position: 'absolute', inset: -10, border: '1px dashed rgba(212,165,116,.4)', borderRadius: '50%', animation: 'spin 10s linear infinite' }}></div>
          </div>
          
           <h1 className="au" style={{ fontSize: '2rem', fontFamily: 'var(--fd)', fontWeight: 800, textAlign: 'center', lineHeight: 1.1, marginBottom: '.5rem', letterSpacing: '-.03em' }}>
            You're all set,<br/> <span style={{ color: 'var(--g4)' }}>{user.name.split(' ')[0]}!</span>
          </h1>
          
          <div className="au d1" style={{ display: 'flex', gap: '.5rem', margin: '1rem 0' }}>
             <div style={{ padding: '.4rem .8rem', background: 'var(--bg3)', borderRadius: '9999px', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <span className="material-symbols-outlined fi" style={{ color: 'var(--o4)', fontSize: '1rem' }}>storefront</span>
                {user.cat.toUpperCase()}
             </div>
             <div style={{ padding: '.4rem .8rem', background: 'var(--bg3)', borderRadius: '9999px', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <span className="material-symbols-outlined fi" style={{ color: 'var(--td)', fontSize: '1rem' }}>handshake</span>
                {linkedDists.length} linked
             </div>
          </div>
          
           <div className="au d2" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1.25rem', width: '100%', marginTop: '1rem', minHeight: '120px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, var(--g4), var(--g6))' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.6rem' }}>
              <span className="material-symbols-outlined aspin" style={{ color: 'var(--g4)', fontSize: '1rem' }}>auto_awesome</span>
              <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--g4)', letterSpacing: '.05em', textTransform: 'uppercase' }}>CounterOS Assistant</span>
            </div>
            
            {loading ? (
               <div style={{ display: 'flex', gap: '4px', marginTop: '1rem' }}>
                  <div className="tdot"></div><div className="tdot"></div><div className="tdot"></div>
               </div>
            ) : (
               <p style={{ fontSize: '.85rem', lineHeight: 1.6, color: 'var(--t1)' }}>{welcomeMsg}</p>
            )}
          </div>
       </div>

        <div className="au d3" style={{ padding: '0 1.4rem 2rem' }}>
          <Button onClick={() => navigate(user?.role === 'distributor' ? '/distributor-home' : '/home')}>Take me to Dashboard <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>rocket_launch</span></Button>
       </div>
    </div>
  );
};
