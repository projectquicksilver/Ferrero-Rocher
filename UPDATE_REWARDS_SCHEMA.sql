-- =====================================================================
--  COUNTER OS v2 — RETAILER REWARDS SCHEMA MIGRATION
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--  to add columns and tables for the rewards system.
-- =====================================================================

-- 1. Alter profiles table to add points_balance column
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS points_balance INT DEFAULT 0;

-- 2. Update initial points balance for test users to match demo/gamed designs
UPDATE profiles SET points_balance = 4850 WHERE phone = '9900000001'; -- Ramesh Kumar (Gold Retailer)
UPDATE profiles SET points_balance = 1250 WHERE phone = '9900000002'; -- Sunita Patel
UPDATE profiles SET points_balance = 8400 WHERE phone = '9900000003'; -- Mohan Sharma
UPDATE profiles SET points_balance = 300  WHERE phone = '9900000004'; -- Anil Verma
UPDATE profiles SET points_balance = 16000 WHERE phone = '9900000005'; -- Kavita Singh

-- 3. Create rewards_catalog table
CREATE TABLE IF NOT EXISTS rewards_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    points_required INT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('cashback', 'coupon', 'gift_card', 'business', 'lifestyle', 'electronics', 'travel', 'lucky_draw')),
    reward_type TEXT NOT NULL CHECK (reward_type IN ('cashback', 'coupon', 'voucher', 'partner')),
    total_inventory INT DEFAULT 100,
    available_inventory INT DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    terms_conditions TEXT,
    partner_name TEXT,
    validity_days INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create reward_redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards_catalog(id) ON DELETE CASCADE,
    voucher_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    points_used INT NOT NULL,
    cashback_amount NUMERIC(12,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- 5. Enable replication for the new tables
ALTER TABLE rewards_catalog REPLICA IDENTITY FULL;
ALTER TABLE reward_redemptions REPLICA IDENTITY FULL;

-- Disable Row Level Security (RLS) for development
ALTER TABLE rewards_catalog DISABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions DISABLE ROW LEVEL SECURITY;

-- Add new tables to Supabase realtime publication if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname='supabase_realtime' AND tablename='rewards_catalog') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE rewards_catalog;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname='supabase_realtime' AND tablename='reward_redemptions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE reward_redemptions;
    END IF;
END $$;

-- 6. Seed rewards_catalog with realistic rewards
INSERT INTO rewards_catalog (title, description, points_required, category, reward_type, partner_name, terms_conditions, validity_days, available_inventory)
VALUES
('₹10 Instant Cashback', 'Instant cashback credited directly to your shop wallet. No minimum purchase required.', 100, 'cashback', 'cashback', 'Wallet Cash', 'Instant credit. Non-refundable. Limits: Max 5 per day.', 365, 1000),
('₹50 Fuel Voucher', 'Save on your delivery transportation fuel. Valid at all major petrol pumps.', 500, 'travel', 'voucher', 'IndianOil', 'Present voucher code at checkout counter. Valid on petrol/diesel.', 90, 200),
('₹100 Amazon Gift Card', 'Shop anything on Amazon India. Fully digital voucher code instantly delivered.', 1000, 'gift_card', 'partner', 'Amazon India', 'Can be added directly to Amazon Pay balance. Valid for 1 year.', 365, 500),
('₹200 Wholesale Discount', 'Save on your next order from Rajesh Wholesaler. Exclusive business benefit.', 2000, 'business', 'coupon', 'CounterOS Wholesale', 'Use code during Buy From Distributor checkout. Minimum order value ₹5,000.', 60, 150),
('₹500 Supermarket Cashback', 'High-value cashback reward for premium retail stores.', 4000, 'cashback', 'cashback', 'Wallet Cash', 'Will be instantly credited to your wallet balance upon redemption.', 365, 100),
('₹1,000 Flipkart Gift Card', 'Redeemable on Flipkart India towards millions of products.', 8000, 'gift_card', 'partner', 'Flipkart', 'Flipkart terms apply. Cannot be exchanged for cash.', 365, 80),
('Smartphone Voucher', 'Get ₹2,000 off on select business smartphones. Upgrade your shop communication.', 15000, 'electronics', 'partner', 'Mi Store', 'Applicable on Redmi & Xiaomi business phones. Valid online only.', 90, 50),
('Mystery Confectionery Hamper', 'Win a special premium selection box of Ferrero Rocher & Raffaello specialties.', 25000, 'lucky_draw', 'voucher', 'Ferrero India', 'Hamper will be shipped to your registered shop location. Subject to stock availability.', 180, 20);

-- Print confirmation
SELECT count(*) as "Catalog Rewards Loaded" FROM rewards_catalog;
