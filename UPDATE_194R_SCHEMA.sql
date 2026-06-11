-- =====================================================================
--  COUNTER OS v2 — SECTION 194R COMPLIANCE SCHEMA MIGRATION
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--  to enable compliance tracking, KYC documents, and audit logs.
-- =====================================================================

-- 1. Insert chocolate categories into business_categories so category reset succeeds
INSERT INTO business_categories (code, label, emoji) VALUES
('rocher', 'Ferrero Rocher Sweets', '🍫'),
('gallery', 'Golden Gallery Sweets', '🎁'),
('raffaello', 'Raffaello Sweets', '🍬'),
('rondnoir', 'Rondnoir Sweets', '🖤'),
('hazelnut', 'Hazelnut Sweets', '🌰'),
('assortment', 'Premium Assortments', '✨')
ON CONFLICT (code) DO NOTHING;

-- 2. Alter rewards_catalog to add monetary value and 194R flags
ALTER TABLE rewards_catalog 
  ADD COLUMN IF NOT EXISTS reward_value NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS is_194r_applicable BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tds_percentage NUMERIC(5,2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS tds_amount NUMERIC(12,2) DEFAULT 0.00;

-- Update existing catalog items with estimated monetary values
UPDATE rewards_catalog SET reward_value = 10.00, is_194r_applicable = false WHERE title = '₹10 Instant Cashback';
UPDATE rewards_catalog SET reward_value = 50.00, is_194r_applicable = false WHERE title = '₹50 Fuel Voucher';
UPDATE rewards_catalog SET reward_value = 100.00, is_194r_applicable = false WHERE title = '₹100 Amazon Gift Card';
UPDATE rewards_catalog SET reward_value = 200.00, is_194r_applicable = false WHERE title = '₹200 Wholesale Discount';
UPDATE rewards_catalog SET reward_value = 500.00, is_194r_applicable = false WHERE title = '₹500 Supermarket Cashback';
UPDATE rewards_catalog SET reward_value = 1000.00, is_194r_applicable = false WHERE title = '₹1,000 Flipkart Gift Card';
UPDATE rewards_catalog SET reward_value = 2000.00, is_194r_applicable = false WHERE title = 'Smartphone Voucher';
UPDATE rewards_catalog SET reward_value = 3000.00, is_194r_applicable = false WHERE title = 'Mystery Confectionery Hamper';

-- Insert new 194R-applicable high-value items
INSERT INTO rewards_catalog (title, description, points_required, category, reward_type, partner_name, terms_conditions, validity_days, available_inventory, reward_value, is_194r_applicable, tds_percentage, tds_amount)
VALUES
('Premium Business Smartphone', 'High-end smartphone for shop billing, customer communication, and inventory tracking.', 20000, 'electronics', 'partner', 'OnePlus India', 'Requires PAN & GST verification. Released after TDS approval. Valid online only.', 90, 10, 20000.00, true, 10.00, 2000.00),
('Business Laptop & Printer Combo', 'Complete shop digitisation setup. Includes HP business laptop and laser jet printer.', 50000, 'electronics', 'partner', 'HP World', 'Requires PAN & KYC compliance. Cumulative benefits are reported under Section 194R.', 180, 5, 45000.00, true, 10.00, 4500.00),
('Premium Shop Smart TV (43")', 'Display product pricing, advertisements, and campaign details in your retail storefront.', 30000, 'electronics', 'partner', 'Samsung Corporate', 'Released only after KYC approval and TDS verification under Section 194R.', 120, 8, 30000.00, true, 10.00, 3000.00),
('Gold Coin (5 Grams - 24K)', 'Festive reward for high-performing channel partners. Pure certified gold coin.', 40000, 'lifestyle', 'voucher', 'Tanishq Jewellers', 'Gold coin will be released at partner store location after verification of PAN card details.', 365, 3, 35000.00, true, 10.00, 3500.00),
('Distributor Dealer Meet (Bali Trip)', 'All-expenses-paid 4 days dealer meet in Bali, Indonesia. Premium business trip reward.', 150000, 'travel', 'partner', 'CounterOS Holidays', 'Includes flight, hotel, and meeting pass. Deductible under 194R rules.', 365, 2, 120000.00, true, 10.00, 12000.00)
ON CONFLICT DO NOTHING;

-- 3. Create KYC Documents Table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pan_number TEXT NOT NULL,
    gst_number TEXT,
    retailer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    address TEXT NOT NULL,
    id_proof_url TEXT,
    pan_verified BOOLEAN DEFAULT false,
    kyc_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Alter reward_redemptions table to support 194R compliance statuses
ALTER TABLE reward_redemptions 
  ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'Approved' CHECK (compliance_status IN ('Pending KYC', 'Pending Verification', 'Pending TDS', 'Pending Approval', 'Approved', 'Reward Released', 'Rejected')),
  ADD COLUMN IF NOT EXISTS tds_applied NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS net_benefit NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS kyc_doc_id UUID REFERENCES kyc_documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS compliance_notes TEXT;

-- Update existing records to Approved status for historical consistency
UPDATE reward_redemptions SET compliance_status = 'Approved' WHERE compliance_status IS NULL;

-- 5. Create Compliance Audit Logs table for transparent tracking
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    redemption_id UUID REFERENCES reward_redemptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'Reward Selection', 'KYC Submission', 'Verification', 'Approval', 'Reward Release', 'Status Change'
    status_from TEXT,
    status_to TEXT,
    performed_by TEXT DEFAULT 'System', -- 'Retailer', 'Admin', 'System'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable replication & disable RLS
ALTER TABLE kyc_documents REPLICA IDENTITY FULL;
ALTER TABLE compliance_audit_logs REPLICA IDENTITY FULL;

ALTER TABLE kyc_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_logs DISABLE ROW LEVEL SECURITY;

-- 7. Add tables to Supabase realtime publication
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname='supabase_realtime' AND tablename='kyc_documents') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE kyc_documents;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname='supabase_realtime' AND tablename='compliance_audit_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE compliance_audit_logs;
    END IF;
END $$;

-- 8. Alter profiles table to support GST and PAN card details entered during registration/onboarding
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS gst_number TEXT;

-- Update test accounts for Section 194R onboarding flow verification
-- Retailer A (Ramesh Kumar): Pre-onboarded with PAN & GST details
UPDATE profiles 
SET 
  pan_number = 'AGKPK1234E', 
  gst_number = '22AGKPK1234E1Z0',
  points_balance = 25000
WHERE phone = '9900000001';

-- Retailer B (Sunita Patel): Skipped PAN & GST details (remains NULL to trigger form collection)
UPDATE profiles 
SET 
  pan_number = NULL, 
  gst_number = NULL,
  points_balance = 25000
WHERE phone = '9900000002';
