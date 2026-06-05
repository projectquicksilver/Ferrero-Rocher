# 📊 Integration Diagram - Counter OS Ferrero System

---

## 🔄 Complete Campaign Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ADMIN PORTAL                                    │
│                   /campaign-portal?access=token                          │
│                                                                          │
│  Step 1: Select Offer Type                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 💰 Commission  │ 🔥 Discount  │ 🎁 Combo  │ 💳 Cashback         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Step 2: Configure Campaign                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Products: [Select Ferrero products]                              │  │
│  │ Commission %: [5-20%]                                            │  │
│  │ Min Qty: [10-50 units]                                           │  │
│  │ Title: "💰 Golden Commission Boost"                              │  │
│  │ Description: "Earn extra on all sales..."                        │  │
│  │ Duration: [7 days]                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Step 3: Launch                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    [Send to Retailers]                            │  │
│  │                   (launches campaign)                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (Supabase)                               │
│                                                                          │
│  offer_campaigns table:                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ id          │ 1                                                  │  │
│  │ title       │ "💰 Golden Commission Boost"                       │  │
│  │ description │ "Earn extra on all sales..."                       │  │
│  │ offer_type  │ "commission"                                       │  │
│  │ target_role │ "retailer"                                         │  │
│  │ commission_ │ 8                                                  │  │
│  │ pct         │                                                    │  │
│  │ is_active   │ true                                               │  │
│  │ start_date  │ 2026-06-05T10:30:00Z                              │  │
│  │ end_date    │ 2026-06-12T10:30:00Z                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  notifications table (created for each retailer):                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ user_id    │ retail_user_123                                     │  │
│  │ title      │ "✨ Golden Commission Boost"                        │  │
│  │ body       │ "Earn extra on all sales..."                        │  │
│  │ type       │ "campaign"                                          │  │
│  │ is_read    │ false                                               │  │
│  │ campaign_id│ 1                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │ Supabase Real-Time Event  │
                    │    (INSERT trigger)       │
                    └───────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      RETAILER APP (Home Screen)                          │
│                      (Real-Time Update Received)                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  🎉 Toast: "New offer: Golden Commission Boost!"                │  │
│  │     (auto-dismisses after 2.6 seconds)                          │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Header                                                          │  │
│  │  [🔔 Gold highlight + Badge "1"]                                │  │
│  │    ↑ Shows unread notification                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  💳 Wallet Card (Gold border)      🏆 Points Card (NEW!)       │  │
│  │  ₹3,482.50                         125 pts                      │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  ✨ Active Offers (1)                                            │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ 💰 Golden Commission Boost                               │   │  │
│  │  │    Earn extra commission on all sales this week          │   │  │
│  │  │    [Claim →]                                             │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │  ↑ Campaign displayed with icon                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Timeline:                                                               │
│  Create ──(0ms)──> Notify ──(0ms)──> Display ──(auto)──> Toast        │
│                    (instant)         (real-time)        (visible)      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 Commission & Points Flow

```
┌────────────────────────────────────┐
│   Retailer Goes to Sell Screen      │
│                                    │
│  Sees campaign banner:              │
│  "💰 Earn Extra Commission!"        │
└────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────┐
│    Select Product                   │
│    Product: Ferrero Rocher 48pc    │
│    Qty: 15 pieces                  │
│    Price: ₹500                     │
└────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────┐
│    Click "Complete Sale"            │
│                                    │
│    applySaleCommission() called:   │
│    • productId: "prod_fr_48"       │
│    • piecesSold: 15                │
│    • pricePerPiece: 500            │
└────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────┐
│    Commission Calculation                      │
│                                               │
│    baseTotal = 15 × 500 = ₹7,500             │
│    campaign.commission_pct = 8%               │
│    commission = 7,500 × 8% = ₹600            │
│                                               │
│    Checks:                                    │
│    ✓ Campaign found                           │
│    ✓ Product matches                          │
│    ✓ Qty >= min_qty (15 >= 10)               │
│    ✓ Commission calculated                    │
└────────────────────────────────────────────────┘
                    │
                    ├─────────────────────┐
                    ▼                     ▼
        ┌─────────────────┐      ┌──────────────────┐
        │  Update Wallet  │      │ Add Point Credits│
        │  ₹600 added     │      │ 600 points added │
        └─────────────────┘      └──────────────────┘
                    │                    │
                    └────────────┬───────┘
                                 ▼
                    ┌──────────────────────┐
                    │  Show Toast:         │
                    │  💰 Earned ₹600     │
                    │  from campaign!      │
                    └──────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │  Log Transaction:    │
                    │  Type: credit        │
                    │  Amount: 600 pts     │
                    │  Description:        │
                    │  "Points from        │
                    │   Rocher sale"       │
                    └──────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │  Update Home Screen: │
                    │  Points: 125 → 725   │
                    └──────────────────────┘
```

---

## 🏪 Three-Screen Integration

```
┌──────────────────────────────────────────────────────────────────────┐
│                      HOME SCREEN                                     │
│                 (Campaign Discovery)                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 🏆 Ferrero Points: 125 pts     [Redeem]                        │ │
│  │                                                                │ │
│  │ ✨ Active Offers (1)                                           │ │
│  │ ┌──────────────────────────────────────────────────────────┐ │ │
│  │ │ 💰 Golden Commission Boost                               │ │ │
│  │ │    Earn extra on all sales                               │ │ │
│  │ │    [Claim →] ← Click here to claim                       │ │ │
│  │ └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      SELL SCREEN                                     │
│                  (Campaign Earnings)                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 💰 Earn Extra Commission!                                      │ │
│  │ Golden Commission Boost is active                              │ │
│  │ Earn 8% commission on all sales!                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [Product Selection & Cart]                                         │
│                                                                      │
│  [Proceed to Checkout] ← Gold→Burgundy gradient button             │
│                                                                      │
│  After sale: 💰 Toast shows earned amount                          │
│  Points automatically updated                                       │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   NOTIFICATIONS SCREEN                               │
│                 (Campaign Tracking)                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ✨ Golden Commission Boost                                     │ │
│  │ 💰                                                              │ │
│  │ Earn extra commission on all sales                             │ │
│  │                                                                │ │
│  │ [View Offer →] ← See details                                   │ │
│  │                                                                │ │
│  │ · Just now   (timestamp)                                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 💡 Daily Insight                                               │ │
│  │ Regular notification...                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
         │                          │                        │
         └──────────────────────────┼────────────────────────┘
                                    ▼
                    ┌─────────────────────────────┐
                    │  All campaigns visible      │
                    │  One unified experience     │
                    │  Ferrero branded throughout │
                    └─────────────────────────────┘
```

---

## 🏦 Wallet Screen Evolution

```
BEFORE:
┌────────────────────────────┐
│     Wallet Screen          │
├────────────────────────────┤
│ 💳 Wallet Balance: ₹3,482  │
│ [Add] [Withdraw]           │
├────────────────────────────┤
│ Wallet History:            │
│ • Purchase +₹1,000         │
│ • Sale +₹100               │
│ • Withdrawal -₹500         │
└────────────────────────────┘


AFTER:
┌────────────────────────────────────┐
│     Wallet Screen                  │
├────────────────────────────────────┤
│ [💳 Wallet] [🏆 Points] ← Tabs!    │
├────────────────────────────────────┤
│                                    │
│ TAB 1: 💳 WALLET                   │
│ ┌────────────────────────────────┐ │
│ │ Total Balance: ₹3,482          │ │
│ │ [Add] [Withdraw]               │ │
│ │                                │ │
│ │ Wallet History:                │ │
│ │ • Purchase +₹1,000  (Just now) │ │
│ │ • Sale +₹100       (2h ago)   │ │
│ │ • Withdrawal -₹500 (Yesterday) │ │
│ └────────────────────────────────┘ │
│                                    │
│ TAB 2: 🏆 POINTS ← NEW TAB!        │
│ ┌────────────────────────────────┐ │
│ │      Ferrero Points            │ │
│ │          725 pts               │ │
│ │ Earn 1 point per ₹1            │ │
│ │  [Redeem 100 Points]           │ │
│ │                                │ │
│ │ Points History:                │ │
│ │ 📈 +600 pts (Just now)         │ │
│ │    Campaign sale bonus         │ │
│ │ 📈 +125 pts (2h ago)           │ │
│ │    Previous sale               │ │
│ │ 📉 -100 pts (Yesterday)        │ │
│ │    Redeemed for discount       │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

## 🔔 Notification Bell State Changes

```
NO CAMPAIGNS:
┌──────────────┐
│  [🔔]        │  ← Gray, no badge
│  No highlight│
└──────────────┘


ONE CAMPAIGN:
┌──────────────┐
│  [🔔]        │  ← Gold background
│   1          │  ← Red badge
│  With glow   │
└──────────────┘


MULTIPLE CAMPAIGNS:
┌──────────────┐
│  [🔔]        │  ← Gold background
│   3          │  ← Red badge shows count
│  Pulsing dot │
└──────────────┘


AFTER READ:
┌──────────────┐
│  [🔔]        │  ← Back to gray
│  No badge    │
└──────────────┘
```

---

## 🎨 Light Theme Color Scheme

```
PRIMARY (Ferrero Gold):
┌─────────────────────────────┐
│ #d4a574 - Buttons, Borders  │
│ Gold accents throughout     │
│ Used for: Primary CTAs      │
└─────────────────────────────┘

SECONDARY (Burgundy):
┌─────────────────────────────┐
│ #c41e3a - Accents, Badges   │
│ Text highlights             │
│ Used for: Emphasis          │
└─────────────────────────────┘

DARK GOLD:
┌─────────────────────────────┐
│ #8b6f47 - Subtle accents    │
│ Hover states               │
│ Used for: Details          │
└─────────────────────────────┘

ON LIGHT BACKGROUND:
┌─────────────────────────────┐
│ Background: #ffffff (white) │
│ Text: #2d2d2d (dark)        │
│ Accents: Gold + Burgundy    │
│ Luxury feel on light theme  │
└─────────────────────────────┘
```

---

## ⏱️ Timeline: Campaign Launch to Points Earned

```
T+0ms:    Admin clicks "Send to Retailers"
          ↓
T+10ms:   Campaign inserted to offer_campaigns table
          ↓
T+15ms:   Notifications created for all retailers
          ↓
T+20ms:   Real-time event published by Supabase
          ↓
T+50ms:   Retailer's browser receives real-time update
          ↓
T+55ms:   showToast() called with campaign name
          ↓
T+60ms:   Toast notification visible on screen: "🎉 New offer!"
          ↓
T+70ms:   Notification bell highlights, badge shows "1"
          ↓
T+80ms:   Campaign appears in "Active Offers" section
          ↓
T+100ms:  User sees complete notification
          
          [Retailer claims campaign and completes sale]
          
T+5s:     Retailer completes sale (selects product, qty, price)
          ↓
T+5.1s:   applySaleCommission() called
          ↓
T+5.2s:   Commission calculated from campaign terms
          ↓
T+5.3s:   Wallet balance increased
          ↓
T+5.4s:   addPointCredits() called
          ↓
T+5.5s:   Points transaction logged
          ↓
T+5.6s:   showToast() called: "💰 Earned ₹600 from campaign!"
          ↓
T+5.7s:   Toast visible on Sell screen
          ↓
T+5.8s:   Home screen updates: Points card shows +600
          ↓
T+8.3s:   Toast auto-dismisses
          ↓
T+∞:      Points tracked in Wallet → 🏆 Points tab


TOTAL TIME FROM CAMPAIGN LAUNCH TO POINTS EARNED: ~5 seconds
```

---

## 🎯 Data Model

```
offer_campaigns
├── id (UUID)
├── title (string) ← "Golden Commission Boost"
├── description (string) ← "Earn extra..."
├── offer_type (enum) ← 'commission' | 'discount' | 'combo' | 'cashback'
├── target_role (string) ← 'retailer' | 'distributor'
├── is_active (boolean) ← true
├── start_date (timestamp)
├── end_date (timestamp)
├── product_ids (array) ← [{id, name, sku}, ...]
├── commission_pct (number) ← 5-20
├── commission_min_qty (number) ← 10-50
├── discount_pct (number)
├── discount_min_qty (number)
├── combo_pct (number)
├── cashback_amount (number)
├── cashback_days (number)
└── duration_days (number)


notifications
├── id (UUID)
├── user_id (UUID) ← Retailer ID
├── title (string) ← "✨ Golden Boost"
├── body (string) ← Campaign description
├── type (string) ← 'campaign'
├── offer_type (string) ← 'commission'
├── is_read (boolean)
├── campaign_id (UUID) ← Link to offer_campaigns
├── role (string) ← 'retailer'
├── created_at (timestamp)
└── offer_data (JSON) ← Full campaign details


pointCredits (AppContext State)
├── pointCredits (number) ← Total points balance
└── pointTransactions (array) ← History
    └── [{
        id,
        type: 'credit' | 'debit',
        amount,
        description,
        timestamp,
        balance
    }, ...]


commission (on sale)
├── productId ← from applySaleCommission()
├── piecesSold ← from user input
├── pricePerPiece ← from user input
└── Returns:
    ├── commission (number) ← ₹ amount
    └── cashback (number) ← ₹ amount
```

---

**All diagrams show the complete integration of:**
- 🎨 Light theme
- 🎉 Real-time notifications
- 💰 Commission system
- 🏆 Points credit system
- 📱 Multi-screen experience

🍫✨ **Complete Ferrero Counter OS Integration**
