import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const RewardsSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { FERRERO_THEME } = useAppContext();
  
  // Extract state details passed from details page
  const { 
    rewardName, 
    pointsUsed, 
    remainingPoints, 
    voucherCode, 
    redemptionId, 
    rewardType, 
    cashbackAmount,
    is194r,
    complianceStatus
  } = location.state || {
    rewardName: '₹100 Gift Voucher',
    pointsUsed: 1000,
    remainingPoints: 3850,
    voucherCode: 'VCH-847291',
    redemptionId: 'RED-' + Date.now(),
    rewardType: 'partner',
    cashbackAmount: 0,
    is194r: false,
    complianceStatus: 'Approved'
  };

  // Trigger custom confetti burst on render (only for normal success, or soft sparklers for compliance)
  useEffect(() => {
    const colors = is194r ? ['#d4a574', '#9ca3af', '#fff'] : ['#d4a574', '#c41e3a', '#ffd060', '#fff'];
    const count = is194r ? 30 : 80;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        top: 40%;
        left: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${colors[i % colors.length]};
        pointer-events: none;
        z-index: 9999;
        animation: cos-confetti 1.4s ease-out forwards;
        --dx: ${(Math.random() - 0.5) * 500}px;
        --dy: ${(Math.random() - 1.2) * 400}px;
        animation-delay: ${Math.random() * 0.15}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }
  }, [is194r]);

  const formattedDate = new Date().toLocaleString('en-IN');

  return (
    <div className="screen active" style={{ background: '#0b0604', color: '#fff', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div className="scroller" style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* SUCCESS ICON ANIMATION CONTAINER */}
        <div className="asp" style={{ 
          width: '5.5rem', height: '5.5rem', 
          background: is194r 
            ? 'linear-gradient(135deg, #d4a574, #442a12)' 
            : 'linear-gradient(135deg, #78f275, #122416)', 
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: is194r 
            ? '0 0 32px rgba(212,165,116,0.3)' 
            : '0 0 32px rgba(120,242,117,0.3)',
          marginBottom: '1.5rem',
          animation: 'spring .6s cubic-bezier(.34,1.56,.64,1) both'
        }}>
          <span className="material-symbols-outlined fi" style={{ fontSize: '3rem', color: is194r ? '#d4a574' : '#78f275' }}>
            {is194r ? 'pending_actions' : 'check_circle'}
          </span>
        </div>

        <h1 className="au d1" style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--g4)', textAlign: 'center', letterSpacing: '-.03em', margin: '0 0 .5rem 0' }}>
          {is194r ? 'Held for 194R Compliance' : 'Redemption Successful!'}
        </h1>
        <p className="au d2" style={{ fontSize: '.85rem', color: 'var(--t3)', textAlign: 'center', marginBottom: '2.5rem', padding: '0 1rem' }}>
          {is194r 
            ? 'Points deducted successfully. The reward will be released after KYC verification and TDS compliance.' 
            : 'Your points have been securely deducted and voucher code is generated.'}
        </p>

        {/* DETAILS TABLE BLOCK */}
        <div className="au d3" style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r16)', padding: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.75rem', borderBottom: '1px solid var(--bdr)', marginBottom: '.75rem' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Claimed Reward</span>
            <strong style={{ fontSize: '.78rem', color: '#fff', textAlign: 'right' }}>{rewardName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.75rem', borderBottom: '1px solid var(--bdr)', marginBottom: '.75rem' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Points Redeemed</span>
            <strong style={{ fontSize: '.78rem', color: 'var(--g4)' }}>-{pointsUsed} pts</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.75rem', borderBottom: '1px solid var(--bdr)', marginBottom: '.75rem' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Remaining Points</span>
            <strong style={{ fontSize: '.78rem', color: 'var(--t2)' }}>{remainingPoints} pts</strong>
          </div>
          
          {is194r ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.75rem', borderBottom: '1px solid var(--bdr)', marginBottom: '.75rem' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>TDS Applicable</span>
                <strong style={{ fontSize: '.78rem', color: '#ef4444' }}>Yes (10%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.75rem', borderBottom: '1px solid var(--bdr)', marginBottom: '.75rem' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Compliance Status</span>
                <strong style={{ fontSize: '.78rem', color: 'var(--g4)', textTransform: 'capitalize' }}>
                  ⏳ {complianceStatus || 'Pending Verification'}
                </strong>
              </div>
            </>
          ) : rewardType !== 'cashback' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.75rem', borderBottom: '1px solid var(--bdr)', marginBottom: '.75rem' }}>
              <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Voucher Code</span>
              <strong style={{ fontSize: '.85rem', color: '#78f275', fontFamily: 'var(--fm)' }}>{voucherCode}</strong>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.75rem', borderBottom: '1px solid var(--bdr)', marginBottom: '.75rem' }}>
              <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Wallet Cash Credits</span>
              <strong style={{ fontSize: '.78rem', color: '#78f275' }}>+ ₹{cashbackAmount}</strong>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem' }}>
            <span style={{ color: 'var(--t3)' }}>Date &amp; Time</span>
            <span style={{ color: 'var(--t2)' }}>{formattedDate}</span>
          </div>
        </div>

        {/* REDIRECTS BUTTON BAR */}
        <div className="au d4" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
          <button
            onClick={() => navigate('/rewards/my-rewards')}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #d4a574, #c41e3a)' }}
          >
            {is194r ? 'Track Compliance Status' : 'View Redeemed Code'}
          </button>
          <button
            onClick={() => navigate('/rewards')}
            className="btn btn-ghost"
          >
            Back to Rewards Store
          </button>
        </div>

      </div>

    </div>
  );
};
