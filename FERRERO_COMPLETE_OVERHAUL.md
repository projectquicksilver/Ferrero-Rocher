# 🍫 Ferrero Rocher - Complete Campaign & Branding Overhaul

## 📋 Overview

This overhaul includes:
1. **Enhanced Campaign Portal** - Product offers with commission & discount management
2. **Ferrero Branding** - Applied to all screens (retailer, distributor, home, etc.)
3. **Offer Types**:
   - Single Product Campaign (product + quantity threshold + commission%)
   - Combo Offers (buy product A + product B = get X% discount)
   - Bulk Discounts (buy 100+ units = get Y% off)
   - Exclusive Commission (earn Z% extra on specific products)

---

## 🎯 Campaign Portal - New Offer Builder

### **Offer Types**

#### **Type 1: Commission Boost**
```
Product: Ferrero Rocher 48pc
Quantity Threshold: 10 units
Commission: 5% (retailers earn extra on each sale)
Duration: 7 days
Target: All Retailers
Message: "Earn 5% extra commission on Ferrero Rocher 48pc! Stock 10+ units and unlock special rewards!"
```

#### **Type 2: Bulk Discount**
```
Product: Golden Gallery 42pc
Quantity to Buy: 50 units minimum from distributor
Discount: 15% off purchase price
Message: "Buy 50+ Golden Gallery boxes from us - get 15% bulk discount + exclusive commission!"
```

#### **Type 3: Combo Offer**
```
Combo: Buy Rocher 48pc + Golden Gallery 42pc
Quantity: 5 of each
Discount: 20% off total order from distributor
Message: "Buy our combo - Rocher + Golden Gallery = 20% off!"
```

#### **Type 4: Cashback Promotion**
```
Product: Raffaello 42pc
Cashback: ₹50 per box
Duration: Weekend only
Message: "Get ₹50 cashback per Raffaello box this weekend!"
```

---

## 💾 Database Updates Needed

### **New Table: offer_campaigns**
```sql
CREATE TABLE IF NOT EXISTS offer_campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  offer_type      text CHECK (offer_type IN ('commission','discount','combo','cashback')),
  
  -- Single Product
  product_id      bigint REFERENCES ferrero_products(id),
  min_qty         integer DEFAULT 0,  -- e.g., 10 units
  
  -- Combo (products array)
  combo_products  jsonb DEFAULT '[]',  -- [{product_id, qty}, ...]
  
  -- Financial Terms
  commission_pct  numeric(5,2) DEFAULT 0,  -- e.g., 5%
  discount_pct    numeric(5,2) DEFAULT 0,  -- e.g., 15%
  cashback_amount numeric(10,2) DEFAULT 0, -- e.g., ₹50
  
  -- Target
  target_role     text DEFAULT 'retailer' CHECK (target_role IN ('retailer','distributor','all')),
  
  -- Timing
  start_date      timestamptz,
  end_date        timestamptz,
  is_active       boolean DEFAULT true,
  
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### **Update notifications table**
```sql
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS offer_campaign_id uuid REFERENCES offer_campaigns(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS offer_data jsonb;  -- stores offer details
```

---

## 🎨 Ferrero Rocher Theme - Colors & Icons

```javascript
// Primary Brand Colors
const FERRERO_THEME = {
  primary:    '#d4a574',   // Gold
  secondary:  '#c41e3a',   // Burgundy
  accent:     '#8b6f47',   // Dark Gold
  light:      '#f9f7f3',   // Cream
  dark:       '#2d2d2d',   // Dark
  success:    '#78f275',   // Green (keep for success states)
  error:      '#f87171',   // Red (keep for errors)
};

// Logo & Branding
const FERRERO_BRANDING = {
  logo: '🍫',
  name: 'Ferrero Rocher',
  tagline: 'Premium Chocolates Distribution',
  colors: ['#d4a574', '#c41e3a', '#8b6f47', '#f9f7f3'],
};
```

---

## 📱 UI Changes Required

### **1. Home Screen - Ferrero Theme**

**Current**: Generic design with green/orange accents

**New**: 
- Header: Gold gradient (#d4a574 → #8b6f47)
- Wallet card: Burgundy accent (#c41e3a)
- Quick actions: Gold borders + icons
- Buttons: Gold → Burgundy gradient
- Charts: Gold bars (not green)
- Product cards: Gold borders on hover

**Code snippet**:
```javascript
// Replace var(--g4) with #d4a574 (gold)
// Replace var(--o4) with #c41e3a (burgundy)
// Replace green accents with gold throughout
```

### **2. Notifications Screen - Campaign Display**

**Current**: Plain notification list

**New**:
```
┌─────────────────────────────────────────┐
│ 🎁 SPECIAL OFFERS                       │
├─────────────────────────────────────────┤
│                                         │
│ ⭐ Commission Boost                     │
│ Ferrero Rocher 48pc                     │
│ Earn 5% extra on purchases of 10+ units │
│ Valid until: Dec 25                     │
│ [View Details] [Claim]                  │
│                                         │
│ 🔥 Bulk Discount                        │
│ Golden Gallery 42pc                     │
│ Buy 50+ units → 15% off + commission    │
│ From: Gupta Mega Suppliers              │
│ [Order Now]                             │
│                                         │
│ 💚 Cashback Weekend                     │
│ Raffaello 42pc                          │
│ Get ₹50 cashback per box                │
│ Fri-Sun only                            │
│ [Shop Now]                              │
│                                         │
└─────────────────────────────────────────┘
```

### **3. Campaign Portal - Offer Builder**

**New Sections**:

#### **Section 1: Offer Type**
```
[ Commission Boost ] [ Bulk Discount ] [ Combo ] [ Cashback ]
```

#### **Section 2: Product Selection**
```
Select Product(s):
[🍫 Ferrero Rocher 48pc] [v]
- SKU: FR-48
- Cost: ₹300
- Retail: ₹450
- Margin: 50%

For Combos:
[+ Add Another Product]
[🍫 Golden Gallery 42pc] [x]
[🍫 Raffaello 42pc] [x]
```

#### **Section 3: Offer Terms**
```
If Offer Type = Commission Boost:
  Minimum Quantity: [10] units
  Commission %:     [5] %
  Duration:         [7] days

If Offer Type = Bulk Discount:
  Minimum Qty to Buy: [50] units
  Discount %:         [15] %
  
If Offer Type = Combo:
  Combo Details:
    Product 1: Rocher 48pc × 5
    Product 2: Golden Gallery × 5
    Combined Discount: [20] %

If Offer Type = Cashback:
  Cashback Amount: [₹50] per unit
  Valid Days: [ ] Mon [ ] Tue [✓] Fri [✓] Sat [✓] Sun
```

#### **Section 4: Target & Message**
```
Target:    [All Retailers] / [Distributors] / [Top Sellers]
Title:     [🎉 Commission Boost on Ferrero Rocher!]
Body:      [Earn 5% extra when you stock 10+ units...]
Preview:   [Shows on retailer's phone]
```

#### **Section 5: Campaign Summary**
```
Offer:      Commission Boost
Product:    Ferrero Rocher 48pc (SKU: FR-48)
Terms:      Min 10 units → +5% commission
Duration:   7 days (Dec 18 - Dec 25)
Target:     All Retailers (~142 users)
Status:     Ready to Send
[Launch Offer] [Preview] [Save as Draft]
```

---

## 🔧 Implementation Tasks

### **Task 1: Database Migration** (5 min)
```sql
-- Create offer_campaigns table
-- Update notifications table
-- Add indexes for performance
```

### **Task 2: Campaign Portal Enhanced** (2 hours)
```
1. Add offer type selector
2. Add product picker (from ferrero_products)
3. Add offer terms input (commission%, discount%, cashback, qty)
4. Add combo builder (multi-product selector)
5. Add preview phone mockup
6. Add send/draft functionality
7. Update database insert logic
```

### **Task 3: Notification UI** (1 hour)
```
1. Add offer campaign display
2. Add offer details modal
3. Add claim/order buttons
4. Link to order flow
```

### **Task 4: Ferrero Branding** (3 hours)
```
1. Home screen - colors + icons
2. Notifications screen - branding
3. Campaign portal - header + buttons
4. All screens - gold/burgundy theme
5. Update CSS variables
```

### **Task 5: Offer Flow** (1.5 hours)
```
1. Track offer claims/views (analytics)
2. Apply commission to sales
3. Apply discount to orders
4. Apply cashback to wallet
5. Update transaction records
```

---

## 📊 Offer Schema (JSON in notifications/campaigns)

### **Notification Payload**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "offer_campaign_id": "uuid",
  "title": "🎉 Commission Boost on Ferrero Rocher!",
  "body": "Earn 5% extra when you stock 10+ units...",
  "offer_data": {
    "offer_type": "commission",
    "product": {
      "id": 1,
      "name": "Ferrero Rocher 48pc",
      "sku": "FR-48",
      "image_url": "..."
    },
    "terms": {
      "min_qty": 10,
      "commission_pct": 5,
      "cashback_amount": 0
    },
    "duration": {
      "start": "2026-12-18",
      "end": "2026-12-25",
      "days_left": 3
    },
    "cta": {
      "label": "Claim Offer",
      "action": "view_product"
    }
  },
  "created_at": "2026-12-18T10:30:00Z"
}
```

---

## 🎨 Color Palette - Ferrero Rocher

### **Primary**
- Gold: `#d4a574` (main brand color)
- Burgundy: `#c41e3a` (secondary, call-to-action)
- Dark Gold: `#8b6f47` (dark text, accents)

### **Neutral**
- Cream: `#f9f7f3` (backgrounds)
- Light Gray: `#e5e5e5` (borders)
- Dark: `#2d2d2d` (text)

### **Status** (keep existing)
- Success: `#78f275` (green for success states)
- Error: `#f87171` (red for errors)
- Warning: `#ffd060` (orange for warnings)

---

## 📝 CSS Variables to Update

```css
:root {
  /* Ferrero Theme */
  --ferrero-gold: #d4a574;
  --ferrero-burgundy: #c41e3a;
  --ferrero-dark-gold: #8b6f47;
  --ferrero-cream: #f9f7f3;
  
  /* Map to existing vars */
  --primary: #d4a574;        /* was --g4 */
  --secondary: #c41e3a;      /* was --o4 */
  --accent: #8b6f47;
  --bg-light: #f9f7f3;       /* was --bg1 */
  --border: #e5e5e5;
  
  /* Keep existing status colors */
  --success: #78f275;
  --error: #f87171;
  --warning: #ffd060;
}
```

---

## 🚀 Rollout Plan

### **Phase 1: Campaign Portal** (Today)
- ✅ Create offer builder UI
- ✅ Add product selector
- ✅ Add offer terms
- ✅ Test send functionality

### **Phase 2: Notifications UI** (Tomorrow)
- ✅ Display offers in notification screen
- ✅ Add offer details modal
- ✅ Add claim button

### **Phase 3: Ferrero Branding** (This week)
- ✅ Update all screens colors
- ✅ Update buttons & gradients
- ✅ Update charts & icons

### **Phase 4: Offer Logic** (Next week)
- ✅ Apply commission on sales
- ✅ Apply discounts on orders
- ✅ Track offer analytics
- ✅ Claim tracking

---

## 📈 Offer Types - Business Logic

### **Commission Boost**
```
When retailer makes sale:
  IF product_id matches offer AND qty >= min_qty
    THEN commission += commission_pct%
```

### **Bulk Discount**
```
When retailer orders from distributor:
  IF product_id matches AND order_qty >= min_qty
    THEN order_total *= (1 - discount_pct/100)
```

### **Combo Offer**
```
When retailer orders:
  IF has_all_combo_products(products, qtys)
    THEN order_total *= (1 - combo_discount_pct/100)
```

### **Cashback**
```
When retailer sells:
  IF product_id matches AND sale_date IN valid_days
    THEN wallet += (qty * cashback_amount)
```

---

## 🎯 Files to Modify

1. **Campaign Portal** - Add offer builder sections
2. **Notifications Screen** - Display offers nicely
3. **Home Screen** - Update colors to gold/burgundy
4. **All Screens** - Replace green (#78f275) with gold
5. **CSS** - Add Ferrero theme variables
6. **AppContext** - Handle offer logic
7. **Database** - New offer_campaigns table

---

## ✨ Quick Reference

| Component | Current | New |
|-----------|---------|-----|
| Primary Color | Green #78f275 | Gold #d4a574 |
| Secondary | Orange #ffd060 | Burgundy #c41e3a |
| Brand | Generic | Ferrero Rocher 🍫 |
| Offers | None | Commission, Discount, Combo, Cashback |
| Campaign | Text only | Product + Terms + Financial |

---

This is your **complete roadmap** for the Ferrero Rocher overhaul! 

Next step: Which phase would you like to tackle first?

