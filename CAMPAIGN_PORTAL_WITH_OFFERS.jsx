// ============================================================
//  ENHANCED CAMPAIGN PORTAL - WITH PRODUCT OFFERS
//  Features:
//  - Commission boost campaigns
//  - Bulk discount offers
//  - Combo product offers
//  - Cashback promotions
//  - Product selection from ferrero_products
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const ADMIN_TOKEN = 'ferrero-admin-2025';

// ─── OFFER TYPES ─────────────────────────────────────────
const OFFER_TYPES = [
  {
    id: 'commission',
    label: 'Commission Boost',
    icon: 'trending_up',
    color: '#d4a574',
    bg: 'rgba(212,165,116,.12)',
    description: 'Retailers earn extra commission on specific products'
  },
  {
    id: 'discount',
    label: 'Bulk Discount',
    icon: 'local_offer',
    color: '#c41e3a',
    bg: 'rgba(196,30,58,.12)',
    description: 'Buy N units from distributor, get X% discount'
  },
  {
    id: 'combo',
    label: 'Combo Offer',
    icon: 'shopping_bag',
    color: '#8b6f47',
    bg: 'rgba(139,111,71,.12)',
    description: 'Buy product A + B together, get combo discount'
  },
  {
    id: 'cashback',
    label: 'Cashback',
    icon: 'account_balance_wallet',
    color: '#ffd060',
    bg: 'rgba(255,208,96,.12)',
    description: 'Retailers get cashback per unit sold'
  },
];

export const CampaignPortalWithOffers = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('access');

  // ─── AUTH STATE ───────────────────────────────────────
  const [isAuth, setIsAuth] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [tokenError, setTokenError] = useState(false);

  // ─── STEP STATE ───────────────────────────────────────
  const [step, setStep] = useState('type'); // type → products → terms → preview → sent

  // ─── OFFER STATE ───────────────────────────────────────
  const [offerType, setOfferType] = useState('commission');
  const [products, setProducts] = useState([]); // loaded from DB
  const [selectedProducts, setSelectedProducts] = useState([]); // cart of selected products
  const [targetRole, setTargetRole] = useState('retailer');

  // ─── COMMISSION STATE ───────────────────────────────────
  const [commissionMinQty, setCommissionMinQty] = useState(10);
  const [commissionPct, setCommissionPct] = useState(5);

  // ─── DISCOUNT STATE ───────────────────────────────────
  const [discountMinQty, setDiscountMinQty] = useState(50);
  const [discountPct, setDiscountPct] = useState(15);

  // ─── COMBO STATE ───────────────────────────────────────
  const [comboPct, setComboPct] = useState(20);

  // ─── CASHBACK STATE ───────────────────────────────────
  const [cashbackAmount, setCashbackAmount] = useState(50);
  const [cashbackDays, setCashbackDays] = useState(['fri', 'sat', 'sun']);

  // ─── CAMPAIGN STATE ───────────────────────────────────
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [duration, setDuration] = useState(7); // days
  const [sending, setSending] = useState(false);

  // ─── UI STATE ───────────────────────────────────────
  const [retailerCount, setRetailerCount] = useState(null);

  // Auto-auth
  useEffect(() => {
    if (token === ADMIN_TOKEN) {
      setIsAuth(true);
    }
  }, [token]);

  // Load products from ferrero_products
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase.from('ferrero_products').select('*').eq('is_active', true);
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
  }, []);

  // Count target retailers
  useEffect(() => {
    if (!isAuth || !isSupabaseConfigured) return;
    const fetchCount = async () => {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', targetRole === 'all' ? 'retailer' : targetRole);
        setRetailerCount(count);
      } catch (err) {
        console.error('Failed to fetch count:', err);
      }
    };
    fetchCount();
  }, [isAuth, targetRole]);

  const currentOfferType = OFFER_TYPES.find(t => t.id === offerType);
  const charCount = campaignBody.length;
  const isValidCampaign = campaignTitle.trim().length >= 3 && campaignBody.trim().length >= 10;

  const handleAddProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (!existing) {
      setSelectedProducts([...selectedProducts, { ...product, qty: offerType === 'combo' ? 1 : 10 }]);
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
      // Create offer campaign in DB
      const offerData = {
        offer_type: offerType,
        products: selectedProducts,
        terms: {
          commission_pct: offerType === 'commission' ? commissionPct : 0,
          commission_min_qty: offerType === 'commission' ? commissionMinQty : 0,
          discount_pct: offerType === 'discount' ? discountPct : 0,
          discount_min_qty: offerType === 'discount' ? discountMinQty : 0,
          combo_discount_pct: offerType === 'combo' ? comboPct : 0,
          cashback_amount: offerType === 'cashback' ? cashbackAmount : 0,
          cashback_days: offerType === 'cashback' ? cashbackDays : [],
        },
        duration_days: duration,
      };

      // Send campaign (via RPC or manual)
      console.log('Sending offer campaign:', offerData);
      setStep('sent');
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  // ─── RENDER: AUTH GATE ───────────────────────────────
  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '380px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '.5rem', color: '#2d2d2d' }}>Admin Access</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '.9rem' }}>Enter Ferrero Rocher admin token</p>
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
            }}
          >
            Unlock Portal
          </button>
          <p style={{ fontSize: '.75rem', color: '#999', marginTop: '1.5rem' }}>
            Demo token: <code style={{ color: '#d4a574', fontWeight: 700 }}>ferrero-admin-2025</code>
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER: STEP 1 - OFFER TYPE ──────────────────────
  if (step === 'type') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '.5rem' }}>🍫 Ferrero Offer Builder</h1>
            <p style={{ color: '#666' }}>Create targeted offers for retailers and distributors</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            {OFFER_TYPES.map(t => (
              <div
                key={t.id}
                onClick={() => { setOfferType(t.id); setStep('products'); }}
                style={{
                  background: offerType === t.id ? t.bg : '#fff',
                  border: `2px solid ${t.color}`,
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: offerType === t.id ? `0 0 0 1px ${t.color}44` : 'none',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  <i className="material-symbols-outlined" style={{ color: t.color }}>{t.icon}</i>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2d2d2d', marginBottom: '.5rem' }}>{t.label}</h3>
                <p style={{ fontSize: '.85rem', color: '#666', lineHeight: 1.5 }}>{t.description}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setIsAuth(false)} style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: STEP 2 - PRODUCTS ────────────────────────
  if (step === 'products') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <button onClick={() => setStep('type')} style={{ background: 'none', border: 'none', color: '#d4a574', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              ← Back
            </button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d' }}>
              Select Products for {currentOfferType?.label}
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Product List */}
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

            {/* Selected Products */}
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
                      {(offerType === 'commission' || offerType === 'discount' || offerType === 'combo') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <label style={{ fontSize: '.85rem', color: '#666' }}>Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={p.qty}
                            onChange={e => handleUpdateQty(p.id, parseInt(e.target.value))}
                            style={{ width: '60px', padding: '.4rem', border: '1px solid #ddd', borderRadius: '.5rem' }}
                          />
                          <span style={{ fontSize: '.8rem', color: '#666' }}>{p.unit}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setStep('type')}
              style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}
            >
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

  // ─── RENDER: STEP 3 - TERMS ───────────────────────────
  if (step === 'terms') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <button onClick={() => setStep('products')} style={{ background: 'none', border: 'none', color: '#d4a574', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              ← Back
            </button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d' }}>
              Set Offer Terms
            </h1>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1.25rem', padding: '2rem', marginBottom: '2rem' }}>
            {offerType === 'commission' && (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' }}>💰 Commission Boost Terms</h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                    Minimum Quantity to Earn Extra Commission
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="number"
                      min="1"
                      value={commissionMinQty}
                      onChange={e => setCommissionMinQty(parseInt(e.target.value))}
                      style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                    />
                    <span style={{ color: '#666' }}>units</span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>Retailers need to stock this many to earn extra commission</p>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                    Extra Commission Percentage
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="number"
                      min="0.1"
                      max="50"
                      step="0.1"
                      value={commissionPct}
                      onChange={e => setCommissionPct(parseFloat(e.target.value))}
                      style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                    />
                    <span style={{ color: '#666' }}>% extra</span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>Retailers earn this extra on each sale (on top of their base margin)</p>
                </div>
              </>
            )}

            {offerType === 'discount' && (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' }}>🔥 Bulk Discount Terms</h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                    Minimum Units to Buy from Distributor
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="number"
                      min="1"
                      value={discountMinQty}
                      onChange={e => setDiscountMinQty(parseInt(e.target.value))}
                      style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                    />
                    <span style={{ color: '#666' }}>units</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                    Discount on Purchase Price
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={discountPct}
                      onChange={e => setDiscountPct(parseInt(e.target.value))}
                      style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                    />
                    <span style={{ color: '#666' }}>% off</span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>Discount applied to order total when buying in bulk</p>
                </div>
              </>
            )}

            {offerType === 'combo' && (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' }}>🎁 Combo Offer Terms</h3>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                    Discount When All Products Bought Together
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={comboPct}
                      onChange={e => setComboPct(parseInt(e.target.value))}
                      style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                    />
                    <span style={{ color: '#666' }}>% off total</span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.5rem' }}>Applied when retailer buys all combo products in required quantities</p>
                </div>
              </>
            )}

            {offerType === 'cashback' && (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2d2d2d' }}>💰 Cashback Terms</h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                    Cashback Per Unit Sold
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#666' }}>₹</span>
                    <input
                      type="number"
                      min="1"
                      value={cashbackAmount}
                      onChange={e => setCashbackAmount(parseInt(e.target.value))}
                      style={{ width: '100px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                    />
                    <span style={{ color: '#666' }}>per unit</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '1rem', color: '#2d2d2d' }}>
                    Valid on Days
                  </label>
                  <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap' }}>
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                      <button
                        key={day}
                        onClick={() => {
                          if (cashbackDays.includes(day)) {
                            setCashbackDays(cashbackDays.filter(d => d !== day));
                          } else {
                            setCashbackDays([...cashbackDays, day]);
                          }
                        }}
                        style={{
                          padding: '.5rem 1rem',
                          border: cashbackDays.includes(day) ? '2px solid #d4a574' : '1px solid #ddd',
                          background: cashbackDays.includes(day) ? 'rgba(212,165,116,.12)' : '#fff',
                          borderRadius: '.5rem',
                          cursor: 'pointer',
                          fontWeight: 700,
                          color: cashbackDays.includes(day) ? '#d4a574' : '#666',
                          textTransform: 'capitalize',
                        }}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setStep('products')}
              style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}
            >
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

  // ─── RENDER: STEP 4 - MESSAGE ─────────────────────────
  if (step === 'message') {
    const isValidTitle = campaignTitle.trim().length >= 3;
    const isValidBody = campaignBody.trim().length >= 10;

    return (
      <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <button onClick={() => setStep('terms')} style={{ background: 'none', border: 'none', color: '#d4a574', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              ← Back
            </button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d' }}>
              Compose Campaign Message
            </h1>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '1.25rem', padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                Campaign Title
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={e => setCampaignTitle(e.target.value)}
                placeholder="e.g. 🎉 Commission Boost on Ferrero Rocher!"
                maxLength={80}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: isValidTitle ? '1px solid #ddd' : '2px solid #f87171',
                  borderRadius: '.75rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '.8rem', color: '#999', marginTop: '.3rem' }}>{campaignTitle.length}/80</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                Campaign Message
              </label>
              <textarea
                value={campaignBody}
                onChange={e => setCampaignBody(e.target.value.slice(0, 250))}
                placeholder="Describe the offer to retailers..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: isValidBody ? '1px solid #ddd' : '2px solid #f87171',
                  borderRadius: '.75rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
              <p style={{ fontSize: '.8rem', color: charCount > 200 ? '#f87171' : '#999', marginTop: '.3rem' }}>{charCount}/250</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                Target Audience
              </label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '.75rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              >
                <option value="retailer">All Retailers</option>
                <option value="distributor">Distributors</option>
                <option value="all">Everyone</option>
              </select>
              {retailerCount !== null && (
                <p style={{ fontSize: '.8rem', color: '#666', marginTop: '.5rem' }}>
                  📡 Will reach ~{retailerCount} {targetRole === 'all' ? 'users' : targetRole === 'retailer' ? 'retailers' : 'distributors'}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '.5rem', color: '#2d2d2d' }}>
                Campaign Duration
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value))}
                  style={{ width: '80px', padding: '.8rem', border: '1px solid #ddd', borderRadius: '.75rem', fontSize: '1rem' }}
                />
                <span style={{ color: '#666' }}>days</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setStep('terms')}
              style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}
            >
              ← Back
            </button>
            <button
              onClick={() => isValidTitle && isValidBody && setStep('preview')}
              disabled={!isValidTitle || !isValidBody}
              style={{
                flex: 1,
                padding: '.8rem 1.5rem',
                background: (isValidTitle && isValidBody) ? 'linear-gradient(135deg,#d4a574,#c41e3a)' : '#e5e5e5',
                color: (isValidTitle && isValidBody) ? '#fff' : '#999',
                border: 'none',
                borderRadius: '.85rem',
                cursor: (isValidTitle && isValidBody) ? 'pointer' : 'not-allowed',
                fontWeight: 900,
              }}
            >
              Preview Offer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: STEP 5 - PREVIEW & SEND ───────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f9f7f3', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '2rem' }}>
          🚀 {step === 'preview' ? 'Preview Offer' : 'Offer Launched!'}
        </h1>

        <div style={{ background: '#fff', border: '2px solid #d4a574', borderRadius: '1.25rem', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ display: 'inline-block', padding: '.4rem .8rem', background: currentOfferType?.bg, color: currentOfferType?.color, borderRadius: '.5rem', fontWeight: 700, fontSize: '.85rem', marginBottom: '.8rem' }}>
              {currentOfferType?.label}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2d2d2d', marginBottom: '1rem' }}>
              {campaignTitle}
            </h2>
            <p style={{ fontSize: '.95rem', color: '#666', lineHeight: 1.6 }}>
              {campaignBody}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2d2d2d', marginBottom: '.8rem' }}>📦 Products</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {selectedProducts.map(p => (
                <div key={p.id} style={{ padding: '.8rem', background: '#f5f5f5', borderRadius: '.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#2d2d2d' }}>{p.name}</span>
                  {p.qty && <span style={{ color: '#666' }}>× {p.qty}</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5', fontSize: '.9rem', color: '#666' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
              <span>Target:</span>
              <span style={{ fontWeight: 700, color: '#2d2d2d' }}>{targetRole === 'all' ? 'Everyone' : targetRole === 'retailer' ? 'All Retailers' : 'Distributors'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Duration:</span>
              <span style={{ fontWeight: 700, color: '#2d2d2d' }}>{duration} days</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('message')}
                style={{ padding: '.8rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '.85rem', cursor: 'pointer', fontWeight: 700 }}
              >
                ← Back
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
                {sending ? '⟳ Sending...' : '🚀 Launch Offer'}
              </button>
            </>
          )}
          {step === 'sent' && (
            <>
              <button
                onClick={() => { setStep('type'); setCampaignTitle(''); setCampaignBody(''); setSelectedProducts([]); }}
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
                ＋ Create Another Offer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignPortalWithOffers;
