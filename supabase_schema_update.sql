-- Table 1: manifest_catalog (Shared product list)
CREATE TABLE IF NOT EXISTS public.manifest_catalog (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text,
  category text,
  name text NOT NULL,
  spec_sheet jsonb,
  reference_photo_url text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.manifest_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Catalog visible to everyone" ON public.manifest_catalog;
CREATE POLICY "Catalog visible to everyone" ON public.manifest_catalog FOR SELECT USING (true);
DROP POLICY IF EXISTS "Catalog editable by master only" ON public.manifest_catalog;
CREATE POLICY "Catalog editable by master only" ON public.manifest_catalog FOR ALL USING (
  EXISTS (SELECT 1 FROM public.manifest_staff WHERE email = auth.jwt()->>'email' AND role = 'master')
);

-- Table 2: manifest_inventory (Per-business stock/price)
CREATE TABLE IF NOT EXISTS public.manifest_inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.manifest_clients(id) ON DELETE CASCADE,
  catalog_id uuid REFERENCES public.manifest_catalog(id) ON DELETE CASCADE,
  price numeric,
  tag text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(client_id, catalog_id)
);
ALTER TABLE public.manifest_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inventory visible to everyone" ON public.manifest_inventory;
CREATE POLICY "Inventory visible to everyone" ON public.manifest_inventory FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inventory editable by owning business" ON public.manifest_inventory;
CREATE POLICY "Inventory editable by owning business" ON public.manifest_inventory FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.manifest_staff 
    WHERE email = auth.jwt()->>'email' 
    AND (client_id = manifest_inventory.client_id OR role = 'master')
  )
);

-- Table 3: manifest_invoice_design
CREATE TABLE IF NOT EXISTS public.manifest_invoice_design (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.manifest_clients(id) ON DELETE CASCADE UNIQUE,
  logo_url text,
  primary_color text,
  layout_style text,
  bank_name text,
  account_name text,
  account_number text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.manifest_invoice_design ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Invoice design visible to owning business staff" ON public.manifest_invoice_design;
CREATE POLICY "Invoice design visible to owning business staff" ON public.manifest_invoice_design FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.manifest_staff 
    WHERE email = auth.jwt()->>'email' 
    AND (client_id = manifest_invoice_design.client_id OR role = 'master')
  )
);
DROP POLICY IF EXISTS "Invoice design editable by master only" ON public.manifest_invoice_design;
CREATE POLICY "Invoice design editable by master only" ON public.manifest_invoice_design FOR ALL USING (
  EXISTS (SELECT 1 FROM public.manifest_staff WHERE email = auth.jwt()->>'email' AND role = 'master')
);

-- Per-business placeholder tables for future use
CREATE TABLE IF NOT EXISTS public.manifest_gallery (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, photo_url text);
ALTER TABLE public.manifest_gallery ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.manifest_videos (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, video_url text);
ALTER TABLE public.manifest_videos ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.manifest_channels (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, platform text, url text);
ALTER TABLE public.manifest_channels ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.manifest_ai_desk (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, context text);
ALTER TABLE public.manifest_ai_desk ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.manifest_warranty (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, content text);
ALTER TABLE public.manifest_warranty ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.manifest_contacts (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, content text);
ALTER TABLE public.manifest_contacts ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.manifest_feedback (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, content text);
ALTER TABLE public.manifest_feedback ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.manifest_education (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, content text);
ALTER TABLE public.manifest_education ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.manifest_pickup_dispatch (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, client_id uuid, content text);
ALTER TABLE public.manifest_pickup_dispatch ENABLE ROW LEVEL SECURITY;

-- Table 4: manifest_cart
CREATE TABLE IF NOT EXISTS public.manifest_cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  session_id text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (client_id, session_id)
);

ALTER TABLE public.manifest_cart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cart_open" ON public.manifest_cart;
CREATE POLICY "cart_open" ON public.manifest_cart FOR ALL USING (true);
