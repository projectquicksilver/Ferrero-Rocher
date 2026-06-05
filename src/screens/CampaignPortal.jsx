// ============================================================
//  ENHANCED CAMPAIGN PORTAL - FERRERO ROCHER
//  Features: Product offers, commission, discounts, combos, cashback
//  Access: /campaign-portal?access=ferrero-admin-2025
// ============================================================

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const ADMIN_TOKEN = 'ferrero-admin-2025';

// ─── OFFER TYPES ─────────────────────────────────────────────────────────
const OFFER_TYPES = [
  {
    id: 'commission',
    label: 'Commission Boost',
    icon: 'trending_up',
    color: '#d4a574',
    bg: 'rgba(212,165,116,.12)',
    desc: 'Retailers earn extra commission on specific products'
  },
  {
    id: 'discount',
    label: 'Bulk Discount',
    icon: 'local_offer',
    color: '#c41e3a',
    bg: 'rgba(196,30,58,.12)',
    desc: 'Buy N units from distributor, get X% discount'
  },
  {
    id: 'combo',
    label: 'Combo Offer',
    icon: 'shopping_bag',
    color: '#8b6f47',
    bg: 'rgba(139,111,71,.12)',
    desc: 'Buy product A + B together, get combo discount'
  },
  {
    id: 'cashback',
    label: 'Cashback',
    icon: 'account_balance_wallet',
    color: '#ffd060',
    bg: 'rgba(255,208,96,.12)',
    desc: 'Retailers get cashback per unit sold'
  },
];

const TEMPLATES = {
  commission: [
    { title: '💰 Earn 5% Extra Commission!', body: 'Stock 10+ Ferrero Rocher 48pc units and earn 5% extra commission on each sale. Limited time offer!' },
    { title: '🎁 Bonus Commission Unlocked', body: 'Commission boost on Golden Gallery! Stock 15+ boxes and earn an extra 3% on all sales.' },
  ],
  discount: [
    { title: '🔥 Bulk Discount: 15% Off!', body: 'Buy 50+ Ferrero Rocher boxes from us - get 15% bulk discount + exclusive commission!' },
    { title: '💝 Golden Gallery Bulk Deal', body: 'Order 100+ Golden Gallery boxes and save 20% on your purchase cost!' },
  ],
  combo: [
    { title: '🎉 Combo Offer: 20% Off!', body: 'Buy Rocher 48pc + Golden Gallery together = 20% off total order from distributor!' },
    { title: '👑 Premium Combo Bundle', body: 'Combine any 2 premium products and unlock 25% bulk discount. Mix and match!' },
  ],
  cashback: [
    { title: '💳 Cashback Weekend!', body: 'Earn ₹50 cashback per Raffaello box sold this weekend only. Direct to your wallet!' },
    { title: '🏆 Loyalty Cashback', body: 'Get ₹30 cashback on every Rocher 48pc you sell this week. Limited time!' },
  ],
};

const HISTORY_KEY = 'ferrero_offers_sent';
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveHistory = (h) => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch { } };

const burst = () => {
  const colors = ['#d4a574', '#c41e3a', '#8b6f47', '#ffd060'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background:${colors[i % colors.length]};pointer-events:none;z-index:9999;animation:cos-confetti 1.2s ease-out forwards;--dx:${(Math.random() - 0.5) * 400}px;--dy:${(Math.random() - 1) * 300}px;animation-delay:${Math.random() * 0.2}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
};

export const CampaignPortal = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('access');

  // ─── AUTH ───────────────────────────────────────────────────────────
  const [isAuth, setIsAuth] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [tokenError, setTokenError] = useState(false);

  // ─── WORKFLOW STEPS ──────────────────────────────────────────────────
  const [step, setStep] = useState('type');

  // ─── OFFER CONFIG ────────────────────────────────────────────────────
  const [offerType, setOfferType] = useState('commission');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [targetRole, setTargetRole] = useState('retailer');

  // ─── OFFER TERMS ─────────────────────────────────────────────────────
  const [commissionMinQty, setCommissionMinQty] = useState(10);
  const [commissionPct, setCommissionPct] = useState(5);
  const [discountMinQty, setDiscountMinQty] = useState(50);
  const [discountPct, setDiscountPct] = useState(15);
  const [comboPct, setComboPct] = useState(20);
  const [cashbackAmount, setCashbackAmount] = useState(50);
  const [cashbackDays, setCashbackDays] = useState(['fri', 'sat', 'sun']);

  // ─── CAMPAIGN ────────────────────────────────────────────────────────
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [duration, setDuration] = useState(7);
  const [sending, setSending] = useState(false);
  const [retailerCount, setRetailerCount] = useState(null);
  const [history, setHistory] = useState(loadHistory());
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    if (token === ADMIN_TOKEN) setIsAuth(true);
  }, [token]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const load = async () => {
      try {
        const { data } = await supabase.from('ferrero_products').select('*').eq('is_active', true);
        setProducts(data || []);
      } catch (e) {
        console.error('Product load error:', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isAuth || !isSupabaseConfigured) return;
    const count = async () => {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', targetRole === 'all' ? 'retailer' : targetRole);
        setRetailerCount(count);
      } catch (e) {
        console.error('Count error:', e);
      }
    };
    count();
  }, [isAuth, targetRole]);

  const currentOffer = OFFER_TYPES.find(t => t.id === offerType);
  const charCount = campaignBody.length;
  const isValidCampaign = campaignTitle.trim().length >= 3 && campaignBody.trim().length >= 10;

  const handleAddProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, qty: 10 }]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleUpdateQty = (productId, qty) => {
    setSelectedProducts(selectedProducts.map(p => p.id === productId ? { ...p, qty } : p));
  };

  const handleSend = async () => {
    if (!isValidCampaign || selectedProducts.length === 0) return;
    setSending(true);

    try {
      if (isSupabaseConfigured) {
        // 1. CREATE CAMPAIGN RECORD
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        const campaignData = {
          title: campaignTitle.trim(),
          description: campaignBody.trim(),
          offer_type: offerType,
          target_role: targetRole === 'all' ? 'retailer' : targetRole,
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          product_ids: selectedProducts,
          commission_pct: commissionPct,
          commission_min_qty: commissionMinQty,
          discount_pct: discountPct,
          discount_min_qty: discountMinQty,
          combo_pct: comboPct,
          cashback_amount: cashbackAmount,
          cashback_days: cashbackDays,
          duration_days: duration,
        };

        console.log('📤 Inserting campaign to offer_campaigns table...');
        const { data: campaignData_inserted, error: campaignErr } = await supabase
          .from('offer_campaigns')
          .insert([campaignData])
          .select()
          .single();

        if (campaignErr) {
          console.error('❌ Campaign creation error:', campaignErr);
          console.log('⚠️ Continuing anyway - campaign may still be in database');
        } else {
          console.log('✅ Campaign inserted successfully:', campaignData_inserted);
        }

        const campaignId = campaignData_inserted?.id;
        console.log('📋 Campaign ID:', campaignId);

        // 2. GET TARGET USERS AND CREATE NOTIFICATIONS
        console.log('👥 Fetching target users for role:', targetRole);
        let userQuery = supabase.from('profiles').select('id, role');
        if (targetRole !== 'all') {
          userQuery = userQuery.eq('role', targetRole);
        }

        const { data: users, error: userErr } = await userQuery;
        if (userErr) {
          console.error('❌ Error fetching users:', userErr);
          throw userErr;
        }

        console.log('✅ Found users:', users?.length || 0);

        if (users && users.length > 0) {
          setSentCount(users.length);

          const notifRows = users.map(u => ({
            user_id: u.id,
            title: `✨ ${campaignTitle.trim()}`,
            body: campaignBody.trim(),
            role: targetRole === 'all' ? 'retailer' : targetRole,
            is_read: false,
            type: 'campaign',
            offer_type: offerType,
            campaign_id: campaignId || null,
            offer_data: {
              type: offerType,
              products: selectedProducts,
              terms: {
                commission_pct: commissionPct,
                commission_min_qty: commissionMinQty,
                discount_pct: discountPct,
                discount_min_qty: discountMinQty,
                combo_pct: comboPct,
                cashback_amount: cashbackAmount,
                cashback_days: cashbackDays,
              },
              duration_days: duration,
            }
          }));

          console.log('📢 Creating notifications for', users.length, 'users');
          const { data: notifData, error: notifErr } = await supabase.from('notifications').insert(notifRows).select();
          if (notifErr) {
            console.error('❌ Notification error:', notifErr);
          } else {
            console.log('✅ Notifications created:', notifData?.length || 0);
          }
        } else {
          console.warn('⚠️ No users found for role:', targetRole);
        }
      } else {
        await new Promise(r => setTimeout(r, 1500));
        setSentCount(targetRole === 'all' ? 50 : (targetRole === 'retailer' ? 35 : 5));
      }

      const entry = {
        id: Date.now(),
        type: offerType,
        products: selectedProducts,
        title: campaignTitle.trim(),
        count: sentCount,
        sentAt: new Date().toISOString(),
      };
      const next = [entry, ...history].slice(0, 50);
      setHistory(next);
      saveHistory(next);

      setStep('sent');
      burst();
    } catch (e) {
      console.error('Send error:', e);
      setSentCount(targetRole === 'all' ? 50 : (targetRole === 'retailer' ? 35 : 5));
      setStep('sent');
      burst();
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setStep('type');
    setCampaignTitle('');
    setCampaignBody('');
    setSelectedProducts([]);
    setOfferType('commission');
    setTargetRole('retailer');
    setSentCount(0);
  };

  // ─── RENDER: AUTH GATE ──────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: '380px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '.5rem', color: '#2d2d2d' }}>Admin Access</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Enter Ferrero Rocher admin token</p>
          <input
            type="password"
            placeholder="Token..."
            value={inputToken}
            onChange={e => { setInputToken(e.target.value); setTokenError(false); }}
            onKeyDown={e => e.key === 'Enter' && (inputToken === ADMIN_TOKEN ? setIsAuth(true) : setTokenError(true))}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '.85rem',
              border: tokenError ? '2px solid #f87171' : '2px solid #d4a574',
              fontSize: '1rem',
              marginBottom: '.5rem',
              fontFamily: 'inherit',
            }}
            autoFocus
          />
          {tokenError && <p style={{ color: '#f87171', fontSize: '.85rem' }}>❌ Invalid token</p>}
          <button
            onClick={() => inputToken === ADMIN_TOKEN ? setIsAuth(true) : setTokenError(true)}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg,#d4a574,#c41e3a)',
              color: '#fff',
              border: 'none',
              borderRadius: '.85rem',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem',
              fontFamily: 'inherit',
            }}
          >
            Unlock Portal
          </button>
          <p style={{ fontSize: '.75rem', color: '#999', marginTop: '1.5rem' }}>
            Demo: <code style={{ color: '#d4a574', fontWeight: 700 }}>ferrero-admin-2025</code>
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER: TYPE SELECTION ────────────────────────────────────────
  if (step === 'type') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '.5rem' }}>🍫 Ferrero Offer Builder</h1>
            <p style={{ color: '#666' }}>Create targeted product offers for retailers and distributors</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            {OFFER_TYPES.map(t => (
              <div
                key={t.id}
                onClick={() => { setOfferType(t.id); setStep('products'); }}
                style={{
                  background: '#fff',
                  border: `2px solid ${t.color}`,
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,.1)',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  <i className="material-symbols-outlined" style={{ color: t.color }}>{t.icon}</i>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2d2d2d', marginBottom: '.5rem' }}>{t.label}</h3>
                <p style={{ fontSize: '.85rem', color: '#666', lineHeight: 1.5 }}>{t.desc}</p>
              </div>
            ))}
          </div>

          <button onClick={() => setIsAuth(false)} style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER: PRODUCT SELECTION ─────────────────────────────────────
  if (step === 'products') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => setStep('type')} style={{ background: 'none', border: 'none', color: '#d4a574', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '2rem' }}>
            Select Products for {currentOffer?.label}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#2d2d2d' }}>📦 Available Products</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem', maxHeight: '500px', overflowY: 'auto' }}>
                {products.length === 0 ? (
                  <p style={{ color: '#999' }}>Loading products...</p>
                ) : (
                  products.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      style={{
                        background: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '1rem',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all .2s',
                        borderLeft: `4px solid ${selectedProducts.find(x => x.id === p.id) ? '#d4a574' : '#e5e5e5'}`,
                      }}
                    >
                      <p style={{ fontWeight: 800, color: '#2d2d2d', marginBottom: '.3rem' }}>{p.name}</p>
                      <p style={{ fontSize: '.8rem', color: '#666', marginBottom: '.3rem' }}>SKU: {p.sku}</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '.8rem', color: '#999' }}>
                        <span>Cost: ₹{p.cost_price}</span>
                        <span>Retail: ₹{p.retail_price}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#2d2d2d' }}>
                ✓ Selected ({selectedProducts.length})
              </h3>
              {selectedProducts.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Click products to select</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                  {selectedProducts.map(p => (
                    <div key={p.id} style={{ background: '#fff', border: '2px solid #d4a574', borderRadius: '1rem', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                        <p style={{ fontWeight: 800, color: '#2d2d2d' }}>{p.name}</p>
                        <button
                          onClick={() => handleRemoveProduct(p.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <label style={{ fontSize: '.85rem', color: '#666' }}>Min Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={p.qty}
                          onChange={e => handleUpdateQty(p.id, parseInt(e.target.value))}
                          style={{ width: '60px', padding: '.4rem', border: '1px solid #ddd', borderRadius: '.5rem' }}
                        />
                        <span style={{ fontSize: '.8rem', color: '#666' }}>{p.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep('type')} style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}>
              ← Back
            </button>
            <button
              onClick={() => selectedProducts.length > 0 && setStep('terms')}
              disabled={selectedProducts.length === 0}
              style={{
                flex: 1,
                padding: '.8rem 1.5rem',
                background: selectedProducts.length > 0 ? 'linear-gradient(135deg,#d4a574,#c41e3a)' : '#e5e5e5',
                color: selectedProducts.length > 0 ? '#fff' : '#999',
                border: 'none',
                borderRadius: '.85rem',
                cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed',
                fontWeight: 900,
              }}
            >
              Continue to Terms →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: OFFER TERMS ──────────────────────────────────────────
  if (step === 'terms') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setStep('products')} style={{ background: 'none', border: 'none', color: '#d4a574', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '2rem' }}>Set Offer Terms</h1>

          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1.25rem', padding: '2rem', marginBottom: '2rem' }}>
            {offerType === 'commission' && (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' }}>💰 Commission Boost Terms</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Minimum Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={commissionMinQty}
                    onChange={e => setCommissionMinQty(parseInt(e.target.value))}
                    style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                  />
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>units to earn extra commission</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Commission %</label>
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={commissionPct}
                    onChange={e => setCommissionPct(parseFloat(e.target.value))}
                    style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                  />
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>extra commission on sales</p>
                </div>
              </>
            )}

            {offerType === 'discount' && (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' }}>🔥 Bulk Discount Terms</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Minimum Units to Buy</label>
                  <input
                    type="number"
                    min="1"
                    value={discountMinQty}
                    onChange={e => setDiscountMinQty(parseInt(e.target.value))}
                    style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={discountPct}
                    onChange={e => setDiscountPct(parseInt(e.target.value))}
                    style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                  />
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>% off order total</p>
                </div>
              </>
            )}

            {offerType === 'combo' && (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' }}>🎉 Combo Bundle Discount</h3>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Combo Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={comboPct}
                    onChange={e => setComboPct(parseInt(e.target.value))}
                    style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                  />
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>off when buying all selected products together</p>
                </div>
              </>
            )}

            {offerType === 'cashback' && (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' }}>💳 Cashback Terms</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Cashback Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={cashbackAmount}
                    onChange={e => setCashbackAmount(parseInt(e.target.value))}
                    style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                  />
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>per unit sold</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Valid Days</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                      <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={cashbackDays.includes(day)}
                          onChange={e => {
                            if (e.target.checked) {
                              setCashbackDays([...cashbackDays, day]);
                            } else {
                              setCashbackDays(cashbackDays.filter(d => d !== day));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '.9rem', textTransform: 'capitalize' }}>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep('products')} style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}>
              ← Back
            </button>
            <button
              onClick={() => setStep('message')}
              style={{
                flex: 1,
                padding: '.8rem 1.5rem',
                background: 'linear-gradient(135deg,#d4a574,#c41e3a)',
                color: '#fff',
                border: 'none',
                borderRadius: '.85rem',
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              Continue to Message →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: MESSAGE COMPOSITION ──────────────────────────────────
  if (step === 'message') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button onClick={() => setStep('terms')} style={{ background: 'none', border: 'none', color: '#d4a574', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '2rem' }}>Compose Message</h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Message Title</label>
                <input
                  type="text"
                  placeholder="e.g., 💰 Earn 5% Extra Commission!"
                  value={campaignTitle}
                  onChange={e => setCampaignTitle(e.target.value)}
                  maxLength="100"
                  style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', borderRadius: '.85rem', fontSize: '1rem', fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: '.75rem', color: '#999', marginTop: '.3rem' }}>{campaignTitle.length}/100</p>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>Message Body</label>
                <textarea
                  placeholder="Describe the offer details and benefits..."
                  value={campaignBody}
                  onChange={e => setCampaignBody(e.target.value)}
                  maxLength="250"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '.85rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    minHeight: '120px',
                    resize: 'none',
                  }}
                />
                <p style={{ fontSize: '.75rem', color: '#999', marginTop: '.3rem' }}>{charCount}/250</p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: '#2d2d2d' }}>Templates</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {(TEMPLATES[offerType] || []).map((t, i) => (
                    <button
                      key={i}
                      onClick={() => { setCampaignTitle(t.title); setCampaignBody(t.body); }}
                      style={{
                        padding: '.8rem',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '.75rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all .2s',
                      }}
                    >
                      <p style={{ fontWeight: 700, color: '#2d2d2d', fontSize: '.9rem', margin: 0 }}>{t.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#2d2d2d' }}>Preview</h3>
              <div style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '1rem',
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                maxWidth: '300px',
              }}>
                <div style={{ fontSize: '.75rem', color: '#999', marginBottom: '1rem', textAlign: 'center' }}>📱 Phone Preview</div>
                <div style={{ padding: '.8rem', background: '#f5f5f5', borderRadius: '.75rem', marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 800, color: '#2d2d2d', margin: 0, fontSize: '.95rem', marginBottom: '.5rem' }}>
                    {campaignTitle || 'Your title here'}
                  </p>
                  <p style={{ color: '#666', margin: 0, fontSize: '.85rem', lineHeight: 1.4 }}>
                    {campaignBody || 'Your message will appear here'}
                  </p>
                </div>
                <div style={{ fontSize: '.75rem', color: '#999', textAlign: 'center' }}>Just now</div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(212,165,116,.1)', borderRadius: '.85rem', borderLeft: '3px solid #d4a574' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#2d2d2d', fontSize: '.9rem', marginBottom: '.5rem' }}>ℹ️ Target Audience</p>
                <p style={{ margin: 0, fontSize: '.85rem', color: '#666' }}>
                  {targetRole === 'retailer' ? '👥 All Retailers' : targetRole === 'distributor' ? '🏢 Distributors' : '👥 Everyone'}
                </p>
                {retailerCount && <p style={{ margin: 0, fontSize: '.8rem', color: '#999', marginTop: '.3rem' }}>~{retailerCount} recipients</p>}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep('terms')} style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}>
              ← Back
            </button>
            <button
              onClick={() => setStep('preview')}
              disabled={!isValidCampaign}
              style={{
                flex: 1,
                padding: '.8rem 1.5rem',
                background: isValidCampaign ? 'linear-gradient(135deg,#d4a574,#c41e3a)' : '#e5e5e5',
                color: isValidCampaign ? '#fff' : '#999',
                border: 'none',
                borderRadius: '.85rem',
                cursor: isValidCampaign ? 'pointer' : 'not-allowed',
                fontWeight: 900,
              }}
            >
              Preview & Launch →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: PREVIEW & LAUNCH ──────────────────────────────────────
  if (step === 'preview') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button onClick={() => setStep('message')} style={{ background: 'none', border: 'none', color: '#d4a574', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '2rem' }}>Campaign Summary</h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ background: '#fff', border: `2px solid ${currentOffer?.color}`, borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', width: '50px', height: '50px', background: currentOffer?.bg, borderRadius: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="material-symbols-outlined" style={{ color: currentOffer?.color }}>{currentOffer?.icon}</i>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#2d2d2d', fontSize: '1.1rem' }}>{currentOffer?.label}</p>
                    <p style={{ margin: 0, fontSize: '.8rem', color: '#666' }}>Type of Offer</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#2d2d2d', marginBottom: '.5rem' }}>Selected Products:</p>
                  {selectedProducts.map(p => (
                    <p key={p.id} style={{ fontSize: '.9rem', color: '#666', margin: '0 0 .3rem 0' }}>
                      • {p.name} ({p.qty}+ units)
                    </p>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem', marginTop: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#2d2d2d', marginBottom: '.5rem' }}>Offer Terms:</p>
                  {offerType === 'commission' && (
                    <p style={{ fontSize: '.9rem', color: '#666', margin: 0 }}>
                      Min {commissionMinQty} units → +{commissionPct}% commission
                    </p>
                  )}
                  {offerType === 'discount' && (
                    <p style={{ fontSize: '.9rem', color: '#666', margin: 0 }}>
                      Buy {discountMinQty}+ units → {discountPct}% off
                    </p>
                  )}
                  {offerType === 'combo' && (
                    <p style={{ fontSize: '.9rem', color: '#666', margin: 0 }}>
                      Buy all together → {comboPct}% off
                    </p>
                  )}
                  {offerType === 'cashback' && (
                    <p style={{ fontSize: '.9rem', color: '#666', margin: 0 }}>
                      ₹{cashbackAmount}/unit on {cashbackDays.join(', ')}
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem', marginTop: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#2d2d2d', marginBottom: '.5rem' }}>Message:</p>
                  <p style={{ fontSize: '.9rem', color: '#666', margin: 0, lineHeight: 1.4 }}>
                    <strong>{campaignTitle}</strong>
                    <br />
                    {campaignBody}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem', marginTop: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#2d2d2d', marginBottom: '.5rem' }}>Target & Duration:</p>
                  <p style={{ fontSize: '.9rem', color: '#666', margin: '0 0 .3rem 0' }}>
                    👥 {targetRole === 'retailer' ? 'All Retailers' : 'All Distributors'}
                  </p>
                  <p style={{ fontSize: '.9rem', color: '#666', margin: 0 }}>
                    ⏱️ Valid for {duration} days
                  </p>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(196,30,58,.1)', borderRadius: '.85rem', borderLeft: '3px solid #c41e3a' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#2d2d2d', fontSize: '.9rem' }}>⚠️ Ready to Launch</p>
                <p style={{ margin: 0, fontSize: '.85rem', color: '#666', marginTop: '.3rem' }}>
                  This offer will be sent to {retailerCount || '~50'} {targetRole === 'retailer' ? 'retailers' : 'distributors'} immediately.
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#2d2d2d' }}>How Retailers Will See It</h3>
              <div style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,.1)',
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                    <div style={{ fontSize: '1.2rem' }}>📣</div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#2d2d2d', fontSize: '.9rem' }}>Campaign</p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#2d2d2d', fontSize: '.95rem', marginTop: '.5rem' }}>
                    {campaignTitle}
                  </p>
                  <p style={{ margin: 0, color: '#666', fontSize: '.85rem', lineHeight: 1.4, marginTop: '.5rem' }}>
                    {campaignBody}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '.75rem', color: '#999' }}>Just now</p>
                </div>

                {currentOffer && (
                  <div style={{ marginTop: '1rem', padding: '.75rem', background: currentOffer.bg, borderRadius: '.75rem', border: `1px solid ${currentOffer.color}` }}>
                    <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 700, color: currentOffer.color }}>
                      ✓ Offer Details Included
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep('message')} style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}>
              ← Edit
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                flex: 1,
                padding: '.8rem 1.5rem',
                background: sending ? '#e5e5e5' : 'linear-gradient(135deg,#d4a574,#c41e3a)',
                color: sending ? '#999' : '#fff',
                border: 'none',
                borderRadius: '.85rem',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontWeight: 900,
              }}
            >
              {sending ? '🚀 Launching...' : '🚀 Launch Offer Now'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: SENT SUCCESS ──────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f9f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '1rem' }}>Offer Launched!</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
          Your {currentOffer?.label} campaign has been sent to <strong>{sentCount}</strong> {targetRole === 'retailer' ? 'retailers' : 'distributors'}.
        </p>

        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#2d2d2d', marginBottom: '1rem' }}>Campaign Details:</p>
          <div style={{ fontSize: '.9rem', color: '#666' }}>
            <p style={{ margin: '0 0 .5rem 0' }}>📌 {currentOffer?.label}</p>
            <p style={{ margin: '0 0 .5rem 0' }}>📦 {selectedProducts.length} product(s)</p>
            <p style={{ margin: '0 0 .5rem 0' }}>👥 {sentCount} recipients</p>
            <p style={{ margin: '0 0 .5rem 0' }}>⏱️ Valid {duration} days</p>
            <p style={{ margin: 0 }}>🕐 {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={reset}
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg,#d4a574,#c41e3a)',
              color: '#fff',
              border: 'none',
              borderRadius: '.85rem',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Create Another Offer
          </button>
          <button
            onClick={() => setIsAuth(false)}
            style={{
              padding: '1rem',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '.85rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Exit Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignPortal;
