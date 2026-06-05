# 🍫 FERRERO ROCHER SYSTEM - QUICK REFERENCE

## 🚀 5-MINUTE SETUP

### Step 1: Database (3 min)
```
1. Supabase Dashboard → SQL Editor
2. Paste: FERRERO_DATABASE_SCHEMA.sql
3. Execute ✓
```

### Step 2: AppContext (2 min)
```
1. Open: src/context/AppContext.jsx
2. Paste: Code from APPCONTEXT_REALTIME_ADDITIONS.js
3. Save ✓
```

### Step 3: Test
```
1. http://localhost:3000/campaign-portal
2. Token: ferrero-admin-2025
3. Create test campaign ✓
```

---

## 🎨 FERRERO COLORS

```
Gold:       #d4a574  ← Buttons, headers, borders
Burgundy:   #c41e3a  ← CTAs, secondary
Dark Gold:  #8b6f47  ← Text, accents
Cream:      #f9f7f3  ← Backgrounds
```

---

## 💰 COMMISSION EXAMPLES

### Commission Boost (5% on sales)
```
Retailer sells: 15 pieces × ₹12.50 = ₹187.50
Commission (5%): ₹9.38
Earned: ₹187.50 + ₹9.38 = ₹196.88
```

### Bulk Discount (15% on orders 50+)
```
Retailer orders: 50 cartons × ₹300 = ₹15,000
Discount (15%): ₹2,250
Pays: ₹12,750 (saves ₹2,250)
```

### Cashback (₹50 per piece)
```
Retailer sells: 10 pieces × ₹12.50 = ₹125
Cashback: 10 × ₹50 = ₹500
Earned: ₹125 + ₹500 = ₹625
```

---

## 📱 SCREENS

| Screen | Purpose | File |
|--------|---------|------|
| Campaign Portal | Create offers | `/campaign-portal` |
| Home | Dashboard | `Home.jsx` |
| Sell | Make sales | `Sell.jsx` |
| Buy | Order cartons | `BuyFromDist.jsx` |
| Notifications | See campaigns | `Notifications.jsx` |

---

## 🔄 REAL-TIME FLOW

```
Campaign Created
    ↓
Notifications sent to retailers
    ↓
Toast appears: "🎁 New Offer!"
    ↓
Retailer sees in Notifications
    ↓
Retailer makes sale
    ↓
Commission calculated
    ↓
Wallet updated automatically
    ↓
Toast: "💰 Earned ₹X!"
```

---

## 🗂️ KEY FILES

### Must Update
- ✏️ `src/context/AppContext.jsx` (add listeners)
- ✏️ `src/screens/Notifications.jsx` (add campaigns display)

### Already Done
- ✅ `src/screens/CampaignPortal.jsx` (created)
- ✅ `FERRERO_DATABASE_SCHEMA.sql` (created)

### Copy & Paste Code
- 📋 `APPCONTEXT_REALTIME_ADDITIONS.js` (listeners)
- 📋 `NOTIFICATIONS_CAMPAIGNS_UPDATE.jsx` (notifications)

---

## ✅ TESTING

```
Create Campaign           → ✓ Accessible
Retailer Gets Notification → ✓ Toast appears
Retailer Makes Sale       → ✓ Commission calculated
Check Wallet              → ✓ Balance increased
Check Ledger              → ✓ Record created
```

---

## 🔐 ADMIN TOKEN

```
Token: ferrero-admin-2025
Use: Campaign Portal access
Keep: Secure in production
```

---

## 📊 OFFERS (4 TYPES)

### 1. Commission Boost 💰
- Extra % on retail sales
- Min pieces to qualify
- Applied automatically

### 2. Bulk Discount 🔥  
- % off carton orders
- Min cartons needed
- Instant savings

### 3. Combo Offer 🎁
- Discount on multiple products
- Buy together = save more
- Flexible bundle

### 4. Cashback 💳
- ₹ per piece sold
- Valid specific days
- Wallet credited

---

## 🎯 CAMPAIGN PORTAL

**5-Step Builder:**
1. **Type** → Choose offer (commission/discount/combo/cashback)
2. **Products** → Select from catalog
3. **Terms** → Set %, amounts, minimum quantities
4. **Message** → Compose offer text
5. **Preview** → Launch when ready

**Access:** `/campaign-portal?access=ferrero-admin-2025`

---

## 📲 RETAILER NOTIFICATIONS

**What They See:**
- Campaign card with gold border
- Offer type emoji (💰🔥🎁💳)
- Commission/discount details
- Valid duration countdown
- Claim button

**How It Works:**
- Real-time push (no refresh needed)
- Toast notification
- Expandable for details
- Claim tracking

---

## 💳 WALLET UPDATES

**Automatic Credits:**
- Commission on sales
- Cashback on special days
- Discount on bulk orders
- Refunds/adjustments

**Visible in:**
- Home screen (balance)
- Wallet screen (transactions)
- Notifications (history)

---

## 🐛 QUICK FIXES

### Campaign not appearing?
```
Check: User role matches target_role
Check: Campaign is_active = true
Check: RLS policies allow access
```

### Commission not calculating?
```
Check: pieces_sold >= commission_min_qty
Check: campaign_id is set on sale
Check: offer_type = 'commission'
```

### Wallet not updating?
```
Check: wallet_transactions table
Check: balance_after shows new value
Check: User sees transaction history
```

### Toast not showing?
```
Check: showToast() is exported
Check: Toast component in App.jsx
Check: Browser console for errors
```

---

## 📞 DEBUG COMMANDS

**Test in Browser Console:**
```javascript
// Check active campaigns
const { activeCampaigns } = useAppContext();
console.log(activeCampaigns);

// Test toast
const { showToast } = useAppContext();
showToast('Testing toast', 'success');

// Check theme colors
const { FERRERO_THEME } = useAppContext();
console.log(FERRERO_THEME);
```

**Test in Supabase SQL:**
```sql
-- Count notifications
SELECT COUNT(*) FROM campaign_notifications;

-- Check commissions
SELECT SUM(amount) FROM commission_ledger;

-- Recent sales
SELECT * FROM customer_sales ORDER BY created_at DESC LIMIT 5;
```

---

## 🎉 SUCCESS INDICATORS

✅ Database schema created
✅ AppContext updated  
✅ Listeners working (console logs)
✅ Campaign portal accessible
✅ Notifications appear instantly
✅ Commission calculates correctly
✅ Wallet updates automatically
✅ Colors match Ferrero theme
✅ Mobile responsive
✅ No console errors

---

## 📈 NEXT STEPS

1. ✅ Setup database
2. ✅ Update AppContext
3. ✅ Update Notifications screen
4. ✅ Test campaign flow
5. ✅ Monitor first campaign
6. ⏭️ Expand to all retailers
7. ⏭️ Add more campaigns
8. ⏭️ Gather feedback
9. ⏭️ Optimize based on data

---

## 📚 REFERENCE DOCS

- **Full Integration Guide**: `COMPLETE_SYSTEM_INTEGRATION.md`
- **Step-by-Step Setup**: `IMPLEMENTATION_CHECKLIST.md`
- **System Overview**: `README_FERRERO_SYSTEM.md`
- **Database Schema**: `FERRERO_DATABASE_SCHEMA.sql`
- **Code to Add**: `APPCONTEXT_REALTIME_ADDITIONS.js`

---

## 💡 PRO TIPS

1. **Test campaigns before sending** - Use preview screen
2. **Set campaign duration wisely** - 3-7 days is typical
3. **Use commission for volume** - Encourage larger orders
4. **Use discount for inventory** - Move stock faster
5. **Use cashback for engagement** - Build loyalty
6. **Monitor metrics** - Track what works

---

**You're ready to go! 🍫✨**

Start with test campaign → monitor → iterate → scale

Questions? Check the full docs or console logs.
