-- ============================================================
-- COUNTER OS v2 - FERRERO ROCHER ONLY DATABASE MIGRATION
-- Safe to run in Supabase SQL editor
-- ============================================================

-- 1. CLEAN EXISTING DATA FROM DOMAIN-DEPENDENT TABLES
TRUNCATE TABLE inventory CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE commission_ledger CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE campaign_notifications CASCADE;
TRUNCATE TABLE notifications CASCADE;

-- 2. RE-POPULATE BUSINESS CATEGORIES TO FERRERO ROCHER ONLY
DELETE FROM business_categories;
INSERT INTO business_categories (code, label, emoji) VALUES
('rocher', 'Ferrero Rocher', '🍫'),
('gallery', 'Golden Gallery', '🌟'),
('raffaello', 'Raffaello', '🥥'),
('rondnoir', 'Rondnoir', '🍪'),
('hazelnut', 'Hazelnut Specialties', '🌰'),
('assortment', 'Premium Assortments', '🎁')
ON CONFLICT (code) DO UPDATE 
SET label = EXCLUDED.label, emoji = EXCLUDED.emoji;

-- 3. RESET AND RE-SEED ALL FERRERO PRODUCTS (CONSOLIDATING UNIQUE SKUS)
TRUNCATE TABLE ferrero_products CASCADE;
INSERT INTO ferrero_products (id, name, sku, description, category, unit, cost_price, retail_price, margin, is_active) VALUES
(1, 'Ferrero Rocher 48 pieces',  'FR-48',    'Classic 48 piece box - premium hazelnut wafer',      'Rocher',         'Box', 300.00, 450.00,  50.00, true),
(2, 'Ferrero Rocher 16 pieces',  'FR-16',    'Premium hazelnut wafer - 16 piece pack',              'Rocher',         'Box', 110.00, 165.00,  50.00, true),
(3, 'Ferrero Rocher 8 pieces',   'FR-8',     'Individual premium pieces - 8 pack',                  'Rocher',         'Pack', 60.00,  90.00,  50.00, true),
(4, 'Ferrero Rocher Single',     'FR-1',     'Single premium hazelnut piece',                       'Rocher',         'Piece', 15.00, 25.00,  66.67, true),
(5, 'Golden Gallery 42 pieces',  'GG-42',    'Premium golden collection - 42 pieces',               'Golden Gallery', 'Box', 250.00, 375.00,  50.00, true),
(6, 'Golden Gallery 18 pieces',  'GG-18',    'Assorted golden chocolates - 18 pieces',             'Golden Gallery', 'Box', 120.00, 180.00,  50.00, true),
(7, 'Raffaello 42 pieces',       'RAF-42',   'Creamy coconut wafer - 42 piece box',                'Raffaello',      'Box', 280.00, 420.00,  50.00, true),
(8, 'Raffaello 20 pieces',       'RAF-20',   'Coconut specialty - 20 piece pack',                  'Raffaello',      'Box', 145.00, 220.00,  51.72, true),
(9, 'Rondnoir 42 pieces',        'RND-42',   'Dark wafer specialty - 42 pieces',                   'Rondnoir',       'Box', 280.00, 420.00,  50.00, true),
(10, 'Rondnoir 20 pieces',       'RND-20',   'Dark hazelnut & almond - 20 pieces',                'Rondnoir',       'Box', 145.00, 220.00,  51.72, true),
(11, 'Hazelnut Specialty Box',    'HNT-BOX',  'Premium hazelnut assortment - luxury pack',          'Hazelnut',       'Box', 320.00, 480.00,  50.00, true),
(12, 'Hazelnut Truffle Pieces',   'HNT-TRU',  'Single hazelnut truffle pieces - 10 count',         'Hazelnut',       'Pack', 80.00, 120.00,  50.00, true),
(13, 'Premium Assortment Box',    'PREM-BOX', 'Mixed premium selection - 60 pieces',               'Assortment',     'Box', 400.00, 600.00,  50.00, true),
(14, 'Holiday Gift Set',          'GIFT-SET', 'Special occasion luxury box - 80 pieces',           'Gift Set',       'Box', 500.00, 750.00,  50.00, true);

-- Reset sequence for primary key on ferrero_products
SELECT setval('ferrero_products_id_seq', (SELECT MAX(id) FROM ferrero_products));

-- 4. UPDATE TEST USER PROFILES TO FERRERO CATEGORIES
-- Clear existing non-matching constraints if any, then insert/update
DELETE FROM profiles WHERE phone NOT IN ('9800000001','9900000001','9900000002','9900000003','9900000004','9900000005','9900000006','9900000007','9900000008','9991111111');

INSERT INTO profiles (phone, name, shop, loc, cat, role, wallet_balance) VALUES
('9800000001', 'Rajesh Gupta',        'Gupta Ferrero Rocher Wholesaler', 'Indore, MP',   'rocher',     'distributor', 50000.00),
('9900000001', 'Ramesh Kumar',        'Kumar Sweet House',               'Khetgaon, MP', 'rocher',     'retailer',     5000.00),
('9900000002', 'Sunita Patel',        'Patel Gift Store',                'Dewas, MP',    'raffaello',  'retailer',     3500.00),
('9900000003', 'Mohan Sharma',        'Sharma Confectionery',            'Ratlam, MP',   'gallery',    'retailer',     4200.00),
('9900000004', 'Anil Verma',          'Verma Premium Gifts',             'Sehore, MP',   'rondnoir',   'retailer',     2800.00),
('9900000005', 'Kavita Singh',        'Singh Luxury Sweets',             'Mandsaur, MP', 'rocher',     'retailer',     6100.00),
('9900000006', 'Deepak Tiwari',       'Tiwari Gift Emporium',            'Vidisha, MP',  'hazelnut',   'retailer',     4500.00),
('9900000007', 'Geeta Yadav',         'Yadav Premium Chocolates',        'Harda, MP',    'assortment', 'retailer',     3200.00),
('9900000008', 'Prakash Dubey',       'Dubey General Store',             'Shajapur, MP', 'rocher',     'retailer',     2900.00),
('9991111111', 'Admin User',          'CounterOS Admin',                 'Headquarters', 'rocher',     'admin',        0.00)
ON CONFLICT (phone) DO UPDATE SET
  name = EXCLUDED.name,
  shop = EXCLUDED.shop,
  loc = EXCLUDED.loc,
  cat = EXCLUDED.cat,
  role = EXCLUDED.role,
  wallet_balance = EXCLUDED.wallet_balance;

-- 5. SEED NEW FERRERO-ONLY INVENTORY RECORDS (LINKED VIA Direct Direct mapping)
INSERT INTO inventory (user_id, code, name, cat, unit, qty, buy, sell, earn, mfg, exp, business_cat)
VALUES
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 'FR-48', 'Ferrero Rocher 48 pieces', 'Rocher', 'Box', 50, 300.00, 450.00, 15.00, '2025-05', '2026-05', 'rocher'),
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 'FR-16', 'Ferrero Rocher 16 pieces', 'Rocher', 'Box', 80, 110.00, 165.00, 5.50, '2025-05', '2026-05', 'rocher'),
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 'GG-42', 'Golden Gallery 42 pieces', 'Golden Gallery', 'Box', 40, 250.00, 375.00, 12.50, '2025-05', '2026-05', 'gallery'),
  ((SELECT id FROM profiles WHERE phone = '9900000002'), 'FR-8', 'Ferrero Rocher 8 pieces', 'Rocher', 'Pack', 120, 60.00, 90.00, 3.00, '2025-05', '2026-05', 'rocher'),
  ((SELECT id FROM profiles WHERE phone = '9900000002'), 'RAF-42', 'Raffaello 42 pieces', 'Raffaello', 'Box', 60, 280.00, 420.00, 14.00, '2025-05', '2026-05', 'raffaello'),
  ((SELECT id FROM profiles WHERE phone = '9900000003'), 'GG-18', 'Golden Gallery 18 pieces', 'Golden Gallery', 'Box', 45, 120.00, 180.00, 6.00, '2025-05', '2026-05', 'gallery'),
  ((SELECT id FROM profiles WHERE phone = '9900000004'), 'RND-42', 'Rondnoir 42 pieces', 'Rondnoir', 'Box', 35, 280.00, 420.00, 14.00, '2025-05', '2026-05', 'rondnoir'),
  ((SELECT id FROM profiles WHERE phone = '9900000005'), 'FR-48', 'Ferrero Rocher 48 pieces', 'Rocher', 'Box', 100, 300.00, 450.00, 15.00, '2025-05', '2026-05', 'rocher');

-- 6. SEED PRE-MOCK TRANSACTIONS
INSERT INTO transactions (user_id, type, label, sub, amt, clr, icon)
VALUES
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 'purchase', 'Gupta Ferrero Rocher Wholesaler', 'Invoice · 3 prod', '+₹12,500', '#d4a574', 'local_shipping'),
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 'sale', 'Sale to Customer', 'Ferrero Rocher 16pc × 2', '+₹330', '#c41e3a', 'storefront'),
  ((SELECT id FROM profiles WHERE phone = '9900000001'), 'sale', 'Sale to Gift Buyer', 'Ferrero Rocher 48pc × 1', '+₹450', '#c41e3a', 'storefront');

-- ============================================================
-- DATABASE OVERHAUL COMPLETE
-- ============================================================
