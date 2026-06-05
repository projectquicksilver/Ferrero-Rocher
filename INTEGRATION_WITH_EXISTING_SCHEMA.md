# ✅ Campaign Portal Integration - Using Your Existing Schema

Your existing Supabase schema **already has everything needed**. Here's how to integrate the new Campaign Portal with **zero breaking changes**.

---

## 🎯 What's Already Working

Your schema has:
- ✅ `profiles` table (with role field)
- ✅ `campaigns` table (created for campaigns)
- ✅ `notifications` table (with campaign_id field already added)
- ✅ RPC function `send_campaign()` (atomic batch operation)
- ✅ Views `v_campaign_summary` (performance tracking)
- ✅ All realtime channels configured

---

## ✨ What's New

The new **CampaignPortal.jsx** is now in your project with:
- ✅ Ferrero Rocher branding (gold #d4a574, burgundy #c41e3a)
- ✅ Clean UI for campaign creation
- ✅ Phone mockup preview
- ✅ Campaign history
- ✅ Target audience selection (All Retailers / Distributors / Everyone)
- ✅ Integration with your existing database

---

## 🚀 3-Step Setup (5 minutes)

### **Step 1: Add Realtime Listener to AppContext**

Open `src/context/AppContext.jsx` and find the realtime subscriptions (around line 650):

```javascript
const notifChannel = supabase
  .channel('realtime-notif')
  .on('postgres_changes', { ... })
  .subscribe();

return () => {
  supabase.removeChannel(ordersChannel);
  supabase.removeChannel(profileChannel);
  supabase.removeChannel(notifChannel);
};
```

**ADD THIS BEFORE the return statement:**

```javascript
// ─── CAMPAIGN REALTIME NOTIFICATIONS ──────────────────────────
const campaignChannel = supabase
  .channel('realtime-campaigns-' + user.id)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('🎁 New Campaign Notification:', payload.new.title);

      if (payload.new.campaign_id) {
        // Add to notifications state
        setNotificationsState(prev => [{
          id: payload.new.id,
          campaign_id: payload.new.campaign_id,
          title: payload.new.title,
          body: payload.new.body,
          role: payload.new.role,
          isRead: payload.new.is_read,
          time: 'Just now'
        }, ...prev]);

        console.log('✅ Campaign notification added');
      }
    }
  )
  .subscribe();
```

**And update the cleanup:**

```javascript
return () => {
  supabase.removeChannel(ordersChannel);
  supabase.removeChannel(profileChannel);
  supabase.removeChannel(notifChannel);
  supabase.removeChannel(campaignChannel);  // ← ADD THIS
};
```

---

### **Step 2: Access Campaign Portal**

In your app, navigate to:
```
http://localhost:5173/campaign-portal?access=ferrero-admin-2025
```

OR manually enter token: `ferrero-admin-2025`

---

### **Step 3: Test Campaign Flow**

1. **Create campaign** in portal:
   - Type: Promo
   - Target: All Retailers
   - Title: "🎉 Ferrero Rocher Mega Sale!"
   - Body: "20% off this weekend!"

2. **Click "Launch Campaign"**
   - See success screen
   - Count shows how many retailers reached

3. **Check retailer notifications**:
   - Login as retailer (any phone: 9900000001)
   - Go to Notifications screen
   - See campaign appear instantly (if realtime listener added)

---

## 📊 How It Works With Your Schema

```
Admin Portal (CampaignPortal.jsx)
    ↓
    Calls: supabase.rpc('send_campaign', {...})
    OR: Manual INSERT → campaigns + notifications
    ↓
Your RPC Function (send_campaign):
    1. INSERT campaigns table
    2. BULK INSERT notifications (1 per retailer)
    ↓
Supabase Realtime Event
    Fires INSERT event on notifications table
    ↓
AppContext Listener (campaignChannel):
    Detects new notification
    Updates state
    UI refreshes automatically
    ↓
Retailer Sees:
    Toast notification (optional)
    Campaign in Notifications screen
```

---

## 🔧 Database Compatibility

Your existing schema **already supports** campaigns:

| Feature | Your Schema | Status |
|---------|-----------|--------|
| campaigns table | ✅ Exists | Ready |
| notifications table | ✅ Exists | Has campaign_id FK |
| Realtime enabled | ✅ Yes | notifications in publication |
| RPC send_campaign | ✅ Exists | Can be used |
| Target filtering | ✅ Yes | By role (retailer/distributor) |
| Batch inserts | ✅ Yes | RPC function handles it |

---

## 🎯 Campaign Portal Features

### **Admin Interface**
- **Campaign Types**: Promo, Reward Alert, Announcement, Cashback
- **Target Audience**: All Retailers / Distributors / Everyone
- **Message**: Title + Body (up to 250 chars)
- **Preview**: See how it looks on retailer's phone
- **History**: View all campaigns sent

### **Retailer Experience**
- **Instant Notifications**: See campaign appear in Notifications screen
- **Campaign Badge**: See which notifs are campaigns (📣 icon)
- **No Page Refresh**: Real-time updates via websocket
- **Mark Read**: Track open rate

### **Analytics (Available)**
- Open rate: Via `v_campaign_summary` view
- Click rate: If action_url implemented (Phase 2)
- Performance tracking: In `campaign_analytics` table

---

## 📱 What Retailers See

### **In Notifications Screen**
```
📣 CAMPAIGNS
┌───────────────────────────────┐
│ 🎉 Ferrero Rocher Mega Sale!  │
│ 📣 Campaign                   │
│ Get 20% off all boxes...       │
│ Just now                       │
└───────────────────────────────┘
```

### **Optional: Toast Notification**
You can add toast via showToast() if available in your app:
```javascript
showToast(`🎁 ${payload.new.title}`);
```

---

## ✅ Verification Checklist

After adding the realtime listener:

- [ ] CampaignPortal.jsx can be accessed at /campaign-portal
- [ ] Admin token "ferrero-admin-2025" works
- [ ] Can create campaigns in portal
- [ ] Campaign appears in Supabase campaigns table
- [ ] Notifications created in Supabase (35+ rows per campaign)
- [ ] Retailer sees notification in list (may need page refresh if realtime not connected)
- [ ] (BONUS) Realtime toast appears without refresh

---

## 🐛 Troubleshooting

### **Campaign doesn't appear in retailer's notifications**

Check:
```sql
-- Verify campaign created
SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 1;

-- Verify notifications created
SELECT COUNT(*) FROM notifications 
WHERE campaign_id IS NOT NULL;

-- Should see ~35+ rows
```

**Fix**: Hard refresh retailer app (Ctrl+Shift+R) or navigate away/back to Notifications

---

### **Realtime not working (notifications appear after refresh)**

Check:
1. Is `campaignChannel` listener added to AppContext? ✅
2. Is `notifications` table in `supabase_realtime` publication? ✅
3. Check browser console (F12) for errors
4. Check browser Network tab for websocket (ws://...)

**Fix**: 
- Verify listener code exact match
- Hard refresh: Ctrl+Shift+R
- Restart dev server

---

### **Admin token not working**

Token is **case-sensitive**: `ferrero-admin-2025`

Try:
- Copy from this doc
- Use URL: `?access=ferrero-admin-2025`
- Hard refresh: Ctrl+Shift+R

---

## 🎨 Ferrero Branding Already Applied

The new CampaignPortal.jsx has:

```
Primary Gold:     #d4a574
Secondary:        #c41e3a (Burgundy)
Background:       #f9f7f3 (Cream)
Text Dark:        #2d2d2d
Logo:             🍫
```

All campaign types, buttons, and UI use these colors.

---

## 📈 Next Steps (Optional Enhancements)

### **Phase 2 Features**
1. **Campaign Scheduling** – Send at specific time
2. **Campaign Templates** – Save & reuse
3. **Analytics Dashboard** – Charts of open rates
4. **Push Notifications** – FCM integration
5. **A/B Testing** – Compare variants
6. **Detailed Targeting** – By product, tier, region

### **Implementation**
- Your schema already has fields for these (scheduled_at, etc.)
- Just add UI/logic when ready
- No schema changes needed

---

## 💡 Pro Tips

### **Test Multiple Campaigns**
```sql
-- See all campaigns sent
SELECT * FROM v_campaign_summary;
```

### **Check Campaign Performance**
```sql
-- Open rate calculation
SELECT 
  c.title,
  COUNT(n.id) as total_sent,
  SUM(CASE WHEN n.is_read THEN 1 ELSE 0 END) as opened,
  ROUND(100.0 * SUM(CASE WHEN n.is_read THEN 1 ELSE 0 END) 
        / COUNT(n.id), 1) as open_rate_pct
FROM campaigns c
LEFT JOIN notifications n ON n.campaign_id = c.id
GROUP BY c.id;
```

### **Target Specific Audiences**
```sql
-- Count retailers by category (if using cat field)
SELECT cat, COUNT(*) 
FROM profiles 
WHERE role = 'retailer' 
GROUP BY cat;
```

---

## 🚀 You're Ready!

Your Campaign Portal is **100% integrated** with your existing database. Just:
1. Add the realtime listener to AppContext (3 min)
2. Test by sending a campaign
3. Enjoy instant notifications! 🎉

---

**Questions?** Check the detailed guide: `CAMPAIGN_INTEGRATION_GUIDE.md`

