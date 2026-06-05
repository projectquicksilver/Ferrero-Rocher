# Counter OS v2 - Complete Project Understanding

## 🎯 Project Overview

**Counter OS** is a B2B retail management platform for small Indian retailers and distributors. It connects:
- **Retailers** (shop owners) – manage inventory, process walk-in sales, order from distributors
- **Distributors** (wholesalers) – manage inventory, fulfill retailer orders, track earnings

The app runs on **React + Vite** frontend with **Supabase** backend. Two user roles with completely different dashboards.

---

## 📱 User Flows

### **RETAILER FLOW** 
1. **Login** → Phone OTP verification
2. **Onboarding** (new user only):
   - Shop Setup (name, location, category)
   - Link to distributors
   - Payout details
   - Ready screen
3. **Home Dashboard** → Wallet, quick actions, AI insights, weekly earnings chart
4. **Core Actions**:
   - **Sell** – Ring bell, scan product or search, add to cart, enter customer name, complete sale → cashback earned
   - **Add Inventory** – Manual add OR invoice scanning (OCR)
   - **Buy from Distributor** – Browse linked distributors' inventory, place B2B order
   - **Inventory** – View stock, low stock alerts
   - **Earnings/Sales** – Transaction history, wallet
   - **Wallet** – Add money, withdraw funds
   - **Notifications** – Campaign messages + order status updates
   - **Assistant** – AI chat for business advice
   - **Settings** – Profile, theme toggle

### **DISTRIBUTOR FLOW**
1. **Login** → Phone OTP verification
2. **Onboarding** (new user only):
   - Setup warehouse (name, location, category)
   - Link retailers (optional)
   - Payout details
   - Ready screen
3. **Distributor Home** – Wallet balance, quick actions, total receivables
4. **Core Actions**:
   - **Manage Incoming Orders** – pending → approve (send OTP) → delivered (verify OTP) OR reject
   - **Sell Items** – Can also have own retail sales
   - **Inventory** – Manage stock
   - **View Retailers** – Linked retailers, LTV (lifetime value), tier, last order
   - **Earnings/Ledger** – Transaction history
   - **Campaign Portal** – *NEW* – Send push notifications to all retailers (admin feature)

---

## 📊 Database Schema (6 Tables)

### 1. **profiles**
```sql
id (uuid, PK)
phone (text, UNIQUE)
name, shop, loc
role ('retailer' OR 'distributor')
cat ('agri','food','pharma','hardware','textile','electronics')
wallet_balance (numeric)
created_at
```
- **One row per user**
- Realtime enabled for wallet live-sync

### 2. **inventory**
```sql
id (bigserial, PK)
user_id (FK → profiles)
code, name, cat, unit
qty, buy, sell, earn
mfg, exp
business_cat
created_at
```
- Products owned by each user
- AI-generated on first login (Intelligence service)

### 3. **orders** *(B2B wholesale orders)*
```sql
id (text, e.g. 'ORD-8291', PK)
retailer_id, retailer_name (FK)
items, total, status
otp, items_list (jsonb)
created_at
```
- Status: `pending` → `approved` → `fulfilled` OR `rejected`
- OTP for delivery verification
- Realtime enabled for order popups

### 4. **transactions** *(financial log)*
```sql
id (bigserial, PK)
user_id (FK)
type ('sale' OR 'purchase')
label, sub, amt, clr, icon
created_at
```
- Retail sales, B2B fulfillments, cashback rewards
- Used for Earnings screen

### 5. **notifications** *(in-app messages)*
```sql
id (bigserial, PK)
user_id (FK)
title, body, role
is_read
created_at
```
- Campaign portal broadcasts to all retailers (bulk insert)
- Order status updates (order approved, delivered, rejected)
- Realtime enabled

### 6. **connections** *(retailer ↔ distributor links)*
```sql
id (bigserial, PK)
retailer_id (FK)
distributor_id (FK)
created_at
UNIQUE (retailer_id, distributor_id)
```
- Many-to-many relationship
- Used in BuyFromDist and DistRetailers screens

---

## 🗂️ Folder Structure

```
src/
├── App.jsx                          # Router with 35+ routes
├── main.jsx                         # React entry
├── context/
│   └── AppContext.jsx               # CORE STATE (1100 lines)
│                                    # ├─ User auth & profiles
│                                    # ├─ Inventory (CRUD + AI seed)
│                                    # ├─ Orders (place, approve, deliver, reject)
│                                    # ├─ Cart & Sales
│                                    # ├─ Wallet & transactions
│                                    # ├─ Notifications
│                                    # ├─ Realtime listeners
│                                    # └─ Popup system
├── services/
│   ├── supabase.js                 # Supabase client init
│   ├── intelligence.js             # Claude API calls for AI
│   └── errorLogger.js              # Error tracking
├── screens/
│   ├── Login.jsx                   # Phone → OTP flow
│   ├── Home.jsx                    # Retailer dashboard
│   ├── DistHome.jsx                # Distributor dashboard
│   ├── onboarding/
│   │   ├── ShopSetup.jsx
│   │   ├── Distributor.jsx         # Distributor link screen
│   │   ├── DistSetup.jsx
│   │   ├── DistLinkRetailers.jsx
│   │   ├── Payout.jsx
│   │   └── Ready.jsx
│   ├── Sell.jsx                    # Ring bell + scan + cart
│   ├── Cart.jsx                    # Customer name + complete sale
│   ├── Success.jsx                 # Sale success screen
│   ├── Invoice.jsx                 # Manual add or scan invoice
│   ├── AddInventory.jsx            # Add product modal
│   ├── Inventory.jsx               # View all products
│   ├── BuyFromDist.jsx             # Search + filter distrib inventory
│   ├── DistRetailers.jsx           # Dist sees linked retailers
│   ├── Earnings.jsx                # Transaction history
│   ├── Wallet.jsx                  # Balance + add/withdraw
│   ├── WalletAdd.jsx
│   ├── WalletWithdraw.jsx
│   ├── Settings.jsx
│   ├── Notifications.jsx           # View campaign + order notifs
│   ├── Assistant.jsx               # AI chat interface
│   └── CampaignPortal.jsx          # ADMIN: send broadcast msgs
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx           # Main wrapper
│   │   ├── Header.jsx              # Title + back button
│   │   └── BottomNav.jsx           # Home, Sell, Inventory, etc tabs
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx               # Text + OtpInput
│   │   ├── Card.jsx
│   │   ├── Chip.jsx
│   │   ├── Toast.jsx               # Toast notifications
│   │   ├── GlobalPopup.jsx         # Realtime popups (order alerts)
│   │   ├── ManualAddModal.jsx      # Product add form
│   │   ├── ProductIcon.jsx         # Category emoji icons
│   │   ├── Scanner.jsx             # Barcode scanner
│   │   └── AIDropdown.jsx          # Dropdown for suggestions
│   ├── ai/
│   │   └── BusinessBuddy.jsx       # AI chat UI
│   └── ErrorBoundary.jsx
└── index.css                       # CSS variables (dark/light themes)
```

---

## 🔑 Key Features

### 1. **Phone OTP Login**
- No email—just phone number
- Demo OTP: `1234`
- Creates user in Supabase on first login

### 2. **Role-Based Dashboards**
- **Retailer**: Focus on selling + restocking
- **Distributor**: Focus on fulfilling orders + managing retailers

### 3. **Inventory Management**
- AI-generates seed inventory on first login (Claude API via Intelligence service)
- Category-specific products (agri, food, pharma, hardware, textile, electronics)
- Mfg/Exp dates, buy/sell/earn prices

### 4. **B2B Order Workflow** (Retail → Distributor)
```
Retailer places order
       ↓
Distributor sees pending order (popup alert)
       ↓
Distributor approves → OTP sent to retailer
       ↓
Retailer enters OTP in cart → confirms receipt
       ↓
Distributor scans OTP to fulfill → funds added
```

### 5. **Wallet & Cashback**
- Earn on retail sales (customer walk-ins)
- Earn on B2B fulfillment (distributor role)
- Add money / Withdraw funds
- Purchase rewards: ₹5k+ = 5% cashback, ₹10k+ = 10%

### 6. **Campaign Portal** ⭐ (NEW)
- **Access**: `?access=cos-admin-2025`
- Send bulk push notifications to retailers
- Filter by category (agri, food, pharma, etc.)
- 5 campaign types: Promo, Reward, Alert, Announcement, Cashback
- Preview on phone mockup before sending
- Inserts one `notifications` row per retailer

### 7. **Realtime Features** (Supabase websockets)
- Order status updates (pending → approved → fulfilled)
- Wallet balance sync
- New notifications arrival

### 8. **AI Assistant**
- Claude API integration (Intelligence service)
- Context-aware advice for inventory, sales, restocking
- Daily insight on Home dashboard

### 9. **Dark/Light Theme**
- Toggle in Home header
- CSS variables swap colors

---

## 🔄 AppContext Methods

### Auth & Profile
```javascript
loginUser(phone, role, isNew)           // Authenticate
updateProfile(updates)                  // Edit shop name, loc, etc
```

### Inventory
```javascript
setInventory(updater)                   // Update local inventory
addInventoryItem(item)                  // Add product to DB
initializeAIStore(category, label)      // AI seed on first login
```

### Selling
```javascript
addToCart(product)                      // Add product to cart
updateCartQty(id, delta)                // Adjust qty
clearCart()                             // Clear cart
completeSale(customerName, phone)       // Finalize walk-in sale
```

### B2B Orders
```javascript
placeB2BOrder(order)                    // Retailer places order
approveB2BOrder(orderId)                // Distributor approves + sends OTP
deliverB2BOrder(orderId, enteredOtp)    // Verify OTP, settle funds
rejectB2BOrder(orderId)                 // Reject due to out of stock
```

### Connections
```javascript
saveConnectionLink(distributorProfile)  // Link/unlink distributor
```

### Wallet & Transactions
```javascript
setWalletBalance(updater)
addTransaction(txn)
addNotification(notif)
```

### Popups
```javascript
showGlobalPopup(popup, targetRole)      // Show alert (realtime)
```

---

## 📡 Realtime Subscriptions (AppContext useEffect)

**Tables subscribed to:**
1. **orders** – When status changes, show popup to affected user
2. **profiles** – Wallet balance sync when updated
3. **notifications** – Show toast/badge when new notif arrives

**Realtime event handlers:**
- New order INSERT → Distributor sees popup
- Order UPDATE (approved) → Retailer gets OTP
- Order UPDATE (fulfilled) → Retailer sees delivery success
- Notification INSERT → Show badge + toast

---

## 🎨 Styling

- **CSS Variables** (dark mode)
  ```css
  --bg1, --bg2, --bg3           /* Background shades */
  --t1, --t2, --t3              /* Text shades */
  --g4                          /* Green (primary) */
  --o4                          /* Orange (secondary) */
  --e4                          /* Red (error) */
  --bdr, --bdr2                 /* Border colors */
  --fm                          /* Font family */
  --fd                          /* Font display (monospace) */
  --r8, --r12, --r16            /* Border radius */
  ```

- **Components use `var(--*)` for theme switching**
- No Tailwind—hand-written inline styles + CSS classes

---

## 🚀 Key Flows

### Retailer Day-in-Life
1. Open app → Login with phone
2. Home dashboard shows wallet, quick actions, AI insight
3. Customer walks in → Scan product (or search) → Add to cart → "Complete Sale" dialog
4. Sale complete → Cashback earned, notification sent
5. Low on DAP? → "Order from Distributor" → Browse linked dist inventory → Place order
6. Order approved → Get OTP → Enter in cart to confirm receipt
7. Check Earnings/Wallet → Add money if needed

### Distributor Day-in-Life
1. Open app → Login with phone
2. Distributor Home shows wallet, total receivables from retailers
3. Notification bell rings → New order from Ramesh Agro Traders
4. Tap "Incoming Orders" → See pending order
5. Approve order → OTP generated and sent to retailer
6. Retailer confirms receipt → Tap "Deliver Order"
7. Enter OTP → Funds added to wallet ✅

### Admin Campaign Portal
1. Go to `?access=cos-admin-2025`
2. Choose campaign type (Promo, Reward, etc.)
3. Select audience (All Retailers, Agri Retailers, etc.)
4. Write title + body
5. See live preview on phone mockup
6. Click "Launch Campaign" → All matching retailers get push notification

---

## 📝 Notable Code Patterns

### Local Storage Fallback
- If Supabase not configured, app uses localStorage
- All data syncs to local storage for offline support
- Great for testing without real backend

### Realtime Popup System
- `globalPopup` state in AppContext
- `GlobalPopup.jsx` component shows/hides modal
- Order events trigger popups automatically

### AI Integration
- `Intelligence.ask(prompt, systemPrompt)` – calls Claude API
- Used in Home daily insight, Assistant chat
- Graceful fallback if API fails (shows default message)

### Cashback Logic
- `₹0–5k` purchase → No cashback
- `₹5k–10k` → 5% cashback
- `₹10k+` → 10% cashback
- Applied on inventory add, transferred to wallet

### Cart System
- Product objects have `qty` field
- `addToCart()` increments qty if already in cart
- `completeSale()` deducts qty from inventory after sale

---

## ⚙️ Environment Setup

**`.env.local` (needed for Supabase):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Fallback credentials** hardcoded in `supabase.js` for demo (public project).

---

## 🔒 Security Notes

- RLS policies currently allow `USING (true)` – needs proper auth
- Campaign portal protected by hardcoded token (`cos-admin-2025`)
- Anon key used (no authentication required)
- Ready to integrate Supabase Auth once deployed

---

## 🎯 Next Steps / TODOs

- [ ] Proper Supabase Auth (magic links or Google OAuth)
- [ ] Tighten RLS policies to `auth.uid()`
- [ ] Real barcode scanner library
- [ ] Invoice OCR (currently UI only)
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Push notifications to app (FCM integration)
- [ ] Analytics dashboard (revenue, retention)
- [ ] Referral program
- [ ] Rating/review system for retailers

---

## 📞 Contact & Support

- **Project**: CounterOS v2
- **Stack**: React + Vite + Supabase + Claude AI
- **Users**: Indian retail shop owners + distributors
- **Status**: MVP ready for beta testing

