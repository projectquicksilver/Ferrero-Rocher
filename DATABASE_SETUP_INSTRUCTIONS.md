# 🗄️ DATABASE SETUP - FINAL INSTRUCTIONS

**⚠️ IMPORTANT:** Use **ONLY** `SUPABASE_SCHEMA_CLEAN.sql` - Delete all other schema files!

---

## ❌ DELETE THESE FILES

Delete from your project root:
- ❌ `SUPABASE_SCHEMA_FIXED.sql` (has conflicts)
- ❌ `SUPABASE_SCHEMA_FERRERO.sql` (has conflicts)
- ❌ `FERRERO_DATABASE_SETUP.sql` (old version)
- ❌ `FERRERO_DATABASE_SCHEMA.sql` (old version)

Keep ONLY:
- ✅ `SUPABASE_SCHEMA_CLEAN.sql` (use this one!)

---

## ✅ SETUP STEPS (3 minutes)

### Step 1: Open Supabase
```
1. Go to https://supabase.com
2. Login to your project
3. Go to SQL Editor (left sidebar)
4. Click "New Query"
```

### Step 2: Copy the SQL
```
1. Open: SUPABASE_SCHEMA_CLEAN.sql
2. Select ALL text (Ctrl+A)
3. Copy (Ctrl+C)
```

### Step 3: Paste in Supabase
```
1. In Supabase SQL Editor, paste the SQL
2. Click "Run" button (top right)
3. Wait for completion (~10 seconds)
```

### Step 4: Verify Success
You should see:
```
Total Tables: 12
Ferrero Products: 14
Test Users: 7
Sample Campaigns: 1
```

---

## 📊 WHAT GETS CREATED

### 12 Tables
1. **business_categories** - Category list (agri, food, pharma, etc.)
2. **profiles** - Users (retailers, distributors, admins)
3. **ferrero_products** - 14 Ferrero items (Rocher, Golden Gallery, Raffaello, etc.)
4. **inventory** - Stock levels
5. **offer_campaigns** - Marketing campaigns (COMMISSION, DISCOUNT, COMBO, CASHBACK)
6. **campaign_notifications** - Track which users claimed which campaigns
7. **commission_ledger** - Commission history
8. **wallet_transactions** - All wallet activity
9. **orders** - B2B orders
10. **transactions** - Generic transaction history
11. **notifications** - System notifications
12. **connections** - Retailer-Distributor links

### 14 Ferrero Products
- Ferrero Rocher (4 variants)
- Golden Gallery (2 variants)
- Raffaello (2 variants)
- Rondnoir (2 variants)
- Hazelnut Specialties (2 variants)
- Assortments (2 variants)

### 7 Test Users
- 1 Distributor (Rajesh)
- 5 Retailers (Ramesh, Sunita, Mohan, Anil, Kavita)
- 1 Admin (Admin Ferrero)

### 1 Sample Campaign
- **Title:** "💰 Golden Commission Week"
- **Type:** Commission Boost (8%)
- **Product:** Ferrero Rocher 48pc
- **Min Qty:** 15 units
- **Duration:** 7 days
- **Status:** Active

---

## 🔄 Real-Time Tables

These tables have real-time enabled (instant updates):
- ✅ offer_campaigns
- ✅ campaign_notifications
- ✅ notifications
- ✅ orders

This powers:
- 🎉 Toast notifications
- 🔔 Notification bell updates
- 💰 Commission tracking
- 📦 Order updates

---

## 🔒 Security

- RLS (Row-Level Security): **DISABLED** for development
- Good for: Quick testing & development
- Before Production: Enable RLS and create proper policies

---

## ⚡ READY TO USE

After running this schema, your Counter OS app can:

✅ Create & launch campaigns (admin portal)  
✅ Receive real-time notifications (instant)  
✅ Track commissions (automatic)  
✅ Manage wallets (real-time)  
✅ Process orders (B2B)  
✅ Display products (Ferrero catalog)  
✅ Manage users (profiles)  

---

## 🚀 NEXT STEPS

1. **Run Schema** (3 min)
   - Use SUPABASE_SCHEMA_CLEAN.sql
   - Verify 12 tables created

2. **Test App** (10 min)
   - npm run dev
   - Check light theme
   - Create campaign
   - See notification

3. **Complete Flow** (5 min)
   - Claim campaign
   - Complete sale
   - Verify commission
   - Check points

---

## ❓ IF SOMETHING GOES WRONG

### Error: "Table already exists"
✅ OK! Schema uses `IF NOT EXISTS`
✅ Safe to run multiple times
✅ Just click Run again

### Error: "Column does not exist"
❌ You're using OLD schema file
✅ Delete old files
✅ Use ONLY SUPABASE_SCHEMA_CLEAN.sql

### Error: "Foreign key constraint"
❌ Means tables created out of order
✅ You're using wrong file again
✅ Make sure it's SUPABASE_SCHEMA_CLEAN.sql

### Verification Queries Show 0 Tables
❌ Schema didn't run
✅ Check for errors in Supabase console
✅ Copy/paste entire SQL again
✅ Make sure "Run" button was clicked

---

## 📋 FINAL CHECKLIST

- [ ] Deleted old schema files (FIXED, FERRERO, old versions)
- [ ] Have SUPABASE_SCHEMA_CLEAN.sql ready
- [ ] Logged into Supabase
- [ ] Went to SQL Editor
- [ ] Created new query
- [ ] Copied entire SUPABASE_SCHEMA_CLEAN.sql
- [ ] Pasted in Supabase
- [ ] Clicked "Run"
- [ ] Waited for completion
- [ ] Verified 12 tables created
- [ ] Verified 14 products
- [ ] Verified 7 users
- [ ] Ready to test app

---

**You're all set!** 🍫✨

Next: `npm run dev` to start the app and test your campaigns!
