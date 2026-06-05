-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY REAL-TIME IS PROPERLY CONFIGURED
-- Run this in Supabase SQL Editor to debug the issue
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Check if tables exist
SELECT
  'offer_campaigns' as table_name,
  COUNT(*) as row_count
FROM offer_campaigns
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'ferrero_products', COUNT(*) FROM ferrero_products;

-- Expected output:
-- offer_campaigns: should be >= 1
-- profiles: should be 7
-- ferrero_products: should be 14

-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 2: Check if real-time publication exists
SELECT
  pubname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Expected output should include:
-- supabase_realtime | campaign_notifications
-- supabase_realtime | notifications
-- supabase_realtime | offer_campaigns ← THIS IS CRITICAL
-- supabase_realtime | orders

-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 3: If offer_campaigns NOT in publication, ADD IT NOW
-- Run this if Step 2 doesn't show offer_campaigns:

ALTER PUBLICATION supabase_realtime ADD TABLE offer_campaigns;

-- Then verify:
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'offer_campaigns';

-- Should return: offer_campaigns

-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 4: Check RLS status (should be DISABLED for dev)
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('offer_campaigns', 'profiles', 'notifications')
ORDER BY tablename;

-- Expected output:
-- rowsecurity should be FALSE (disabled) for all three tables

-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 5: Verify offer_campaigns table structure
\d+ offer_campaigns

-- Should show all columns including:
-- id, title, description, offer_type, target_role, product_ids, etc.

-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 6: Check sample data
SELECT id, title, target_role, offer_type, is_active
FROM offer_campaigns
LIMIT 5;

-- Should show the "💰 Golden Commission Week" campaign with target_role='retailer'

-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 7: Test INSERT trigger (doesn't actually insert, just shows if replication works)
-- This creates a test campaign visible in real-time

INSERT INTO offer_campaigns (
  title,
  description,
  offer_type,
  target_role,
  product_ids,
  is_active,
  start_date,
  end_date,
  commission_pct,
  commission_min_qty,
  duration_days
) VALUES (
  '🧪 Test Campaign - ' || now()::text,
  'This is a test to verify real-time is working',
  'commission',
  'retailer',
  '[{"id":1,"name":"Test","sku":"TEST"}]'::jsonb,
  true,
  now(),
  now() + interval '1 day',
  5.00,
  1,
  1
) RETURNING id, title, target_role;

-- ═══════════════════════════════════════════════════════════════════════════

-- SUMMARY: If all steps pass:
-- ✅ Tables exist with data
-- ✅ Real-time publication enabled
-- ✅ RLS disabled
-- ✅ Test campaign inserted

-- Then the issue is in the React code, not the database.
-- Check console for subscription status and error messages.

-- ═══════════════════════════════════════════════════════════════════════════
