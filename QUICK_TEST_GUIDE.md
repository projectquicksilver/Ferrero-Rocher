# ⚡ QUICK TEST GUIDE - Ferrero Theme & Campaign Integration

**Time to test:** ~5 minutes  
**What to test:** Theme colors, toasts, notifications, campaigns

---

## 🚀 START HERE

### 1. Open the App
```bash
npm run dev
# Then open http://localhost:5173
```

### 2. Login
- Phone: any number (e.g., 9999999999)
- Role: Retailer
- Click "Continue"

---

## ✨ VISUAL CHECKS (1 min)

### Home Screen Colors
Navigate to: `/home`

Look for:
- ✅ **Wallet card** - Should have **gold border** (#d4a574)
- ✅ **Wallet amount** - Should be **burgundy** (#c41e3a)
- ✅ **"Add Money" button** - Should have **gold→burgundy gradient**
- ✅ **Chart bars** - Should be **gold and burgundy**, NOT green/orange
- ✅ **All buttons** - Should be **gold themed**, NOT green

❌ **If you see green (#78f275) or orange (#ffd060) anywhere → PROBLEM**  
✅ **If everything is gold/burgundy → PASS**

---

## 📢 TOAST NOTIFICATIONS (2 min)

### Test 1: Campaign Claim Toast
1. Go to `/home`
2. Look for **"✨ Active Offers"** section
   - If not there → Create a campaign first (see below)
3. Click **"Claim →"** button on any campaign
4. **Toast should appear** at bottom: `✓ Offer claimed!`
   - ✅ Toast should be **centered at bottom**
   - ✅ Toast should have **proper colors** (not white text on white)
   - ✅ Toast should **disappear after ~2.6 seconds**

❌ **If no toast appears → PROBLEM**  
❌ **If toast is invisible → PROBLEM**  
✅ **If toast appears and disappears → PASS**

### Test 2: Commission Earned Toast
1. Go to `/sell`
2. Select any product
3. Enter quantity (e.g., 2 pieces)
4. Set price (e.g., ₹500)
5. Click **"Proceed to Checkout"** (gold→burgundy gradient button)
6. Click **"Complete Sale"**
7. **Toast should appear**: `💰 Earned ₹X from campaign!`
   - ✅ Shows commission amount
   - ✅ Has proper colors
   - ✅ Auto-disappears

❌ **If no commission toast → May not have campaign or matching quantity**  
✅ **If toast appears → PASS**

---

## 🔔 NOTIFICATION BELL (1 min)

### Test: Bell Highlight & Count
1. Go to Home screen header (top right)
2. Look at **notification bell icon**

**Before creating campaigns:**
- Bell should be **dark** (no highlight)
- No badge

**After claiming campaigns:**
1. Claim 1 campaign
2. Bell should:
   - ✅ Have **gold background** (rgba(212,165,116,.1))
   - ✅ Have **burgundy pulsing dot**
   - ✅ Show **red badge with count "1"**

3. Claim another campaign
4. Badge should now show **"2"**

❌ **If bell doesn't change → PROBLEM**  
❌ **If count doesn't update → PROBLEM**  
✅ **If bell highlights & badge shows → PASS**

---

## 📬 NOTIFICATIONS SCREEN (1 min)

### Test: Campaign Cards
1. Click the **notification bell** in header
2. Navigate to `/notifications`
3. You should see **campaign cards** with:
   - ✅ **Icon** (💰 for commission, 🔥 for discount, etc.)
   - ✅ **Campaign title**
   - ✅ **Campaign description**
   - ✅ **Timestamp** when notification arrived
   - ✅ **"View Offer →" button** (gold→burgundy gradient)
   - ✅ **Gold gradient background**
   - ✅ **Hover effect** (card lifts slightly)

❌ **If cards look plain → PROBLEM**  
❌ **If no "View Offer →" button → PROBLEM**  
❌ **If no icons → PROBLEM**  
✅ **If cards look styled and professional → PASS**

---

## 🎨 COLOR VERIFICATION (Spot Check)

### Colors That Should Exist
- ✅ **#d4a574** (Ferrero gold) - primary color, buttons
- ✅ **#c41e3a** (Burgundy) - secondary color, accents, badges
- ✅ **#8b6f47** (Dark gold) - subtle accents
- ✅ **#f9f7f3** (Cream) - light backgrounds

### Colors That Should NOT Exist
- ❌ **#78f275** (Green) - SHOULD BE GONE
- ❌ **#52cc4f** (Bright green) - SHOULD BE GONE
- ❌ **#ffd060** (Orange) - SHOULD BE GONE
- ❌ **#f5b800** (Orange) - SHOULD BE GONE

### Quick Check
Open browser DevTools → Elements tab  
Click on any button → Check computed colors  
Should show `rgb(212, 165, 116)` or `rgb(196, 30, 58)` NOT green/orange

---

## 🎯 COMPLETE CAMPAIGN FLOW TEST (3 min)

### Step 1: Create Campaign (Admin)
1. Go to `/campaign-portal?access=ferrero-admin-2025`
2. Click "Create Campaign"
3. Fill:
   - **Type:** Commission Boost
   - **Title:** Test Campaign
   - **Products:** Select any
   - **Commission %:** 5
   - **Duration:** 7 days
4. Click "Launch"

### Step 2: Home Screen (Retailer)
1. Logout and login as **Retailer**
2. Go to `/home`
3. Should see:
   - ✅ **"✨ Active Offers"** section
   - ✅ **Campaign card** with icon
   - ✅ **"Claim →" button** (gold)

### Step 3: Claim Campaign
1. Click **"Claim →"**
2. Should see:
   - ✅ **Toast notification** appears: "✓ Offer claimed!"
   - ✅ **Notification bell** now highlighted in gold
   - ✅ **Badge shows "1"** on bell

### Step 4: Sell Screen
1. Click **"Sell a Product"**
2. Go to `/sell`
3. Should see:
   - ✅ **Gold campaign banner** at top
   - ✅ **Campaign title & description**
   - ✅ **"💰 Earn Extra Commission!"** text
   - ✅ **Checkout button** has gold→burgundy gradient

### Step 5: Complete Sale
1. Select a product (matching the campaign)
2. Enter quantity
3. Set price
4. Click **"Proceed to Checkout"** (gradient button)
5. Click **"Complete Sale"**
6. Should see:
   - ✅ **Toast notification**: "💰 Earned ₹X from campaign!"
   - ✅ **Commission amount** is correct
   - ✅ **Wallet updates** with commission

### Step 6: Check Notifications
1. Click **notification bell** in header
2. Go to `/notifications`
3. Should see:
   - ✅ **Campaign card** with icon
   - ✅ **"View Offer →" button**
   - ✅ **Unread status** indicator
   - ✅ All with **Ferrero colors**

---

## ✅ PASS/FAIL SUMMARY

### PASS if ALL of these are TRUE:
- ✅ All buttons are gold (#d4a574), not green
- ✅ Toast notifications appear and disappear
- ✅ Notification bell highlights in gold
- ✅ Notification badge shows count
- ✅ Notifications screen shows campaign cards with icons
- ✅ Campaign flow works end-to-end
- ✅ No green (#78f275) or orange (#ffd060) visible anywhere
- ✅ All colors are Ferrero theme (gold, burgundy, dark gold, cream)

### FAIL if ANY of these are TRUE:
- ❌ Green or orange colors visible
- ❌ Toast notifications don't appear
- ❌ Notification bell doesn't highlight
- ❌ Notifications screen is plain/ugly
- ❌ Campaign flow breaks anywhere
- ❌ Theme is inconsistent across screens

---

## 🐛 TROUBLESHOOTING

### Problem: No campaigns showing on Home screen
**Solution:** 
1. Make sure campaigns are created in `/campaign-portal`
2. Check they're active (start date ≤ today ≤ end date)
3. Check they target "retailer" role
4. Refresh page

### Problem: Toast not appearing
**Solution:**
1. Check browser console for errors
2. Make sure you're actually calling campaign functions
3. Check if `showToast()` is being invoked
4. Look for CustomEvent in console: `show-toast`

### Problem: Notification bell doesn't update
**Solution:**
1. Make sure notifications are being added
2. Check notification has correct `role` field
3. Try refreshing page
4. Check notification's `isRead` status

### Problem: Notifications screen is blank
**Solution:**
1. Create some campaigns first
2. Claim them to create notifications
3. Check notifications exist in AppContext
4. Try refreshing page

### Problem: Colors are still old (green/orange)
**Solution:**
1. Hard refresh page: `Ctrl+Shift+R` (or Cmd+Shift+R on Mac)
2. Clear browser cache
3. Make sure dev server restarted
4. Check index.css was actually changed

---

## 📊 TEST REPORT TEMPLATE

```
Test Date: [DATE]
Tester: [NAME]
App Version: Counter OS v2

[ ] Home screen colors - PASS / FAIL
[ ] Toast notifications - PASS / FAIL
[ ] Notification bell - PASS / FAIL
[ ] Notifications screen - PASS / FAIL
[ ] Campaign claim flow - PASS / FAIL
[ ] Commission earning - PASS / FAIL
[ ] Color consistency - PASS / FAIL
[ ] Distributor experience - PASS / FAIL

Overall Status: ✅ PASS / ❌ FAIL

Issues Found:
- [List any issues]

Notes:
- [Any observations]
```

---

## 🎯 QUICK CHECKLIST

Copy this and use while testing:

```
HOME SCREEN
[ ] Wallet has gold border
[ ] Amount is burgundy
[ ] Chart bars are gold/burgundy
[ ] Active Offers section visible
[ ] Campaign cards show icons
[ ] "Claim →" buttons are gold

TOAST NOTIFICATIONS
[ ] Campaign claim toast appears
[ ] Commission earned toast appears
[ ] Toast auto-disappears
[ ] Toast colors are correct
[ ] Toast text is readable

NOTIFICATION BELL
[ ] Bell highlights when unread exist
[ ] Badge shows correct count
[ ] Dot has glow effect
[ ] Clicking opens Notifications screen

NOTIFICATIONS SCREEN
[ ] Campaign cards display
[ ] Icons show (💰🔥🎁💳)
[ ] Timestamps visible
[ ] "View Offer →" button visible
[ ] Hover effects work
[ ] Gradient backgrounds show

COLORS
[ ] NO green (#78f275) visible
[ ] NO orange (#ffd060) visible
[ ] Buttons are gold gradient
[ ] Badges are burgundy
[ ] Accents are dark gold
[ ] Overall theme is Ferrero

CAMPAIGN FLOW
[ ] Create campaign (admin)
[ ] See on Home (retailer)
[ ] Claim campaign
[ ] See toast
[ ] Go to Sell
[ ] See campaign banner
[ ] Complete sale
[ ] See commission toast
[ ] Check Notifications
[ ] See campaign card
```

---

**Ready to test?**  
Start the dev server and follow the steps above!

If all checks pass → **Status: ✅ READY FOR PRODUCTION**  
If any check fails → **Report the issue and we'll fix it**

Good luck! 🍫✨
