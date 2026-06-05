# Campaign Portal Integration Guide - Ferrero Rocher Edition

## 🎯 What Changed

The Campaign Portal is now **fully integrated** with the Supabase backend and will push **real-time notifications** to retailers when campaigns are sent.

---

## 📊 Database Changes Required

### NEW TABLES TO CREATE
1. **campaigns** – Stores campaign metadata (title, body, type, target audience, status)
2. **campaign_recipients** – Tracks who received each campaign
3. **campaign_analytics** – Campaign performance metrics
4. **ferrero_products** – All Ferrero Rocher products (replaces multi-category system)

### MODIFIED TABLES
1. **profiles** – Removed `cat` field (no longer multi-category), added `is_active`, `updated_at`
2. **inventory** – Now links to `ferrero_products` via `product_id`, removed individual price fields
3. **notifications** – Added `campaign_id`, `image_url`, `action_url`, `read_at` timestamp
4. **orders** – Added `updated_at` field

### DELETED / DEPRECATED
- All category-specific logic (`agri`, `food`, `pharma`, etc.)
- Multi-category filtering in CampaignPortal
- Category-based inventory seeding

---

## 🚀 Implementation Steps

### Step 1: Update Supabase Schema
Run the entire `SUPABASE_SCHEMA_FERRERO.sql` file in your Supabase SQL Editor:
- Creates all 6 new tables
- Adds RLS policies
- Sets up realtime publication
- Seeds Ferrero products + sample users

**Important**: Run this BEFORE deploying the new code!

---

### Step 2: Replace CampaignPortal.jsx
```bash
# Backup old file
mv src/screens/CampaignPortal.jsx src/screens/CampaignPortal_OLD.jsx

# Use new version
mv src/screens/CampaignPortal_FIXED.jsx src/screens/CampaignPortal.jsx
```

**New Features:**
- Admin token changed to `ferrero-admin-2025` (or via URL `?access=ferrero-admin-2025`)
- Target roles: All Retailers, Distributors, Everyone
- Campaign types: Promo, Reward, Stock Alert, Announcement, Cashback
- Ferrero-themed colors (gold #d4a574, burgundy #c41e3a)
- Phone mockup preview
- Campaign history (localStorage + Supabase)
- Real-time notification delivery

---

### Step 3: Update AppContext.jsx

Add this **realtime listener** in the `useEffect` that sets up subscriptions (around line 650):

```javascript
// ─── CAMPAIGN NOTIFICATIONS (REALTIME) ───────────────────────
const campaignChannel = supabase
  .channel('realtime-campaigns')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, 
    (payload) => {
      console.log('🔔 New Campaign Notification:', payload.new);
      
      // Add to notifications list
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

      // Show toast
      showToast(`🎁 ${payload.new.title}`);

      // Show global popup (optional)
      showGlobalPopup({
        title: payload.new.title,
        message: payload.new.body,
        type: 'campaign',
        icon: 'campaign'
      });
    }
  )
  .subscribe();

// Add cleanup in return statement:
return () => {
  supabase.removeChannel(campaignChannel);
  // ... other cleanups
};
```

---

### Step 4: Update Notifications Screen

In `src/screens/Notifications.jsx`, optionally add campaign badge:

```javascript
// In the notifications map, add campaign indicator:
{myNotifs.map(n => (
  <div key={n.id} style={{ background: 'var(--bg2)', padding: '1rem', ... }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
      <h4 style={{ fontSize: '.9rem', fontWeight: 800 }}>{n.title}</h4>
      {n.campaign_id && (
        <span style={{ 
          background: 'rgba(212,165,116,.2)', 
          color: '#d4a574', 
          fontSize: '.65rem', 
          fontWeight: 700,
          padding: '.2rem .5rem',
          borderRadius: '4px'
        }}>📣 Campaign</span>
      )}
      {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--e4)' }}></span>}
    </div>
    <p style={{ fontSize: '.8rem', color: 'var(--t2)', lineHeight: 1.4 }}>{n.body}</p>
  </div>
))}
```

---

### Step 5: Update Home Screen (Optional Enhancement)

Add campaign banner on home dashboard:

```javascript
// In src/screens/Home.jsx, after wallet section:
const activeCampaigns = notifications.filter(n => 
  n.campaign_id && !n.isRead && n.role === user.role
);

{activeCampaigns.length > 0 && (
  <div style={{ 
    background: 'linear-gradient(135deg, rgba(212,165,116,.1), rgba(196,30,58,.1))',
    border: '1px solid rgba(212,165,116,.2)',
    borderRadius: 'var(--r12)',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <span style={{ fontSize: '1.5rem' }}>📣</span>
    <div>
      <p style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: '.2rem' }}>
        🎁 Special Offer from Ferrero Rocher!
      </p>
      <p style={{ fontSize: '.75rem', color: 'var(--t2)' }}>
        {activeCampaigns[0].body}
      </p>
    </div>
    <button onClick={() => navigate('/notifications')} 
      style={{ marginLeft: 'auto', background: 'var(--g4)', color: '#000', border: 'none', padding: '.4rem .8rem', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer' }}>
      View
    </button>
  </div>
)}
```

---

## 🔄 How Campaign Flow Works (End-to-End)

### 1. **Admin Creates Campaign**
- Visits `/campaign-portal?access=ferrero-admin-2025`
- Selects campaign type (Promo, Reward, etc.)
- Chooses target audience (All Retailers, Distributors, Everyone)
- Writes title + body
- Previews on phone mockup
- Clicks "Launch Campaign"

### 2. **Backend Processing**
```
Admin clicks "Launch Campaign"
    ↓
Campaign record created in `campaigns` table
    ↓
Fetch all users matching target role
    ↓
Create notification rows (1 per user) in `notifications` table
    ↓
Create campaign_recipients entries (audit log)
    ↓
Create campaign_analytics entry (tracking)
```

### 3. **Real-time Push to Retailers**
```
Notification rows inserted
    ↓
Supabase realtime publishes INSERT event
    ↓
AppContext listens to 'notifications' channel
    ↓
User sees toast: "🎁 Ferrero Rocher Mega Sale!"
    ↓
Notification appears in Notifications screen
    ↓
Badge counter updates in bottom nav
```

### 4. **Retailer Experience**
- **While on app**: Toast notification + auto-refresh notifications list
- **App closed**: Push notification when they reopen (via Notifications screen load)
- **Mark as read**: Notification is_read flag updated
- **Analytics**: Ferrero can track open rates, clicks, etc.

---

## 📋 Campaign Data Structure

### **campaigns table**
```json
{
  "id": "uuid",
  "admin_id": "uuid (FK to profiles)",
  "type": "promo|reward|alert|announcement|cashback",
  "title": "string",
  "body": "string",
  "image_url": "string (optional)",
  "target_role": "retailer|distributor|all",
  "scheduled_at": "timestamp (optional, for future scheduling)",
  "sent_at": "timestamp",
  "status": "draft|scheduled|sent|cancelled",
  "is_sent": true/false,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### **notifications table** (modified)
```json
{
  "id": "bigint",
  "user_id": "uuid (FK to profiles)",
  "campaign_id": "uuid (FK to campaigns) - NEW",
  "title": "string",
  "body": "string",
  "image_url": "string - NEW",
  "action_url": "string - NEW",
  "role": "retailer|distributor|admin",
  "is_read": false/true,
  "read_at": "timestamp - NEW",
  "created_at": "timestamp"
}
```

### **campaign_recipients table**
```json
{
  "id": "uuid",
  "campaign_id": "uuid (FK)",
  "user_id": "uuid (FK)",
  "sent_at": "timestamp",
  "opened_at": "timestamp (when user reads)",
  "clicked_at": "timestamp (when user taps action_url)",
  "created_at": "timestamp"
}
```

---

## 🎨 Ferrero Branding

### Colors
- **Primary Gold**: #d4a574
- **Secondary Burgundy**: #c41e3a  
- **Light Background**: #f9f7f3
- **Text Dark**: #2d2d2d

### Logo
- Emoji: 🍫 (Ferrero visual)
- Updated in CampaignPortal header

### Products
All seeded in `ferrero_products`:
- Rocher (48pc, 16pc, 8pc, single)
- Golden Gallery (42pc, 18pc)
- Raffaello (42pc, 20pc)
- Rondnoir (42pc, 20pc)
- Hazelnut Specialty
- Premium Assortment
- Holiday Gift Sets

---

## 🧪 Testing the Campaign Flow

### Test Scenario: Send "Flash Sale" Campaign

1. **Login as Retailer** (phone: 9900000001)
2. **Open Campaign Portal** (in new tab: `http://localhost:5173/campaign-portal?access=ferrero-admin-2025`)
3. **Create Campaign**:
   - Type: Promo
   - Target: All Retailers
   - Title: "🎉 Ferrero Rocher Mega Sale!"
   - Body: "20% off all boxes this weekend!"
4. **Click "Launch Campaign"**
5. **Switch back to retailer tab** → Should see:
   - Toast: "🎉 Ferrero Rocher Mega Sale!"
   - New notification in Notifications screen
   - Badge number increased in bottom nav

---

## 📊 Campaign Analytics (Optional)

Track performance via `campaign_analytics`:

```javascript
// In a future Analytics screen:
const { data: analytics } = await supabase
  .from('campaign_analytics')
  .select('*')
  .eq('campaign_id', campaignId)
  .single();

console.log(`Open rate: ${analytics.open_rate}%`);
console.log(`Click rate: ${analytics.click_rate}%`);
```

---

## ⚠️ Important Notes

1. **No more multi-category system** – Everything is Ferrero Rocher branded
2. **All inventory** is now Ferrero products (seeded in `ferrero_products` table)
3. **Retailers don't have category** field anymore (simplified profile)
4. **Distributor role** is preserved for B2B order workflow
5. **Admin role** is NEW (used for campaign management)
6. **localStorage fallback** still works for testing without Supabase

---

## 🔗 Migration Checklist

- [ ] Run `SUPABASE_SCHEMA_FERRERO.sql` in Supabase SQL Editor
- [ ] Verify `campaigns`, `campaign_recipients`, `campaign_analytics` tables created
- [ ] Verify `ferrero_products` seeded with ~12 products
- [ ] Backup and replace `CampaignPortal.jsx`
- [ ] Update `AppContext.jsx` with campaign realtime listener
- [ ] Test login → Open campaign portal → Send campaign → See notification
- [ ] Update `Notifications.jsx` (optional, for campaign badge)
- [ ] Update `Home.jsx` (optional, for campaign banner)
- [ ] Remove any remaining category-based UI code
- [ ] Test Ferrero branding colors in all screens

---

## 🚀 What Retailers See Now

### Notifications Screen
Each campaign notification shows:
- **Title**: e.g., "🎉 Ferrero Rocher Mega Sale!"
- **Body**: Campaign message
- **Badge**: "📣 Campaign" indicator
- **Unread dot**: If not yet viewed
- **Read status**: Toggles on tap

### Realtime Toast
```
Toast appears instantly when campaign sent:
"🎁 🎉 Ferrero Rocher Mega Sale!"
```

### Campaign Banner (Optional, on Home)
Shows active campaigns with quick "View" button linking to Notifications.

---

## 📞 Troubleshooting

### Campaign doesn't appear in retailer notifications
- ✅ Check `campaigns` table has `is_sent = true`
- ✅ Verify `notifications` rows were created (SELECT * FROM notifications WHERE campaign_id = 'X')
- ✅ Confirm retailer's `role = 'retailer'` in profiles

### Realtime notifications not working
- ✅ Check Supabase realtime is enabled in SQL Editor: `SHOW rls_config;`
- ✅ Verify `notifications` table is in `supabase_realtime` publication
- ✅ Check browser console for websocket errors

### Campaign Portal not loading
- ✅ Verify `ferrero-admin-2025` token (case-sensitive!)
- ✅ Check Supabase configured in `.env.local`
- ✅ Reload page after Supabase schema changes

---

## ✅ Success Metrics

After setup, you should be able to:
1. ✅ Send a campaign to 35+ retailers in < 2 seconds
2. ✅ See toast notification instantly on retailer's device
3. ✅ View campaign in Notifications screen
4. ✅ Track recipient count, open rate, click rate
5. ✅ See campaign history in CampaignPortal
6. ✅ All Ferrero products show in inventory

