-- =====================================================================
--  COUNTER OS v2 — MONTHLY TARGETS & REWARDS SCHEMA MIGRATION
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--  to enable monthly targets, progress tracking, and reward claiming.
-- =====================================================================

-- 1. Create table retailer_monthly_targets
CREATE TABLE IF NOT EXISTS retailer_monthly_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    current_value NUMERIC(12,2) DEFAULT 0.00,
    target_value NUMERIC(12,2) DEFAULT 0.00,
    unit TEXT NOT NULL DEFAULT 'units',
    points_reward INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'claimed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable replication and disable RLS
ALTER TABLE retailer_monthly_targets REPLICA IDENTITY FULL;
ALTER TABLE retailer_monthly_targets DISABLE ROW LEVEL SECURITY;

-- 3. Add to Supabase Realtime Publication
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname='supabase_realtime' AND tablename='retailer_monthly_targets') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE retailer_monthly_targets;
    END IF;
END $$;

-- 4. Seed 3 targets for test accounts
DO $$
DECLARE
    ramesh_id UUID;
    sunita_id UUID;
BEGIN
    SELECT id INTO ramesh_id FROM profiles WHERE phone = '9900000001';
    SELECT id INTO sunita_id FROM profiles WHERE phone = '9900000002';

    IF ramesh_id IS NOT NULL THEN
        -- Clear existing monthly targets for Ramesh to prevent duplication
        DELETE FROM retailer_monthly_targets WHERE user_id = ramesh_id;

        -- Seed Rocher Restock Target
        INSERT INTO retailer_monthly_targets (user_id, title, description, current_value, target_value, unit, points_reward, status)
        VALUES (ramesh_id, 'Rocher Restock Target', 'Restock Ferrero Rocher cartons to boost your inventory levels.', 35.00, 50.00, 'cartons', 5000, 'in_progress');

        -- Seed Rocher 16pc Sales Target
        INSERT INTO retailer_monthly_targets (user_id, title, description, current_value, target_value, unit, points_reward, status)
        VALUES (ramesh_id, 'Rocher 16pc Sales Target', 'Sell Ferrero Rocher 16pc boxes to retail customers.', 12.00, 15.00, 'boxes', 1500, 'in_progress');

        -- Seed Commission Earnings Target
        INSERT INTO retailer_monthly_targets (user_id, title, description, current_value, target_value, unit, points_reward, status)
        VALUES (ramesh_id, 'Commission Earnings Target', 'Earn commissions by selling premium Ferrero assortments.', 750.00, 1000.00, '₹', 3000, 'in_progress');
    END IF;

    IF sunita_id IS NOT NULL THEN
        -- Clear existing monthly targets for Sunita to prevent duplication
        DELETE FROM retailer_monthly_targets WHERE user_id = sunita_id;

        -- Seed Rocher Restock Target
        INSERT INTO retailer_monthly_targets (user_id, title, description, current_value, target_value, unit, points_reward, status)
        VALUES (sunita_id, 'Rocher Restock Target', 'Restock Ferrero Rocher cartons to boost your inventory levels.', 35.00, 50.00, 'cartons', 5000, 'in_progress');

        -- Seed Rocher 16pc Sales Target
        INSERT INTO retailer_monthly_targets (user_id, title, description, current_value, target_value, unit, points_reward, status)
        VALUES (sunita_id, 'Rocher 16pc Sales Target', 'Sell Ferrero Rocher 16pc boxes to retail customers.', 12.00, 15.00, 'boxes', 1500, 'in_progress');

        -- Seed Commission Earnings Target
        INSERT INTO retailer_monthly_targets (user_id, title, description, current_value, target_value, unit, points_reward, status)
        VALUES (sunita_id, 'Commission Earnings Target', 'Earn commissions by selling premium Ferrero assortments.', 750.00, 1000.00, '₹', 3000, 'in_progress');
    END IF;
END $$;
