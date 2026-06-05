-- ============================================================
--  CounterOS v2 - FERRERO ROCHER EDITION
--  Complete Supabase Schema with Campaign System
--  Run this in Supabase SQL Editor
-- ============================================================

-- ─── CLEANUP (Optional - run if you want to start fresh) ──────
-- DROP TABLE IF EXISTS campaigns CASCADE;
-- DROP TABLE IF EXISTS campaign_recipients CASCADE;
-- DROP TABLE IF EXISTS campaign_analytics CASCADE;

-- ============================================================
--  1. PROFILES (MODIFIED - Remove category, single for Ferrero)
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


-- ─── 2. INVENTORY (MODIFIED - Ferrero Rocher products only) ─────
CREATE TABLE IF NOT EXISTS inventory (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id    bigint REFERENCES ferrero_products(id),
  qty           integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);


-- ─── 3. FERRERO_PRODUCTS (NEW - All Ferrero products) ──────────
CREATE TABLE IF NOT EXISTS ferrero_products (
  id              bigserial PRIMARY KEY,
  name            text NOT NULL,
  sku             text UNIQUE,
  description     text,
  category        text,                -- e.g. "Rocher", "Golden Gallery", "Raffaello", "Rondnoir", "Ferrero Roche Hazelnut"
  unit            text,                -- "Box", "Piece", "Pack"
  cost_price      numeric(10,2),       -- Distributor selling price
  retail_price    numeric(10,2),       -- Recommended retail price
  margin          numeric(5,2),        -- Profit margin % for retailers
  image_url       text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ferrero_products_sku ON ferrero_products(sku);
CREATE INDEX IF NOT EXISTS idx_ferrero_products_category ON ferrero_products(category);


-- ─── 4. CAMPAIGNS (NEW - Admin campaigns) ─────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            text CHECK (type IN ('promo','reward','alert','announcement','cashback')),
  title           text NOT NULL,
  body            text NOT NULL,
  image_url       text,
  target_role     text CHECK (target_role IN ('retailer','distributor','all')),
  scheduled_at    timestamptz,
  sent_at         timestamptz,
  is_scheduled    boolean DEFAULT false,
  is_sent         boolean DEFAULT false,
  status          text DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent','cancelled')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE campaigns REPLICA IDENTITY FULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_admin_id ON campaigns(admin_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_sent_at ON campaigns(sent_at);


-- ─── 5. CAMPAIGN_RECIPIENTS (NEW - Track who got the campaign) ──
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sent_at         timestamptz DEFAULT now(),
  opened_at       timestamptz,
  clicked_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_user_id ON campaign_recipients(user_id);


-- ─── 6. CAMPAIGN_ANALYTICS (NEW - Track campaign performance) ──
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  total_sent      integer DEFAULT 0,
  total_opened    integer DEFAULT 0,
  total_clicked   integer DEFAULT 0,
  open_rate       numeric(5,2) DEFAULT 0,
  click_rate      numeric(5,2) DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);


-- ─── 7. ORDERS (No changes - keep existing) ───────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             text PRIMARY KEY,
  retailer_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  retailer_name  text,
  items          integer DEFAULT 0,
  total          numeric(12,2) DEFAULT 0,
  status         text DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','fulfilled','rejected')),
  otp            text,
  items_list     jsonb DEFAULT '[]',
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_retailer_id ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

ALTER TABLE orders REPLICA IDENTITY FULL;


-- ─── 8. TRANSACTIONS (Keep existing) ──────────────────────────
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


-- ─── 9. NOTIFICATIONS (MODIFIED - Link to campaigns) ──────────
CREATE TABLE IF NOT EXISTS notifications (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id   uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  title         text NOT NULL,
  body          text,
  image_url     text,
  action_url    text,
  role          text CHECK (role IN ('retailer','distributor','admin')),
  is_read       boolean DEFAULT false,
  read_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id ON notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

ALTER TABLE notifications REPLICA IDENTITY FULL;


-- ─── 10. CONNECTIONS (Keep existing) ──────────────────────────
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
--  ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferrero_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns    ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections  ENABLE ROW LEVEL SECURITY;

-- Permissive policies (tighten with proper auth later)
CREATE POLICY "all_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "all_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "all_update" ON profiles FOR UPDATE USING (true);

CREATE POLICY "all" ON inventory USING (true) WITH CHECK (true);
CREATE POLICY "all" ON ferrero_products USING (true) WITH CHECK (true);
CREATE POLICY "all" ON campaigns USING (true) WITH CHECK (true);
CREATE POLICY "all" ON campaign_recipients USING (true) WITH CHECK (true);
CREATE POLICY "all" ON campaign_analytics USING (true) WITH CHECK (true);
CREATE POLICY "all" ON orders USING (true) WITH CHECK (true);
CREATE POLICY "all" ON transactions USING (true) WITH CHECK (true);
CREATE POLICY "all" ON notifications USING (true) WITH CHECK (true);
CREATE POLICY "all" ON connections USING (true) WITH CHECK (true);


-- ============================================================
--  REALTIME PUBLICATION
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='campaigns') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='campaign_recipients') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE campaign_recipients;
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

-- Seasonal / Limited Edition (optional)
  ('Premium Assortment Box',    'PREM-BOX','Mixed premium selection - 60 pieces',              'Assortment',        'Box', 400.00, 600.00, 50.00, null, true),
  ('Holiday Gift Set',          'GIFT-SET','Special occasion luxury box - 80 pieces',          'Gift Set',          'Box', 500.00, 750.00, 50.00, null, true);

-- Insert sample users (retailers + distributor + admin)
INSERT INTO profiles (phone, name, shop, loc, role, wallet_balance) VALUES
  ('9800000001', 'Rajesh Gupta',        'Gupta Chocolates',         'Indore, MP',       'distributor', 50000.00),
  ('9900000001', 'Ramesh Kumar',        'Kumar Sweet House',        'Khetgaon, MP',     'retailer',     5000.00),
  ('9900000002', 'Sunita Patel',        'Patel Gift Store',         'Dewas, MP',        'retailer',     3500.00),
  ('9900000003', 'Mohan Sharma',        'Sharma Confectionery',     'Ratlam, MP',       'retailer',     4200.00),
  ('9900000004', 'Anil Verma',          'Verma Premium Gifts',      'Sehore, MP',       'retailer',     2800.00),
  ('9900000005', 'Kavita Singh',        'Singh Luxury Sweets',      'Mandsaur, MP',     'retailer',     6100.00),
  ('9900000006', 'Deepak Tiwari',       'Tiwari Gift Emporium',     'Vidisha, MP',      'retailer',     4500.00),
  ('9900000007', 'Geeta Yadav',         'Yadav Premium Chocolates', 'Harda, MP',        'retailer',     3200.00),
  ('9900000008', 'Prakash Dubey',       'Dubey General Store',      'Shajapur, MP',     'retailer',     2900.00),
  ('9991111111', 'Admin User',          'CounterOS Admin',          'Headquarters',     'admin',        0.00);

-- Seed some inventory
INSERT INTO inventory (user_id, product_id, qty) VALUES
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 1, 50),  -- Ramesh has 50 Rocher 48-pcs
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 2, 80),  -- 80 Rocher 16-pcs
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 5, 40),  -- 40 Golden Gallery
  ((SELECT id FROM profiles WHERE phone = '9900000002'), 3, 120), -- Sunita has 120 Rocher 8-pcs
  ((SELECT id FROM profiles WHERE phone = '9900000002'), 7, 60),  -- 60 Raffaello
  ((SELECT id FROM profiles WHERE phone = '9900000003'), 6, 45),  -- Mohan has 45 Golden Gallery
  ((SELECT id FROM profiles WHERE phone = '9900000004'), 8, 35),  -- Anil has 35 Rondnoir
  ((SELECT id FROM profiles WHERE phone = '9900000005'), 1, 100); -- Kavita has 100 Rocher

-- Sample campaign (optional - see it in action)
INSERT INTO campaigns (admin_id, type, title, body, target_role, status, is_sent, sent_at) VALUES
  (
    (SELECT id FROM profiles WHERE phone = '9991111111'),
    'promo',
    '🎉 Ferrero Rocher Mega Sale!',
    'This weekend only! Get 20% off on all Ferrero Rocher premium boxes. Stock up now and delight your customers!',
    'retailer',
    'sent',
    true,
    now()
  );
