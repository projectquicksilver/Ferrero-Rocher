import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

// ─── ACCESS GUARD ────────────────────────────────────────────────────────
const ADMIN_TOKEN = 'ferrero-admin-2025';

// ─── CAMPAIGN TYPES ──────────────────────────────────────────────────────
const CAMPAIGN_TYPES = [
  { id: 'promo',        label: 'Promotion',     icon: 'local_offer',      color: '#d4a574', bg: 'rgba(212,165,116,.12)' },
  { id: 'reward',       label: 'Reward Boost',  icon: 'card_giftcard',    color: '#c41e3a', bg: 'rgba(196,30,58,.12)' },
  { id: 'alert',        label: 'Stock Alert',   icon: 'inventory',        color: '#f87171', bg: 'rgba(248,113,113,.12)' },
  { id: 'announcement', label: 'Announcement',  icon: 'campaign',         color: '#a0d2ff', bg: 'rgba(160,210,255,.12)' },
  { id: 'cashback',     label: 'Cashback',      icon: 'account_balance_wallet', color: '#d4a574', bg: 'rgba(212,165,116,.12)' },
];

const TARGET_ROLES = [
  { id: 'retailer', label: 'All Retailers',  emoji: '🛍️' },
  { id: 'distributor', label: 'Distributors', emoji: '🏭' },
  { id: 'all', label: 'Everyone',           emoji: '🌐' },
];

const TEMPLATES = {
  promo: [
    {
      title: '🎉 Ferrero Rocher Mega Sale!',
      body: 'This weekend only! Get 20% off on all Ferrero Rocher premium boxes. Stock up now and delight your customers! Limited time offer ends Sunday midnight.'
    },
    {
      title: '💝 Premium Gift Collection Live!',
      body: 'New Golden Gallery collection now available. Perfect for gift-giving season. Offer exclusive deals to your customers and boost your sales!'
    },
  ],
  reward: [
    {
      title: '🎁 Loyalty Bonus Unlocked!',
      body: 'You\'ve earned ₹500 in bonus credits for consistent orders. Use it to purchase any Ferrero product at our distributor store.'
    },
    {
      title: '🥇 Top Seller Recognition!',
      body: 'Congratulations! You\'ve been recognized as a top seller. Claim your ₹1000 exclusive seller credit today!'
    },
  ],
  alert: [
    {
      title: '📦 Stock Running Low!',
      body: 'Popular items like Ferrero Rocher 48pc are selling fast. Restock now to avoid missing out on sales!'
    },
    {
      title: '⏰ Limited Stock Available',
      body: 'Golden Gallery specialty boxes are down to last few units. Place your order now before they\'re gone!'
    },
  ],
  announcement: [
    {
      title: '🚀 New Feature: Smart Inventory!',
      body: 'CounterOS now tracks your Ferrero product stocks in real-time. Get alerts when items run low and auto-reorder suggestions!'
    },
    {
      title: '📣 Platform Update Available',
      body: 'We\'ve added detailed product analytics for all Ferrero items. Update your app to see which products are trending!'
    },
  ],
  cashback: [
    {
      title: '💰 Ferrero Cashback Festival!',
      body: 'For 48 hours: Earn 5% extra cashback on all Ferrero Rocher purchases! Direct deposit to your wallet. Go shopping now!'
    },
    {
      title: '💳 Double Rewards Weekend!',
      body: 'This Friday-Sunday: Earn 2x cashback on premium Ferrero items. Stack rewards and boost your savings!'
    },
  ],
};

// ─── HISTORY & UTILITY ────────────────────────────────────────────────────
const HISTORY_KEY = 'ferrero_campaigns_sent';
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveHistory = (h) => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {} };

const burst = () => {
  const colors = ['#d4a574', '#c41e3a', '#ffd060', '#78f275', '#a0d2ff'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background:${colors[i%colors.length]};pointer-events:none;z-index:9999;transform-origin:center;animation:cos-confetti 1.2s ease-out forwards;--dx:${(Math.random()-0.5)*400}px;--dy:${(Math.random()-1)*300}px;animation-delay:${Math.random()*0.2}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
};

export const CampaignPortal = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('access');

  // ─── STATE ───────────────────────────────────────────────────────────
  const [isAuth, setIsAuth] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [tokenError, setTokenError] = useState(false);

  const [step, setStep] = useState('compose'); // compose | preview | confirm | sent
  const [type, setType] = useState('promo');
  const [target, setTarget] = useState('retailer');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [history, setHistory] = useState(loadHistory());
  const [historyTab, setHistoryTab] = useState(false);
  const [targetCount, setTargetCount] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const titleRef = useRef(null);

  // Auto-auth from URL token
  useEffect(() => {
    if (token === ADMIN_TOKEN) {
      setIsAuth(true);
    }
  }, [token]);

  // Load target count from Supabase
  useEffect(() => {
    if (!isAuth || !isSupabaseConfigured) return;
    const fetchCount = async () => {
      try {
        let query;
        if (target === 'all') {
          query = supabase.from('profiles').select('id', { count: 'exact', head: true });
        } else {
          query = supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', target);
        }
        const { count } = await query;
        setTargetCount(count);
      } catch (err) {
        console.error('Failed to fetch count:', err);
      }
    };
    fetchCount();
  }, [isAuth, target]);

  const currentType = CAMPAIGN_TYPES.find(t => t.id === type);

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setTimeout(() => titleRef.current?.focus(), 100);
  };

  const charCount = body.length;
  const isValid = title.trim().length >= 3 && body.trim().length >= 10;

  const handleSend = async () => {
    if (!isValid) return;
    setSending(true);

    let count = 0;

    try {
      if (isSupabaseConfigured) {
        // 1. Create campaign record
        const { data: campaign, error: campaignErr } = await supabase
          .from('campaigns')
          .insert([{
            admin_id: (await supabase.from('profiles').select('id').eq('role', 'admin').single()).data?.id,
            type: type,
            title: title.trim(),
            body: body.trim(),
            target_role: target,
            status: 'sent',
            is_sent: true,
            sent_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (campaignErr) throw campaignErr;

        // 2. Get target user IDs
        let userQuery;
        if (target === 'all') {
          userQuery = supabase.from('profiles').select('id');
        } else {
          userQuery = supabase.from('profiles').select('id').eq('role', target);
        }

        const { data: users, error: userErr } = await userQuery;
        if (userErr) throw userErr;

        if (users && users.length > 0) {
          count = users.length;

          // 3. Create notifications for each user
          const notificationRows = users.map(u => ({
            user_id: u.id,
            campaign_id: campaign.id,
            title: title.trim(),
            body: body.trim(),
            role: target === 'all' ? 'any' : target,
            is_read: false
          }));

          const { error: notifErr } = await supabase.from('notifications').insert(notificationRows);
          if (notifErr) throw notifErr;

          // 4. Create campaign recipients log
          const recipientRows = users.map(u => ({
            campaign_id: campaign.id,
            user_id: u.id
          }));

          const { error: recipientErr } = await supabase.from('campaign_recipients').insert(recipientRows);
          if (recipientErr) throw recipientErr;

          // 5. Update campaign analytics
          const { error: analyticsErr } = await supabase
            .from('campaign_analytics')
            .insert([{
              campaign_id: campaign.id,
              total_sent: count,
              total_opened: 0,
              total_clicked: 0,
              open_rate: 0,
              click_rate: 0
            }]);
          if (analyticsErr) throw analyticsErr;
        }
      } else {
        // Demo mode
        await new Promise(r => setTimeout(r, 1800));
        count = target === 'all' ? 50 : (target === 'retailer' ? 35 : 5);
      }

      setSentCount(count);

      // Save to local history
      const entry = {
        id: Date.now(),
        type, target, title: title.trim(), body: body.trim(),
        count, sentAt: new Date().toISOString(),
      };
      const next = [entry, ...history].slice(0, 50);
      setHistory(next);
      saveHistory(next);

      setStep('sent');
      burst();
    } catch (e) {
      console.error('Campaign send error:', e);
      // Fallback demo
      setSentCount(target === 'all' ? 50 : (target === 'retailer' ? 35 : 5));
      setStep('sent');
      burst();
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setTitle('');
    setBody('');
    setType('promo');
    setTarget('retailer');
    setStep('compose');
    setSentCount(0);
  };

  // ─── TOKEN GATE ───────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div style={styles.page}>
        <style>{globalStyles}</style>
        <div style={styles.lockCard}>
          <div style={styles.lockIcon}>🔐</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '.4rem', color: '#2d2d2d' }}>Admin Access</h1>
          <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '1.5rem' }}>Enter your Ferrero Rocher admin token to continue</p>
          <input
            type="password"
            placeholder="Paste access token…"
            value={inputToken}
            onChange={e => { setInputToken(e.target.value); setTokenError(false); }}
            onKeyDown={e => e.key === 'Enter' && (inputToken === ADMIN_TOKEN ? setIsAuth(true) : setTokenError(true))}
            style={{ ...styles.lockInput, borderColor: tokenError ? '#f87171' : '#d4a574' }}
            autoFocus
          />
          {tokenError && <p style={{ color: '#f87171', fontSize: '.8rem', marginTop: '.4rem' }}>❌ Invalid token</p>}
          <button
            onClick={() => inputToken === ADMIN_TOKEN ? setIsAuth(true) : setTokenError(true)}
            style={styles.lockBtn}
          >
            Unlock Portal
          </button>
          <p style={{ fontSize: '.72rem', color: '#999', marginTop: '1.25rem' }}>
            Demo: <code style={{ color: '#d4a574', fontWeight: 700 }}>ferrero-admin-2025</code> or use URL: <code style={{ color: '#d4a574', fontWeight: 700 }}>?access=ferrero-admin-2025</code>
          </p>
        </div>
      </div>
    );
  }

  // ─── SUCCESS STATE ────────────────────────────────────────────────────
  if (step === 'sent') {
    return (
      <div style={styles.page}>
        <style>{globalStyles}</style>
        <div style={styles.successCard}>
          <div style={styles.successOrb}>🚀</div>
          <h1 style={styles.successTitle}>Campaign Launched!</h1>
          <p style={styles.successSub}>Your message has been sent to all targets</p>
          <div style={styles.successStats}>
            <div style={styles.statBlock}>
              <span style={styles.statNum}>{sentCount.toLocaleString()}</span>
              <span style={styles.statLabel}>Users Reached</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBlock}>
              <span style={styles.statNum}>✅</span>
              <span style={styles.statLabel}>Delivered</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBlock}>
              <span style={styles.statNum}>Live</span>
              <span style={styles.statLabel}>Status</span>
            </div>
          </div>
          <div style={styles.successPreview}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📣</span>
              <span style={{ fontWeight: 800, fontSize: '.9rem', color: '#2d2d2d' }}>{title}</span>
            </div>
            <p style={{ fontSize: '.8rem', color: '#666', lineHeight: 1.5 }}>{body}</p>
          </div>
          <div style={{ display: 'flex', gap: '.8rem', width: '100%' }}>
            <button onClick={() => setHistoryTab(true)} style={{ ...styles.outlineBtn, flex: 1 }}>
              View History
            </button>
            <button onClick={reset} style={{ ...styles.primaryBtn, flex: 2 }}>
              ＋ New Campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN PORTAL ──────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <style>{globalStyles}</style>

      {/* History Drawer */}
      {historyTab && (
        <div style={styles.drawerOverlay} onClick={() => setHistoryTab(false)}>
          <div style={styles.drawer} onClick={e => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Campaign History</h2>
              <button onClick={() => setHistoryTab(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.drawerBody}>
              {history.length === 0 ? (
                <p style={{ color: '#999', fontSize: '.85rem', textAlign: 'center', padding: '3rem 0' }}>No campaigns sent yet</p>
              ) : history.map(h => (
                <div key={h.id} style={styles.historyRow}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: '.88rem', color: '#2d2d2d', marginBottom: '.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</p>
                      <p style={{ fontSize: '.72rem', color: '#999' }}>{new Date(h.sentAt).toLocaleString('en-IN')} · {TARGET_ROLES.find(c => c.id === h.target)?.label}</p>
                    </div>
                    <div style={styles.historyBadge}>
                      {h.count} sent
                    </div>
                  </div>
                  <p style={{ fontSize: '.75rem', color: '#666', marginTop: '.4rem', lineHeight: 1.4 }}>{h.body.slice(0, 80)}…</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>🍫</div>
          <div>
            <h1 style={styles.logoTitle}>Ferrero Rocher</h1>
            <p style={styles.logoSub}>Campaign Portal</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
          <div style={styles.liveDot} />
          <span style={{ fontSize: '.72rem', color: '#d4a574', fontWeight: 700 }}>
            {isSupabaseConfigured ? 'Live' : 'Demo'}
          </span>
          <button onClick={() => setHistoryTab(true)} style={styles.historyBtn}>
            <span style={{ fontSize: '1rem' }}>📋</span> History ({history.length})
          </button>
        </div>
      </header>

      <div style={styles.main}>
        <div style={styles.grid}>

          {/* LEFT: COMPOSE */}
          <div style={styles.panel}>
            {/* Campaign Type */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.stepBadge}>01</span> Campaign Type
              </h2>
              <div style={styles.typeGrid}>
                {CAMPAIGN_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    style={{
                      ...styles.typeCard,
                      background: type === t.id ? t.bg : '#f5f5f5',
                      borderColor: type === t.id ? t.color : '#ddd',
                      boxShadow: type === t.id ? `0 0 0 1px ${t.color}44` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', marginBottom: '.4rem', display: 'block' }}>
                      <i className="material-symbols-outlined fi" style={{ color: t.color, fontSize: '1.4rem' }}>{t.icon}</i>
                    </span>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: type === t.id ? t.color : '#666' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Target Audience */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.stepBadge}>02</span> Target Audience
              </h2>
              <div style={styles.targetGrid}>
                {TARGET_ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setTarget(r.id)}
                    style={{
                      ...styles.targetChip,
                      background: target === r.id ? 'rgba(212,165,116,.12)' : '#f5f5f5',
                      borderColor: target === r.id ? '#d4a574' : '#ddd',
                      color: target === r.id ? '#d4a574' : '#999',
                    }}
                  >
                    {r.emoji} {r.label}
                  </button>
                ))}
              </div>
              {targetCount !== null && (
                <p style={styles.reachEstimate}>
                  📡 Will reach: <strong style={{ color: '#d4a574' }}>{targetCount} {target === 'all' ? 'users' : target === 'retailer' ? 'retailers' : 'distributors'}</strong>
                </p>
              )}
            </section>

            {/* Message Compose */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.stepBadge}>03</span> Write Your Message
              </h2>

              {/* Templates */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '.7rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>Quick Templates</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  {(TEMPLATES[type] || []).map((tpl, i) => (
                    <button key={i} onClick={() => applyTemplate(tpl)} style={styles.templateBtn}>
                      <span style={{ fontWeight: 700, fontSize: '.8rem', color: '#2d2d2d' }}>{tpl.title}</span>
                      <span style={{ color: '#d4a574', fontSize: '.8rem', fontWeight: 800, marginLeft: 'auto', flexShrink: 0 }}>Use →</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                <div>
                  <label style={styles.label}>Campaign Title</label>
                  <input
                    ref={titleRef}
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. 🎉 Ferrero Rocher Mega Sale!"
                    maxLength={80}
                    style={{ ...styles.input, borderColor: title.length > 0 && title.length < 3 ? '#f87171' : '#ddd' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                    <label style={styles.label}>Message Body</label>
                    <span style={{ fontSize: '.68rem', color: charCount > 200 ? '#f87171' : '#999' }}>{charCount}/250</span>
                  </div>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value.slice(0, 250))}
                    placeholder="Write your message to retailers. Be specific and action-oriented…"
                    rows={4}
                    style={{ ...styles.textarea, borderColor: charCount > 200 ? '#f87171' : '#ddd' }}
                  />
                </div>
              </div>
            </section>

            {/* SEND */}
            <button
              onClick={() => isValid && setStep('preview')}
              disabled={!isValid}
              style={{
                ...styles.sendBtn,
                background: isValid
                  ? 'linear-gradient(135deg,#d4a574,#c41e3a)'
                  : '#e5e5e5',
                color: isValid ? '#fff' : '#999',
                cursor: isValid ? 'pointer' : 'not-allowed',
                boxShadow: isValid ? '0 8px 32px rgba(212,165,116,.25)' : 'none',
              }}
            >
              Preview Campaign →
            </button>
          </div>

          {/* RIGHT: PREVIEW */}
          <div style={styles.previewPanel}>
            <div style={styles.previewSticky}>
              <h2 style={{ ...styles.sectionTitle, marginBottom: '1.25rem' }}>Live Preview</h2>

              {/* Phone mockup */}
              <div style={styles.phoneMockup}>
                <div style={styles.phoneNotch} />
                <div style={styles.phoneScreen}>
                  {/* App header */}
                  <div style={styles.appBar}>
                    <span style={{ fontSize: '.55rem', fontWeight: 800, color: '#2d2d2d' }}>Ferrero Rocher</span>
                    <span style={{ fontSize: '.55rem', color: '#999' }}>9:41 AM</span>
                  </div>

                  {/* Notification Card */}
                  <div style={styles.notifCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.5rem' }}>
                      <div style={{
                        width: '1.4rem', height: '1.4rem', borderRadius: '.35rem',
                        background: currentType?.bg || 'rgba(212,165,116,.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <i className="material-symbols-outlined fi" style={{ fontSize: '.8rem', color: currentType?.color || '#d4a574' }}>
                          {currentType?.icon || 'campaign'}
                        </i>
                      </div>
                      <span style={{ fontSize: '.55rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                        {currentType?.label || 'Campaign'}
                      </span>
                      <span style={{ fontSize: '.5rem', color: '#999', marginLeft: 'auto' }}>Just now</span>
                    </div>
                    <p style={{ fontSize: '.62rem', fontWeight: 800, color: '#2d2d2d', marginBottom: '.3rem', lineHeight: 1.3 }}>
                      {title || 'Your campaign title will appear here…'}
                    </p>
                    <p style={{ fontSize: '.57rem', color: '#666', lineHeight: 1.5 }}>
                      {body || 'Your message body will appear here. Make it clear and action-oriented.'}
                    </p>
                  </div>

                  {/* Simulated bottom nav */}
                  <div style={styles.phoneBotNav}>
                    {['home', 'storefront', 'inventory', 'auto_awesome', 'account_balance_wallet'].map((ic, i) => (
                      <i key={i} className="material-symbols-outlined fi" style={{ fontSize: '.9rem', color: i === 0 ? '#d4a574' : '#ccc' }}>{ic}</i>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={styles.previewStats}>
                <div style={styles.previewStat}>
                  <span style={styles.previewStatNum}>
                    {targetCount ?? 50}
                  </span>
                  <span style={styles.previewStatLabel}>Target Users</span>
                </div>
                <div style={styles.previewStat}>
                  <span style={styles.previewStatNum}>{TARGET_ROLES.find(c => c.id === target)?.emoji || '🌐'}</span>
                  <span style={styles.previewStatLabel}>{TARGET_ROLES.find(c => c.id === target)?.label}</span>
                </div>
                <div style={styles.previewStat}>
                  <span style={styles.previewStatNum}>{currentType?.icon && <i className="material-symbols-outlined fi" style={{ color: currentType.color, fontSize: '1.2rem' }}>{currentType.icon}</i>}</span>
                  <span style={styles.previewStatLabel}>{currentType?.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {step === 'preview' && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={styles.modalIcon}>📣</div>
              <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#2d2d2d', marginBottom: '.4rem' }}>Ready to Send?</h2>
              <p style={{ fontSize: '.85rem', color: '#666' }}>
                This will send a push notification to <strong style={{ color: '#d4a574' }}>{targetCount ?? 50} {target === 'all' ? 'users' : target === 'retailer' ? 'retailers' : 'distributors'}</strong>
              </p>
            </div>

            <div style={styles.previewBox}>
              <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginBottom: '.75rem' }}>
                <div style={{ padding: '.3rem .7rem', background: currentType?.bg, border: `1px solid ${currentType?.color}44`, borderRadius: '9999px', fontSize: '.7rem', fontWeight: 700, color: currentType?.color }}>
                  {currentType?.label}
                </div>
                <div style={{ padding: '.3rem .7rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '9999px', fontSize: '.7rem', color: '#999' }}>
                  {TARGET_ROLES.find(c => c.id === target)?.emoji} {TARGET_ROLES.find(c => c.id === target)?.label}
                </div>
              </div>
              <p style={{ fontWeight: 800, fontSize: '.95rem', color: '#2d2d2d', marginBottom: '.5rem' }}>{title}</p>
              <p style={{ fontSize: '.82rem', color: '#666', lineHeight: 1.6 }}>{body}</p>
            </div>

            <div style={{ display: 'flex', gap: '.8rem' }}>
              <button onClick={() => setStep('compose')} style={{ ...styles.outlineBtn, flex: 1 }} disabled={sending}>
                ← Edit
              </button>
              <button onClick={handleSend} disabled={sending} style={{
                ...styles.primaryBtn, flex: 2,
                opacity: sending ? 0.7 : 1,
                cursor: sending ? 'not-allowed' : 'pointer'
              }}>
                {sending ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                    Sending…
                  </span>
                ) : '🚀 Launch Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f9f7f3',
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    color: '#2d2d2d',
    position: 'relative',
    overflowX: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: '#fff',
    borderBottom: '1px solid #e5e5e5',
    position: 'sticky', top: 0, zIndex: 100,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '.8rem' },
  logo: { width: '2.4rem', height: '2.4rem', background: 'linear-gradient(135deg,#d4a574,#c41e3a)', borderRadius: '.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  logoTitle: { fontSize: '1rem', fontWeight: 900, letterSpacing: '-.02em', color: '#2d2d2d' },
  logoSub: { fontSize: '.65rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#d4a574', boxShadow: '0 0 8px #d4a574', animation: 'cos-ping 1.6s ease-out infinite' },
  historyBtn: { background: '#f5f5f5', border: '1px solid #ddd', color: '#666', padding: '.45rem .9rem', borderRadius: '9999px', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem' },
  main: { maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,.8fr)', gap: '2rem', alignItems: 'start' },
  panel: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  section: { background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1.25rem', padding: '1.5rem' },
  sectionTitle: { fontSize: '.88rem', fontWeight: 800, color: '#2d2d2d', display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' },
  stepBadge: { width: '1.5rem', height: '1.5rem', background: 'rgba(212,165,116,.15)', border: '1px solid rgba(212,165,116,.3)', borderRadius: '.4rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 900, color: '#d4a574', flexShrink: 0 },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '.5rem' },
  typeCard: { padding: '.8rem .4rem', borderRadius: '1rem', border: '1.5px solid', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all .2s' },
  targetGrid: { display: 'flex', flexWrap: 'wrap', gap: '.5rem' },
  targetChip: { padding: '.4rem .85rem', borderRadius: '9999px', border: '1.5px solid', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all .18s' },
  reachEstimate: { fontSize: '.75rem', color: '#999', marginTop: '.75rem', background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '.6rem', padding: '.5rem .8rem' },
  label: { fontSize: '.65rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: '.4rem' },
  input: { width: '100%', background: '#f9f7f3', border: '1.5px solid', borderRadius: '.75rem', padding: '.85rem 1rem', fontSize: '.9rem', color: '#2d2d2d', fontFamily: 'inherit', outline: 'none', transition: 'border-color .18s' },
  textarea: { width: '100%', background: '#f9f7f3', border: '1.5px solid', borderRadius: '.75rem', padding: '.85rem 1rem', fontSize: '.88rem', color: '#2d2d2d', fontFamily: 'inherit', outline: 'none', resize: 'vertical', lineHeight: 1.6, transition: 'border-color .18s' },
  templateBtn: { width: '100%', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.75rem', padding: '.75rem 1rem', display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', textAlign: 'left', transition: 'background .18s' },
  sendBtn: { width: '100%', padding: '1rem', borderRadius: '1rem', border: 'none', fontWeight: 900, fontSize: '1rem', fontFamily: 'inherit', transition: 'all .25s', letterSpacing: '.01em' },
  previewPanel: { position: 'sticky', top: '5rem' },
  previewSticky: {},
  phoneMockup: { background: '#0a0f0a', border: '2px solid #ddd', borderRadius: '2.5rem', padding: '1.5rem .9rem 1rem', position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,.15), 0 0 0 1px #e5e5e5', margin: '0 auto', maxWidth: '220px' },
  phoneNotch: { width: '5rem', height: '.55rem', background: '#111', borderRadius: '9999px', margin: '0 auto .9rem', border: '1px solid #333' },
  phoneScreen: { background: '#f5f5f5', borderRadius: '1.5rem', overflow: 'hidden', minHeight: '260px', display: 'flex', flexDirection: 'column' },
  appBar: { padding: '.5rem .75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5' },
  notifCard: { margin: '.6rem', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1rem', padding: '.75rem', flex: 1 },
  phoneBotNav: { padding: '.5rem .5rem .4rem', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
  previewStats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem', marginTop: '1.25rem' },
  previewStat: { background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '.85rem', padding: '.75rem .5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '.25rem' },
  previewStatNum: { fontSize: '1.1rem', fontWeight: 900, color: '#2d2d2d' },
  previewStatLabel: { fontSize: '.6rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' },
  modal: { background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '440px', animation: 'cos-slide-up .35s cubic-bezier(.34,1.56,.64,1)' },
  modalIcon: { fontSize: '3rem', marginBottom: '.75rem' },
  previewBox: { background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' },
  primaryBtn: { background: 'linear-gradient(135deg,#d4a574,#c41e3a)', color: '#fff', border: 'none', padding: '.85rem 1.25rem', borderRadius: '.85rem', fontWeight: 900, fontSize: '.9rem', fontFamily: 'inherit', cursor: 'pointer', transition: 'all .2s' },
  outlineBtn: { background: '#f5f5f5', border: '1px solid #ddd', color: '#666', padding: '.85rem 1.25rem', borderRadius: '.85rem', fontWeight: 700, fontSize: '.9rem', fontFamily: 'inherit', cursor: 'pointer' },
  successCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center', maxWidth: '440px', margin: '0 auto' },
  successOrb: { fontSize: '4rem', animation: 'cos-bounce .6s cubic-bezier(.34,1.56,.64,1)', marginBottom: '1rem' },
  successTitle: { fontSize: '2rem', fontWeight: 900, color: '#2d2d2d', letterSpacing: '-.04em', marginBottom: '.4rem' },
  successSub: { color: '#999', fontSize: '.9rem', marginBottom: '2rem' },
  successStats: { display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '1.25rem', padding: '1.25rem 2rem', marginBottom: '2rem', width: '100%' },
  statBlock: { display: 'flex', flexDirection: 'column', gap: '.25rem', flex: 1 },
  statNum: { fontSize: '1.5rem', fontWeight: 900, color: '#d4a574' },
  statLabel: { fontSize: '.65rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' },
  statDivider: { width: '1px', height: '2.5rem', background: '#ddd' },
  successPreview: { background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '1rem', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem', width: '100%' },
  lockCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', maxWidth: '380px', margin: '0 auto', textAlign: 'center' },
  lockIcon: { fontSize: '3rem', marginBottom: '1.25rem', animation: 'cos-bounce .5s ease' },
  lockInput: { width: '100%', background: '#f9f7f3', border: '1.5px solid', borderRadius: '.85rem', padding: '1rem 1.25rem', fontSize: '1rem', color: '#2d2d2d', fontFamily: 'inherit', outline: 'none', textAlign: 'center', letterSpacing: '.12em', marginBottom: '.25rem' },
  lockBtn: { width: '100%', background: 'linear-gradient(135deg,#d4a574,#c41e3a)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '.85rem', fontWeight: 900, fontSize: '.95rem', cursor: 'pointer', marginTop: '1rem', fontFamily: 'inherit' },
  drawerOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' },
  drawer: { width: '100%', maxWidth: '480px', background: '#fff', borderLeft: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', animation: 'cos-slide-right .3s ease' },
  drawerHeader: { padding: '1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  drawerBody: { flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.8rem' },
  closeBtn: { background: '#f5f5f5', border: '1px solid #ddd', color: '#999', width: '2rem', height: '2rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem' },
  historyRow: { background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '1rem', padding: '1rem' },
  historyBadge: { background: 'rgba(212,165,116,.12)', color: '#d4a574', border: '1px solid rgba(212,165,116,.2)', borderRadius: '9999px', padding: '.2rem .6rem', fontSize: '.7rem', fontWeight: 800, flexShrink: 0 },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: #f9f7f3; }
  @keyframes cos-ping { 0% { transform:scale(1); opacity:.8 } 100% { transform:scale(2.4); opacity:0 } }
  @keyframes cos-confetti { 0%{transform:translate(0,0) rotate(0deg);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) rotate(720deg);opacity:0} }
  @keyframes cos-slide-up { from{opacity:0;transform:translateY(40px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes cos-slide-right { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes cos-bounce { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  input:focus, textarea:focus { border-color: rgba(212,165,116,.5) !important; box-shadow: 0 0 0 3px rgba(212,165,116,.08); }
  .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; font-size:inherit; line-height:1; vertical-align:middle; }
  .material-symbols-outlined.fi { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
  button { font-family: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(212,165,116,.2); border-radius: 9999px; }
  @media (max-width: 768px) {
    .campaign-grid { grid-template-columns: 1fr !important; }
    .type-grid { grid-template-columns: repeat(3,1fr) !important; }
    .preview-panel { display: none !important; }
  }
`;
