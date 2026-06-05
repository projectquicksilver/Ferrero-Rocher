-- =====================================================================
--  COUNTER OS v2 — NOTIFICATIONS TABLE MIGRATION
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--  to add the missing columns required for campaign notifications.
-- =====================================================================

-- 1. Alter notifications table to add missing columns
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'notification',
  ADD COLUMN IF NOT EXISTS offer_type TEXT,
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES offer_campaigns(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offer_data JSONB,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 1.5 Alter offer_campaigns table to add missing combo_pct column
ALTER TABLE offer_campaigns
  ADD COLUMN IF NOT EXISTS combo_pct NUMERIC(5,2) DEFAULT 0;

-- 2. Verify or add notifications table constraint checks if needed
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS notifications_role_check;

ALTER TABLE notifications 
  ADD CONSTRAINT notifications_role_check 
  CHECK (role IN ('retailer', 'distributor', 'admin'));

-- 3. Disable Row Level Security (for development)
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 4. Enable real-time for notifications table in publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- 5. Print success verification
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND table_schema = 'public';
