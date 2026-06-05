// ============================================================
// UPDATE FOR src/screens/Notifications.jsx
// Display campaign notifications with offer details
// Ferrero Rocher theme colors
// ============================================================

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { AppLayout } from '../components/layout/AppLayout';

const OFFER_ICONS = {
  commission: '💰',
  discount: '🔥',
  combo: '🎁',
  cashback: '💳',
};

export const NotificationsWithCampaigns = () => {
  const { notifications, FERRERO_THEME, claimCampaign, showToast } = useAppContext();
  const [expandedNotif, setExpandedNotif] = useState(null);

  // Separate campaigns from regular notifications
  const { campaigns, regular } = useMemo(() => {
    return {
      campaigns: notifications.filter(n => n.type === 'campaign' && n.offer_data),
      regular: notifications.filter(n => !n.type === 'campaign' || !n.offer_data)
    };
  }, [notifications]);

  const handleClaimOffer = async (campaignId) => {
    const success = await claimCampaign(campaignId);
    if (success) {
      showToast('✓ Offer claimed!', 'success');
    }
  };

  return (
    <AppLayout>
      <div className="screen active" style={{ background: '#f9f7f3', paddingBottom: '2rem' }}>
        <div className="scroller">

          {/* Header */}
          <div style={{ padding: '1.5rem 1rem 0', marginBottom: '1rem' }}>
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#2d2d2d',
              marginBottom: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🎁 Notifications
            </h1>
            <p style={{ fontSize: '.85rem', color: '#666', margin: 0 }}>
              {campaigns.length > 0 ? `${campaigns.length} active offers` : 'No active offers yet'}
            </p>
          </div>

          {/* CAMPAIGNS SECTION */}
          {campaigns.length > 0 && (
            <div style={{ padding: '0 1rem 1.5rem' }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: '#d4a574',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ✨ Special Offers
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {campaigns.map(notif => {
                  const offer = notif.offer_data;
                  const icon = OFFER_ICONS[offer?.type] || '📣';
                  const isExpanded = expandedNotif === notif.id;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => setExpandedNotif(isExpanded ? null : notif.id)}
                      style={{
                        background: '#fff',
                        border: `2px solid ${FERRERO_THEME.primary}`,
                        borderRadius: '1.25rem',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: isExpanded ? '0 8px 24px rgba(212,165,116,.15)' : '0 2px 8px rgba(0,0,0,.08)',
                        transform: isExpanded ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      {/* Title & Icon */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          fontSize: '2rem',
                          minWidth: '2.5rem',
                          height: '2.5rem',
                          background: `rgba(212,165,116,.1)`,
                          borderRadius: '.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: '#2d2d2d',
                            margin: '0 0 0.3rem 0'
                          }}>
                            {notif.title}
                          </h3>
                          <p style={{
                            fontSize: '.8rem',
                            color: '#666',
                            margin: 0,
                            lineHeight: 1.4
                          }}>
                            {notif.body}
                          </p>
                        </div>
                        <span style={{
                          color: FERRERO_THEME.primary,
                          fontSize: '1.2rem'
                        }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && offer && (
                        <div style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: `1px solid ${FERRERO_THEME.border}`,
                          animation: 'slideIn 0.3s ease-out'
                        }}>

                          {/* Offer Terms */}
                          <div style={{
                            background: '#f9f7f3',
                            border: `1px solid ${FERRERO_THEME.border}`,
                            borderRadius: '1rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                          }}>
                            <h4 style={{
                              fontSize: '.9rem',
                              fontWeight: 800,
                              color: FERRERO_THEME.accent,
                              margin: '0 0 0.75rem 0',
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em'
                            }}>
                              Offer Terms
                            </h4>

                            {offer.type === 'commission' && (
                              <div>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '.85rem', color: '#666' }}>
                                  <strong>Earn Extra Commission</strong>
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                  <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${FERRERO_THEME.border}` }}>
                                    <p style={{ fontSize: '.75rem', color: '#999', margin: '0 0 0.3rem 0' }}>Min Units</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: FERRERO_THEME.primary, margin: 0 }}>
                                      {offer.terms?.commission_min_qty}
                                    </p>
                                  </div>
                                  <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${FERRERO_THEME.border}` }}>
                                    <p style={{ fontSize: '.75rem', color: '#999', margin: '0 0 0.3rem 0' }}>Commission</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: FERRERO_THEME.secondary, margin: 0 }}>
                                      {offer.terms?.commission_pct}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {offer.type === 'discount' && (
                              <div>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '.85rem', color: '#666' }}>
                                  <strong>Bulk Order Discount</strong>
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                  <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${FERRERO_THEME.border}` }}>
                                    <p style={{ fontSize: '.75rem', color: '#999', margin: '0 0 0.3rem 0' }}>Min Cartons</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: FERRERO_THEME.primary, margin: 0 }}>
                                      {offer.terms?.discount_min_qty}
                                    </p>
                                  </div>
                                  <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${FERRERO_THEME.border}` }}>
                                    <p style={{ fontSize: '.75rem', color: '#999', margin: '0 0 0.3rem 0' }}>Discount</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#78f275', margin: 0 }}>
                                      {offer.terms?.discount_pct}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {offer.type === 'cashback' && (
                              <div>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '.85rem', color: '#666' }}>
                                  <strong>Cashback per Unit</strong>
                                </p>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                  <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${FERRERO_THEME.border}`, flex: 1 }}>
                                    <p style={{ fontSize: '.75rem', color: '#999', margin: '0 0 0.3rem 0' }}>Amount</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: FERRERO_THEME.primary, margin: 0 }}>
                                      ₹{offer.terms?.cashback_amount}
                                    </p>
                                  </div>
                                </div>
                                <p style={{ fontSize: '.8rem', color: '#666', margin: '0 0 0.5rem 0' }}>
                                  Valid Days:
                                </p>
                                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                  {(offer.terms?.cashback_days || []).map(day => (
                                    <span
                                      key={day}
                                      style={{
                                        background: FERRERO_THEME.primary,
                                        color: '#fff',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '.7rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {day}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {offer.type === 'combo' && (
                              <div>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '.85rem', color: '#666' }}>
                                  <strong>Bundle Discount</strong>
                                </p>
                                <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${FERRERO_THEME.border}` }}>
                                  <p style={{ fontSize: '.75rem', color: '#999', margin: '0 0 0.3rem 0' }}>Save</p>
                                  <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#78f275', margin: 0 }}>
                                    {offer.terms?.combo_discount_pct}% when buying together
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Products */}
                          {offer.products && offer.products.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                              <h4 style={{
                                fontSize: '.9rem',
                                fontWeight: 800,
                                color: FERRERO_THEME.accent,
                                margin: '0 0 0.5rem 0'
                              }}>
                                Products
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {offer.products.map((prod, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      background: '#fff',
                                      padding: '0.75rem',
                                      borderRadius: '0.75rem',
                                      border: `1px solid ${FERRERO_THEME.border}`,
                                      fontSize: '.85rem'
                                    }}
                                  >
                                    <p style={{ margin: 0, fontWeight: 700, color: '#2d2d2d' }}>
                                      {prod.name}
                                    </p>
                                    <p style={{ margin: '0.2rem 0 0 0', color: '#666', fontSize: '.75rem' }}>
                                      Min qty: {prod.qty || 'N/A'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Valid Until */}
                          {offer.duration_days && (
                            <div style={{
                              background: `${FERRERO_THEME.primary}15`,
                              border: `1px solid ${FERRERO_THEME.primary}`,
                              borderRadius: '0.75rem',
                              padding: '0.75rem',
                              marginBottom: '1rem',
                              fontSize: '.85rem'
                            }}>
                              <p style={{ margin: 0, color: FERRERO_THEME.accent, fontWeight: 700 }}>
                                ⏱️ Valid for {offer.duration_days} days
                              </p>
                            </div>
                          )}

                          {/* Claim Button */}
                          {!notif.is_claimed && (
                            <button
                              onClick={() => handleClaimOffer(notif.campaign_id)}
                              style={{
                                width: '100%',
                                padding: '1rem',
                                background: `linear-gradient(135deg, ${FERRERO_THEME.primary}, ${FERRERO_THEME.secondary})`,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.85rem',
                                fontWeight: 900,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 12px rgba(212,165,116,.25)'
                              }}
                              onMouseOver={e => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(212,165,116,.35)';
                              }}
                              onMouseOut={e => {
                                e.target.style.transform = 'none';
                                e.target.style.boxShadow = '0 4px 12px rgba(212,165,116,.25)';
                              }}
                            >
                              ✓ Claim Offer
                            </button>
                          )}

                          {notif.is_claimed && (
                            <div style={{
                              width: '100%',
                              padding: '1rem',
                              background: '#f0f9ff',
                              border: '1px solid #0ea5e9',
                              borderRadius: '0.85rem',
                              color: '#0284c7',
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem'
                            }}>
                              ✓ Offer Claimed
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REGULAR NOTIFICATIONS */}
          {regular.length > 0 && (
            <div style={{ padding: '0 1rem' }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: FERRERO_THEME.text,
                marginBottom: '1rem',
                marginTop: campaigns.length > 0 ? '2rem' : 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                📢 Other Notifications
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {regular.map(notif => (
                  <div
                    key={notif.id}
                    style={{
                      background: '#fff',
                      border: `1px solid ${FERRERO_THEME.border}`,
                      borderRadius: '1rem',
                      padding: '1rem'
                    }}
                  >
                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: FERRERO_THEME.text,
                      margin: '0 0 0.3rem 0'
                    }}>
                      {notif.title}
                    </h3>
                    <p style={{
                      fontSize: '.8rem',
                      color: FERRERO_THEME.textSecond,
                      margin: 0
                    }}>
                      {notif.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {notifications.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: FERRERO_THEME.textLight
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: FERRERO_THEME.text, fontWeight: 700, margin: 0 }}>
                No notifications yet
              </h3>
              <p style={{ fontSize: '.85rem', margin: '0.5rem 0 0 0' }}>
                Stay tuned for special offers and updates!
              </p>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </AppLayout>
  );
};

export default NotificationsWithCampaigns;
