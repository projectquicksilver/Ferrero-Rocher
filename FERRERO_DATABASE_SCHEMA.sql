-- ============================================================
-- FERRERO ROCHER - COMPLETE DATABASE SCHEMA
-- Updated for: Products, Orders (Cartons), Sales (Pieces), Campaigns, Commissions
-- ============================================================

-- ─── 1. PRODUCTS TABLE (CARTON-LEVEL) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ferrero_products (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  sku               TEXT UNIQUE NOT NULL,
  category          TEXT,

  -- Carton Details (what distributor sells to retailer)
  cost_price        NUMERIC(10, 2),      -- e.g., ₹300 per carton
  distributor_price NUMERIC(10, 2),      -- Selling price from distributor to retailer

  -- Piece Details (what retailer sells to customer)
  pieces_per_carton INTEGER DEFAULT 48,  -- e.g., 48 pieces in 1 carton
  piece_cost        NUMERIC(10, 2),      -- ₹300 / 48 = ₹6.25 per piece
  piece_retail      NUMERIC(10, 2),      -- e.g., ₹12.50 per piece (retail price)

  unit              TEXT DEFAULT 'pcs',
  image_url         TEXT,
  description       TEXT,

  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. CARTON-LEVEL INVENTORY (Retailer's Stock from Distributor) ────────
CREATE TABLE IF NOT EXISTS retailer_inventory (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES profiles(id),
  product_id        BIGINT NOT NULL REFERENCES ferrero_products(id),

  cartons_stock     INTEGER DEFAULT 0,   -- e.g., 5 cartons
  pieces_stock      INTEGER DEFAULT 0,   -- Loose pieces (remainder from carton)

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, product_id)
);

-- ─── 3. ORDERS FROM RETAILER TO DISTRIBUTOR (CARTON ORDERS) ──────────────
CREATE TABLE IF NOT EXISTS carton_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id       UUID NOT NULL REFERENCES profiles(id),
  distributor_id    UUID NOT NULL REFERENCES profiles(id),

  product_id        BIGINT NOT NULL REFERENCES ferrero_products(id),
  quantity_cartons  INTEGER NOT NULL,   -- e.g., 5 cartons

  -- Pricing
  unit_price        NUMERIC(10, 2) NOT NULL,  -- Cost per carton
  base_total        NUMERIC(12, 2),           -- quantity × unit_price

  -- Campaign Discount (if applicable)
  campaign_id       UUID REFERENCES offer_campaigns(id),
  discount_pct      NUMERIC(5, 2) DEFAULT 0,
  discount_amount   NUMERIC(12, 2) DEFAULT 0,

  final_total       NUMERIC(12, 2),     -- base_total - discount_amount

  -- Status
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','delivered')),
  notes             TEXT,

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. SALES FROM RETAILER TO CUSTOMER (PIECE-LEVEL) ──────────────────────
CREATE TABLE IF NOT EXISTS customer_sales (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id       UUID NOT NULL REFERENCES profiles(id),

  product_id        BIGINT NOT NULL REFERENCES ferrero_products(id),
  pieces_sold       INTEGER NOT NULL,   -- e.g., 10 pieces

  -- Pricing
  piece_price       NUMERIC(10, 2) NOT NULL,  -- Price per piece
  base_total        NUMERIC(12, 2),           -- pieces_sold × piece_price

  -- Campaign Commission (if applicable)
  campaign_id       UUID REFERENCES offer_campaigns(id),
  commission_pct    NUMERIC(5, 2) DEFAULT 0,
  commission_amount NUMERIC(12, 2) DEFAULT 0,

  total_earned      NUMERIC(12, 2),    -- base_total + commission_amount

  -- Cashback (if applicable)
  cashback_amount   NUMERIC(12, 2) DEFAULT 0,

  payment_method    TEXT DEFAULT 'cash',
  notes             TEXT,

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. OFFER CAMPAIGNS (Commissions, Discounts, Cashback) ──────────────────
CREATE TABLE IF NOT EXISTS offer_campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        UUID NOT NULL REFERENCES profiles(id),  -- Admin

  title             TEXT NOT NULL,
  description       TEXT,
  offer_type        TEXT NOT NULL CHECK (offer_type IN ('commission','discount','combo','cashback')),

  -- Products Involved
  product_ids       JSONB DEFAULT '[]',        -- [{id, name, qty}, ...]

  -- Commission Boost (retailers earn extra on sales)
  commission_min_qty    INTEGER DEFAULT 0,     -- Min pieces to earn commission
  commission_pct        NUMERIC(5, 2) DEFAULT 0,

  -- Bulk Discount (retailers pay less when ordering)
  discount_min_qty      INTEGER DEFAULT 0,     -- Min cartons to get discount
  discount_pct          NUMERIC(5, 2) DEFAULT 0,

  -- Combo Offer
  combo_discount_pct    NUMERIC(5, 2) DEFAULT 0,

  -- Cashback (retailers get cash per piece)
  cashback_amount       NUMERIC(10, 2) DEFAULT 0,  -- ₹ per piece
  cashback_days         JSONB DEFAULT '[]',        -- ["mon","tue",...]

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

-- ─── 6. CAMPAIGN NOTIFICATIONS (Realtime Push to Retailers) ─────────────────
CREATE TABLE IF NOT EXISTS campaign_notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id),
  campaign_id       UUID NOT NULL REFERENCES offer_campaigns(id),

  title             TEXT NOT NULL,
  body              TEXT NOT NULL,
  offer_data        JSONB,  -- {type, products, terms, duration_days}

  is_read           BOOLEAN DEFAULT false,
  is_claimed        BOOLEAN DEFAULT false,  -- Retailer claimed the offer

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 7. COMMISSION TRACKING (Earned by Retailer) ───────────────────────────
CREATE TABLE IF NOT EXISTS commission_ledger (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id       UUID NOT NULL REFERENCES profiles(id),

  source_type       TEXT CHECK (source_type IN ('sale','campaign','cashback')),
  source_id         UUID,  -- customer_sales.id or carton_orders.id or campaign

  campaign_id       UUID REFERENCES offer_campaigns(id),

  amount            NUMERIC(12, 2) NOT NULL,
  reason            TEXT,  -- "5% commission on Rocher sale", "Bulk discount on order", etc.

  status            TEXT DEFAULT 'earned' CHECK (status IN ('earned','pending','paid')),

  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── 8. WALLET TRANSACTIONS (Retailer & Distributor) ──────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id),

  type              TEXT CHECK (type IN ('credit','debit','commission','cashback','refund')),
  amount            NUMERIC(12, 2) NOT NULL,

  source            TEXT,  -- "Commission from sale", "Cashback offer", etc.
  reference_id      UUID,  -- Links to sales/orders/commissions

  balance_before    NUMERIC(12, 2),
  balance_after     NUMERIC(12, 2),

  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_user_product
  ON retailer_inventory(user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_carton_orders_retailer
  ON carton_orders(retailer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_carton_orders_distributor
  ON carton_orders(distributor_id, status);

CREATE INDEX IF NOT EXISTS idx_customer_sales_retailer
  ON customer_sales(retailer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_sales_campaign
  ON customer_sales(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_notifications_user
  ON campaign_notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_retailer
  ON commission_ledger(retailer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user
  ON wallet_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_offer_campaigns_active
  ON offer_campaigns(is_active, end_date DESC);

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────────────────────

-- Retailer Inventory: Only see own inventory
ALTER TABLE retailer_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "retailer_inventory_self" ON retailer_inventory
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Carton Orders: Retailer sees own orders, Distributor sees orders sent to them
ALTER TABLE carton_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carton_orders_own" ON carton_orders
  USING (retailer_id = auth.uid() OR distributor_id = auth.uid())
  WITH CHECK (retailer_id = auth.uid() OR distributor_id = auth.uid());

-- Customer Sales: Only retailer sees own sales
ALTER TABLE customer_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_sales_own" ON customer_sales
  USING (retailer_id = auth.uid())
  WITH CHECK (retailer_id = auth.uid());

-- Campaign Notifications: Only user sees own notifications
ALTER TABLE campaign_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_notif_own" ON campaign_notifications
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Commission Ledger: Only retailer sees own commissions
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commission_own" ON commission_ledger
  USING (retailer_id = auth.uid())
  WITH CHECK (retailer_id = auth.uid());

-- Wallet Transactions: Only user sees own transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_own" ON wallet_transactions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── RPC FUNCTIONS ───────────────────────────────────────────────────────────

-- RPC: Send Campaign (create campaign + notifications)
CREATE OR REPLACE FUNCTION send_campaign(
  p_title TEXT,
  p_description TEXT,
  p_offer_type TEXT,
  p_product_ids JSONB,
  p_commission_min_qty INTEGER,
  p_commission_pct NUMERIC,
  p_discount_min_qty INTEGER,
  p_discount_pct NUMERIC,
  p_combo_discount_pct NUMERIC,
  p_cashback_amount NUMERIC,
  p_cashback_days JSONB,
  p_target_role TEXT,
  p_duration_days INTEGER
)
RETURNS TABLE (campaign_id UUID, notifications_sent INT) AS $$
DECLARE
  v_campaign_id UUID;
  v_notif_count INT;
BEGIN
  -- Create campaign
  INSERT INTO offer_campaigns (
    created_by, title, description, offer_type, product_ids,
    commission_min_qty, commission_pct,
    discount_min_qty, discount_pct,
    combo_discount_pct,
    cashback_amount, cashback_days,
    target_role, duration_days, end_date
  ) VALUES (
    auth.uid(), p_title, p_description, p_offer_type, p_product_ids,
    p_commission_min_qty, p_commission_pct,
    p_discount_min_qty, p_discount_pct,
    p_combo_discount_pct,
    p_cashback_amount, p_cashback_days,
    p_target_role, p_duration_days, now() + (p_duration_days || ' days')::INTERVAL
  ) RETURNING id INTO v_campaign_id;

  -- Create notifications for target users
  INSERT INTO campaign_notifications (user_id, campaign_id, title, body, offer_data)
  SELECT
    p.id,
    v_campaign_id,
    p_title,
    p_description,
    jsonb_build_object(
      'type', p_offer_type,
      'products', p_product_ids,
      'terms', jsonb_build_object(
        'commission_min_qty', p_commission_min_qty,
        'commission_pct', p_commission_pct,
        'discount_min_qty', p_discount_min_qty,
        'discount_pct', p_discount_pct,
        'combo_discount_pct', p_combo_discount_pct,
        'cashback_amount', p_cashback_amount,
        'cashback_days', p_cashback_days
      ),
      'duration_days', p_duration_days
    )
  FROM profiles p
  WHERE
    (p_target_role = 'all' OR p.role = p_target_role)
    AND p.role IN ('retailer', 'distributor')
    AND p.deleted_at IS NULL;

  GET DIAGNOSTICS v_notif_count = ROW_COUNT;

  RETURN QUERY SELECT v_campaign_id, v_notif_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Process Sale with Campaign Commission
CREATE OR REPLACE FUNCTION process_customer_sale(
  p_product_id BIGINT,
  p_pieces_sold INTEGER,
  p_piece_price NUMERIC,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS TABLE (sale_id UUID, commission_earned NUMERIC, cashback_earned NUMERIC) AS $$
DECLARE
  v_sale_id UUID;
  v_commission NUMERIC := 0;
  v_cashback NUMERIC := 0;
  v_campaign RECORD;
  v_base_total NUMERIC;
BEGIN
  v_base_total := p_pieces_sold * p_piece_price;

  -- Check for campaign
  IF p_campaign_id IS NOT NULL THEN
    SELECT * INTO v_campaign FROM offer_campaigns WHERE id = p_campaign_id AND is_active = true;

    -- Apply commission if offer type is 'commission'
    IF v_campaign IS NOT NULL AND v_campaign.offer_type = 'commission' THEN
      IF p_pieces_sold >= v_campaign.commission_min_qty THEN
        v_commission := (v_base_total * v_campaign.commission_pct) / 100;
      END IF;
    END IF;

    -- Apply cashback if offer type is 'cashback'
    IF v_campaign IS NOT NULL AND v_campaign.offer_type = 'cashback' THEN
      v_cashback := p_pieces_sold * v_campaign.cashback_amount;
    END IF;
  END IF;

  -- Create sale record
  INSERT INTO customer_sales (
    retailer_id, product_id, pieces_sold, piece_price,
    base_total, campaign_id, commission_pct, commission_amount, cashback_amount, total_earned
  ) VALUES (
    auth.uid(), p_product_id, p_pieces_sold, p_piece_price,
    v_base_total, p_campaign_id, COALESCE(v_campaign.commission_pct, 0), v_commission,
    v_cashback, v_base_total + v_commission + v_cashback
  ) RETURNING id INTO v_sale_id;

  -- Record commission in ledger
  IF v_commission > 0 THEN
    INSERT INTO commission_ledger (retailer_id, source_type, source_id, campaign_id, amount, reason)
    VALUES (auth.uid(), 'sale', v_sale_id, p_campaign_id, v_commission, 'Commission from campaign sale');
  END IF;

  -- Add to wallet if commission/cashback
  IF v_commission + v_cashback > 0 THEN
    INSERT INTO wallet_transactions (user_id, type, amount, source, reference_id)
    VALUES (auth.uid(), 'commission', v_commission + v_cashback, 'Sale commission & cashback', v_sale_id);
  END IF;

  RETURN QUERY SELECT v_sale_id, v_commission, v_cashback;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── REALTIME PUBLICATIONS ───────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE carton_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_sales;
ALTER PUBLICATION supabase_realtime ADD TABLE commission_ledger;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_transactions;

-- ─── SAMPLE DATA (Testing) ────────────────────────────────────────────────────
INSERT INTO ferrero_products (name, sku, category, cost_price, distributor_price, pieces_per_carton, piece_cost, piece_retail, description) VALUES
  ('Ferrero Rocher 48pc', 'FR-48', 'Premium', 300, 350, 48, 6.25, 12.50, 'Classic hazelnut wafer balls'),
  ('Golden Gallery 42pc', 'GG-42', 'Premium', 250, 300, 42, 5.95, 11.90, 'Golden wafer assortment'),
  ('Raffaello 42pc', 'RAF-42', 'Premium', 220, 270, 42, 5.24, 10.48, 'Coconut almond wafers'),
  ('Rondnoir 42pc', 'RN-42', 'Dark', 240, 290, 42, 5.71, 11.43, 'Dark chocolate wafers'),
  ('Mon Cheri 30pc', 'MC-30', 'Liquor', 180, 220, 30, 6.00, 12.00, 'Liqueur-filled chocolates')
ON CONFLICT (sku) DO NOTHING;
