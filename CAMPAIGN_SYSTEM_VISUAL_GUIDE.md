# 📊 Ferrero Rocher Campaign System - Visual Guide

## 🎯 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FERRERO ROCHER ADMIN                        │
│                   Campaign Portal Interface                      │
│                                                                  │
│  Step 1: Select Type    ┌──────────────────────────────────┐   │
│  ┌─────────────────┐   │ 🎉 Promo    🎁 Reward   ⚠️ Alert│   │
│  │ 🎉 Promo       │   │ 📣 Announce 💰 Cashback         │   │
│  │ 🎁 Reward      │   └──────────────────────────────────┘   │
│  │ ⚠️ Alert       │                                             │
│  │ 📣 Announce    │  Step 2: Choose Target                     │
│  │ 💰 Cashback    │  ┌──────────────────────────────────┐   │
│  └─────────────────┘   │ 🛍️ All Retailers  🏭 Distributors  │
│                        │ 🌐 Everyone                      │
│  Step 3: Write Message │ (Estimated reach: 35 retailers) │
│  ┌─────────────────┐   └──────────────────────────────────┘   │
│  │ Title: [text]   │                                             │
│  │ Body:  [text]   │  Step 4: Preview on Phone                │
│  │ Len:   0/250    │  ┌──────────────────────────────────┐   │
│  └─────────────────┘   │ ┌─────────────────────────────┐ │   │
│                        │ │  🍫 Ferrero Rocher    9:41  │ │   │
│  [Preview Campaign]    │ │                             │ │   │
│                        │ │  📣 PROMO                   │ │   │
│                        │ │  🎉 Mega Sale!              │ │   │
│                        │ │  Get 20% off this...        │ │   │
│                        │ │                             │ │   │
│                        │ │  [home] [sell] [inv]...     │ │   │
│                        │ └─────────────────────────────┘ │   │
│                        └──────────────────────────────────┘   │
│                                                                  │
│                        ┌────────────────┐                      │
│                        │ [Launch Campaign] →                   │
│                        └────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                           │
│                                                                  │
│  1. Create Campaign         ┌─────────────────────────────┐   │
│     INSERT INTO campaigns   │ id: uuid                    │   │
│                             │ admin_id: uuid              │   │
│  2. Create Notifications    │ type: 'promo'               │   │
│     (1 per retailer)        │ title: 'Mega Sale!'         │   │
│     INSERT INTO             │ target_role: 'retailer'     │   │
│     notifications (35 rows) │ status: 'sent'              │   │
│                             │ sent_at: timestamp          │   │
│  3. Create Recipients Log   └─────────────────────────────┘   │
│     INSERT INTO                                                │
│     campaign_recipients     notifications:                    │
│     (audit log, 35 rows)    ┌──────────────────────────┐   │
│                             │ id: 1-35                 │   │
│  4. Create Analytics        │ campaign_id: uuid        │   │
│     INSERT INTO             │ user_id: retailer_id     │   │
│     campaign_analytics      │ title: 'Mega Sale!'      │   │
│                             │ body: '20% off...'       │   │
│                             │ is_read: false           │   │
│                             └──────────────────────────┘   │
│                                                                  │
│  5. Fire Real-time Event                                      │
│     Supabase publishes:                                       │
│     INSERT event on notifications table                       │
│     For each user_id (retailer)                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RETAILER APP (Real-time)                     │
│                                                                  │
│  AppContext listens:                                           │
│  supabase                                                      │
│    .channel('realtime-campaigns-' + user.id)                 │
│    .on('postgres_changes', { event: 'INSERT' })             │
│    → Detects new notification                                │
│                                                                  │
│  Instant Actions:                                             │
│  ✅ Toast notification pops up                              │
│  ✅ Add to notifications list                              │
│  ✅ Update badge counter                                   │
│  ✅ Show global popup (optional)                           │
│  ✅ NO page refresh needed                                 │
│                                                                  │
│  RETAILER SEES:                                               │
│                                                                  │
│  ┌────────────────────────────────────┐                      │
│  │ 🎁 🎉 Ferrero Rocher Mega Sale!    │ ← Toast              │
│  │ (auto-dismiss)                     │   Notification       │
│  └────────────────────────────────────┘                      │
│                                                                  │
│  Notifications Screen:                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 📣 CAMPAIGNS                                       │     │
│  │ ┌────────────────────────────────────────────────┐ │     │
│  │ │ 🎉 Ferrero Rocher Mega Sale!        📣 Campaign│ │     │
│  │ │ Get 20% off all boxes this weekend!            │ │     │
│  │ │ Just now                                       │ │     │
│  │ └────────────────────────────────────────────────┘ │     │
│  │                                                    │     │
│  │ [OTHER NOTIFICATIONS...]                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                                  │
│  Home Screen (Optional):                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 📣 Special Offer from Ferrero Rocher!              │     │
│  │ 🎁 Get 20% off all boxes...          [View]       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 User Interface Flow

### **Campaign Portal (Admin)**

```
┌─────────────────────────────────────────┐
│  🔐 LOGIN                               │
│  Enter token: [ferrero-admin-2025]      │
│  [Unlock Portal]                        │
└──────────────────┬──────────────────────┘
                   │ (token validated)
                   ↓
┌─────────────────────────────────────────┐
│  📣 FERRERO ROCHER CAMPAIGN PORTAL       │
│                                          │
│  [Header with history]                  │
│                                          │
│  ┌─ COMPOSE ─────────────────────────┐  │
│  │                                   │  │
│  │ 01 CAMPAIGN TYPE                  │  │
│  │ [🎉] [🎁] [⚠️] [📣] [💰]          │  │
│  │                                   │  │
│  │ 02 TARGET AUDIENCE                │  │
│  │ [🛍️ All Retailers]  [🏭 Dist]     │  │
│  │ [🌐 Everyone]                     │  │
│  │ Reach: ~35 retailers              │  │
│  │                                   │  │
│  │ 03 WRITE MESSAGE                  │  │
│  │ Title: [_________________]  80   │  │
│  │ Use templates → [Quick fill]      │  │
│  │                                   │  │
│  │ Body: [________________]  0/250   │  │
│  │ [___________________________]      │  │
│  │                                   │  │
│  │        [Preview Campaign →]       │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌─ PREVIEW ─────────────────────────┐  │
│  │                                   │  │
│  │  📱 Phone Mockup                  │  │
│  │  ┌──────────────────────┐         │  │
│  │  │ Ferrero... 9:41      │         │  │
│  │  │ ┌──────────────────┐ │         │  │
│  │  │ │ 📣 PROMO         │ │         │  │
│  │  │ │ 🎉 Mega Sale!    │ │         │  │
│  │  │ │ 20% off...       │ │         │  │
│  │  │ │ [nav bar]        │ │         │  │
│  │  │ └──────────────────┘ │         │  │
│  │  └──────────────────────┘         │  │
│  │                                   │  │
│  │  35 Target Retailers              │  │
│  │  🛍️ All Retailers                 │  │
│  │  📣 Promo                         │  │
│  └───────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

### **Preview Modal**

```
┌──────────────────────────────────────┐
│  📣 READY TO SEND?                    │
│                                      │
│  This will send to 35 retailers       │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ 📣 PROMO  🛍️ All Retailers      ││
│  │                                  ││
│  │ 🎉 Mega Sale!                   ││
│  │ Get 20% off all boxes...         ││
│  └──────────────────────────────────┘│
│                                      │
│  [← Edit]  [🚀 Launch Campaign]     │
│                                      │
└──────────────────────────────────────┘
```

### **Success Screen**

```
┌──────────────────────────────────────┐
│         🚀 CAMPAIGN LAUNCHED!        │
│                                      │
│  Your message is on its way          │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  35         ✅        Live       ││
│  │  Reached    Delivered Status     ││
│  └──────────────────────────────────┘│
│                                      │
│  📣 Campaign Preview                 │
│  🎉 Mega Sale!                       │
│  Get 20% off all boxes...            │
│                                      │
│  [View History]  [+ New Campaign]   │
│                                      │
└──────────────────────────────────────┘
```

---

## 📊 Database Relationship Diagram

```
┌──────────────────┐
│   profiles       │
├──────────────────┤
│ id (PK)          │──┐
│ phone            │  │
│ name             │  │ Foreign Keys
│ shop             │  │ (1:many)
│ loc              │  │
│ role             │  │
│ wallet_balance   │  │
└──────────────────┘  │
        ▲             │
        │             │
        └─────────────┼─────────────────────┐
              ┌─────────────────────────────┼───────────────┐
              │                             │               │
         (1:many)                      (1:many)        (1:many)
              │                             │               │
              ▼                             ▼               ▼
┌──────────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    campaigns             │  │  notifications   │  │   inventory      │
├──────────────────────────┤  ├──────────────────┤  ├──────────────────┤
│ id (PK)                  │  │ id (PK)          │  │ id (PK)          │
│ admin_id (FK→profiles)   │  │ user_id (FK)     │  │ user_id (FK)     │
│ type                     │  │ campaign_id (FK) │  │ product_id (FK)  │
│ title                    │  │ title            │  │ qty              │
│ body                     │  │ body             │  │ created_at       │
│ target_role              │  │ is_read          │  └──────────────────┘
│ status                   │  │ read_at          │
│ sent_at                  │  │ created_at       │
│ created_at               │  └──────────────────┘
└──────────────────────────┘
        │
        │ (1:many)
        ▼
┌────────────────────────────────────┐
│  campaign_recipients               │
├────────────────────────────────────┤
│ id (PK)                            │
│ campaign_id (FK→campaigns)         │
│ user_id (FK→profiles)              │
│ sent_at                            │
│ opened_at                          │
│ clicked_at                         │
│ created_at                         │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  campaign_analytics                │
├────────────────────────────────────┤
│ id (PK)                            │
│ campaign_id (FK→campaigns)         │
│ total_sent                         │
│ total_opened                       │
│ total_clicked                      │
│ open_rate                          │
│ click_rate                         │
│ created_at                         │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  ferrero_products                  │
├────────────────────────────────────┤
│ id (PK)                            │
│ name                               │
│ sku                                │
│ category                           │
│ unit                               │
│ cost_price                         │
│ retail_price                       │
│ margin                             │
│ image_url                          │
└────────────────────────────────────┘
```

---

## 🔄 Real-time Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN SENDS CAMPAIGN                             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │ Backend Processing (< 1 second)      │
         │                                      │
         │ 1. INSERT campaigns table            │
         │ 2. INSERT notifications table (35×)  │
         │ 3. INSERT campaign_recipients (35×)  │
         │ 4. INSERT campaign_analytics         │
         │ 5. Trigger realtime event            │
         └──────────┬───────────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────────┐
    │  Supabase Realtime Event Broadcast       │
    │  Table: notifications                    │
    │  Event: INSERT                           │
    │  Filter: user_id = X (for each user)     │
    └──────┬──────────────────────────────────┘
           │
           ├──────────────┬──────────────┬──────────────┐
           │              │              │              │
           ▼              ▼              ▼              ▼
      Retailer 1    Retailer 2    Retailer 3   ... Retailer 35
      App (Redux)   App (Redux)   App (Redux)       App (Redux)
           │              │              │              │
           │              │              │              │
           ├─ Updates state            │              │
           ├─ Shows toast              │              │
           ├─ Adds notification        │              │
           └─ Updates badge            │              │
                                       ▼              ▼
                                   [Similar flow for all retailers]
```

---

## 🎨 Color Usage Guide

```
Primary Gold: #d4a574
├─ Campaign portal header
├─ Type card borders (when selected)
├─ Step badges
├─ Primary buttons
└─ Live indicator dot

Secondary Burgundy: #c41e3a
├─ Reward campaign type
├─ Gradient in primary button
└─ Accent highlights

Light Background: #f9f7f3
├─ Page background
├─ Card backgrounds
├─ Input backgrounds
└─ Overall theme

Dark Text: #2d2d2d
├─ Headings
├─ Body text (primary)
└─ High contrast

Light Text: #999999
├─ Helper text
├─ Secondary info
├─ Disabled state
└─ Borders

Campaign Type Colors:
├─ Promo: Gold (#d4a574)
├─ Reward: Burgundy (#c41e3a)
├─ Alert: Red (#f87171)
├─ Announcement: Blue (#a0d2ff)
└─ Cashback: Gold (#d4a574)
```

---

## 📈 Performance Metrics

### **Campaign Delivery**
```
┌──────────────────────────────────────┐
│  Campaign Send Speed                 │
├──────────────────────────────────────┤
│  Admin clicks "Launch"               │
│  ↓                                   │
│  Backend processing: < 100ms         │
│  ↓                                   │
│  Realtime broadcast: < 500ms         │
│  ↓                                   │
│  Retailers receive: < 1 second       │
│                                      │
│  Total time to reach 35 retailers:   │
│  1-2 seconds ✅                      │
└──────────────────────────────────────┘
```

### **Database Operations**
```
┌──────────────────────────────────────┐
│  Batch Insert Performance            │
├──────────────────────────────────────┤
│  Creating 35 notifications:          │
│  Individual INSERTs: ~3500ms ❌      │
│  Batch INSERT: ~100ms ✅             │
│                                      │
│  35x faster with batch operations    │
└──────────────────────────────────────┘
```

---

## 🧪 Testing Checklist Visual

```
┌────────────────────────────────────────────────────────┐
│ SETUP PHASE                                            │
├────────────────────────────────────────────────────────┤
│ ☐ SQL script executed (6 tables created)              │
│ ☐ ferrero_products seeded (12 rows)                   │
│ ☐ Test users created (9 profiles)                     │
│ ☐ CampaignPortal.jsx replaced                         │
│ ☐ AppContext realtime listener added                  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ FUNCTIONAL TESTS                                       │
├────────────────────────────────────────────────────────┤
│ Test 1: Portal Access                                 │
│ ☐ Can access /campaign-portal without token           │
│ ☐ Can enter token ferrero-admin-2025                  │
│ ☐ Portal loads successfully                           │
│                                                        │
│ Test 2: Campaign Creation                             │
│ ☐ Can select campaign type (all 5 work)               │
│ ☐ Can select target (Retailers, Dist, All)            │
│ ☐ Can write title + body                              │
│ ☐ Preview shows on phone mockup                       │
│                                                        │
│ Test 3: Campaign Send                                 │
│ ☐ Success screen appears                              │
│ ☐ Correct count shown (e.g., 35 retailers)            │
│ ☐ Campaign created in DB                              │
│ ☐ Notifications rows created (35 rows)                │
│                                                        │
│ Test 4: Real-time Delivery                            │
│ ☐ Toast appears in retailer app instantly             │
│ ☐ Notification appears in list (no refresh)           │
│ ☐ Badge counter increments                            │
│ ☐ Campaign marked in history                          │
│                                                        │
│ Test 5: Data Integrity                                │
│ ☐ campaigns table has correct record                  │
│ ☐ campaign_recipients has 35 rows                     │
│ ☐ notifications linked to campaign_id                 │
│ ☐ analytics shows total_sent = 35                     │
│                                                        │
│ Test 6: Edge Cases                                    │
│ ☐ Offline mode (demo) still works                     │
│ ☐ Multiple campaigns in history                       │
│ ☐ Different target audiences work                     │
│ ☐ Long titles/bodies handled                          │
└────────────────────────────────────────────────────────┘
```

---

## 📞 Support Decision Tree

```
              Campaign Not Working?
                      │
         ┌────────────┴────────────┐
         │                         │
    Did admin        Did retailer get
    send campaign?   notification?
    │                │
    ├─ No            ├─ No
    │   └─> Check:   │   └─> Check:
    │       • Token OK? │    • AppContext updated?
    │       • Portal loads? │  • Realtime enabled?
    │       • No JS errors?  │  • User role = retailer?
    │                        │
    └─ Yes              └─ Yes
        │                   │
        └─> Check:     See Toast?
            • Count shown?  │
            • DB rows OK?   ├─ No
            • Status=sent?  │  └─> Check:
                           │      • Supabase connected?
                           │      • Network tab (ws)
                           │      • Console errors?
                           │
                           └─ Yes ✅
                              All working!
```

---

**End of Visual Guide**

This covers the entire system from admin perspective to retailer experience! 🎉

