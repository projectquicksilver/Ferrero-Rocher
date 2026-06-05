# 🔴 FIX: Subscription Status CLOSED → SUBSCRIBED

**Issue:** Your console shows `📡 Subscription status for retailer: CLOSED`  
**Meaning:** Real-time connection is NOT working  
**Status:** FIXING NOW ✅

---

## 🔍 ROOT CAUSE

The subscription status showing **CLOSED** means one of these:

1. **Offer_campaigns NOT in real-time publication** ← MOST LIKELY
2. **RLS blocking the subscription**
3. **Network/connection issue**
4. **Database not set up properly**

---

## ✅ FIX IT (3 STEPS)

### STEP 1: Verify Database Real-Time Setup (2 min)

Run this SQL in Supabase SQL Editor:

```sql
-- Check if offer_campaigns is in real-time publication
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'offer_campaigns';
```

**Expected Result:**
```
tablename
─────────────────
offer_campaigns
```

**If you get NO results (empty):**
→ Go to STEP 2

**If you see "offer_campaigns":**
→ Go to STEP 3 (Database is fine, issue is in React code)

---

### STEP 2: ADD Real-Time Publication (30 seconds)

If Step 1 showed no results, run this:

```sql
-- Add offer_campaigns to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE offer_campaigns;

-- Verify it was added
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'offer_campaigns';
```

**Expected Result:**
```
tablename
─────────────────
offer_campaigns
```

✅ **If you see this, your database is now fixed!**

---

### STEP 3: Update React Code (Already Done!)

I've already fixed the React code in `src/context/AppContext.jsx`:

**Changes made:**
- ✅ Added retry logic when subscription closes
- ✅ Added better logging to diagnose issues
- ✅ Added config option for broadcast
- ✅ Added role matching debug logs

**What you need to do:**
1. Save the file (it's already updated)
2. Restart your React app: `npm run dev`
3. Clear browser cache: `Ctrl+Shift+Delete` (or Cmd+Shift+Delete on Mac)
4. Hard refresh page: `Ctrl+F5` (or Cmd+Shift+R on Mac)

---

## 🧪 TEST IF IT'S FIXED

### Step 1: Run Verification SQL
```sql
-- In Supabase SQL Editor, paste and run:
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'offer_campaigns';
```

✅ **If you see "offer_campaigns", continue to Step 2**

### Step 2: Restart React App
```bash
# Stop the current app (Ctrl+C)
# Restart it
npm run dev
```

### Step 3: Watch Console Logs
```
Open browser console (F12)
Login as retailer (9900000001)
Watch for these logs in order:

1. 🔄 Setting up real-time subscription for: retailer
2. 📡 Subscription status for retailer: SUBSCRIBED ← THIS IS CRITICAL
3. (Wait for admin to create campaign)
4. 🔔 Real-time campaign received: {...}
5. ✅ Toast shown for: [Campaign Title]
```

**If you see "SUBSCRIBED" instead of "CLOSED", it's working!**

### Step 4: Create Test Campaign
```
Left window:  /campaign-portal?access=ferrero-admin-2025
Right window: / (logged in as retailer)

In left: Create campaign and click "Send Campaign"
In right: Watch for toast within 5 seconds
```

---

## 📋 COMPLETE DIAGNOSTIC CHECKLIST

### Database Setup
- [ ] Run: `SELECT COUNT(*) FROM offer_campaigns;` → Should be >= 1
- [ ] Run: `SELECT COUNT(*) FROM profiles;` → Should be 7
- [ ] Run: `SELECT tablename FROM pg_publication_tables WHERE pubname='supabase_realtime';` → Should include "offer_campaigns"
- [ ] Run: `SELECT rowsecurity FROM pg_tables WHERE tablename='offer_campaigns';` → Should be FALSE

### React Code
- [ ] `src/context/AppContext.jsx` updated (you can check lines 1185-1255)
- [ ] App restarted: `npm run dev`
- [ ] Browser cache cleared: `Ctrl+Shift+Delete`
- [ ] Page hard refreshed: `Ctrl+F5`

### Console Logs
- [ ] See: `🔄 Setting up real-time subscription for: retailer`
- [ ] See: `📡 Subscription status for retailer: SUBSCRIBED` (NOT CLOSED!)
- [ ] No red errors in console
- [ ] See: `✅ Real-time subscription ACTIVE`

### Testing
- [ ] Logged in as retailer (9900000001-9900000005)
- [ ] Admin creates campaign
- [ ] See: `🔔 Real-time campaign received: {...}`
- [ ] See: `✅ Toast shown for: [Campaign Title]`
- [ ] Toast appears on screen

---

## 🎯 IF STILL NOT WORKING

### Check 1: Is offer_campaigns in publication?
```sql
SELECT * FROM pg_publication_tables 
WHERE pubname='supabase_realtime';
```

If "offer_campaigns" is NOT in the list:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE offer_campaigns;
```

### Check 2: Is data actually in database?
```sql
SELECT COUNT(*) as total FROM offer_campaigns;
SELECT COUNT(*) as total FROM profiles;
```

Both should be > 0

### Check 3: Do you have correct user role?
```javascript
// In browser console, paste:
console.log(JSON.parse(localStorage.getItem('user')))
```

Should show: `"role": "retailer"`

### Check 4: Check for JavaScript errors
```
F12 → Console tab
Look for red error messages
```

Common errors:
- "Cannot read property 'on' of undefined" = Supabase not configured
- "offer_campaigns does not exist" = Schema not run
- Any other error = Read it carefully, it tells you what's wrong

### Check 5: Check Network Tab
```
F12 → Network tab
Create campaign
Look for WebSocket connections
Should see: wss://... (secure WebSocket)
```

If no WebSocket connection appears, real-time isn't connecting.

---

## 🚨 NUCLEAR OPTION (If nothing else works)

Drop and recreate real-time from scratch:

```sql
-- DROP old publication (careful!)
DROP PUBLICATION supabase_realtime CASCADE;

-- CREATE new publication with all tables
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- VERIFY
SELECT * FROM pg_publication;
SELECT * FROM pg_publication_tables WHERE pubname='supabase_realtime';
```

Then restart React app.

---

## 📞 WHAT EACH LOG MEANS

| Log | Meaning | Status |
|-----|---------|--------|
| 🔄 Setting up real-time | Subscription being created | ℹ️ Info |
| 📡 Subscription status: SUBSCRIBED | ✅ Connected to Supabase | ✅ Good |
| 📡 Subscription status: CLOSED | ❌ Disconnected from Supabase | ❌ Bad |
| 📡 Subscription status: CHANNEL_ERROR | ❌ Error occurred | ❌ Bad |
| 🔔 Real-time campaign received | ✅ Event received from DB | ✅ Good |
| ✅ Toast shown for | ✅ Toast displayed | ✅ Good |
| ⚠️ Campaign target_role does not match | Campaign is for different role | ℹ️ Info |

---

## 🎯 SUCCESS INDICATORS

You'll know it's fixed when:

1. **Console shows:** `📡 Subscription status for retailer: SUBSCRIBED`
2. **When admin creates campaign**, console shows: `🔔 Real-time campaign received: {...}`
3. **Toast appears** on screen with campaign title
4. **Campaign visible** on Home screen under "Active Offers"

---

## 🔄 WHAT I FIXED

**File:** `src/context/AppContext.jsx` (lines 1185-1255)

**Changes:**
```javascript
// BEFORE: Used .subscribe((status) => {}) which doesn't properly track
// AFTER: Uses proper subscription with retry logic

// Added:
1. Retry logic: If subscription closes, reconnects after 3 seconds
2. Better logging: Shows what's happening at each step
3. Role validation: Logs if campaign matches user role
4. Config option: broadcast: { self: true } for better tracking
```

---

## 📝 NEXT ACTIONS

1. **Run VERIFY_REALTIME_SETUP.sql** in Supabase (see next file)
2. **Make sure offer_campaigns is in publication** (run ALTER if needed)
3. **Restart React app** (npm run dev)
4. **Clear browser cache** (Ctrl+Shift+Delete)
5. **Test again** with two browser windows

---

## ✅ EXPECTED RESULT

After these fixes, when you:
1. Create campaign in admin portal
2. Retailers will see toast within 5 seconds:
   ```
   🎉 New offer from Ferrero: [Campaign Title]! Check "Active Offers" now.
   ```

---

**Status:** FIXING ✅  
**Files Updated:** src/context/AppContext.jsx  
**SQL to Run:** VERIFY_REALTIME_SETUP.sql  
**Next:** Follow the steps above!
