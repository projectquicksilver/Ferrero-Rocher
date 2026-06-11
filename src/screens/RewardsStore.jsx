import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Header } from '../components/layout/Header';
import { ProductIcon } from '../components/ui/ProductIcon';

const REWARD_CATEGORIES = [
  { id: 'all', label: 'All Rewards', emoji: '🛍️' },
  { id: 'cashback', label: 'Cashback', emoji: '💳' },
  { id: 'coupon', label: 'Coupons', emoji: '🎟️' },
  { id: 'gift_card', label: 'Gift Cards', emoji: '🎁' },
  { id: 'business', label: 'Business', emoji: '🏢' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '✨' },
  { id: 'electronics', label: 'Electronics', emoji: '📱' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'lucky_draw', label: 'Lucky Draw', emoji: '🎲' }
];

export const RewardsStore = () => {
  const navigate = useNavigate();
  const { pointCredits, rewardsCatalog, myRedemptions } = useAppContext();
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSpinGame, setShowSpinGame] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Dynamic Tier Calculations
  const getTierDetails = (pts) => {
    if (pts < 1000) {
      return { tier: 'Bronze', nextTier: 'Silver', nextTierPoints: 1000, progress: Math.min(100, Math.round((pts / 1000) * 100)), emoji: '🥉' };
    } else if (pts < 3000) {
      return { tier: 'Silver', nextTier: 'Gold', nextTierPoints: 3000, progress: Math.min(100, Math.round(((pts - 1000) / 2000) * 100)), emoji: '🥈' };
    } else if (pts < 6000) {
      return { tier: 'Gold', nextTier: 'Platinum', nextTierPoints: 6000, progress: Math.min(100, Math.round(((pts - 3000) / 3000) * 100)), emoji: '🥇' };
    } else if (pts < 12000) {
      return { tier: 'Platinum', nextTier: 'Diamond', nextTierPoints: 12000, progress: Math.min(100, Math.round(((pts - 6000) / 6000) * 100)), emoji: '💎' };
    } else {
      return { tier: 'Diamond', nextTier: 'Max Tier reached', nextTierPoints: pts, progress: 100, emoji: '👑' };
    }
  };

  const { tier, nextTier, nextTierPoints, progress: tierProgress, emoji: tierEmoji } = getTierDetails(pointCredits);
  const pointsToNext = Math.max(0, nextTierPoints - pointCredits);

  // Expiring rewards count simulation
  const expiringCount = 2;
  const activeOffersCount = rewardsCatalog.filter(r => r.is_active).length;

  // Filter Catalog
  const filteredCatalog = rewardsCatalog.filter(r => {
    const matchesCat = selectedCat === 'all' || r.category === selectedCat;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.partner_name && r.partner_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Spin & Win simulator
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);
    setTimeout(() => {
      const options = ['₹10 Cashback', '50 Bonus Points', 'Better luck next time!', 'Amazon Gift Voucher', 'Raffaello Special Box'];
      const win = options[Math.floor(Math.random() * options.length)];
      setSpinResult(win);
      setIsSpinning(false);
    }, 2500);
  };

  return (
    <div className="screen active" style={{ background: 'var(--bg0)' }}>
      <Header title="Rewards Dashboard" backTo="/home" />
      
      {/* Dynamic Sub-header Nav */}
      <div style={{ display: 'flex', background: 'var(--bg1)', borderBottom: '1px solid var(--bdr)', padding: '0.5rem 1.25rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--t2)' }}>
          🎁 Store Open
        </span>
        <button onClick={() => navigate('/rewards/my-rewards')} style={{ background: 'transparent', border: 'none', color: 'var(--g4)', fontSize: '.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
          My Rewards Vault <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
        </button>
      </div>

      <div className="scroller" style={{ padding: '1.25rem' }}>
        
        {/* PREMIUM POINTS CARD */}
        <div className="au d1" style={{ background: 'linear-gradient(135deg, #1d120d 0%, #0b0604 100%)', border: '2px solid #d4a574', borderRadius: 'var(--r16)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--sh)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at top right, rgba(212,165,116,.18), transparent 70%)', pointerEvents: 'none' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontSize: '.7rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>Total Balance</p>
              <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--fd)', fontWeight: 900, color: 'var(--g4)', margin: '0.15rem 0' }}>
                {pointCredits.toLocaleString('en-IN')} <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--t2)' }}>pts</span>
              </h2>
              <p style={{ fontSize: '.72rem', color: 'var(--t2)', fontWeight: 600 }}>Approx. Value: <strong style={{ color: '#78f275' }}>₹{Math.round(pointCredits / 10).toLocaleString('en-IN')}</strong></p>
            </div>
            <div style={{ background: 'rgba(212,165,116,.1)', border: '1px solid #d4a574', padding: '.4rem .8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{tierEmoji}</span>
              <span style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--g4)' }}>{tier} Tier</span>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTierPoints > pointCredits && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.35rem', fontSize: '.72rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--t2)' }}>Progress to {nextTier}</span>
                <span style={{ color: 'var(--g4)' }}>{tierProgress}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${tierProgress}%`, background: 'linear-gradient(90deg, #d4a574, #c41e3a)', borderRadius: '9999px' }} />
              </div>
              <p style={{ fontSize: '.68rem', color: 'var(--t3)', marginTop: '.4rem' }}>
                💡 You are just <strong>{pointsToNext.toLocaleString('en-IN')} points</strong> away from {nextTier} status!
              </p>
            </div>
          )}
        </div>

        {/* REWARDS STATUS METRICS */}
        <div className="au d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.6rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '.8rem .4rem', textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '.2rem' }}>📦</span>
            <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Available</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--t1)', marginTop: '.15rem' }}>{activeOffersCount} Rewards</strong>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '.8rem .4rem', textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '.2rem' }}>⏰</span>
            <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Expiring</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', color: '#ef4444', marginTop: '.15rem' }}>{expiringCount} Offers</strong>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '.8rem .4rem', textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '.2rem' }}>🏆</span>
            <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Claimed</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--g4)', marginTop: '.15rem' }}>{myRedemptions.length} Claimed</strong>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="au d3" style={{ marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', marginBottom: '.8rem' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: '1.1rem' }}>search</span>
            <input 
              placeholder="Search rewards or brands..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: '12px', padding: '0.7rem 1rem 0.7rem 2.6rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Horizontally scrollable categories */}
          <div style={{ display: 'flex', gap: '.5rem', overflowX: 'auto', paddingBottom: '.4rem', WebkitOverflowScrolling: 'touch' }}>
            {REWARD_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`ifbtn ${selectedCat === cat.id ? 'act' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SPIN & WIN GAMIFICATION BANNER */}
        <div className="au d4" style={{ background: 'linear-gradient(135deg, rgba(212,165,116,.1), rgba(196,30,58,.1))', border: '1.5px dashed var(--g4)', borderRadius: 'var(--r12)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '2.2rem' }}>🎡</span>
            <div>
              <h4 style={{ fontSize: '.85rem', fontWeight: 900, color: 'var(--g4)' }}>Spin & Win Campaign!</h4>
              <p style={{ fontSize: '.68rem', color: 'var(--t3)' }}>Try your luck with 50 points per spin.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSpinGame(true)}
            style={{ padding: '.45rem .85rem', background: 'var(--g4)', border: 'none', borderRadius: '8px', color: '#000', fontSize: '.72rem', fontWeight: 900, cursor: 'pointer' }}
          >
            Play Now
          </button>
        </div>

        {/* SPIN WHEEL MODAL */}
        {showSpinGame && (
          <div className="buddy-panel" onClick={() => !isSpinning && setShowSpinGame(false)}>
            <div className="buddy-content" onClick={e => e.stopPropagation()} style={{ height: 'auto', padding: '2rem 1.25rem', background: '#140c08', borderTop: '2px solid var(--g4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--g4)' }}>🎡 Mystery Spin & Win</h3>
                <button disabled={isSpinning} onClick={() => setShowSpinGame(false)} style={{ background: 'transparent', border: 'none', color: 'var(--t3)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
                <div style={{ 
                  width: '200px', height: '200px', borderRadius: '50%', 
                  border: '10px solid #d4a574', background: 'radial-gradient(circle, #c41e3a 0%, #1d120d 100%)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  boxShadow: '0 0 24px rgba(212,165,116,0.3)',
                  transition: isSpinning ? 'transform 2.5s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none',
                  transform: isSpinning ? 'rotate(1440deg)' : 'none',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '-15px', width: '0', height: '0', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #d4a574', zIndex: 10 }} />
                  <span style={{ fontSize: '2.5rem', animation: isSpinning ? 'cos-bounce .5s infinite' : 'none' }}>🍬</span>
                </div>

                {spinResult && (
                  <div className="au" style={{ marginTop: '1.5rem', textAlign: 'center', background: 'rgba(212,165,116,0.1)', padding: '.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--g4)' }}>
                    <p style={{ fontSize: '.72rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Spin Result</p>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginTop: '.2rem' }}>🎉 {spinResult}</h4>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <button 
                  onClick={handleSpin}
                  disabled={isSpinning || pointCredits < 50}
                  className="btn btn-primary"
                >
                  {isSpinning ? 'Spinning...' : 'Spin for 50 Points'}
                </button>
                <p style={{ fontSize: '.68rem', color: 'var(--t3)', textAlign: 'center' }}>
                  Each spin costs 50 loyalty points. Prizes credited instantly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LISTINGS CONTAINER */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '.8rem' }}>Available Rewards</h3>
        
        {filteredCatalog.length === 0 ? (
          <div style={{ background: 'var(--bg2)', border: '1px dashed var(--bdr2)', borderRadius: 'var(--r16)', padding: '3rem 1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--t3)', fontSize: '.9rem' }}>No rewards matching filters. Keep scanning sales to earn more points!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {filteredCatalog.map(reward => {
              const userHasEnoughPoints = pointCredits >= reward.points_required;
              
              // Progress tracking
              const progressPct = Math.min(100, Math.round((pointCredits / reward.points_required) * 100));

              // State logic
              // State 1: Eligible
              // State 2: Locked
              // State 3: Progress Tracker (shown on highly-valued rewards above current balance)
              const showProgress = reward.points_required > pointCredits && reward.points_required <= pointCredits * 3;
              const isLocked = pointCredits < reward.points_required;

              return (
                <div 
                  key={reward.id} 
                  style={{ 
                    background: isLocked ? 'rgba(29, 18, 13, 0.4)' : 'var(--card)', 
                    border: userHasEnoughPoints ? '1.5px solid #d4a574' : '1px solid var(--bdr)', 
                    borderRadius: 'var(--r16)', 
                    padding: '1.1rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    position: 'relative',
                    transition: 'all 0.2s',
                    opacity: isLocked ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', gap: '.8rem', alignItems: 'start', marginBottom: '.8rem' }}>
                    <div style={{ 
                      width: '3.2rem', height: '3.2rem', 
                      background: isLocked ? 'var(--bg3)' : 'rgba(212,165,116,0.12)', 
                      borderRadius: '12px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '1.8rem', flexShrink: 0 
                    }}>
                      {reward.category === 'cashback' ? '💳' : reward.category === 'gift_card' ? '🎁' : reward.category === 'travel' ? '✈️' : reward.category === 'electronics' ? '📱' : '🎟️'}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--g4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          {reward.partner_name || reward.category}
                        </span>
                        <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>
                          Exp. {reward.validity_days} days
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--t1)', marginTop: '.1rem', marginBottom: '.25rem' }}>
                        {reward.title}
                      </h4>
                      <p style={{ fontSize: '.75rem', color: 'var(--t3)', lineHeight: 1.4 }}>
                        {reward.description}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Progress Bar (State 3) */}
                  {showProgress && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bdr)', borderRadius: '8px', padding: '.5rem .75rem', marginBottom: '.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.68rem', fontWeight: 700, marginBottom: '.25rem' }}>
                        <span style={{ color: 'var(--t3)' }}>Savings Goal Progress</span>
                        <span style={{ color: 'var(--g4)' }}>{progressPct}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg4)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--g4)' }} />
                      </div>
                      <span style={{ fontSize: '.62rem', color: 'var(--t3)', display: 'block', marginTop: '.2rem' }}>
                        Need {(reward.points_required - pointCredits).toLocaleString('en-IN')} more points to unlock.
                      </span>
                    </div>
                  )}

                  {/* Foot Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', pt: '.2rem' }}>
                    <div>
                      <p style={{ fontSize: '.65rem', color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700 }}>Cost</p>
                      <p style={{ fontSize: '1.15rem', fontWeight: 900, color: isLocked ? 'var(--t3)' : 'var(--g4)', fontFamily: 'var(--fd)' }}>
                        {reward.points_required.toLocaleString('en-IN')} <span style={{ fontSize: '.75rem', fontWeight: 600 }}>pts</span>
                      </p>
                    </div>

                    {userHasEnoughPoints ? (
                      <button
                        onClick={() => navigate(`/rewards/detail/${reward.id}`)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '.55rem 1.25rem', width: 'auto', background: 'linear-gradient(135deg, #d4a574, #c41e3a)' }}
                      >
                        Redeem Now
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <button
                          disabled
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '.55rem 1.25rem', width: 'auto', opacity: 0.5, cursor: 'not-allowed' }}
                        >
                          Locked
                        </button>
                        <span style={{ fontSize: '.6rem', color: '#ef4444', fontWeight: 700 }}>
                          Need {(reward.points_required - pointCredits).toLocaleString('en-IN')} pts
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
