# 🍫 FERRERO ROCHER - COMPLETE SYSTEM INTEGRATION GUIDE

## 📋 Overview

This guide covers:
1. **Database Schema** - Updated for products (cartons), orders (carton-level), sales (piece-level), campaigns, and commissions
2. **Campaign Integration** - Realtime notifications → commissions → wallet
3. **Ferrero Theme** - Gold (#d4a574) + Burgundy (#c41e3a) throughout
4. **Retailer Workflow** - Buy cartons from distributor → Sell pieces to customers
5. **Commission System** - Automatic calculation based on campaigns

---

## 🗄️ DATABASE SCHEMA UPDATES

### **Key Changes**

1. **ferrero_products** - Now tracks BOTH carton and piece details
   ```
   - Cost Price: ₹300 per carton (distributor → retailer)
   - Piece Cost: ₹6.25 (300 ÷ 48 pieces)
   - Retail Price: ₹12.50 per piece (retailer → customer)
   - Pieces per Carton: 48
   ```

2. **retailer_inventory** - Tracks both cartons and loose pieces
   ```
   - cartons_stock: Number of full cartons
   - pieces_stock: Loose pieces from broken cartons
   ```

3. **carton_orders** - Order from Retailer → Distributor
   ```
   - Ordered in CARTONS (e.g., 5 cartons)
   - Can have campaign discount applied
   - Status: pending → accepted → delivered
   ```

4. **customer_sales** - Sales from Retailer → Customer
   ```
   - Sold in PIECES (e.g., 10 pieces)
   - Can have campaign commission applied
   - Can have cashback applied
   ```

5. **offer_campaigns** - Centralized campaigns
   ```
   - Commission: Retailers earn extra % on sales
   - Discount: Retailers get % off when ordering cartons
   - Combo: Buy 2+ products → discount on total
   - Cashback: Get ₹X per piece sold (specific days)
   ```

6. **campaign_notifications** - Realtime push to retailers
   ```
   - Created when campaign launched
   - Shows in Notifications screen
   - Includes offer details (commission %, discount %, etc.)
   - Tracks if claimed
   ```

7. **commission_ledger** - Tracks all earnings
   ```
   - Source: 'sale', 'campaign', 'cashback'
   - Amount: Calculated commission
   - Status: earned → pending → paid
   ```

---

## ⚡ CAMPAIGN WORKFLOW

### **Step 1: Admin Launches Campaign**
```
Campaign Portal → Create offer (type, products, terms)
↓
send_campaign() RPC function
↓
Creates offer_campaigns record
↓
Creates campaign_notifications (1 per retailer)
```

### **Step 2: Retailers Receive Notification**
```
Database INSERT → notifications table
↓
Supabase Realtime triggers
↓
AppContext listener updates state
↓
Toast notification appears
↓
Campaign appears in Notifications screen
```

### **Step 3: Retailer Makes Sale**
```
Retailer sells 10 pieces of Rocher @ ₹12.50 each
↓
Base Total = 10 × ₹12.50 = ₹125

IF campaign is 'commission' AND pieces >= min_qty:
  Commission = (₹125 × 5%) = ₹6.25
  Total Earned = ₹125 + ₹6.25 = ₹131.25

IF campaign is 'cashback':
  Cashback = 10 pieces × ₹50/piece = ₹500
  Total Earned = ₹125 + ₹500 = ₹625

↓
process_customer_sale() RPC
↓
Creates customer_sales record
↓
Updates commission_ledger
↓
Updates wallet_transactions
↓
Wallet balance updates automatically
```

### **Step 4: Retailer Orders Cartons**
```
Retailer orders 5 cartons @ ₹300 each
↓
Base Total = 5 × ₹300 = ₹1,500

IF campaign is 'discount' AND cartons >= min_qty:
  Discount = (₹1,500 × 15%) = ₹225
  Final Total = ₹1,500 - ₹225 = ₹1,275 (saves ₹225)

↓
Creates carton_orders record
↓
Distributor sees order (real-time)
↓
Distributor can accept/reject
↓
When accepted, updates retailer_inventory
```

---

## 🎨 FERRERO ROCHER THEME - COLOR SYSTEM

### **Primary Colors**
```css
--ferrero-gold: #d4a574        /* Main brand color - buttons, headers */
--ferrero-burgundy: #c41e3a    /* Secondary - CTAs, accents */
--ferrero-dark-gold: #8b6f47   /* Dark accents, text */
--ferrero-cream: #f9f7f3       /* Light backgrounds */
```

### **Where to Apply**

#### **Retailer Screen (Home.jsx)**
```
Header: Gold gradient background
Wallet Card: Burgundy border + gold icon
Quick Actions: Gold borders
Primary Button: Gold → Burgundy gradient
Commission Badge: Burgundy with gold text
Chart Bars: Gold (not green)
Active States: Gold (#d4a574)
```

#### **Distributor Screen (DistHome.jsx)**
```
Same as Retailer - unified Ferrero theme
Order Badges: Gold for pending, Burgundy for accepted
Sales Widget: Gold text with burgundy accents
Top Performers: Burgundy badges
```

#### **Campaign Notifications Screen**
```
Campaign Card: Gold border on left
Commission Tag: Burgundy background, gold text
Discount Tag: Green background (keep for clarity)
Cashback Tag: Gold background
Active Offer Badge: Burgundy
Claim Button: Gold → Burgundy gradient
```

#### **Campaign Portal (CampaignPortal.jsx)**
```
Type Selector: Gold cards with burgundy borders
Product Picker: Gold highlights
Terms Input: Gold borders
Message Composer: Gold text area border
Launch Button: Gold → Burgundy gradient
Success Screen: Gold confetti + burgundy text
```

---

## 🔄 INTEGRATION STEPS

### **Step 1: Update Supabase Schema** (10 min)
```bash
1. Go to Supabase SQL Editor
2. Copy entire content from FERRERO_DATABASE_SCHEMA.sql
3. Paste and run all SQL
4. Verify tables created and RLS policies applied
```

### **Step 2: Update AppContext.jsx** (15 min)

Add these listeners for real-time updates:

```javascript
// ─── CAMPAIGN NOTIFICATIONS LISTENER ──────────────────────────
useEffect(() => {
  if (!isSupabaseConfigured || !user?.id) return;

  const campaignChannel = supabase
    .channel('campaigns-' + user.id)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'campaign_notifications',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('🎁 New Campaign:', payload.new.title);
        // Update notifications state
        setNotificationsState(prev => [payload.new, ...prev]);
        // Show toast
        showToast(`🎁 ${payload.new.title}`);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(campaignChannel);
}, [user?.id]);

// ─── COMMISSION LEDGER LISTENER ──────────────────────────────
useEffect(() => {
  if (!isSupabaseConfigured || !user?.id) return;

  const commissionChannel = supabase
    .channel('commissions-' + user.id)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'commission_ledger',
        filter: `retailer_id=eq.${user.id}`
      },
      (payload) => {
        console.log('💰 Commission Earned:', payload.new.amount);
        showToast(`💰 Earned ₹${payload.new.amount} commission!`);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(commissionChannel);
}, [user?.id]);

// ─── WALLET TRANSACTIONS LISTENER ──────────────────────────────
useEffect(() => {
  if (!isSupabaseConfigured || !user?.id) return;

  const walletChannel = supabase
    .channel('wallet-' + user.id)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        // Update wallet balance
        const newBalance = payload.new.balance_after;
        setWalletBalance(newBalance);
        showToast(`💳 Wallet updated: ₹${newBalance}`);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(walletChannel);
}, [user?.id]);
```

### **Step 3: Update Home.jsx** (20 min)

Replace color variables with Ferrero theme:

```javascript
// Colors
const FERRERO = {
  gold: '#d4a574',
  burgundy: '#c41e3a',
  darkGold: '#8b6f47',
  cream: '#f9f7f3',
  light: '#f5f5f5',
  border: '#e5e5e5',
  text: '#2d2d2d',
  gray: '#666',
};

// Wallet Card
<div style={{
  background: '#fff',
  border: `2px solid ${FERRERO.gold}`,
  borderRadius: '1rem',
  padding: '1.5rem'
}}>
  <h3 style={{ color: FERRERO.burgundy, fontWeight: 900 }}>Wallet Balance</h3>
  <h2 style={{ fontSize: '2rem', color: FERRERO.darkGold }}>₹{walletBalance}</h2>
</div>

// Primary Button
<button style={{
  background: `linear-gradient(135deg, ${FERRERO.gold}, ${FERRERO.burgundy})`,
  color: '#fff',
  border: 'none',
  fontWeight: 900
}}>
  Order from Distributor
</button>

// Commission Badge
<span style={{
  background: FERRERO.burgundy,
  color: FERRERO.cream,
  padding: '.4rem .8rem',
  borderRadius: '9999px',
  fontWeight: 700,
  fontSize: '.85rem'
}}>
  💰 +5% Commission
</span>
```

### **Step 4: Create Retailer Notifications Screen** (30 min)

```javascript
export const NotificationsWithCampaigns = () => {
  const { notifications } = useAppContext();
  const [campaignNotifs, setCampaignNotifs] = useState([]);

  // Filter campaign notifications
  useEffect(() => {
    setCampaignNotifs(
      notifications.filter(n => n.offer_data) || []
    );
  }, [notifications]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ color: '#d4a574', fontWeight: 900 }}>🎁 Active Offers</h2>
      
      {campaignNotifs.map(n => (
        <div
          key={n.id}
          style={{
            background: '#fff',
            border: '2px solid #d4a574',
            borderRadius: '1rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}
        >
          <h3 style={{ color: '#2d2d2d', fontWeight: 800, margin: 0 }}>
            {n.title}
          </h3>
          <p style={{ color: '#666', margin: '.5rem 0' }}>{n.body}</p>

          {/* Show offer details */}
          {n.offer_data && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f7f3', borderRadius: '.75rem' }}>
              {n.offer_data.type === 'commission' && (
                <p style={{ margin: 0, fontWeight: 700, color: '#d4a574' }}>
                  💰 Earn +{n.offer_data.terms.commission_pct}% on {n.offer_data.terms.commission_min_qty}+ units
                </p>
              )}
              {n.offer_data.type === 'discount' && (
                <p style={{ margin: 0, fontWeight: 700, color: '#d4a574' }}>
                  🔥 {n.offer_data.terms.discount_pct}% off on {n.offer_data.terms.discount_min_qty}+ cartons
                </p>
              )}
              {n.offer_data.type === 'cashback' && (
                <p style={{ margin: 0, fontWeight: 700, color: '#d4a574' }}>
                  💳 Get ₹{n.offer_data.terms.cashback_amount} per piece
                </p>
              )}
            </div>
          )}

          <button
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '.8rem',
              background: 'linear-gradient(135deg, #d4a574, #c41e3a)',
              color: '#fff',
              border: 'none',
              borderRadius: '.75rem',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            Claim Offer
          </button>
        </div>
      ))}
    </div>
  );
};
```

### **Step 5: Update Sales Screen (Sell.jsx)** (15 min)

When making a sale, check for active campaigns:

```javascript
const handleCompleteSale = async () => {
  // Find active commission campaigns for this product
  const activeCampaigns = await supabase
    .from('offer_campaigns')
    .select('*')
    .eq('is_active', true)
    .contains('product_ids', JSON.stringify([{ id: product.id }]));

  // If campaign exists and pieces >= min_qty, apply commission
  const campaign = activeCampaigns.data?.[0];

  if (campaign && campaign.offer_type === 'commission') {
    // Call RPC to process sale with commission
    const { data } = await supabase.rpc('process_customer_sale', {
      p_product_id: product.id,
      p_pieces_sold: piecesCount,
      p_piece_price: product.piece_retail,
      p_campaign_id: campaign.id
    });

    console.log('Commission earned:', data[0].commission_earned);
    showToast(`💰 Earned ₹${data[0].commission_earned} commission!`);
  }
};
```

### **Step 6: Update Order Screen (BuyFromDist.jsx)** (15 min)

Check for bulk discount campaigns:

```javascript
const handleCreateOrder = async () => {
  // Find active discount campaigns for this product
  const activeCampaigns = await supabase
    .from('offer_campaigns')
    .select('*')
    .eq('is_active', true)
    .eq('offer_type', 'discount')
    .contains('product_ids', JSON.stringify([{ id: product.id }]));

  const campaign = activeCampaigns.data?.[0];

  // Check if order qty meets min requirement
  if (campaign && quantity >= campaign.discount_min_qty) {
    const discountAmount = (basePrice * campaign.discount_pct) / 100;
    const finalPrice = basePrice - discountAmount;

    console.log(`Discount Applied! Save ₹${discountAmount}`);
  }

  // Create carton order with campaign reference
  await supabase.from('carton_orders').insert({
    retailer_id: user.id,
    distributor_id: selectedDist.id,
    product_id: product.id,
    quantity_cartons: quantity,
    unit_price: product.distributor_price,
    campaign_id: campaign?.id || null,
    discount_pct: campaign?.discount_pct || 0
  });
};
```

---

## 📱 RETAILER UX FLOW

### **Home Screen**
```
Header: "Namaste, Ramesh! 👋" (Gold gradient)
Wallet: "₹3,482" (Burgundy card with gold text)

SPECIAL OFFERS (if campaigns active)
┌─────────────────────────────────────┐
│ 💰 Commission Boost                  │
│ Ferrero Rocher 48pc                  │
│ Earn +5% on 10+ units               │
│ [Claim Offer →]                      │
└─────────────────────────────────────┘

Quick Actions:
[📦 Order from Distributor] (Gold button)
[💰 Sell to Customer] (Burgundy button)
[💳 Wallet] (Gold border)
```

### **Sales Screen (Sell.jsx)**
```
Select Product: Rocher 48pc
Pieces to Sell: 10
Price/Piece: ₹12.50

IF campaign active for this product:
  Base: ₹125.00
  + Commission (5%): ₹6.25 ← (Burgundy badge)
  Total Earned: ₹131.25

[Complete Sale] (Gold → Burgundy gradient)
✅ Sale completed!
💰 Earned ₹131.25 (Commission: ₹6.25)
```

### **Order Screen (BuyFromDist.jsx)**
```
Select Product: Golden Gallery 42pc
Cartons to Order: 50

IF campaign active (bulk discount):
  Base: ₹15,000 (50 × ₹300)
  - Discount (15%): ₹2,250 ← (Green badge)
  You Pay: ₹12,750
  Saves: ₹2,250

[Place Order] (Gold → Burgundy gradient)
```

### **Notifications Screen**
```
ACTIVE OFFERS (Gold header)

📣 Commission Boost
Ferrero Rocher 48pc
Earn +5% on 10+ units
Expires in 5 days
[Claim →]

🔥 Bulk Discount  
Golden Gallery 42pc
Save 15% on 50+ cartons
From any distributor
[Order Now →]

💳 Cashback Weekend
Raffaello 42pc
Get ₹50 per piece
Fri-Sun only
[Shop Now →]
```

---

## 💰 COMMISSION CALCULATION EXAMPLES

### **Example 1: Commission Campaign**
```
Campaign: +5% commission on Rocher sales (min 10 pieces)
Retailer sells: 15 pieces @ ₹12.50 each

Calculation:
Base Total = 15 × ₹12.50 = ₹187.50
Min Qty Met? 15 >= 10 ✓
Commission = ₹187.50 × 5% = ₹9.38
Wallet Credit = ₹9.38

Result: Retailer earns ₹187.50 (to customer) + ₹9.38 (commission)
```

### **Example 2: Bulk Discount Campaign**
```
Campaign: 15% off on 50+ cartons
Retailer orders: 50 cartons @ ₹300 each

Calculation:
Base Total = 50 × ₹300 = ₹15,000
Min Qty Met? 50 >= 50 ✓
Discount = ₹15,000 × 15% = ₹2,250
Final Total = ₹15,000 - ₹2,250 = ₹12,750

Result: Retailer pays ₹12,750 (saves ₹2,250)
```

### **Example 3: Cashback Campaign**
```
Campaign: ₹50 cashback per Raffaello (Fri-Sun only)
Retailer sells: 10 pieces on Saturday

Calculation:
Base Total = 10 × ₹12.50 = ₹125.00
Day Valid? Saturday ✓
Cashback = 10 × ₹50 = ₹500
Wallet Credit = ₹500

Result: Retailer earns ₹125 (to customer) + ₹500 (cashback)
```

---

## 🔐 Security & RLS Policies

All tables have RLS enabled:
- Retailers only see their own sales, orders, inventory
- Distributors only see orders sent to them
- Commissions only visible to earning retailer
- Campaigns visible to all (but notifications filtered per user)

---

## ✅ TESTING CHECKLIST

- [ ] Database schema created and RLS policies applied
- [ ] Campaign portal sends notifications to retailers
- [ ] Retailers see campaigns in Notifications screen
- [ ] Commission calculated correctly on sales
- [ ] Discount applied correctly on orders
- [ ] Cashback awarded on valid days
- [ ] Wallet balance updates automatically
- [ ] Toast notifications appear for campaigns & earnings
- [ ] Ferrero colors applied to all screens
- [ ] Real-time updates work (no page refresh needed)
- [ ] Campaign offers appear on Home screen

---

## 🎯 Next Steps

1. Run SQL schema in Supabase
2. Add AppContext listeners (Step 2)
3. Update Home.jsx with Ferrero colors (Step 3)
4. Create Notifications campaign display (Step 4)
5. Update Sell.jsx with commission logic (Step 5)
6. Update BuyFromDist.jsx with discount logic (Step 6)
7. Test complete workflow

---

**You now have a complete Ferrero Rocher system with campaigns, commissions, and beautiful theming!** 🍫✨
