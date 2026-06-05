# 🗄️ Database Setup Guide - Ferrero Counter OS

**Status:** Ready to set up your Supabase database  
**Time:** 5 minutes  
**What you'll do:** Copy SQL → Paste in Supabase → Done!

---

## 📋 WHAT THIS SCHEMA INCLUDES

### Tables Created (11 total)
1. **profiles** - Users (retailers, distributors, admins)
2. **ferrero_products** - Ferrero Rocher product catalog
3. **inventory** - Retailer stock levels
4. **offer_campaigns** - Marketing campaigns with real-time support
5. **campaign_notifications** - Track claimed campaigns per user
6. **commission_ledger** - Commission earning history
7. **wallet_transactions** - Wallet activity log
8. **orders** - B2B orders between retailers & distributors
9. **transactions** - Generic transaction history
10. **notifications** - System notifications
11. **connections** - Retailer-Distributor relationships

### Key Features
✅ Real-time enabled (campaigns, notifications, orders)  
✅ Row-level security (RLS) enabled  
✅ Proper foreign keys and constraints  
✅ Performance indexes  
✅ Sample data included (14 Ferrero products, 7 test users)  
✅ Campaign system ready to use  

---

## 🚀 SETUP STEPS

### Step 1: Go to Supabase
```
1. Visit https://supabase.com
2. Login to your project
3. Go to SQL Editor (left sidebar)
4. Create a new query
```

### Step 2: Copy the SQL
```
1. Open: SUPABASE_SCHEMA_FIXED.sql (in your project root)
2. Select ALL text (Ctrl+A)
3. Copy (Ctrl+C)
```

### Step 3: Paste in Supabase
```
1. In Supabase SQL Editor, paste the SQL
2. Click "Run" button
3. Wait for completion (should be ~5 seconds)
```

### Step 4: Verify Success
You should see:
```
✅ Tables Created: 11
✅ Ferrero Products: 14
✅ Test Users: 7
✅ Sample Campaigns: 1
```

If you see errors, see **TROUBLESHOOTING** below.

---

## 📊 DATABASE STRUCTURE

### Core Tables

**profiles** (Users)
```
id (UUID)
phone (unique)
name
shop
role: 'retailer' | 'distributor' | 'admin'
wallet_balance
created_at
```

**ferrero_products** (Product Catalog)
```
id (bigint)
name: e.g., "Ferrero Rocher 48 pieces"
sku: e.g., "FR-48"
category: 'Rocher', 'Golden Gallery', 'Raffaello', etc.
cost_price: ₹300
retail_price: ₹450
margin: 50%
is_active: boolean
```

**inventory** (Stock Levels)
```
id
user_id → profiles.id
product_id → ferrero_products.id
qty: 50 boxes
updated_at
```

### Campaign Tables

**offer_campaigns** (Marketing Campaigns)
```
id (UUID)
title: "💰 Golden Commission Week"
description: "Earn 8% extra commission..."
offer_type: 'commission' | 'discount' | 'combo' | 'cashback'
target_role: 'retailer' | 'distributor'
is_active: true
start_date, end_date
commission_pct: 8
commission_min_qty: 15
product_ids: JSON array
```

**campaign_notifications** (Who Claimed What)
```
id
campaign_id → offer_campaigns.id
user_id → profiles.id
is_claimed: boolean
claimed_at: timestamp
UNIQUE (campaign_id, user_id)
```

### Wallet Tables

**commission_ledger** (Commission History)
```
id
user_id
campaign_id
product_id
pieces_sold: 15
price_per_piece: 500
commission_amount: ₹600
cashback_amount: ₹0
```

**wallet_transactions** (Wallet Activity)
```
id
user_id
type: 'commission' | 'cashback' | 'withdrawal'
amount: ₹600
description: "Commission from sale"
campaign_id: references offer_campaigns
```

---

## 💾 SEED DATA

### Products (14 Ferrero items)
- Ferrero Rocher (48, 16, 8, single pieces)
- Golden Gallery (42, 18 pieces)
- Raffaello (42, 20 pieces)
- Rondnoir (42, 20 pieces)
- Hazelnut specialty boxes
- Premium assortments

### Test Users (7 profiles)
```
Phone           Name                    Role          Shop Name
9800000001      Rajesh Distributor      distributor   Rajesh Distributors
9900000001      Ramesh Kumar            retailer      Kumar Sweet House
9900000002      Sunita Patel            retailer      Patel Gift Store
9900000003      Mohan Sharma            retailer      Sharma Confectionery
9900000004      Anil Verma              retailer      Verma Premium Gifts
9900000005      Kavita Singh            retailer      Singh Luxury Sweets
9991111111      Admin Ferrero           admin         CounterOS Admin
```

### Sample Campaign (1 campaign)
```
Title: "💰 Golden Commission Week"
Type: Commission Boost
Offer: 8% extra commission
Min Qty: 15 units
Products: Ferrero Rocher 48-pc
Duration: 7 days
Status: Active
```

---

## 🔒 SECURITY

### Row-Level Security (RLS)
- All tables have RLS enabled
- Default: Permissive policies (allow all for development)
- **IMPORTANT:** Before production, replace with strict policies

### Current Policies
```sql
-- Development (permissive - allow all)
CREATE POLICY "all_select" ON table_name FOR SELECT USING (true);
CREATE POLICY "all_insert" ON table_name FOR INSERT WITH CHECK (true);
```

### For Production
Tighten policies to:
```sql
-- Retailers can only see their own data
CREATE POLICY "retailers_own_data" ON profiles 
  FOR SELECT USING (auth.uid() = id);
```

---

## 🔄 REAL-TIME ENABLED

These tables have real-time support enabled:
- ✅ **offer_campaigns** - New campaigns appear instantly
- ✅ **notifications** - Push notifications real-time
- ✅ **campaign_notifications** - Claim tracking
- ✅ **orders** - Order updates real-time

This powers the:
- 🎉 Toast notifications when campaigns launch
- 🔔 Notification bell updates
- 💰 Commission tracking

---

## 🔍 VERIFY SETUP

### Run These Queries in Supabase SQL Editor

**Check all tables created:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Count products:**
```sql
SELECT COUNT(*) as total_products FROM ferrero_products;
-- Should return: 14
```

**List test users:**
```sql
SELECT phone, name, role FROM profiles ORDER BY role;
-- Should show: 1 distributor, 5 retailers, 1 admin
```

**Check sample campaign:**
```sql
SELECT title, offer_type, is_active FROM offer_campaigns;
-- Should show: "Golden Commission Week", commission, true
```

---

## 🐛 TROUBLESHOOTING

### Error: "Table already exists"
**Solution:** Schema includes `IF NOT EXISTS` clauses - it's safe to run multiple times

### Error: "Foreign key constraint failed"
**Solution:** Tables reference each other in order. Run the full script at once, not individual statements.

### Error: "Column does not exist"
**Solution:** This is the error you had before. The FIXED version resolves it - make sure you're using `SUPABASE_SCHEMA_FIXED.sql`

### Products not showing?
```sql
-- Check if products were inserted
SELECT COUNT(*) FROM ferrero_products;

-- If 0, run just this:
INSERT INTO ferrero_products (name, sku, description, category, unit, cost_price, retail_price, margin) VALUES
  ('Ferrero Rocher 48 pieces', 'FR-48', 'Classic 48 piece box', 'Rocher', 'Box', 300.00, 450.00, 50.00);
```

### Test users not appearing?
```sql
-- Check profiles
SELECT COUNT(*) FROM profiles;

-- Insert manually if needed
INSERT INTO profiles (phone, name, shop, loc, role, wallet_balance) VALUES
  ('9900000001', 'Ramesh Kumar', 'Kumar Sweet House', 'Khetgaon, MP', 'retailer', 5000.00)
ON CONFLICT (phone) DO NOTHING;
```

---

## 📱 CONNECTING APP TO DATABASE

### In your Counter OS app:

**File:** `src/services/supabase.js` (if it exists)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_PROJECT.supabase.co'
const supabaseKey = 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey
```

### Get Your Credentials:
1. Go to Supabase Project Settings
2. Copy "Project URL" → `supabaseUrl`
3. Copy "anon public" key → `supabaseKey`

---

## ✅ WHAT WORKS AFTER SETUP

### 1. Real-Time Campaigns
```
Admin creates campaign
    ↓
Toast appears on retailer (instant)
    ↓
Campaign visible in Active Offers
    ↓
Retailer claims campaign
```

### 2. Commission Tracking
```
Retailer sells product
    ↓
Commission calculated
    ↓
Wallet updated
    ↓
Points added
    ↓
Transaction logged
```

### 3. Notifications
```
Campaign launched
    ↓
Notification created in DB
    ↓
Real-time event triggers
    ↓
Bell updates + Toast appears
```

### 4. Inventory Management
```
Retailer has stock levels
    ↓
Track by product
    ↓
See quantities
    ↓
Update on purchase
```

---

## 📞 QUICK REFERENCE

| What | Where | Action |
|------|-------|--------|
| Set up database | Supabase SQL Editor | Paste & Run schema |
| View products | Supabase → ferrero_products table | Click rows |
| Create campaign | Counter OS admin portal | Use UI |
| Check users | Supabase → profiles table | See list |
| Monitor real-time | Supabase → realtime_logs | Watch updates |

---

## 🎯 SUCCESS INDICATORS

After running the schema, you should have:

✅ 11 tables created  
✅ 14 Ferrero products  
✅ 7 test users  
✅ 1 sample campaign  
✅ Real-time enabled  
✅ RLS enabled  
✅ Indexes created  
✅ Ready for app connection  

---

## 🚀 NEXT STEPS

1. **Run Schema** (5 minutes)
   - Copy SQL from SUPABASE_SCHEMA_FIXED.sql
   - Paste in Supabase SQL Editor
   - Click Run

2. **Verify** (1 minute)
   - Run verification queries above
   - Confirm 14 products, 7 users

3. **Test Campaign** (10 minutes)
   - Go to `/campaign-portal?access=ferrero-admin-2025`
   - Create a campaign
   - See it appear instantly on retailer app

4. **Complete Flow** (5 minutes)
   - Claim campaign
   - Complete sale
   - Verify commission & points

---

**Ready to set up?**

→ Copy `SUPABASE_SCHEMA_FIXED.sql`  
→ Go to Supabase SQL Editor  
→ Paste and Run  
→ Done! ✅

---

**Estimated Total Time:** 5-10 minutes  
**Difficulty:** Easy  
**What you need:** Supabase account + admin access

🍫✨ Your database is ready to power the Ferrero Counter OS!
