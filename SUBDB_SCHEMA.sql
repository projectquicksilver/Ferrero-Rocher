-- ============================================================
--  SUB-DB PLATFORM — DATABASE SCHEMA MIGRATION
--  Run this in: Supabase Dashboard → SQL Editor
--  Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- ============================================================
--  1. SUBDB_USERS TABLE
--  Sub-distributor / field EMP accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS subdb_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    emp_id TEXT,
    name TEXT,
    state TEXT,
    district TEXT,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE subdb_users REPLICA IDENTITY FULL;
ALTER TABLE subdb_users DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subdb_users_phone ON subdb_users(phone);
CREATE INDEX IF NOT EXISTS idx_subdb_users_emp_id ON subdb_users(emp_id);


-- ============================================================
--  2. SUBDB_INVOICES TABLE
--  Every AI-scanned + submitted invoice
-- ============================================================
CREATE TABLE IF NOT EXISTS subdb_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Submitted by which EMP
    submitted_by UUID REFERENCES subdb_users(id) ON DELETE SET NULL,

    -- Retailer info (from invoice or EMP selection)
    retailer_name TEXT,
    retailer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- matched profile

    -- Wholesaler / supplier info
    wholesaler_name TEXT,

    -- Invoice details
    purchase_date DATE,
    invoice_number TEXT,

    -- Products as JSON array: [{name, sku, qty, unit, price}]
    products JSONB DEFAULT '[]'::jsonb,

    -- Financial summary
    total_amount NUMERIC(12, 2) DEFAULT 0,

    -- AI scan metadata
    raw_ocr_text TEXT,          -- raw Gemini output
    image_url TEXT,             -- uploaded file path / base64 ref
    scan_confidence TEXT,       -- 'high' | 'medium' | 'low'

    -- Workflow status
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'rejected')),

    -- Which retailer targets were updated
    targets_updated JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE subdb_invoices REPLICA IDENTITY FULL;
ALTER TABLE subdb_invoices DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subdb_invoices_submitted_by ON subdb_invoices(submitted_by);
CREATE INDEX IF NOT EXISTS idx_subdb_invoices_retailer_id ON subdb_invoices(retailer_id);
CREATE INDEX IF NOT EXISTS idx_subdb_invoices_status ON subdb_invoices(status);
CREATE INDEX IF NOT EXISTS idx_subdb_invoices_created_at ON subdb_invoices(created_at DESC);


-- ============================================================
--  3. ADD TO SUPABASE REALTIME PUBLICATION
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname='supabase_realtime' AND tablename='subdb_users') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE subdb_users;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname='supabase_realtime' AND tablename='subdb_invoices') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE subdb_invoices;
    END IF;
END $$;


-- ============================================================
--  4. VERIFY
-- ============================================================
SELECT
    (SELECT count(*) FROM information_schema.tables
     WHERE table_schema='public' AND table_name='subdb_users') AS "subdb_users table",
    (SELECT count(*) FROM information_schema.tables
     WHERE table_schema='public' AND table_name='subdb_invoices') AS "subdb_invoices table";

-- ✅ Sub-DB schema ready!
