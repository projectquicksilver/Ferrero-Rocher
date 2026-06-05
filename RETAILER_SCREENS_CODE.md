# 🍫 RETAILER SCREENS - READY-TO-USE CODE SNIPPETS

## 📋 How to Use This File

Copy each code block and paste it into the corresponding screen file.

---

## 1️⃣ HOME SCREEN (src/screens/Home.jsx)

### **Import at Top (Add these to existing imports):**

```javascript
import { useAppContext } from '../context/AppContext';

// You already have: user, walletBalance, inventory, transactions, theme, toggleTheme
// Add to destructure:
const { 
  user, 
  walletBalance, 
  inventory, 
  transactions, 
  theme, 
  toggleTheme,
  FERRERO_THEME,        // ADD THIS
  activeCampaigns,      // ADD THIS
  claimCampaign         // ADD THIS
} = useAppContext();
```

### **Replace Wallet Card Section (around line 102-145):**

```javascript
{/* Wallet & Rewards Section - FERRERO THEMED */}
<div style={{
  background: '#fff',
  border: '2px solid #d4a574',
  borderRadius: '1.25rem',
  overflow: 'hidden',
  marginBottom: '1.5rem',
  boxShadow: '0 2px 8px rgba(212,165,116,.1)'
}}>
  <div style={{
    padding: '1.25rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e5e5e5',
    background: 'linear-gradient(135deg, rgba(212,165,116,.02), rgba(196,30,58,.02))'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
      <div style={{
        width: '2.8rem',
        height: '2.8rem',
        background: 'rgba(212,165,116,.12)',
        borderRadius: '.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span className="material-symbols-outlined fi" style={{
          color: '#d4a574',
          fontSize: '1.4rem'
        }}>account_balance_wallet</span>
      </div>
      <div>
        <p style={{
          fontSize: '.68rem',
          fontWeight: 600,
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '.05em',
          margin: 0
        }}>Wallet Balance</p>
        <h2 style={{
          fontSize: '1.8rem',
          fontFamily: 'var(--fd)',
          fontWeight: 900,
          color: '#c41e3a',
          display: 'flex',
          alignItems: 'center',
          gap: '.4rem',
          margin: 0
        }}>
          ₹{walletBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          <span className="material-symbols-outlined" style={{
            fontSize: '1.1rem',
            color: '#d4a574',
            cursor: 'pointer'
          }}>visibility</span>
        </h2>
      </div>
    </div>
    <button onClick={() => navigate('/wallet')} style={{
      padding: '.5rem .8rem',
      background: 'linear-gradient(135deg, #d4a574, #c41e3a)',
      border: 'none',
      borderRadius: '9999px',
      color: '#fff',
      fontSize: '.75rem',
      fontWeight: 900,
      display: 'flex',
      alignItems: 'center',
      gap: '.3rem',
      cursor: 'pointer'
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
      Add Money
    </button>
  </div>

  <div style={{ padding: '1rem', background: 'rgba(212,165,116,.03)' }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '.8rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
        <span style={{ fontSize: '.9rem' }}>💎</span>
        <span style={{
          fontSize: '.8rem',
          fontWeight: 600,
          color: '#2d2d2d'
        }}>Premium Benefits</span>
      </div>
      <div style={{
        fontSize: '.75rem',
        color: '#999',
        display: 'flex',
        alignItems: 'center',
        gap: '.2rem'
      }}>
        <strong style={{ color: '#d4a574' }}>₹247</strong> earned
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{
        padding: '.3rem .8rem',
        background: 'rgba(212,165,116,.1)',
        border: '1px solid rgba(212,165,116,.3)',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        gap: '.3rem'
      }}>
        <span style={{ fontSize: '.9rem' }}>🥇</span>
        <span style={{
          fontSize: '.7rem',
          fontWeight: 800,
          color: '#d4a574'
        }}>GOLD TIER</span>
      </div>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <div style={{
          padding: '.3rem .6rem',
          background: 'linear-gradient(135deg, rgba(212,165,116,.1), rgba(196,30,58,.05))',
          border: '1px solid #d4a574',
          borderRadius: '9999px',
          fontSize: '.7rem',
          fontWeight: 700,
          color: '#d4a574',
          display: 'flex',
          alignItems: 'center',
          gap: '.25rem'
        }}>
          📦 ₹2,156
        </div>
        <div style={{
          padding: '.3rem .6rem',
          background: 'linear-gradient(135deg, rgba(196,30,58,.1), rgba(212,165,116,.05))',
          border: '1px solid #c41e3a',
          borderRadius: '9999px',
          fontSize: '.7rem',
          fontWeight: 700,
          color: '#c41e3a',
          display: 'flex',
          alignItems: 'center',
          gap: '.25rem'
        }}>
          💳 ₹1,326
        </div>
      </div>
    </div>
  </div>
</div>
```

### **Add Active Campaigns Section (after Wallet, before Quick Actions):**

```javascript
{/* ACTIVE CAMPAIGNS SECTION - NEW */}
{activeCampaigns.length > 0 && (
  <div style={{
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#fff',
    border: '2px solid #d4a574',
    borderRadius: '1.25rem',
    boxShadow: '0 2px 8px rgba(212,165,116,.1)'
  }}>
    <h3 style={{
      fontSize: '1.05rem',
      fontWeight: 900,
      color: '#d4a574',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '.5rem',
      margin: '0 0 1rem 0'
    }}>
      ✨ Active Offers ({activeCampaigns.length})
    </h3>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
      {activeCampaigns.map(campaign => {
        const icons = {
          commission: '💰',
          discount: '🔥',
          combo: '🎁',
          cashback: '💳'
        };
        
        return (
          <div key={campaign.id} style={{
            background: 'linear-gradient(135deg, rgba(212,165,116,.02), rgba(196,30,58,.02))',
            border: '1px solid #d4a574',
            borderRadius: '.75rem',
            padding: '.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '.75rem',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'rgba(212,165,116,.12)',
              borderRadius: '.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              {icons[campaign.offer_type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0,
                fontWeight: 700,
                color: '#2d2d2d',
                fontSize: '0.9rem'
              }}>
                {campaign.title}
              </p>
              <p style={{
                margin: '0.2rem 0 0 0',
                color: '#666',
                fontSize: '0.75rem',
                lineHeight: 1.3
              }}>
                {campaign.description}
              </p>
            </div>
            <button
              onClick={() => claimCampaign(campaign.id)}
              style={{
                padding: '0.4rem 0.8rem',
                background: '#d4a574',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.target.style.background = '#c41e3a';
              }}
              onMouseOut={e => {
                e.target.style.background = '#d4a574';
              }}
            >
              Claim →
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}
```

### **Update Quick Actions Section (Search for "What would you like to do today"):**

```javascript
{/* Update the Order from Distributor button */}
<div onClick={() => navigate('/buy-from-dist')} style={{
  background: 'linear-gradient(135deg, rgba(212,165,116,.1), rgba(196,30,58,.05))',
  border: '2px solid #d4a574',
  borderRadius: 'var(--r12)',
  padding: '1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '.8rem',
  transition: 'all 0.3s'
}}>
  <div style={{
    width: '2.5rem',
    height: '2.5rem',
    background: '#d4a574',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <span className="material-symbols-outlined fi" style={{
      color: '#fff',
      fontSize: '1.3rem'
    }}>local_shipping</span>
  </div>
  <div>
    <p style={{
      fontSize: '.95rem',
      fontWeight: 900,
      color: '#d4a574',
      marginBottom: '.1rem',
      margin: 0
    }}>Order from Distributor</p>
    <p style={{ fontSize: '.7rem', color: '#666', margin: 0 }}>
      Restock inventory directly from suppliers
    </p>
  </div>
</div>

{/* Update the Sell button */}
<div onClick={() => navigate('/sell')} style={{
  background: '#fff',
  border: '2px solid #d4a574',
  borderRadius: 'var(--r12)',
  padding: '1rem',
  cursor: 'pointer',
  position: 'relative'
}}>
  <div style={{
    width: '3rem',
    height: '3rem',
    background: 'linear-gradient(135deg, #d4a574, #c41e3a)',
    borderRadius: '.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem'
  }}>
    <span className="material-symbols-outlined fi" style={{
      color: '#fff',
      fontSize: '1.6rem'
    }}>storefront</span>
  </div>
  <p style={{
    fontSize: '.9rem',
    fontWeight: 900,
    color: '#d4a574',
    marginBottom: '.3rem',
    margin: 0
  }}>Sell a Product</p>
  <p style={{
    fontSize: '.68rem',
    color: '#666',
    lineHeight: 1.4,
    margin: 0
  }}>Scan code or select from inventory</p>
</div>
```

---

## 2️⃣ SELL SCREEN (src/screens/Sell.jsx)

### **Import at Top (Add to existing imports):**

```javascript
import { useAppContext } from '../context/AppContext';

// Update destructure:
const { 
  inventory, 
  user, 
  cart, 
  addToCart, 
  clearCart,
  activeCampaigns,      // ADD THIS
  applySaleCommission,  // ADD THIS
  FERRERO_THEME,        // ADD THIS
  showToast: appShowToast // ADD THIS (rename to avoid conflict)
} = useAppContext();

// Keep existing showToast import but use it as fallback
```

### **Add Campaign Banner (after Mode Toggles section, around line 83):**

```javascript
{/* ACTIVE COMMISSION CAMPAIGNS BANNER - NEW */}
{activeCampaigns.some(c => c.offer_type === 'commission') && (
  <div style={{
    background: 'linear-gradient(135deg, #d4a574, #c41e3a)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '1rem',
    marginBottom: '1rem',
    border: 'none',
    boxShadow: '0 4px 12px rgba(212,165,116,.2)'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.5rem'
    }}>
      <span style={{ fontSize: '1.3rem' }}>💰</span>
      <h3 style={{
        margin: 0,
        fontSize: '1rem',
        fontWeight: 900,
        color: '#fff'
      }}>
        Earn Extra Commission!
      </h3>
    </div>
    <p style={{
      margin: 0,
      fontSize: '0.85rem',
      opacity: 0.95,
      lineHeight: 1.4
    }}>
      {activeCampaigns.filter(c => c.offer_type === 'commission')[0]?.title}
      {' '} - {activeCampaigns.filter(c => c.offer_type === 'commission')[0]?.description}
    </p>
  </div>
)}
```

### **Update Sell Button Styling (Search for "Complete Sale" or checkout button):**

```javascript
{/* Sell/Checkout Button - FERRERO THEMED */}
<button
  onClick={handleSellConfirm}
  style={{
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #d4a574, #c41e3a)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.85rem',
    fontWeight: 900,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(212,165,116,.2)',
    transition: 'all 0.3s'
  }}
  onMouseOver={e => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 6px 16px rgba(212,165,116,.3)';
  }}
  onMouseOut={e => {
    e.target.style.transform = 'none';
    e.target.style.boxShadow = '0 4px 12px rgba(212,165,116,.2)';
  }}
>
  ✓ Complete Sale (₹{total.toFixed(2)})
</button>
```

### **Add Commission Logic in handleSellConfirm (Modify existing function):**

```javascript
const handleSellConfirm = async () => {
  if (cart.length === 0) return;

  // Existing logic...
  const total = cart.reduce((s, c) => s + c.sell * c.qty, 0);

  // NEW: Apply commission if campaign active
  let totalEarnedWithCommission = cart.reduce((s, c) => s + (c.earn * c.qty), 0);
  
  for (const cartItem of cart) {
    const result = await applySaleCommission(
      cartItem.id,
      cartItem.qty,
      cartItem.sell
    );
    totalEarnedWithCommission += (result.commission + result.cashback);
  }

  // Show toast notification
  const commissionEarned = totalEarnedWithCommission - cart.reduce((s, c) => s + (c.earn * c.qty), 0);
  if (commissionEarned > 0) {
    appShowToast(
      `💰 Earned ₹${commissionEarned.toFixed(2)} commission!`,
      'success'
    );
  }

  // Existing logic to complete sale...
  clearCart();
  // Navigate or show success...
};
```

---

## 3️⃣ NOTIFICATIONS SCREEN

Will be provided in next section (use NOTIFICATIONS_CAMPAIGNS_UPDATE.jsx from your project)

---

## ✅ QUICK CHECKLIST AFTER COPYING CODE

### **Home Screen:**
- [ ] Wallet card has gold border (#d4a574)
- [ ] Wallet amount is burgundy (#c41e3a)
- [ ] Buttons have gradient (gold → burgundy)
- [ ] Active Campaigns section appears
- [ ] Campaign cards show with icons

### **Sell Screen:**
- [ ] Campaign banner appears if campaign active
- [ ] Commission logic works
- [ ] Toast shows commission earned
- [ ] Sell button is gradient
- [ ] No color variables left (var(--g4), var(--o4))

### **All Screens:**
- [ ] No green (#78f275) colors visible
- [ ] No orange (#ffd060) colors visible
- [ ] All gold is #d4a574
- [ ] All burgundy is #c41e3a
- [ ] Theme is consistent

---

**Ready to copy-paste and test! 🍫✨**
