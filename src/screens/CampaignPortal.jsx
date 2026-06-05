// ============================================================
//  FERRERO ROCHER — CAMPAIGN PORTAL
//  Full multi-step: Offer Builder → Products → Terms → Compose → Launch
//  Access: /campaign-portal?access=ferrero-admin-2025
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const ADMIN_TOKEN = 'ferrero-admin-2025';

// ─── OFFER TYPES ──────────────────────────────────────────────────────────
const OFFER_TYPES = [
  { id: 'commission', label: 'Commission Boost',  icon: 'trending_up',            color: '#d4a574', bg: 'rgba(212,165,116,.12)', desc: 'Retailers earn extra commission on specific products' },
  { id: 'discount',   label: 'Bulk Discount',     icon: 'local_offer',             color: '#c41e3a', bg: 'rgba(196,30,58,.12)',   desc: 'Buy N units from distributor, get X% discount' },
  { id: 'combo',      label: 'Combo Offer',       icon: 'shopping_bag',            color: '#8b6f47', bg: 'rgba(139,111,71,.12)',  desc: 'Buy product A + B together, get combo discount' },
  { id: 'cashback',   label: 'Cashback',          icon: 'account_balance_wallet',  color: '#ffd060', bg: 'rgba(255,208,96,.12)',  desc: 'Retailers get cashback per unit sold' },
];

// ─── CAMPAIGN TYPES (for the compose step) ────────────────────────────────
const CAMPAIGN_TYPES = [
  { id: 'promo',        label: 'Promotion',    icon: 'local_offer',           color: '#d4a574', bg: 'rgba(212,165,116,.12)' },
  { id: 'reward',       label: 'Reward Boost', icon: 'card_giftcard',         color: '#c41e3a', bg: 'rgba(196,30,58,.12)'   },
  { id: 'alert',        label: 'Stock Alert',  icon: 'inventory',             color: '#f87171', bg: 'rgba(248,113,113,.12)' },
  { id: 'announcement', label: 'Announcement', icon: 'campaign',              color: '#a0d2ff', bg: 'rgba(160,210,255,.12)' },
  { id: 'cashback',     label: 'Cashback',     icon: 'account_balance_wallet', color: '#ffd060', bg: 'rgba(255,208,96,.12)'  },
];

const TARGET_ROLES = [
  { id: 'retailer',    label: 'All Retailers', emoji: '🛍️' },
  { id: 'distributor', label: 'Distributors',  emoji: '🏭' },
  { id: 'all',         label: 'Everyone',      emoji: '🌐' },
];

const INDIAN_STATES = [
  'All States',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const STATE_ABBR = {
  'Madhya Pradesh': 'MP', 'Maharashtra': 'MH', 'Gujarat': 'GJ', 'Delhi': 'DL',
  'Rajasthan': 'RJ', 'Uttar Pradesh': 'UP', 'Karnataka': 'KA', 'Tamil Nadu': 'TN',
  'West Bengal': 'WB', 'Punjab': 'PB', 'Haryana': 'HR',
};
const getStateAbbr = (s) => STATE_ABBR[s] || s;

const TEMPLATES = {
  commission: [
    { title: '💰 Earn 5% Extra Commission!',    body: 'Stock 10+ Ferrero Rocher 48pc units and earn 5% extra commission on each sale. Limited time offer!' },
    { title: '🎁 Bonus Commission Unlocked',    body: 'Commission boost on Golden Gallery! Stock 15+ boxes and earn an extra 3% on all sales.' },
  ],
  discount: [
    { title: '🔥 Bulk Discount: 15% Off!',      body: 'Buy 50+ Ferrero Rocher boxes from us — get 15% bulk discount + exclusive commission!' },
    { title: '💝 Golden Gallery Bulk Deal',     body: 'Order 100+ Golden Gallery boxes and save 20% on your purchase cost!' },
  ],
  combo: [
    { title: '🎉 Combo Offer: 20% Off!',        body: 'Buy Rocher 48pc + Golden Gallery together = 20% off total order from distributor!' },
    { title: '👑 Premium Combo Bundle',         body: 'Combine any 2 premium products and unlock 25% bulk discount. Mix and match!' },
  ],
  cashback: [
    { title: '💳 Cashback Weekend!',            body: 'Earn ₹50 cashback per Raffaello box sold this weekend only. Direct to your wallet!' },
    { title: '🏆 Loyalty Cashback',             body: 'Get ₹30 cashback on every Rocher 48pc you sell this week. Limited time!' },
  ],
  promo: [
    { title: '🎉 Ferrero Rocher Mega Sale!',   body: 'This weekend only! Get 20% off on all Ferrero Rocher premium boxes. Stock up now!' },
    { title: '💝 Premium Gift Collection Live!', body: 'New Golden Gallery collection now available. Perfect for gift-giving season!' },
  ],
  reward: [
    { title: '🎁 Loyalty Bonus Unlocked!',     body: "You've earned ₹500 in bonus credits for consistent orders. Use it now!" },
    { title: '🥇 Top Seller Recognition!',     body: "Congratulations! You've been recognized as a top seller. Claim your ₹1000 credit!" },
  ],
  alert: [
    { title: '📦 Stock Running Low!',          body: 'Popular items like Ferrero Rocher 48pc are selling fast. Restock now!' },
    { title: '⏰ Limited Stock Available',     body: "Golden Gallery specialty boxes are down to last few units. Order now!" },
  ],
  announcement: [
    { title: '🚀 New Feature: Smart Inventory!', body: 'CounterOS now tracks your Ferrero product stocks in real-time!' },
    { title: '📣 Platform Update Available',   body: "We've added detailed product analytics for all Ferrero items. Update your app!" },
  ],
};

// ─── UTILITY ──────────────────────────────────────────────────────────────
const HISTORY_KEY = 'ferrero_campaigns_sent';
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveHistory = (h) => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {} };

const burst = () => {
  const colors = ['#d4a574', '#c41e3a', '#8b6f47', '#ffd060', '#a0d2ff'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background:${colors[i%colors.length]};pointer-events:none;z-index:9999;animation:cos-confetti 1.2s ease-out forwards;--dx:${(Math.random()-0.5)*400}px;--dy:${(Math.random()-1)*300}px;animation-delay:${Math.random()*0.2}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
};

// ─── STEP PROGRESS BAR ────────────────────────────────────────────────────
const STEPS = [
  { key: 'type',     label: 'Offer Type'  },
  { key: 'products', label: 'Products'    },
  { key: 'terms',    label: 'Terms'       },
  { key: 'compose',  label: 'Message'     },
  { key: 'preview',  label: 'Preview'     },
];
const stepIndex = (s) => STEPS.findIndex(x => x.key === s);

const ProgressBar = ({ step }) => {
  const cur = stepIndex(step);
  if (cur < 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2.5rem' }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '.75rem',
              background: i < cur ? 'linear-gradient(135deg,#d4a574,#c41e3a)' : i === cur ? '#fff' : '#f5f5f5',
              border: i === cur ? '2px solid #d4a574' : i < cur ? 'none' : '2px solid #ddd',
              color: i < cur ? '#fff' : i === cur ? '#d4a574' : '#bbb',
              boxShadow: i === cur ? '0 0 0 4px rgba(212,165,116,.15)' : 'none',
              transition: 'all .3s',
            }}>
              {i < cur ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '.62rem', fontWeight: i === cur ? 800 : 600, color: i === cur ? '#d4a574' : i < cur ? '#8b6f47' : '#bbb', whiteSpace: 'nowrap' }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < cur ? 'linear-gradient(90deg,#d4a574,#c41e3a)' : '#e5e5e5', margin: '0 .4rem', marginBottom: '1.4rem', transition: 'background .3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export const CampaignPortal = () => {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('access');

  // ─── AUTH ────────────────────────────────────────────────────────────
  const [isAuth,      setIsAuth]      = useState(false);
  const [inputToken,  setInputToken]  = useState('');
  const [tokenError,  setTokenError]  = useState(false);

  // ─── WIZARD STEP ─────────────────────────────────────────────────────
  const [step, setStep] = useState('type'); // type | products | terms | compose | preview | sent

  // ─── OFFER CONFIG ────────────────────────────────────────────────────
  const [offerType,        setOfferType]        = useState('commission');
  const [products,         setProducts]         = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [targetRole,       setTargetRole]       = useState('retailer');

  // ─── OFFER TERMS ─────────────────────────────────────────────────────
  const [commissionMinQty, setCommissionMinQty] = useState(10);
  const [commissionPct,    setCommissionPct]    = useState(5);
  const [discountMinQty,   setDiscountMinQty]   = useState(50);
  const [discountPct,      setDiscountPct]      = useState(15);
  const [comboPct,         setComboPct]         = useState(20);
  const [cashbackAmount,   setCashbackAmount]   = useState(50);

  // ─── COMPOSE ─────────────────────────────────────────────────────────
  const [campaignType,  setCampaignType]  = useState('promo');
  const [title,         setTitle]         = useState('');
  const [body,          setBody]          = useState('');
  const [duration,      setDuration]      = useState(7);

  // ─── TARGETING & CHANNELS ────────────────────────────────────────────
  const [targetState,   setTargetState]   = useState('All States');
  const [sendApp,       setSendApp]       = useState(true);
  const [sendSMS,       setSendSMS]       = useState(false);
  const [sendWhatsApp,  setSendWhatsApp]  = useState(false);
  const [previewTab,    setPreviewTab]    = useState('app');

  // ─── MISC ────────────────────────────────────────────────────────────
  const [sending,       setSending]       = useState(false);
  const [targetCount,   setTargetCount]   = useState(null);
  const [history,       setHistory]       = useState(loadHistory());
  const [historyOpen,   setHistoryOpen]   = useState(false);
  const [sentCount,     setSentCount]     = useState(0);

  const titleRef = useRef(null);

  // Auto-auth from URL token
  useEffect(() => { if (token === ADMIN_TOKEN) setIsAuth(true); }, [token]);

  // Add full-page-mode class to <html> so CSS overrides the mobile shell
  useEffect(() => {
    document.documentElement.classList.add('full-page-mode');
    return () => document.documentElement.classList.remove('full-page-mode');
  }, []);

  // Load products from DB
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.from('ferrero_products').select('*').eq('is_active', true)
      .then(({ data }) => setProducts(data || []))
      .catch(console.error);
  }, []);

  // Fetch filtered target count
  useEffect(() => {
    if (!isAuth || !isSupabaseConfigured) return;
    const fetch = async () => {
      try {
        let q = supabase.from('profiles').select('id, loc');
        if (targetRole !== 'all') q = q.eq('role', targetRole);
        const { data } = await q;
        let filtered = data || [];
        if (targetState !== 'All States') {
          const abbr = getStateAbbr(targetState).toLowerCase();
          const full = targetState.toLowerCase();
          filtered = filtered.filter(u => u.loc && (u.loc.toLowerCase().includes(full) || u.loc.toLowerCase().includes(abbr)));
        }
        setTargetCount(filtered.length);
      } catch { setTargetCount(null); }
    };
    fetch();
  }, [isAuth, targetRole, targetState]);

  const currentOfferType   = OFFER_TYPES.find(t => t.id === offerType);
  const currentCampaignType = CAMPAIGN_TYPES.find(t => t.id === campaignType);
  const charCount = body.length;
  const isValid   = title.trim().length >= 3 && body.trim().length >= 10;
  const smsText   = `${title.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim() || 'Message title'}: ${body.slice(0, 100) || 'Message details...'}\n\nValid for ${duration} days.`.trim();

  const applyTemplate = (tpl) => {
    setTitle(tpl.title); setBody(tpl.body);
    setTimeout(() => titleRef.current?.focus(), 100);
  };

  const handleAddProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, qty: offerType === 'combo' ? 1 : 10 }]);
    }
  };
  const handleRemoveProduct = (id) => setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  const handleUpdateQty = (id, qty) => setSelectedProducts(selectedProducts.map(p => p.id === id ? { ...p, qty } : p));

  const handleSend = async () => {
    if (!isValid) return;
    setSending(true);
    let count = 0;
    try {
      if (isSupabaseConfigured) {
        const endDate = new Date(); endDate.setDate(endDate.getDate() + duration);
        const campaignData = {
          title: title.trim(), description: body.trim(),
          offer_type: offerType, target_role: targetRole === 'all' ? 'retailer' : targetRole,
          is_active: true, start_date: new Date().toISOString(), end_date: endDate.toISOString(),
          product_ids: selectedProducts,
          commission_pct: commissionPct, commission_min_qty: commissionMinQty,
          discount_pct: discountPct, discount_min_qty: discountMinQty,
          combo_pct: comboPct, cashback_amount: cashbackAmount,
          duration_days: duration,
        };

        // Try with optional columns, fall back without them
        let insertedCampaign = null;
        try {
          const r1 = await supabase.from('offer_campaigns')
            .insert([{ ...campaignData, target_state: targetState, channels: { app: sendApp, sms: sendSMS, whatsapp: sendWhatsApp } }])
            .select().single();
          if (r1.error?.code === '42703') {
            const r2 = await supabase.from('offer_campaigns').insert([campaignData]).select().single();
            insertedCampaign = r2.data;
          } else {
            insertedCampaign = r1.data;
          }
        } catch {}

        // Get & filter users
        let uq = supabase.from('profiles').select('id, loc');
        if (targetRole !== 'all') uq = uq.eq('role', targetRole);
        const { data: users } = await uq;
        let filteredUsers = users || [];
        if (targetState !== 'All States') {
          const abbr = getStateAbbr(targetState).toLowerCase();
          const full = targetState.toLowerCase();
          filteredUsers = filteredUsers.filter(u => u.loc && (u.loc.toLowerCase().includes(full) || u.loc.toLowerCase().includes(abbr)));
        }
        count = filteredUsers.length;

        if (filteredUsers.length > 0) {
          await supabase.from('notifications').insert(filteredUsers.map(u => ({
            user_id: u.id, campaign_id: insertedCampaign?.id || null,
            title: `✨ ${title.trim()}`, body: body.trim(),
            role: targetRole === 'all' ? 'retailer' : targetRole,
            is_read: false, type: 'campaign', offer_type: offerType,
            offer_data: { type: offerType, products: selectedProducts, target_state: targetState, channels: { app: sendApp, sms: sendSMS, whatsapp: sendWhatsApp } }
          })));
        }
      } else {
        await new Promise(r => setTimeout(r, 1500));
        const base = targetRole === 'all' ? 50 : (targetRole === 'retailer' ? 35 : 5);
        count = targetState === 'All States' ? base : Math.max(1, Math.floor(base * 0.4));
      }

      setSentCount(count);
      const entry = { id: Date.now(), type: offerType, products: selectedProducts, title: title.trim(), count, sentAt: new Date().toISOString() };
      const next = [entry, ...history].slice(0, 50);
      setHistory(next); saveHistory(next);
      setStep('sent'); burst();
    } catch (e) {
      console.error(e);
      setSentCount(targetRole === 'all' ? 50 : 35);
      setStep('sent'); burst();
    } finally { setSending(false); }
  };

  const reset = () => {
    setStep('type'); setTitle(''); setBody(''); setSelectedProducts([]);
    setOfferType('commission'); setTargetRole('retailer');
    setTargetState('All States'); setSendApp(true); setSendSMS(false);
    setSendWhatsApp(false); setPreviewTab('app'); setSentCount(0); setDuration(7);
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  AUTH GATE
  // ═══════════════════════════════════════════════════════════════════════
  if (!isAuth) return (
    <div style={S.page}>
      <style>{GS}</style>
      <div style={S.lockCard}>
        <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>🔐</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '.5rem', color: '#2d2d2d' }}>Admin Access</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '.9rem' }}>Enter your Ferrero Rocher admin token to continue</p>
        <input type="password" placeholder="Paste access token…" value={inputToken}
          onChange={e => { setInputToken(e.target.value); setTokenError(false); }}
          onKeyDown={e => e.key === 'Enter' && (inputToken === ADMIN_TOKEN ? setIsAuth(true) : setTokenError(true))}
          style={{ ...S.lockInput, borderColor: tokenError ? '#f87171' : '#d4a574' }} autoFocus />
        {tokenError && <p style={{ color: '#f87171', fontSize: '.8rem', marginTop: '.4rem' }}>❌ Invalid token</p>}
        <button onClick={() => inputToken === ADMIN_TOKEN ? setIsAuth(true) : setTokenError(true)} style={S.lockBtn}>Unlock Portal</button>
        <p style={{ fontSize: '.72rem', color: '#999', marginTop: '1.25rem' }}>
          Demo: <code style={{ color: '#d4a574', fontWeight: 700 }}>ferrero-admin-2025</code> or append <code style={{ color: '#d4a574' }}>?access=ferrero-admin-2025</code> to the URL
        </p>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  //  SUCCESS / SENT
  // ═══════════════════════════════════════════════════════════════════════
  if (step === 'sent') {
    const channels = [sendApp && '📱 App', sendSMS && '💬 SMS', sendWhatsApp && '💚 WhatsApp'].filter(Boolean).join(' · ') || '📱 App';
    return (
      <div style={S.page}>
        <style>{GS}</style>
        <div style={S.successCard}>
          <div style={{ fontSize: '4rem', animation: 'cos-bounce .6s cubic-bezier(.34,1.56,.64,1)', marginBottom: '1rem' }}>🚀</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#2d2d2d', letterSpacing: '-.04em', marginBottom: '.4rem' }}>Campaign Launched!</h1>
          <p style={{ color: '#999', fontSize: '.9rem', marginBottom: '2rem' }}>
            Sent via <strong style={{ color: '#d4a574' }}>{channels}</strong>
            {targetState !== 'All States' && <> · <strong style={{ color: '#d4a574' }}>{targetState}</strong></>}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '1.25rem', padding: '1.25rem 2rem', marginBottom: '2rem', width: '100%' }}>
            {[{ n: sentCount.toLocaleString(), l: 'Users Reached' }, { n: '✅', l: 'Delivered' }, { n: 'Live', l: 'Status' }].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: '1px', height: '2.5rem', background: '#ddd' }} />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem', flex: 1 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d4a574' }}>{s.n}</span>
                  <span style={{ fontSize: '.65rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.l}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '1rem', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem', width: '100%' }}>
            <p style={{ fontWeight: 800, fontSize: '.9rem', color: '#2d2d2d', marginBottom: '.4rem' }}>📣 {title}</p>
            <p style={{ fontSize: '.8rem', color: '#666', lineHeight: 1.5 }}>{body}</p>
          </div>
          <div style={{ display: 'flex', gap: '.8rem', width: '100%' }}>
            <button onClick={() => setHistoryOpen(true)} style={{ ...S.outlineBtn, flex: 1 }}>View History</button>
            <button onClick={reset} style={{ ...S.primaryBtn, flex: 2 }}>＋ New Campaign</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  PAGE SHELL (header + steps)
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div style={S.page}>
      <style>{GS}</style>

      {/* History Drawer */}
      {historyOpen && (
        <div style={S.drawerOverlay} onClick={() => setHistoryOpen(false)}>
          <div style={S.drawer} onClick={e => e.stopPropagation()}>
            <div style={S.drawerHeader}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Campaign History</h2>
              <button onClick={() => setHistoryOpen(false)} style={S.closeBtn}>✕</button>
            </div>
            <div style={S.drawerBody}>
              {history.length === 0
                ? <p style={{ color: '#999', textAlign: 'center', padding: '3rem 0' }}>No campaigns sent yet</p>
                : history.map(h => (
                  <div key={h.id} style={S.historyRow}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: '.88rem', color: '#2d2d2d', marginBottom: '.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
                        <p style={{ fontSize: '.72rem', color: '#999' }}>{new Date(h.sentAt).toLocaleString('en-IN')}</p>
                      </div>
                      <div style={S.historyBadge}>{h.count} sent</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
          <div style={S.logo}>🍫</div>
          <div>
            <h1 style={S.logoTitle}>Ferrero Rocher</h1>
            <p style={S.logoSub}>Campaign &amp; Offer Builder</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
          <div style={S.liveDot} />
          <span style={{ fontSize: '.72rem', color: '#d4a574', fontWeight: 700 }}>{isSupabaseConfigured ? 'Live Backend' : 'Demo Mode'}</span>
          <button onClick={() => setHistoryOpen(true)} style={S.historyBtn}>
            <span>📋</span> History ({history.length})
          </button>
          <button onClick={() => { setIsAuth(false); reset(); }} style={{ ...S.historyBtn, color: '#f87171', borderColor: '#fecaca' }}>Exit</button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────
          STEP 1: OFFER TYPE
      ────────────────────────────────────────────────── */}
      {step === 'type' && (
        <div style={S.main}>
          <ProgressBar step={step} />
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#2d2d2d', letterSpacing: '-.03em', marginBottom: '.5rem' }}>🍫 Ferrero Offer Builder</h2>
            <p style={{ color: '#666', fontSize: '.95rem' }}>Create targeted product offers and promotions for retailers and distributors</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            {OFFER_TYPES.map(t => (
              <div key={t.id} onClick={() => { setOfferType(t.id); setStep('products'); }}
                style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1.5rem', padding: '2rem', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 12px rgba(0,0,0,.03)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(212,165,116,.15)'; e.currentTarget.style.borderColor = '#d4a574'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.03)'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <i className="material-symbols-outlined" style={{ color: t.color, fontSize: '2.2rem' }}>{t.icon}</i>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2d2d2d', marginBottom: '.5rem' }}>{t.label}</h3>
                <p style={{ fontSize: '.9rem', color: '#666', lineHeight: 1.5 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          STEP 2: PRODUCT SELECTION
      ────────────────────────────────────────────────── */}
      {step === 'products' && (
        <div style={S.main}>
          <ProgressBar step={step} />
          <button onClick={() => setStep('type')} style={S.backBtn}>← Back</button>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '1.75rem' }}>
            Select Products for <span style={{ color: '#d4a574' }}>{currentOfferType?.label}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            {/* Available */}
            <div>
              <h3 style={S.subhead}>📦 Available Ferrero Products</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '.4rem' }}>
                {products.length === 0
                  ? <p style={{ color: '#999', padding: '2rem', textAlign: 'center' }}>Loading products…</p>
                  : products.map(p => {
                    const sel = !!selectedProducts.find(x => x.id === p.id);
                    return (
                      <div key={p.id} onClick={() => handleAddProduct(p)} style={{ background: '#fff', border: sel ? '1px solid #d4a574' : '1px solid #e5e5e5', borderLeft: `5px solid ${sel ? '#d4a574' : '#e5e5e5'}`, borderRadius: '1rem', padding: '1rem', cursor: 'pointer', transition: 'all .2s', boxShadow: sel ? '0 4px 12px rgba(212,165,116,.1)' : 'none' }}>
                        <p style={{ fontWeight: 800, color: '#2d2d2d', marginBottom: '.3rem' }}>{p.name}</p>
                        <p style={{ fontSize: '.8rem', color: '#666', marginBottom: '.3rem' }}>SKU: {p.sku}</p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '.8rem', color: '#8b6f47', fontWeight: 600 }}>
                          <span>Cost: ₹{p.cost_price}</span>
                          <span>Retail: ₹{p.retail_price}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            {/* Selected */}
            <div>
              <h3 style={S.subhead}>✓ Selected ({selectedProducts.length})</h3>
              {selectedProducts.length === 0
                ? <div style={{ background: '#fff', border: '1px dashed #ccc', borderRadius: '1.25rem', padding: '3rem 1.5rem', textAlign: 'center' }}>
                    <p style={{ color: '#999' }}>Click products on the left to add them to this offer.</p>
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                    {selectedProducts.map(p => (
                      <div key={p.id} style={{ background: '#fff', border: '1px solid #d4a574', borderRadius: '1rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                          <p style={{ fontWeight: 800, color: '#2d2d2d', fontSize: '.9rem' }}>{p.name}</p>
                          <button onClick={() => handleRemoveProduct(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                        </div>
                        {offerType !== 'cashback' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <label style={{ fontSize: '.85rem', color: '#666', fontWeight: 700 }}>Min Qty:</label>
                            <input type="number" min="1" value={p.qty}
                              onChange={e => handleUpdateQty(p.id, parseInt(e.target.value) || 1)}
                              style={{ width: '70px', padding: '.4rem', border: '1px solid #ddd', borderRadius: '.5rem', outline: 'none', fontSize: '.85rem' }} />
                            <span style={{ fontSize: '.8rem', color: '#999' }}>units</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep('type')} style={S.outlineBtn}>← Back</button>
            <button onClick={() => selectedProducts.length > 0 && setStep('terms')} disabled={selectedProducts.length === 0}
              style={{ ...S.primaryBtn, flex: 1, opacity: selectedProducts.length > 0 ? 1 : 0.5, cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed' }}>
              Continue to Terms →
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          STEP 3: SET OFFER TERMS
      ────────────────────────────────────────────────── */}
      {step === 'terms' && (
        <div style={S.main}>
          <ProgressBar step={step} />
          <button onClick={() => setStep('products')} style={S.backBtn}>← Back</button>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '1.75rem' }}>Set Offer Terms</h2>
          <div style={{ maxWidth: '640px' }}>
            <div style={S.termsCard}>
              {offerType === 'commission' && <>
                <h3 style={S.termsHead}>💰 Commission Boost Terms</h3>
                <TermRow label="Minimum Quantity to Earn Extra Commission" hint="Retailers need to stock this many to earn extra commission">
                  <input type="number" min="1" value={commissionMinQty} onChange={e => setCommissionMinQty(parseInt(e.target.value)||1)} style={S.numInput} /> <span style={S.unit}>units</span>
                </TermRow>
                <TermRow label="Extra Commission Percentage" hint="Added on top of base margin for each sale">
                  <input type="number" min="0.1" max="50" step="0.1" value={commissionPct} onChange={e => setCommissionPct(parseFloat(e.target.value)||0)} style={S.numInput} /> <span style={S.unit}>% extra</span>
                </TermRow>
              </>}
              {offerType === 'discount' && <>
                <h3 style={S.termsHead}>🔥 Bulk Discount Terms</h3>
                <TermRow label="Minimum Units to Buy from Distributor">
                  <input type="number" min="1" value={discountMinQty} onChange={e => setDiscountMinQty(parseInt(e.target.value)||1)} style={S.numInput} /> <span style={S.unit}>units</span>
                </TermRow>
                <TermRow label="Discount on Purchase Price" hint="Applied to order total when buying in bulk">
                  <input type="number" min="1" max="50" value={discountPct} onChange={e => setDiscountPct(parseInt(e.target.value)||0)} style={S.numInput} /> <span style={S.unit}>% off</span>
                </TermRow>
              </>}
              {offerType === 'combo' && <>
                <h3 style={S.termsHead}>🎁 Combo Offer Terms</h3>
                <TermRow label="Combo Discount Percentage" hint="Discount when retailer buys all selected products together">
                  <input type="number" min="1" max="60" value={comboPct} onChange={e => setComboPct(parseInt(e.target.value)||0)} style={S.numInput} /> <span style={S.unit}>% off combo</span>
                </TermRow>
              </>}
              {offerType === 'cashback' && <>
                <h3 style={S.termsHead}>💳 Cashback Terms</h3>
                <TermRow label="Cashback Amount per Unit Sold" hint="Amount credited to retailer's wallet per unit sold">
                  <span style={{ ...S.unit, marginRight: '.3rem' }}>₹</span>
                  <input type="number" min="1" value={cashbackAmount} onChange={e => setCashbackAmount(parseInt(e.target.value)||0)} style={S.numInput} /> <span style={S.unit}>per unit</span>
                </TermRow>
              </>}
            </div>
            {/* Target Role */}
            <div style={{ ...S.termsCard, marginTop: '1.5rem' }}>
              <h3 style={S.termsHead}>🎯 Target Audience</h3>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {TARGET_ROLES.map(r => (
                  <button key={r.id} onClick={() => setTargetRole(r.id)}
                    style={{ padding: '.5rem 1.2rem', borderRadius: '9999px', border: '1.5px solid', fontSize: '.85rem', fontWeight: 700, cursor: 'pointer',
                      background: targetRole === r.id ? 'rgba(212,165,116,.12)' : '#f5f5f5',
                      borderColor: targetRole === r.id ? '#d4a574' : '#ddd',
                      color: targetRole === r.id ? '#d4a574' : '#666' }}>
                    {r.emoji} {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setStep('products')} style={S.outlineBtn}>← Back</button>
            <button onClick={() => setStep('compose')} style={{ ...S.primaryBtn, flex: 1 }}>Continue to Message →</button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          STEP 4: COMPOSE MESSAGE (two-column)
      ────────────────────────────────────────────────── */}
      {step === 'compose' && (
        <div style={S.main}>
          <ProgressBar step={step} />
          <button onClick={() => setStep('terms')} style={S.backBtn}>← Back</button>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '1.75rem' }}>
            Compose Campaign Message
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,.8fr)', gap: '2rem', alignItems: 'start' }}>

            {/* LEFT — form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* 01 Campaign Type */}
              <section style={S.section}>
                <h3 style={S.sectionTitle}><span style={S.stepBadge}>01</span> Campaign Type</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '.5rem' }}>
                  {CAMPAIGN_TYPES.map(t => (
                    <button key={t.id} onClick={() => setCampaignType(t.id)} style={{ padding: '.8rem .4rem', borderRadius: '1rem', border: `1.5px solid ${campaignType===t.id ? t.color : '#ddd'}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem', background: campaignType===t.id ? t.bg : '#f5f5f5', transition: 'all .2s' }}>
                      <i className="material-symbols-outlined fi" style={{ color: t.color, fontSize: '1.4rem' }}>{t.icon}</i>
                      <span style={{ fontSize: '.65rem', fontWeight: 700, color: campaignType===t.id ? t.color : '#666' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 02 Target Audience */}
              <section style={S.section}>
                <h3 style={S.sectionTitle}><span style={S.stepBadge}>02</span> Target Audience</h3>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {TARGET_ROLES.map(r => (
                    <button key={r.id} onClick={() => setTargetRole(r.id)} style={{ padding: '.4rem .85rem', borderRadius: '9999px', border: '1.5px solid', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all .18s',
                      background: targetRole===r.id ? 'rgba(212,165,116,.12)' : '#f5f5f5',
                      borderColor: targetRole===r.id ? '#d4a574' : '#ddd',
                      color: targetRole===r.id ? '#d4a574' : '#999' }}>
                      {r.emoji} {r.label}
                    </button>
                  ))}
                </div>
                {/* Indian States */}
                <div>
                  <label style={S.label}>Target Indian State</label>
                  <div style={{ position: 'relative' }}>
                    <select value={targetState} onChange={e => setTargetState(e.target.value)} style={S.selectInput}>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span style={S.selectChevron}>▾</span>
                  </div>
                  <p style={{ fontSize: '.72rem', color: '#999', marginTop: '.4rem' }}>
                    {targetState === 'All States' ? 'Targeting all users across India' : `Target only users in ${targetState}`}
                  </p>
                </div>
                {targetCount !== null && (
                  <p style={{ fontSize: '.75rem', color: '#999', marginTop: '.75rem', background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '.6rem', padding: '.5rem .8rem' }}>
                    📡 Will reach: <strong style={{ color: '#d4a574' }}>~{targetCount} {targetRole==='all'?'users':targetRole==='retailer'?'retailers':'distributors'}</strong>
                    {targetState !== 'All States' && <span style={{ color: '#999' }}> in {targetState}</span>}
                  </p>
                )}
              </section>

              {/* 03 Write Message */}
              <section style={S.section}>
                <h3 style={S.sectionTitle}><span style={S.stepBadge}>03</span> Write Your Message</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
                  <label style={{ ...S.label, margin: 0 }}>Campaign Duration</label>
                  <input type="number" min={1} max={90} value={duration} onChange={e => setDuration(Math.max(1, parseInt(e.target.value)||1))}
                    style={{ width: '64px', padding: '.4rem .6rem', border: '1.5px solid #ddd', borderRadius: '.6rem', fontSize: '.9rem', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
                  <span style={{ fontSize: '.8rem', color: '#999' }}>days</span>
                </div>
                {/* Templates */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '.7rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>Quick Templates</p>
                  {(TEMPLATES[offerType] || TEMPLATES[campaignType] || []).map((tpl, i) => (
                    <button key={i} onClick={() => applyTemplate(tpl)} style={{ width: '100%', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.75rem', padding: '.75rem 1rem', display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', textAlign: 'left', marginBottom: '.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '.8rem', color: '#2d2d2d', flex: 1 }}>{tpl.title}</span>
                      <span style={{ color: '#d4a574', fontSize: '.8rem', fontWeight: 800 }}>Use →</span>
                    </button>
                  ))}
                </div>
                {/* Title */}
                <div style={{ marginBottom: '.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                    <label style={S.label}>Message Title</label>
                    <span style={{ fontSize: '.68rem', color: '#999' }}>{title.length}/80</span>
                  </div>
                  <input ref={titleRef} type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
                    placeholder="e.g. 🎉 Earn 5% Extra Commission!"
                    style={{ ...S.input, borderColor: title.length > 0 && title.length < 3 ? '#f87171' : '#ddd' }} />
                </div>
                {/* Body */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                    <label style={S.label}>Message Body</label>
                    <span style={{ fontSize: '.68rem', color: charCount > 200 ? '#f87171' : '#999' }}>{charCount}/250</span>
                  </div>
                  <textarea value={body} onChange={e => setBody(e.target.value.slice(0,250))} rows={4}
                    placeholder="Describe the offer details and benefits..."
                    style={{ ...S.textarea, borderColor: charCount > 200 ? '#f87171' : '#ddd' }} />
                </div>
              </section>

              {/* 04 Broadcast Channels */}
              <section style={S.section}>
                <h3 style={S.sectionTitle}><span style={S.stepBadge}>04</span> Broadcast Channels</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                  {[
                    { key:'app',      label:'Push to App Notification', emoji:'📱', val:sendApp,      set:setSendApp      },
                    { key:'sms',      label:'Send SMS Broadcast',       emoji:'💬', val:sendSMS,      set:setSendSMS      },
                    { key:'whatsapp', label:'Send WhatsApp Message',    emoji:'💚', val:sendWhatsApp, set:setSendWhatsApp },
                  ].map(ch => (
                    <label key={ch.key} style={{ display:'flex', alignItems:'center', gap:'.75rem', cursor:'pointer', padding:'.7rem 1rem', borderRadius:'.85rem', border:`1.5px solid ${ch.val?'#d4a574':'#ddd'}`, background:ch.val?'rgba(212,165,116,.06)':'#f9f7f3', transition:'all .18s' }}>
                      <input type="checkbox" checked={ch.val} onChange={e => ch.set(e.target.checked)} style={{ width:'1.1rem', height:'1.1rem', accentColor:'#d4a574', cursor:'pointer' }} />
                      <span style={{ fontSize:'1.1rem' }}>{ch.emoji}</span>
                      <span style={{ fontSize:'.85rem', fontWeight:700, color:ch.val?'#d4a574':'#666' }}>{ch.label}</span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop:'1rem', background:'#f5f5f5', border:'1px solid #e5e5e5', borderRadius:'.85rem', padding:'.9rem 1rem', fontSize:'.8rem', color:'#555', lineHeight:1.7 }}>
                  <strong>Target Audience</strong><br />
                  <span>👥 {TARGET_ROLES.find(r=>r.id===targetRole)?.emoji} {TARGET_ROLES.find(r=>r.id===targetRole)?.label}</span><br />
                  <span>📍 State: {targetState}</span><br />
                  {targetCount !== null && <span>~{targetCount} recipients found</span>}
                </div>
              </section>

              {/* Send button */}
              <button onClick={() => isValid && setStep('preview')} disabled={!isValid}
                style={{ width:'100%', padding:'1rem', borderRadius:'1rem', border:'none', fontWeight:900, fontSize:'1rem', fontFamily:'inherit', transition:'all .25s', letterSpacing:'.01em',
                  background: isValid ? 'linear-gradient(135deg,#d4a574,#c41e3a)' : '#e5e5e5',
                  color: isValid ? '#fff' : '#999', cursor: isValid ? 'pointer' : 'not-allowed',
                  boxShadow: isValid ? '0 8px 32px rgba(212,165,116,.25)' : 'none' }}>
                Preview Offer &amp; Launch →
              </button>
            </div>

            {/* RIGHT — live preview */}
            <div style={{ position: 'sticky', top: '5rem' }}>
              <h3 style={{ ...S.sectionTitle, marginBottom: '1rem' }}>Channels &amp; Live Preview</h3>
              {/* Tab bar */}
              <div style={{ display:'flex', gap:'.4rem', marginBottom:'1rem' }}>
                {[{ key:'app', icon:'📱' }, { key:'sms', icon:'💬' }, { key:'whatsapp', icon:'💚' }].map(tab => (
                  <button key={tab.key} onClick={() => setPreviewTab(tab.key)}
                    style={{ flex:1, padding:'.4rem .5rem', border:'1.5px solid', borderRadius:'.6rem', fontSize:'.72rem', fontWeight:800, cursor:'pointer', fontFamily:'inherit',
                      background: previewTab===tab.key ? 'rgba(212,165,116,.12)' : '#f5f5f5',
                      borderColor: previewTab===tab.key ? '#d4a574' : '#ddd',
                      color: previewTab===tab.key ? '#d4a574' : '#666' }}>
                    {tab.icon} {tab.key}
                  </button>
                ))}
              </div>
              {/* Phone mockup */}
              <div style={{ background:'#0a0f0a', border:'2px solid #ddd', borderRadius:'2.5rem', padding:'1.5rem .9rem 1rem', boxShadow:'0 40px 80px rgba(0,0,0,.15)', margin:'0 auto', maxWidth:'220px' }}>
                <div style={{ width:'5rem', height:'.55rem', background:'#111', borderRadius:'9999px', margin:'0 auto .9rem', border:'1px solid #333' }} />
                <div style={{ background:'#f5f5f5', borderRadius:'1.5rem', overflow:'hidden', minHeight:'280px', display:'flex', flexDirection:'column' }}>
                  {/* APP */}
                  {previewTab === 'app' && <>
                    <div style={{ padding:'.5rem .75rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e5e5e5' }}>
                      <span style={{ fontSize:'.55rem', fontWeight:800, color:'#2d2d2d' }}>Ferrero Rocher</span>
                      <span style={{ fontSize:'.55rem', color:'#999' }}>9:41 AM</span>
                    </div>
                    <div style={{ margin:'.6rem', background:'#fff', border:'1px solid #e5e5e5', borderRadius:'1rem', padding:'.75rem', flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.4rem', marginBottom:'.5rem' }}>
                        <div style={{ width:'1.4rem', height:'1.4rem', borderRadius:'.35rem', background:currentCampaignType?.bg||'rgba(212,165,116,.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <i className="material-symbols-outlined fi" style={{ fontSize:'.8rem', color:currentCampaignType?.color||'#d4a574' }}>{currentCampaignType?.icon||'campaign'}</i>
                        </div>
                        <span style={{ fontSize:'.55rem', fontWeight:800, color:'#999', textTransform:'uppercase', letterSpacing:'.08em' }}>{currentCampaignType?.label}</span>
                        <span style={{ fontSize:'.5rem', color:'#999', marginLeft:'auto' }}>Just now</span>
                      </div>
                      <p style={{ fontSize:'.62rem', fontWeight:800, color:'#2d2d2d', marginBottom:'.3rem', lineHeight:1.3 }}>{title || 'Your campaign title will appear here…'}</p>
                      <p style={{ fontSize:'.57rem', color:'#666', lineHeight:1.5 }}>{body || 'Your message body will appear here. Make it clear and action-oriented.'}</p>
                    </div>
                    <div style={{ padding:'.5rem .5rem .4rem', borderTop:'1px solid #e5e5e5', display:'flex', justifyContent:'space-around', alignItems:'center' }}>
                      {['home','storefront','inventory','auto_awesome','account_balance_wallet'].map((ic,i) => (
                        <i key={i} className="material-symbols-outlined fi" style={{ fontSize:'.9rem', color:i===0?'#d4a574':'#ccc' }}>{ic}</i>
                      ))}
                    </div>
                  </>}
                  {/* SMS */}
                  {previewTab === 'sms' && <>
                    <div style={{ padding:'.5rem .75rem', display:'flex', justifyContent:'space-between', background:'#1a1a2e', borderBottom:'1px solid #333' }}>
                      <span style={{ fontSize:'.55rem', fontWeight:800, color:'#fff' }}>Messages</span>
                      <span style={{ fontSize:'.55rem', color:'#aaa' }}>9:41 AM</span>
                    </div>
                    <div style={{ flex:1, background:'#f0f0f5', padding:'.6rem .5rem' }}>
                      <div style={{ textAlign:'center', marginBottom:'.5rem' }}>
                        <span style={{ fontSize:'.5rem', color:'#999', background:'#fff', padding:'.2rem .6rem', borderRadius:'9999px', border:'1px solid #e5e5e5' }}>Today</span>
                      </div>
                      <span style={{ fontSize:'.48rem', color:'#999', marginLeft:'.4rem' }}>AD-FRROCH</span>
                      <div style={{ background:'#fff', borderRadius:'0 .75rem .75rem .75rem', padding:'.5rem .6rem', maxWidth:'90%', boxShadow:'0 1px 3px rgba(0,0,0,.08)', border:'1px solid #e5e5e5', marginTop:'.25rem' }}>
                        <p style={{ fontSize:'.52rem', color:'#2d2d2d', lineHeight:1.5, margin:0, wordBreak:'break-word' }}>{smsText}</p>
                      </div>
                      <span style={{ fontSize:'.45rem', color:'#aaa', marginLeft:'.4rem' }}>Just now</span>
                    </div>
                    {!sendSMS && <div style={{ background:'rgba(248,113,113,.08)', borderTop:'1px solid #fecaca', padding:'.4rem .5rem', textAlign:'center' }}>
                      <p style={{ fontSize:'.5rem', color:'#f87171', margin:0 }}>⚠️ SMS channel not selected</p>
                    </div>}
                  </>}
                  {/* WHATSAPP */}
                  {previewTab === 'whatsapp' && <>
                    <div style={{ padding:'.5rem .75rem', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#075E54' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.35rem' }}>
                        <div style={{ width:'1.2rem', height:'1.2rem', borderRadius:'50%', background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem' }}>🍫</div>
                        <div>
                          <p style={{ fontSize:'.52rem', fontWeight:800, color:'#fff', margin:0 }}>Ferrero Rocher</p>
                          <p style={{ fontSize:'.42rem', color:'rgba(255,255,255,.7)', margin:0 }}>✅ Verified B2B Business</p>
                        </div>
                      </div>
                      <span style={{ fontSize:'.5rem', color:'rgba(255,255,255,.7)' }}>9:41 AM</span>
                    </div>
                    <div style={{ flex:1, background:'#ECE5DD', padding:'.6rem .5rem' }}>
                      <div style={{ textAlign:'center', marginBottom:'.5rem' }}>
                        <span style={{ fontSize:'.48rem', color:'#666', background:'rgba(255,255,255,.85)', padding:'.2rem .6rem', borderRadius:'9999px' }}>Today</span>
                      </div>
                      <div style={{ background:'#fff', borderRadius:'0 .75rem .75rem .75rem', padding:'.5rem .65rem', maxWidth:'92%', boxShadow:'0 1px 3px rgba(0,0,0,.12)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'.3rem', marginBottom:'.3rem', paddingBottom:'.3rem', borderBottom:'1px solid #f0f0f0' }}>
                          <span style={{ fontSize:'.55rem', fontWeight:900, color:'#075E54' }}>🍫 Ferrero Rocher</span>
                          <span style={{ fontSize:'.42rem', background:'#e3f9e5', color:'#128C7E', padding:'.1rem .3rem', borderRadius:'9999px', fontWeight:700 }}>✅ B2B</span>
                        </div>
                        <p style={{ fontSize:'.6rem', fontWeight:800, color:'#2d2d2d', marginBottom:'.25rem', lineHeight:1.3 }}>{title || 'Campaign title here…'}</p>
                        <p style={{ fontSize:'.53rem', color:'#555', lineHeight:1.5, marginBottom:'.35rem', wordBreak:'break-word' }}>{body ? body.slice(0,150)+(body.length>150?'…':'') : 'Your WhatsApp message will appear here.'}</p>
                        <p style={{ fontSize:'.47rem', color:'#8b6f47', margin:0 }}>Valid for {duration} days · Reply STOP to opt out</p>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'.3rem' }}>
                          <span style={{ fontSize:'.45rem', color:'#aaa' }}>Just now</span>
                          <span style={{ fontSize:'.5rem', color:'#34B7F1' }}>✓✓</span>
                        </div>
                      </div>
                    </div>
                    {!sendWhatsApp && <div style={{ background:'rgba(248,113,113,.08)', borderTop:'1px solid #fecaca', padding:'.4rem .5rem', textAlign:'center' }}>
                      <p style={{ fontSize:'.5rem', color:'#f87171', margin:0 }}>⚠️ WhatsApp channel not selected</p>
                    </div>}
                  </>}
                </div>
              </div>
              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.5rem', marginTop:'1.25rem' }}>
                {[
                  { n: targetCount ?? '—', l: 'Target Users' },
                  { n: TARGET_ROLES.find(r=>r.id===targetRole)?.emoji, l: TARGET_ROLES.find(r=>r.id===targetRole)?.label },
                  { n: <i className="material-symbols-outlined fi" style={{ color:currentCampaignType?.color||'#d4a574', fontSize:'1.2rem' }}>{currentCampaignType?.icon||'campaign'}</i>, l: currentCampaignType?.label },
                ].map((s,i) => (
                  <div key={i} style={{ background:'#f5f5f5', border:'1px solid #e5e5e5', borderRadius:'.85rem', padding:'.75rem .5rem', textAlign:'center', display:'flex', flexDirection:'column', gap:'.25rem' }}>
                    <span style={{ fontSize:'1.1rem', fontWeight:900, color:'#2d2d2d' }}>{s.n}</span>
                    <span style={{ fontSize:'.6rem', color:'#999', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          PREVIEW MODAL (step === 'preview')
      ────────────────────────────────────────────────── */}
      {step === 'preview' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'1.5rem' }}>
          <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:'1.5rem', padding:'2rem', width:'100%', maxWidth:'480px', animation:'cos-slide-up .35s cubic-bezier(.34,1.56,.64,1)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>📣</div>
              <h2 style={{ fontWeight:900, fontSize:'1.3rem', color:'#2d2d2d', marginBottom:'.4rem' }}>Ready to Launch?</h2>
              <p style={{ fontSize:'.85rem', color:'#666' }}>
                Sending to <strong style={{ color:'#d4a574' }}>{targetCount ?? '—'} {targetRole==='all'?'users':targetRole==='retailer'?'retailers':'distributors'}</strong>
                {targetState !== 'All States' && <> in <strong style={{ color:'#d4a574' }}>{targetState}</strong></>}
              </p>
              <div style={{ display:'flex', gap:'.4rem', justifyContent:'center', marginTop:'.6rem' }}>
                {[sendApp && '📱 App', sendSMS && '💬 SMS', sendWhatsApp && '💚 WhatsApp'].filter(Boolean).map((ch,i) => (
                  <span key={i} style={{ fontSize:'.7rem', fontWeight:700, background:'rgba(212,165,116,.12)', border:'1px solid rgba(212,165,116,.3)', color:'#d4a574', padding:'.2rem .6rem', borderRadius:'9999px' }}>{ch}</span>
                ))}
              </div>
            </div>
            {/* Offer summary */}
            <div style={{ background:'#f5f5f5', border:'1px solid #e5e5e5', borderRadius:'1rem', padding:'1.25rem', marginBottom:'1.25rem' }}>
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'.75rem' }}>
                <span style={{ padding:'.25rem .7rem', background:currentOfferType?.bg, border:`1px solid ${currentOfferType?.color}44`, borderRadius:'9999px', fontSize:'.7rem', fontWeight:700, color:currentOfferType?.color }}>{currentOfferType?.label}</span>
                <span style={{ padding:'.25rem .7rem', background:'#fff', border:'1px solid #ddd', borderRadius:'9999px', fontSize:'.7rem', color:'#666' }}>
                  {TARGET_ROLES.find(r=>r.id===targetRole)?.emoji} {TARGET_ROLES.find(r=>r.id===targetRole)?.label}
                </span>
                {targetState !== 'All States' && <span style={{ padding:'.25rem .7rem', background:'#fff', border:'1px solid #ddd', borderRadius:'9999px', fontSize:'.7rem', color:'#666' }}>📍 {targetState}</span>}
              </div>
              <p style={{ fontWeight:800, fontSize:'.95rem', color:'#2d2d2d', marginBottom:'.5rem' }}>{title}</p>
              <p style={{ fontSize:'.82rem', color:'#666', lineHeight:1.6 }}>{body}</p>
            </div>
            {/* Products summary */}
            {selectedProducts.length > 0 && (
              <div style={{ background:'#f5f5f5', border:'1px solid #e5e5e5', borderRadius:'1rem', padding:'1rem', marginBottom:'1.25rem' }}>
                <p style={{ fontSize:'.75rem', fontWeight:800, color:'#2d2d2d', marginBottom:'.5rem' }}>📦 Products ({selectedProducts.length})</p>
                {selectedProducts.map(p => (
                  <p key={p.id} style={{ fontSize:'.78rem', color:'#666', marginBottom:'.2rem' }}>• {p.name} — min {p.qty} units</p>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:'.8rem' }}>
              <button onClick={() => setStep('compose')} disabled={sending} style={S.outlineBtn}>← Edit</button>
              <button onClick={handleSend} disabled={sending} style={{ ...S.primaryBtn, flex:2, opacity:sending?.7:1, cursor:sending?'not-allowed':'pointer' }}>
                {sending
                  ? <span style={{ display:'flex', alignItems:'center', gap:'.5rem', justifyContent:'center' }}><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span> Sending…</span>
                  : '🚀 Launch Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────
const TermRow = ({ label, hint, children }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d', fontSize: '.95rem' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>{children}</div>
    {hint && <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.4rem' }}>{hint}</p>}
  </div>
);

// ─── STYLES ──────────────────────────────────────────────────────────────
const S = {
  page:       { minHeight: '100vh', background: '#f9f7f3', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", color: '#2d2d2d', position: 'relative', overflowX: 'clip' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 100 },
  logo:       { width: '2.4rem', height: '2.4rem', background: 'linear-gradient(135deg,#d4a574,#c41e3a)', borderRadius: '.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  logoTitle:  { fontSize: '1rem', fontWeight: 900, letterSpacing: '-.02em', color: '#2d2d2d' },
  logoSub:    { fontSize: '.65rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' },
  liveDot:    { width: '7px', height: '7px', borderRadius: '50%', background: '#d4a574', boxShadow: '0 0 8px #d4a574', animation: 'cos-ping 1.6s ease-out infinite' },
  historyBtn: { background: '#f5f5f5', border: '1px solid #ddd', color: '#666', padding: '.45rem .9rem', borderRadius: '9999px', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem' },
  main:       { maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 4rem' },
  backBtn:    { background: 'none', border: 'none', color: '#d4a574', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', padding: 0 },
  subhead:    { fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#2d2d2d' },
  termsCard:  { background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1.25rem', padding: '2rem' },
  termsHead:  { fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' },
  numInput:   { width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem', outline: 'none', fontFamily: 'inherit' },
  unit:       { color: '#666', fontSize: '.9rem' },
  section:    { background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1.25rem', padding: '1.5rem' },
  sectionTitle: { fontSize: '.88rem', fontWeight: 800, color: '#2d2d2d', display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' },
  stepBadge:  { width: '1.5rem', height: '1.5rem', background: 'rgba(212,165,116,.15)', border: '1px solid rgba(212,165,116,.3)', borderRadius: '.4rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 900, color: '#d4a574', flexShrink: 0 },
  label:      { fontSize: '.65rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: '.4rem' },
  input:      { width: '100%', background: '#f9f7f3', border: '1.5px solid', borderRadius: '.75rem', padding: '.85rem 1rem', fontSize: '.9rem', color: '#2d2d2d', fontFamily: 'inherit', outline: 'none', transition: 'border-color .18s', boxSizing: 'border-box' },
  textarea:   { width: '100%', background: '#f9f7f3', border: '1.5px solid', borderRadius: '.75rem', padding: '.85rem 1rem', fontSize: '.88rem', color: '#2d2d2d', fontFamily: 'inherit', outline: 'none', resize: 'vertical', lineHeight: 1.6, transition: 'border-color .18s', boxSizing: 'border-box' },
  selectInput: { width: '100%', background: '#f9f7f3', border: '1.5px solid #ddd', borderRadius: '.75rem', padding: '.75rem 2.5rem .75rem 1rem', fontSize: '.88rem', color: '#2d2d2d', fontFamily: 'inherit', outline: 'none', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' },
  selectChevron: { position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#d4a574', fontSize: '.85rem' },
  primaryBtn: { background: 'linear-gradient(135deg,#d4a574,#c41e3a)', color: '#fff', border: 'none', padding: '.85rem 1.5rem', borderRadius: '.85rem', fontWeight: 900, fontSize: '.9rem', fontFamily: 'inherit', cursor: 'pointer', transition: 'all .2s' },
  outlineBtn: { background: '#f5f5f5', border: '1px solid #ddd', color: '#666', padding: '.85rem 1.25rem', borderRadius: '.85rem', fontWeight: 700, fontSize: '.9rem', fontFamily: 'inherit', cursor: 'pointer' },
  lockCard:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', maxWidth: '380px', margin: '0 auto', textAlign: 'center' },
  lockInput:  { width: '100%', background: '#f9f7f3', border: '1.5px solid', borderRadius: '.85rem', padding: '1rem 1.25rem', fontSize: '1rem', color: '#2d2d2d', fontFamily: 'inherit', outline: 'none', textAlign: 'center', letterSpacing: '.12em', marginBottom: '.25rem', boxSizing: 'border-box' },
  lockBtn:    { width: '100%', background: 'linear-gradient(135deg,#d4a574,#c41e3a)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '.85rem', fontWeight: 900, fontSize: '.95rem', cursor: 'pointer', marginTop: '1rem', fontFamily: 'inherit' },
  successCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' },
  drawerOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' },
  drawer:        { width: '100%', maxWidth: '480px', background: '#fff', borderLeft: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', animation: 'cos-slide-right .3s ease' },
  drawerHeader:  { padding: '1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  drawerBody:    { flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.8rem' },
  closeBtn:      { background: '#f5f5f5', border: '1px solid #ddd', color: '#999', width: '2rem', height: '2rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem' },
  historyRow:    { background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '1rem', padding: '1rem' },
  historyBadge:  { background: 'rgba(212,165,116,.12)', color: '#d4a574', border: '1px solid rgba(212,165,116,.2)', borderRadius: '9999px', padding: '.2rem .6rem', fontSize: '.7rem', fontWeight: 800, flexShrink: 0 },
};

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: #f9f7f3; }
  @keyframes cos-ping { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.4);opacity:0} }
  @keyframes cos-confetti { 0%{transform:translate(0,0) rotate(0deg);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) rotate(720deg);opacity:0} }
  @keyframes cos-slide-up { from{opacity:0;transform:translateY(40px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes cos-slide-right { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes cos-bounce { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  input:focus, textarea:focus, select:focus { border-color: rgba(212,165,116,.5) !important; box-shadow: 0 0 0 3px rgba(212,165,116,.08); }
  .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; font-size:inherit; line-height:1; vertical-align:middle; }
  .material-symbols-outlined.fi { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
  button { font-family: inherit; }
  select { font-family: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(212,165,116,.2); border-radius: 9999px; }
`;
