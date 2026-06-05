-- ============================================================
--  COUNTER OS v2 - FERRERO ROCHER EDITION
--  Complete Supabase Schema - FIXED & WORKING
--  Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
--  1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           text UNIQUE NOT NULL,
  name            text,
  shop            text,
  loc             text,
  role            text CHECK (role IN ('retailer','distributor','admin')),
  wallet_balance  numeric(12,2) DEFAULT 0,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE profiles REPLICA IDENTITY FULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);


-- ============================================================
--  2. FERRERO_PRODUCTS TABLE (Create FIRST!)
-- ============================================================
CREATE TABLE IF NOT EXISTS ferrero_products (
  id              bigserial PRIMARY KEY,
  name            text NOT NULL,
  sku             text UNIQUE,
  description     text,
  category        text,
  unit            text,
  cost_price      numeric(10,2),
  retail_price    numeric(10,2),
  margin          numeric(5,2),
  image_url       text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ferrero_products_sku ON ferrero_products(sku);
CREATE INDEX IF NOT EXISTS idx_ferrero_products_category ON ferrero_products(category);


-- ============================================================
--  3. INVENTORY TABLE (References ferrero_products)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id    bigint REFERENCES ferrero_products(id) ON DELETE SET NULL,
  qty           integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);


-- ============================================================
--  4. OFFER_CAMPAIGNS TABLE (NEW - for real-time campaigns)
-- ============================================================
CREATE TABLE IF NOT EXISTS offer_campaigns (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  description           text,
  offer_type            text CHECK (offer_type IN ('commission','discount','combo','cashback')),
  target_role           text CHECK (target_role IN ('retailer','distributor','all')),
  product_ids           jsonb DEFAULT '[]',
  is_active             boolean DEFAULT true,
  start_date            timestamptz DEFAULT now(),
  end_date              timestamptz,
  commission_pct        numeric(5,2) DEFAULT 0,
  commission_min_qty    integer DEFAULT 1,
  discount_pct          numeric(5,2) DEFAULT 0,
  discount_min_qty      integer DEFAULT 1,
  combo_pct             numeric(5,2) DEFAULT 0,
  cashback_amount       numeric(10,2) DEFAULT 0,
  cashback_days         integer DEFAULT 7,
  duration_days         integer DEFAULT 7,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE offer_campaigns REPLICA IDENTITY FULL;
CREATE INDEX IF NOT EXISTS idx_offer_campaigns_is_active ON offer_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_offer_campaigns_target_role ON offer_campaigns(target_role);
CREATE INDEX IF NOT EXISTS idx_offer_campaigns_start_date ON offer_campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_offer_campaigns_end_date ON offer_campaigns(end_date);


-- ============================================================
--  5. CAMPAIGN_NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_notifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid NOT NULL REFERENCES offer_campaigns(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_claimed        boolean DEFAULT false,
  claimed_at        timestamptz,
  created_at        timestamptz DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_notifications_campaign_id ON campaign_notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_notifications_user_id ON campaign_notifications(user_id);


-- ============================================================
--  6. COMMISSION_LEDGER TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS commission_ledger (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id       uuid REFERENCES offer_campaigns(id) ON DELETE SET NULL,
  product_id        text,
  pieces_sold       integer,
  price_per_piece   numeric(10,2),
  commission_amount numeric(12,2),
  cashback_amount   numeric(12,2),
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_user_id ON commission_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_campaign_id ON commission_ledger(campaign_id);


-- ============================================================
--  7. WALLET_TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type              text CHECK (type IN ('commission','cashback','withdrawal','refund','credit')),
  amount            numeric(12,2),
  description       text,
  campaign_id       uuid REFERENCES offer_campaigns(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);


-- ============================================================
--  8. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              text PRIMARY KEY,
  retailer_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  retailer_name   text,
  items           integer DEFAULT 0,
  total           numeric(12,2) DEFAULT 0,
  status          text DEFAULT 'pending' CHECK (status IN ('pending','approved','fulfilled','rejected')),
  otp             text,
  items_list      jsonb DEFAULT '[]',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_retailer_id ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
ALTER TABLE orders REPLICA IDENTITY FULL;


-- ============================================================
--  9. TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id          bigserial PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text CHECK (type IN ('sale','purchase','cashback','refund')),
  label       text,
  sub         text,
  amt         text,
  clr         text,
  icon        text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);


-- ============================================================
--  10. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  body          text,
  type          text DEFAULT 'notification',
  offer_type    text,
  campaign_id   uuid REFERENCES offer_campaigns(id) ON DELETE SET NULL,
  role          text CHECK (role IN ('retailer','distributor','admin')),
  is_read       boolean DEFAULT false,
  read_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(role);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
ALTER TABLE notifications REPLICA IDENTITY FULL;


-- ============================================================
--  11. CONNECTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS connections (
  id              bigserial PRIMARY KEY,
  retailer_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  distributor_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (retailer_id, distributor_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_retailer_id ON connections(retailer_id);
CREATE INDEX IF NOT EXISTS idx_connections_distributor_id ON connections(distributor_id);


-- ============================================================
--  ROW LEVEL SECURITY - ENABLE ON ALL TABLES
-- ============================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferrero_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections  ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE POLICIES (for development - tighten in production)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);

CREATE POLICY "inventory_all" ON inventory USING (true) WITH CHECK (true);
CREATE POLICY "ferrero_products_all" ON ferrero_products USING (true) WITH CHECK (true);
CREATE POLICY "offer_campaigns_all" ON offer_campaigns USING (true) WITH CHECK (true);
CREATE POLICY "campaign_notifications_all" ON campaign_notifications USING (true) WITH CHECK (true);
CREATE POLICY "commission_ledger_all" ON commission_ledger USING (true) WITH CHECK (true);
CREATE POLICY "wallet_transactions_all" ON wallet_transactions USING (true) WITH CHECK (true);
CREATE POLICY "orders_all" ON orders USING (true) WITH CHECK (true);
CREATE POLICY "transactions_all" ON transactions USING (true) WITH CHECK (true);
CREATE POLICY "notifications_all" ON notifications USING (true) WITH CHECK (true);
CREATE POLICY "connections_all" ON connections USING (true) WITH CHECK (true);


-- ============================================================
--  REALTIME PUBLICATION
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='offer_campaigns') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE offer_campaigns;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='campaign_notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE campaign_notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;


-- ============================================================
--  SEED DATA - FERRERO PRODUCTS
-- ============================================================

INSERT INTO ferrero_products (name, sku, description, category, unit, cost_price, retail_price, margin, image_url, is_active) VALUES

-- Ferrero Rocher Classic
  ('Ferrero Rocher 48 pieces',  'FR-48',   'Classic 48 piece box - premium hazelnut wafer',     'Rocher',            'Box', 300.00, 450.00,  50.00, null, true),
  ('Ferrero Rocher 16 pieces',  'FR-16',   'Premium hazelnut wafer - 16 piece pack',             'Rocher',            'Box', 110.00, 165.00,  50.00, null, true),
  ('Ferrero Rocher 8 pieces',   'FR-8',    'Individual premium pieces - 8 pack',                 'Rocher',            'Pack', 60.00,  90.00,  50.00, null, true),
  ('Ferrero Rocher Single',     'FR-1',    'Single premium hazelnut piece',                      'Rocher',            'Piece', 15.00, 25.00,  66.67, null, true),

-- Golden Gallery
  ('Golden Gallery 42 pieces',  'GG-42',   'Premium golden collection - 42 pieces',              'Golden Gallery',    'Box', 250.00, 375.00, 50.00, null, true),
  ('Golden Gallery 18 pieces',  'GG-18',   'Assorted golden chocolates - 18 pieces',            'Golden Gallery',    'Box', 120.00, 180.00, 50.00, null, true),

-- Raffaello
  ('Raffaello 42 pieces',       'RAF-42',  'Creamy coconut wafer - 42 piece box',               'Raffaello',         'Box', 280.00, 420.00, 50.00, null, true),
  ('Raffaello 20 pieces',       'RAF-20',  'Coconut specialty - 20 piece pack',                 'Raffaello',         'Box', 145.00, 220.00, 51.72, null, true),

-- Rondnoir
  ('Rondnoir 42 pieces',        'RND-42',  'Dark wafer specialty - 42 pieces',                  'Rondnoir',          'Box', 280.00, 420.00, 50.00, null, true),
  ('Rondnoir 20 pieces',        'RND-20',  'Dark hazelnut & almond - 20 pieces',               'Rondnoir',          'Box', 145.00, 220.00, 51.72, null, true),

-- Hazelnut Specialties
  ('Hazelnut Specialty Box',    'HNT-BOX', 'Premium hazelnut assortment - luxury pack',         'Hazelnut',          'Box', 320.00, 480.00, 50.00, null, true),
  ('Hazelnut Truffle Pieces',   'HNT-TRU', 'Single hazelnut truffle pieces - 10 count',        'Hazelnut',          'Pack', 80.00, 120.00, 50.00, null, true),

-- Premium Assortments
  ('Premium Assortment Box',    'PREM-BOX','Mixed premium selection - 60 pieces',              'Assortment',        'Box', 400.00, 600.00, 50.00, null, true),
  ('Holiday Gift Set',          'GIFT-SET','Special occasion luxury box - 80 pieces',          'Gift Set',          'Box', 500.00, 750.00, 50.00, null, true);


-- ============================================================
--  SEED DATA - TEST USERS
-- ============================================================

INSERT INTO profiles (phone, name, shop, loc, role, wallet_balance) VALUES
  ('9800000001', 'Rajesh Distributor',   'Rajesh Distributors',      'Indore, MP',       'distributor', 50000.00),
  ('9900000001', 'Ramesh Kumar',         'Kumar Sweet House',        'Khetgaon, MP',     'retailer',     5000.00),
  ('9900000002', 'Sunita Patel',         'Patel Gift Store',         'Dewas, MP',        'retailer',     3500.00),
  ('9900000003', 'Mohan Sharma',         'Sharma Confectionery',     'Ratlam, MP',       'retailer',     4200.00),
  ('9900000004', 'Anil Verma',           'Verma Premium Gifts',      'Sehore, MP',       'retailer',     2800.00),
  ('9900000005', 'Kavita Singh',         'Singh Luxury Sweets',      'Mandsaur, MP',     'retailer',     6100.00),
  ('9991111111', 'Admin Ferrero',        'CounterOS Admin',          'Headquarters',     'admin',        0.00)
ON CONFLICT (phone) DO NOTHING;


-- ============================================================
--  SEED DATA - SAMPLE INVENTORY
-- ============================================================

INSERT INTO inventory (user_id, product_id, qty) VALUES
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 1, 50),  -- Rocher 48-pcs
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 2, 80),  -- Rocher 16-pcs
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 5, 40),  -- Golden Gallery 42
  ((SELECT id FROM profiles WHERE phone = '9900000002'), 3, 120), -- Rocher 8-pcs
  ((SELECT id FROM profiles WHERE phone = '9900000002'), 7, 60),  -- Raffaello 42
  ((SELECT id FROM profiles WHERE phone = '9900000003'), 6, 45),  -- Golden Gallery 18
  ((SELECT id FROM profiles WHERE phone = '9900000004'), 9, 35),  -- Rondnoir 42
  ((SELECT id FROM profiles WHERE phone = '9900000005'), 1, 100)  -- Rocher 48-pcs
ON CONFLICT DO NOTHING;


-- ============================================================
--  SAMPLE CAMPAIGN (Optional - creates one campaign to test)
-- ============================================================

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
  '💰 Golden Commission Week',
  'Earn 8% extra commission on all Ferrero Rocher 48pc sales this week! Boost your earnings now.',
  'commission',
  'retailer',
  '[{"id": 1, "name": "Ferrero Rocher 48 pieces", "sku": "FR-48"}]'::jsonb,
  true,
  now(),
  now() + interval '7 days',
  8.00,
  15,
  7
)
ON CONFLICT DO NOTHING;


-- ============================================================
--  VERIFICATION QUERIES (Run to verify setup)
-- ============================================================

-- Count tables created
SELECT count(*) as "Tables Created" FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Count Ferrero products
SELECT count(*) as "Ferrero Products" FROM ferrero_products;

-- Count test users
SELECT count(*) as "Test Users" FROM profiles;

-- Count campaigns
SELECT count(*) as "Sample Campaigns" FROM offer_campaigns;

-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
