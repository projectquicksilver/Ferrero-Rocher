-- =====================================================================
--  COUNTER OS v2 — CAMPAIGN TARGETING SCHEMA MIGRATION
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--  to add columns for targeting by state and selecting notification channels.
-- =====================================================================

-- 1. Alter offer_campaigns table to add state and channels columns
ALTER TABLE offer_campaigns 
  ADD COLUMN IF NOT EXISTS target_state TEXT DEFAULT 'All States',
  ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '{"app": true, "sms": false, "whatsapp": false}';

-- 2. Print success verification
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'offer_campaigns' AND table_schema = 'public';
