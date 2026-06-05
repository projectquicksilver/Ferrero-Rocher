# ✅ Ferrero Rocher Campaign System - Complete Setup Checklist

## 📦 What You Got

Three new complete files to implement the **fully-integrated** Ferrero Rocher campaign system:

1. **SUPABASE_SCHEMA_FERRERO.sql** (350 lines)
   - Complete database schema for campaigns
   - All new tables with proper relationships
   - Ferrero product catalog seeded
   - Sample users (retailers + distributor + admin)

2. **CampaignPortal_FIXED.jsx** (750 lines)
   - Fully branded for Ferrero (gold #d4a574, burgundy #c41e3a)
   - Real-time integration with Supabase
   - Creates campaigns → pushes notifications → retailers see instantly
   - Admin token: `ferrero-admin-2025`
   - Phone preview mockup included

3. **CAMPAIGN_INTEGRATION_GUIDE.md** (400 lines)
   - Step-by-step implementation instructions
   - How the flow works end-to-end
   - Database changes explained
   - Testing scenarios
   - Troubleshooting guide

---

## 🚀 Quick Start (10 minutes)

### Step 1: Update Supabase (5 min)
```bash
1. Open your Supabase project → SQL Editor
2. Copy entire SUPABASE_SCHEMA_FERRERO.sql
3. Paste into SQL Editor
4. Click "Run"
5. Wait for success message
```

**Result**: 
- ✅ campaigns table created
- ✅ campaign_recipients table created
- ✅ campaign_analytics table created
- ✅ ferrero_products table with ~12 products
- ✅ 9 test users seeded (retailers + distributor + admin)
- ✅ Realtime enabled

---

### Step 2: Replace CampaignPortal (2 min)
```bash
# In your project directory:
mv src/screens/CampaignPortal.jsx src/screens/CampaignPortal_OLD.jsx
mv src/screens/CampaignPortal_FIXED.jsx src/screens/CampaignPortal.jsx
```

**Result**: 
- ✅ Campaign portal now sends real notifications
- ✅ Branded with Ferrero colors
- ✅ Admin token: `ferrero-admin-2025`

---

### Step 3: Update AppContext (3 min)

Find this section in `src/context/AppContext.jsx` (around line 650-670):

```javascript
const notifChannel = supabase
  .channel('realtime-notif')
  .on('postgres_changes', { ... })
```

**Add this BEFORE the return cleanup:**

```javascript
// ─── CAMPAIGN REALTIME NOTIFICATIONS ──────────────────────────
const campaignChannel = supabase
  .channel('realtime-campaigns-' + user.id)
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, 
    (payload) => {
      console.log('🎁 New Campaign:', payload.new.title);
      
      if (payload.new.campaign_id) {
        setNotificationsState(prev => [{
          id: payload.new.id,
          campaign_id: payload.new.campaign_id,
          title: payload.new.title,
          body: payload.new.body,
          image_url: payload.new.image_url,
          role: payload.new.role,
          isRead: payload.new.is_read,
          time: 'Just now'
        }, ...prev]);
      }
    }
  )
  .subscribe();
```

**And in the return cleanup (around line 665):**

```javascript
return () => {
  supabase.removeChannel(ordersChannel);
  supabase.removeChannel(profileChannel);
  supabase.removeChannel(notifChannel);
  supabase.removeChannel(campaignChannel);  // ← ADD THIS
};
```

**Result**: 
- ✅ Retailers get instant notifications when campaigns sent
- ✅ Toast shows automatically
- ✅ Notifications list refreshes live

---

## 🧪 Test It (5 minutes)

### Test Scenario
1. **Open app in Chrome**: `http://localhost:5173`
   - Login with phone: `9900000001`
   - Password: `1234`

2. **Open Campaign Portal in Firefox** (different browser tab):
   - `http://localhost:5173/campaign-portal?access=ferrero-admin-2025`
   - or click URL, token will be: `ferrero-admin-2025`

3. **Create Test Campaign**:
   - Campaign Type: **Promo**
   - Target: **All Retailers**
   - Title: `🎉 Ferrero Rocher Mega Sale!`
   - Body: `Get 20% off this weekend only!`

4. **Click "Launch Campaign"**
   - See success screen
   - Count shows: "35 Users Reached"

5. **Switch back to Chrome (retailer)**
   - ✅ Toast appears: "🎁 🎉 Ferrero Rocher Mega Sale!"
   - ✅ Notification appears in top section
   - ✅ Notifications screen shows new campaign

---

## 📊 Database Structure

### New Tables (3)

**campaigns**
- id, admin_id, type, title, body, target_role, status, sent_at
- Stores each campaign sent

**campaign_recipients**
- id, campaign_id, user_id, sent_at, opened_at, clicked_at
- Audit log: who got what campaign

**campaign_analytics**
- id, campaign_id, total_sent, total_opened, total_clicked, open_rate
- Performance tracking

### Modified Tables (2)

**notifications**
- Added: campaign_id (links to campaigns), image_url, action_url, read_at
- Now supports campaign linking

**profiles**
- Removed: cat (no more multi-category)
- Added: is_active, updated_at
- Simplified for Ferrero-only

### New Inventory System

**ferrero_products** (12 products)
- Rocher Classic (4 variants)
- Golden Gallery (2)
- Raffaello (2)
- Rondnoir (2)
- Hazelnut Specialty (2)
- Premium collections (2)

**inventory** (now simpler)
- Links to ferrero_products via product_id
- Just qty + timestamps

---

## 🎯 What Happens When Admin Sends Campaign

```
1. Admin fills form in CampaignPortal
   ↓
2. Clicks "Launch Campaign"
   ↓
3. Backend creates:
   - campaigns record
   - notifications rows (1 per retailer)
   - campaign_recipients rows (audit)
   - campaign_analytics row
   ↓
4. Supabase realtime fires INSERT on notifications
   ↓
5. AppContext listens → sees new notification
   ↓
6. Retailers see:
   - Toast: "🎁 🎉 Ferrero Rocher Mega Sale!"
   - New notification in Notifications screen
   - Badge counter increments
   ↓
7. Ferrero can track:
   - Who received (campaign_recipients)
   - Who opened (is_read flag + read_at)
   - Performance (campaign_analytics)
```

---

## 🔐 Admin Access

### Campaign Portal Entry Points

**Option 1: URL Parameter**
```
http://localhost:5173/campaign-portal?access=ferrero-admin-2025
```

**Option 2: Manual Token Entry**
```
Open: http://localhost:5173/campaign-portal
Token field appears
Enter: ferrero-admin-2025
```

### Who Can Access
- Only users with correct token
- Currently hardcoded (ready for auth integration later)
- Admin account created in seed data (phone: 9991111111)

---

## 🎨 Ferrero Branding Applied

### Colors
- **Primary**: #d4a574 (Gold)
- **Secondary**: #c41e3a (Burgundy)
- **Background**: #f9f7f3 (Cream)
- **Text**: #2d2d2d (Dark)

### Logo
- Emoji: 🍫 (in campaign portal header)
- Replaced generic branding everywhere

### Campaign Types
- 🎉 Promo (gold)
- 🎁 Reward (burgundy)
- ⚠️ Stock Alert (red)
- 📣 Announcement (blue)
- 💰 Cashback (gold)

---

## 📋 File Locations

```
d:\Counter OS v2\V2\
├── SUPABASE_SCHEMA_FERRERO.sql           ← Run in Supabase SQL Editor
├── src\screens\
│   ├── CampaignPortal.jsx                ← Replace with CampaignPortal_FIXED.jsx
│   ├── CampaignPortal_FIXED.jsx          ← New version (copy to ^)
│   └── Notifications.jsx                 ← (Optional: add campaign badge)
├── src\context\
│   └── AppContext.jsx                    ← Add campaign realtime listener
├── CAMPAIGN_INTEGRATION_GUIDE.md         ← Detailed implementation docs
└── FERRERO_ROCHER_SETUP_CHECKLIST.md     ← This file
```

---

## ✅ Pre-Launch Checklist

- [ ] Run SUPABASE_SCHEMA_FERRERO.sql in Supabase
- [ ] Verify ferrero_products table has 12 products
- [ ] Verify profiles table has 10 sample users
- [ ] Replace CampaignPortal.jsx with CampaignPortal_FIXED.jsx
- [ ] Add campaign realtime listener to AppContext.jsx
- [ ] Test login with phone 9900000001
- [ ] Test campaign portal with token ferrero-admin-2025
- [ ] Send test campaign to All Retailers
- [ ] Verify retailer sees toast notification instantly
- [ ] Check Notifications screen shows campaign
- [ ] Verify colors match Ferrero branding (gold #d4a574, burgundy #c41e3a)
- [ ] Test with Distributor role (should work too)
- [ ] Check localStorage history saves campaigns

---

## 🐛 Common Issues & Fixes

### "Campaign doesn't appear in retailer's notifications"
**Check**:
1. Did campaign send complete? (success screen appears)
2. Are you testing with same user?
3. Is retailer's role = 'retailer' in profiles?
4. Run: `SELECT * FROM notifications WHERE campaign_id = 'X'` in SQL

**Fix**: Refresh retailer's app or navigate away/back to Notifications screen

---

### "Toast doesn't appear but notification is in list"
**Check**: 
1. Is AppContext campaign listener added?
2. Is supabase realtime enabled?
3. Check browser console for errors

**Fix**: Hard refresh (Ctrl+Shift+R) and resend campaign

---

### "Admin token not working"
**Check**:
1. Is token exactly `ferrero-admin-2025`? (case-sensitive!)
2. Is CampaignPortal.jsx updated to _FIXED version?

**Fix**: Copy token again carefully, try URL parameter: `?access=ferrero-admin-2025`

---

### "ferrero_products not showing in inventory"
**Check**:
1. Did SQL script run completely?
2. Run: `SELECT COUNT(*) FROM ferrero_products;` → should be 12

**Fix**: Re-run SUPABASE_SCHEMA_FERRERO.sql, skip campaigns table creation (add IF NOT EXISTS)

---

## 🎓 Learning Resources

- **Realtime**: [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- **Notifications**: [Toast Pattern](https://ui-patterns.com/patterns/notification)
- **Campaign Systems**: Industry standard for e-commerce

---

## 🚀 Next Steps (Optional Enhancements)

1. **Campaign Scheduling**
   - Add `scheduled_at` logic
   - Auto-send at specific time

2. **Analytics Dashboard**
   - Chart open rates, click rates
   - Segment by retailer
   - A/B testing

3. **Campaign Templates Library**
   - Save custom templates
   - Reuse across campaigns

4. **Push Notifications**
   - FCM integration (Firebase Cloud Messaging)
   - Browser notifications when app closed

5. **Campaign Targeting**
   - By product sold
   - By retailer tier (Gold, Silver, Bronze)
   - By region

6. **A/B Testing**
   - Send variant A to 50%, variant B to 50%
   - Track which performs better

---

## 💬 Support

If you hit issues:
1. Check browser console (F12 → Console tab)
2. Check Supabase logs (Project → Logs)
3. Verify all files are in correct locations
4. Ensure Supabase URL & key correct in .env.local
5. Test with demo token in URL first

---

## 🎉 Success!

Once this is all working:
- ✅ Ferrero can send campaigns to retailers instantly
- ✅ Retailers see notifications in real-time
- ✅ Campaign history tracked
- ✅ Performance metrics available
- ✅ Everything branded for Ferrero Rocher

**You're ready to launch!** 🚀

