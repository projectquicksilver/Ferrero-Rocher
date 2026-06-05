-- ============================================================
-- FERRERO ROCHER - DATABASE SETUP (CORRECTED)
-- For existing Supabase project
-- ============================================================

-- ─── 1. CREATE OFFER CAMPAIGNS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS offer_campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        UUID,

  title             TEXT NOT NULL,
  description       TEXT,
  offer_type        TEXT NOT NULL CHECK (offer_type IN ('commission','discount','combo','cashback')),

  -- Products Involved
  product_ids       JSONB DEFAULT '[]',

  -- Commission Boost
  commission_min_qty    INTEGER DEFAULT 0,
  commission_pct        NUMERIC(5, 2) DEFAULT 0,

  -- Bulk Discount
  discount_min_qty      INTEGER DEFAULT 0,
  discount_pct          NUMERIC(5, 2) DEFAULT 0,

  -- Combo Offer
  combo_discount_pct    NUMERIC(5, 2) DEFAULT 0,

  -- Cashback
  cashback_amount       NUMERIC(10, 2) DEFAULT 0,
  cashback_days         JSONB DEFAULT '[]',

  -- Targeting
  target_role           TEXT DEFAULT 'retailer' CHECK (target_role IN ('retailer','distributor','all')),

  -- Duration
  start_date            TIMESTAMPTZ DEFAULT now(),
  end_date              TIMESTAMPTZ,
  duration_days         INTEGER DEFAULT 7,

  is_active             BOOLEAN DEFAULT true,

  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. CREATE CAMPAIGN NOTIFICATIONS TABLE ──────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  campaign_id       UUID NOT NULL REFERENCES offer_campaigns(id),

  title             TEXT NOT NULL,
  body              TEXT NOT NULL,
  offer_data        JSONB,

  is_read           BOOLEAN DEFAULT false,
  is_claimed        BOOLEAN DEFAULT false,

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. CREATE COMMISSION LEDGER TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS commission_ledger (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,

  source_type       TEXT CHECK (source_type IN ('sale','campaign','cashback')),
  source_id         UUID,

  campaign_id       UUID REFERENCES offer_campaigns(id),

  amount            NUMERIC(12, 2) NOT NULL,
  reason            TEXT,

  status            TEXT DEFAULT 'earned' CHECK (status IN ('earned','pending','paid')),

  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. CREATE WALLET TRANSACTIONS TABLE ────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,

  type              TEXT CHECK (type IN ('credit','debit','commission','cashback','refund')),
  amount            NUMERIC(12, 2) NOT NULL,

  source            TEXT,
  reference_id      UUID,

  balance_before    NUMERIC(12, 2),
  balance_after     NUMERIC(12, 2),

  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. CREATE FERRERO PRODUCTS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ferrero_products (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  sku               TEXT UNIQUE NOT NULL,
  category          TEXT,

  cost_price        NUMERIC(10, 2),
  distributor_price NUMERIC(10, 2),

  pieces_per_carton INTEGER DEFAULT 48,
  piece_cost        NUMERIC(10, 2),
  piece_retail      NUMERIC(10, 2),

  unit              TEXT DEFAULT 'pcs',
  image_url         TEXT,
  description       TEXT,

  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. INDEXES FOR PERFORMANCE ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campaign_notifications_user
  ON campaign_notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_user
  ON commission_ledger(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user
  ON wallet_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_offer_campaigns_active
  ON offer_campaigns(is_active, end_date DESC);

-- ─── 7. ENABLE ROW LEVEL SECURITY ───────────────────────────────────────

-- Campaign Notifications: Only user sees own
ALTER TABLE campaign_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaign_notif_own" ON campaign_notifications;
CREATE POLICY "campaign_notif_own" ON campaign_notifications
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Commission Ledger: Only user sees own
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "commission_own" ON commission_ledger;
CREATE POLICY "commission_own" ON commission_ledger
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Wallet Transactions: Only user sees own
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallet_own" ON wallet_transactions;
CREATE POLICY "wallet_own" ON wallet_transactions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Offer Campaigns: Public read (all can see active campaigns)
ALTER TABLE offer_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaigns_read" ON offer_campaigns;
CREATE POLICY "campaigns_read" ON offer_campaigns
  USING (is_active = true);

-- ─── 8. INSERT SAMPLE FERRERO PRODUCTS ──────────────────────────────────
INSERT INTO ferrero_products (name, sku, category, cost_price, distributor_price, pieces_per_carton, piece_cost, piece_retail, description)
VALUES
  ('Ferrero Rocher 48pc', 'FR-48', 'Premium', 300, 350, 48, 6.25, 12.50, 'Classic hazelnut wafer balls'),
  ('Golden Gallery 42pc', 'GG-42', 'Premium', 250, 300, 42, 5.95, 11.90, 'Golden wafer assortment'),
  ('Raffaello 42pc', 'RAF-42', 'Premium', 220, 270, 42, 5.24, 10.48, 'Coconut almond wafers'),
  ('Rondnoir 42pc', 'RN-42', 'Dark', 240, 290, 42, 5.71, 11.43, 'Dark chocolate wafers'),
  ('Mon Cheri 30pc', 'MC-30', 'Liquor', 180, 220, 30, 6.00, 12.00, 'Liqueur-filled chocolates')
ON CONFLICT (sku) DO NOTHING;

-- ─── 9. REALTIME PUBLICATIONS ──────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE commission_ledger;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE offer_campaigns;

-- ============================================================
-- SETUP COMPLETE
-- ============================================================
-- Tables created:
--   ✓ offer_campaigns
--   ✓ campaign_notifications
--   ✓ commission_ledger
--   ✓ wallet_transactions
--   ✓ ferrero_products
--
-- RLS enabled for all
-- Indexes created for performance
-- Sample products inserted
-- Realtime publications enabled
--
-- Now your app is ready to use campaigns!
-- ============================================================
