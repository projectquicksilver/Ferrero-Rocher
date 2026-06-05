# 🍫 FERRERO ROCHER - COMPLETE IMPLEMENTATION CHECKLIST

## 📋 PHASE 1: DATABASE SETUP (30 minutes)

### Step 1: Run Database Schema
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy entire content from `FERRERO_DATABASE_SCHEMA.sql`
- [ ] Paste into SQL Editor and execute
- [ ] Verify all tables created:
  - [ ] `ferrero_products`
  - [ ] `retailer_inventory`
  - [ ] `carton_orders`
  - [ ] `customer_sales`
  - [ ] `offer_campaigns`
  - [ ] `campaign_notifications`
  - [ ] `commission_ledger`
  - [ ] `wallet_transactions`

### Step 2: Verify RLS Policies
- [ ] Check that all tables have RLS enabled
- [ ] Verify policies are created for:
  - [ ] retailer_inventory (users see only own)
  - [ ] carton_orders (retailer & distributor access)
  - [ ] customer_sales (retailers see own)
  - [ ] campaign_notifications (users see own)
  - [ ] commission_ledger (retailers see own)
  - [ ] wallet_transactions (users see own)

### Step 3: Test RPC Functions
In SQL Editor, run:
```sql
-- Test send_campaign RPC
SELECT * FROM send_campaign(
  'Test Campaign',
  'Test Description',
  'commission',
  '[{"id": 1, "name": "Rocher", "qty": 10}]'::jsonb,
  10,
  5.0,
  0,
  0,
  0,
  0,
  '[]'::jsonb,
  'retailer',
  7
);

-- Test process_customer_sale RPC
SELECT * FROM process_customer_sale(1, 15, 12.50, NULL);
```

---

## 📱 PHASE 2: APP INTEGRATION (45 minutes)

### Step 1: Update AppContext.jsx

**File:** `src/context/AppContext.jsx`

1. Add state variables (after existing state):
```javascript
// Copy from APPCONTEXT_REALTIME_ADDITIONS.js:
// - notifications state
// - activeCampaigns state
// - commissionEarnings state
// - toastQueue state
```

2. Add FERRERO_THEME constant:
```javascript
const FERRERO_THEME = {
  primary: '#d4a574',      // Gold
  secondary: '#c41e3a',    // Burgundy
  accent: '#8b6f47',       // Dark gold
  light: '#f9f7f3',        // Cream
  lightGray: '#f5f5f5',
  border: '#e5e5e5',
  text: '#2d2d2d',
  textSecond: '#666',
  textLight: '#999',
};
```

3. Add realtime listeners:
```javascript
// Campaign notifications listener
useEffect(() => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
}, [user?.id]);

// Commission ledger listener
useEffect(() => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
}, [user?.id, user?.role]);

// Wallet transactions listener
useEffect(() => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
}, [user?.id]);

// Carton orders listener (distributor)
useEffect(() => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
}, [user?.id, user?.role]);
```

4. Add helper functions:
```javascript
const showToast = (message, type = 'info') => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
};

const loadActiveCampaigns = async () => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
};

const applySaleCommission = async (...) => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
};

const applyOrderDiscount = async (...) => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
};

const claimCampaign = async (...) => {
  // Copy from APPCONTEXT_REALTIME_ADDITIONS.js
};
```

5. Add to returned context value:
```javascript
const value = {
  // ... existing ...
  FERRERO_THEME,
  notifications,
  activeCampaigns,
  commissionEarnings,
  toastQueue,
  showToast,
  applySaleCommission,
  applyOrderDiscount,
  claimCampaign,
  loadActiveCampaigns,
};
```

- [ ] AppContext.jsx updated with all listeners
- [ ] FERRERO_THEME colors added
- [ ] Helper functions implemented
- [ ] Context value exported

### Step 2: Update Notifications Screen

**File:** `src/screens/Notifications.jsx`

- [ ] Replace with content from `NOTIFICATIONS_CAMPAIGNS_UPDATE.jsx`
- [ ] Verify campaign cards display
- [ ] Test offer details expand/collapse
- [ ] Test claim button functionality

### Step 3: Update Home Screen (Optional - For Better Branding)

**File:** `src/screens/Home.jsx`

Replace color variables:
```javascript
// OLD: var(--g4) → NEW: FERRERO_THEME.primary (#d4a574)
// OLD: var(--o4) → NEW: FERRERO_THEME.secondary (#c41e3a)
// OLD: Green #78f275 → NEW: FERRERO_THEME.primary (#d4a574)

// Example changes:
- Wallet card border: #d4a574 (gold)
- Wallet balance text: #c41e3a (burgundy)
- Primary button: linear-gradient(135deg, #d4a574, #c41e3a)
- Commission badge: #c41e3a background
- Chart bars: #d4a574 (not green)
```

- [ ] Color variables replaced with Ferrero theme
- [ ] Wallet card styled with gold border
- [ ] Primary buttons use gold→burgundy gradient
- [ ] Commission badges are burgundy
- [ ] Chart bars are gold

### Step 4: Update Sell Screen (Sales)

**File:** `src/screens/Sell.jsx`

Add commission logic:
```javascript
const handleCompleteSale = async () => {
  // Find active campaigns for this product
  const campaign = activeCampaigns.find(c =>
    c.product_ids?.some(p => p.id === product.id)
  );

  // Apply commission if campaign exists
  if (campaign && campaign.offer_type === 'commission') {
    const result = await applySaleCommission(
      product.id,
      piecesCount,
      product.piece_retail
    );

    showToast(`💰 Earned ₹${result.commission.toFixed(2)} commission!`);
  }
};
```

- [ ] applySaleCommission function integrated
- [ ] Commission calculated on each sale
- [ ] Toast notification shows commission amount
- [ ] Wallet updates automatically

### Step 5: Update Order Screen (Buy from Distributor)

**File:** `src/screens/BuyFromDist.jsx`

Add discount logic:
```javascript
const handleCreateOrder = async () => {
  // Find active discount campaigns
  const discount = await applyOrderDiscount(product.id, cartonQty);

  if (discount.discount_pct > 0) {
    showToast(`🔥 Save ₹${discountAmount.toFixed(2)} with bulk discount!`);
  }

  // Create carton order with campaign reference
  await supabase.from('carton_orders').insert({
    retailer_id: user.id,
    distributor_id: selectedDist.id,
    product_id: product.id,
    quantity_cartons: cartonQty,
    unit_price: product.distributor_price,
    campaign_id: discount.campaign_id,
    discount_pct: discount.discount_pct,
  });
};
```

- [ ] applyOrderDiscount function integrated
- [ ] Discount calculated on large orders
- [ ] Toast shows discount savings
- [ ] Order created with campaign reference

---

## 🎨 PHASE 3: THEMING (30 minutes)

### Color Palette

Apply these colors throughout:

```
Primary Gold:     #d4a574 (buttons, headers, borders)
Secondary Burgundy: #c41e3a (CTAs, accents)
Dark Gold:        #8b6f47 (dark text, section titles)
Cream:            #f9f7f3 (light backgrounds)
Light Gray:       #f5f5f5 (subtle backgrounds)
Border:           #e5e5e5 (lines, dividers)
Text Dark:        #2d2d2d (main text)
Text Gray:        #666 (secondary text)
Text Light:       #999 (light text)
```

### Where to Apply

- [ ] Header backgrounds: Gold gradient
- [ ] Primary buttons: Gold → Burgundy gradient
- [ ] Card borders: Gold (#d4a574)
- [ ] Active states: Gold
- [ ] Secondary CTAs: Burgundy
- [ ] Badges: Gold/Burgundy
- [ ] Success messages: Green (#78f275)
- [ ] Error states: Red (#f87171)

### Test Theming

- [ ] Home screen looks good with new colors
- [ ] Buttons are visually consistent
- [ ] Campaign cards are prominent
- [ ] All text is readable (contrast check)
- [ ] Mobile view looks good

---

## ✅ PHASE 4: TESTING (45 minutes)

### Campaign Flow Testing

1. **Create Campaign via Portal**
   - [ ] Navigate to `/campaign-portal`
   - [ ] Enter token: `ferrero-admin-2025`
   - [ ] Create commission boost offer
   - [ ] Select products (Rocher 48pc)
   - [ ] Set terms (Min 10 units, 5% commission)
   - [ ] Compose message
   - [ ] Preview looks good
   - [ ] Launch campaign

2. **Retailer Receives Notification**
   - [ ] Login as retailer
   - [ ] Go to Notifications screen
   - [ ] See campaign notification
   - [ ] Toast appeared automatically
   - [ ] Campaign details expand properly
   - [ ] Claim button works

3. **Retailer Makes Sale with Commission**
   - [ ] Go to Sell screen
   - [ ] Select Rocher 48pc product
   - [ ] Sell 15 pieces @ ₹12.50
   - [ ] Commission shows (5% of ₹187.50 = ₹9.38)
   - [ ] Toast shows "💰 Earned ₹9.38 commission!"
   - [ ] Wallet balance increases by ₹9.38
   - [ ] Check commission_ledger in Supabase (new row created)

4. **Retailer Orders with Discount**
   - [ ] Create bulk discount campaign (15% off 50+ cartons)
   - [ ] Retailer goes to Buy from Distributor
   - [ ] Orders 50+ cartons
   - [ ] Discount tooltip appears (15% off)
   - [ ] Toast shows savings
   - [ ] Order created with campaign_id reference

5. **Cashback Campaign**
   - [ ] Create cashback campaign (₹50 per Raffaello, Fri-Sun)
   - [ ] Check current day (must be Fri/Sat/Sun for testing)
   - [ ] Make sale on valid day
   - [ ] Cashback applies automatically
   - [ ] Wallet credited with cashback

6. **Wallet & Commission Tracking**
   - [ ] Go to Wallet screen
   - [ ] See recent commission transactions
   - [ ] Balance reflects all earnings
   - [ ] Transaction history shows commission source
   - [ ] Multiple commissions accumulate correctly

### Database Verification

In Supabase SQL Editor:

```sql
-- Check campaigns created
SELECT * FROM offer_campaigns ORDER BY created_at DESC;

-- Check notifications sent
SELECT COUNT(*) FROM campaign_notifications;

-- Check commission records
SELECT * FROM commission_ledger ORDER BY created_at DESC;

-- Check wallet transactions
SELECT * FROM wallet_transactions WHERE type = 'commission' LIMIT 10;

-- Check sales with campaigns
SELECT * FROM customer_sales WHERE campaign_id IS NOT NULL LIMIT 10;
```

- [ ] Campaigns table has records
- [ ] Notifications created for each campaign
- [ ] Commission ledger updated after sales
- [ ] Wallet transactions track earnings
- [ ] All relationships are correct

### UI/UX Checklist

- [ ] Campaign cards look beautiful (gold borders)
- [ ] Offer icons display correctly (💰🔥🎁💳)
- [ ] Expand/collapse animations smooth
- [ ] Buttons have proper hover states
- [ ] Toast notifications appear & disappear smoothly
- [ ] No errors in console (F12)
- [ ] Responsive on mobile (375px width)
- [ ] Text is readable on all backgrounds
- [ ] Colors match Ferrero theme exactly

---

## 🚀 PHASE 5: DEPLOYMENT (15 minutes)

### Before Going Live

- [ ] All tests pass
- [ ] No console errors
- [ ] All screens responsive
- [ ] Campaign portal accessible
- [ ] Realtime listeners working
- [ ] Database backups configured
- [ ] RLS policies verified
- [ ] Admin token is secure

### Go Live

1. **Backup Database**
   ```sql
   -- In Supabase: Data > Backups
   -- Create manual backup before go-live
   ```

2. **Monitor First Campaign**
   - [ ] Create test campaign
   - [ ] Send to 5 users
   - [ ] Verify notifications received
   - [ ] Check commission calculations
   - [ ] Monitor database for errors
   - [ ] Check console for warnings

3. **Full Rollout**
   - [ ] Announce to retailers
   - [ ] Create first real campaign
   - [ ] Monitor user engagement
   - [ ] Collect feedback
   - [ ] Iterate based on response

---

## 📊 SUCCESS METRICS

After implementation, track:

- ✓ Campaign reach (notifications sent)
- ✓ Campaign engagement (offers claimed)
- ✓ Commission earnings (per retailer)
- ✓ Average order value (before/after campaigns)
- ✓ Retailer retention (repeat orders)
- ✓ System performance (API response times)

---

## 🐛 TROUBLESHOOTING

### Campaign not appearing in notifications
- [ ] Check RLS policies allow user to see notifications
- [ ] Verify user_id in campaign_notifications table
- [ ] Check if user role matches target_role in campaign
- [ ] Test realtime listener in browser console

### Commission not calculating
- [ ] Verify campaign is_active = true
- [ ] Check commission_min_qty is met
- [ ] Verify RPC function runs without errors
- [ ] Check commission_ledger for entries

### Toast not appearing
- [ ] Ensure showToast function is exported from context
- [ ] Verify Toast component is rendered in App.jsx
- [ ] Check browser console for JS errors
- [ ] Test with simple toast: showToast('Test')

### Discount not applying
- [ ] Check campaign offer_type = 'discount'
- [ ] Verify discount_min_qty is met
- [ ] Check product_ids in campaign match
- [ ] Test applyOrderDiscount function

---

## 📞 SUPPORT

If you encounter issues:

1. Check console (F12) for JavaScript errors
2. Check Supabase logs for database errors
3. Verify RLS policies (go to Authentication > Policies)
4. Test RPC functions directly in SQL Editor
5. Check realtime publication (Database > Publications)

---

## ✨ NEXT FEATURES (Optional)

After launch, consider adding:

- [ ] Campaign scheduling (send at specific time)
- [ ] A/B testing (test different messages)
- [ ] Campaign analytics dashboard
- [ ] Repeat campaigns (send same offer again)
- [ ] Campaign templates library
- [ ] SMS notifications for campaigns
- [ ] Push notifications (FCM integration)
- [ ] Campaign performance metrics

---

**Congratulations! You now have a complete Ferrero Rocher campaign system with commissions!** 🍫✨
