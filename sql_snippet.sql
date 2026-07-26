-- Run this in your Supabase SQL Editor to authorize your Master account:
INSERT INTO public.manifest_staff (email, role)
VALUES ('aceknight790@gmail.com', 'master')
ON CONFLICT (email) DO UPDATE SET role = 'master';

-- If you also have a dedicated manifest_master table for RLS:
INSERT INTO public.manifest_master (user_id) 
SELECT id FROM auth.users WHERE email = 'aceknight790@gmail.com'
ON CONFLICT DO NOTHING;

-- Fix Domain Config RLS so master can edit it:
ALTER TABLE public.manifest_domain_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Domain config readable by all" ON public.manifest_domain_config;
CREATE POLICY "Domain config readable by all" ON public.manifest_domain_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Domain config editable by master" ON public.manifest_domain_config;
CREATE POLICY "Domain config editable by master" ON public.manifest_domain_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.manifest_staff WHERE email = auth.jwt()->>'email' AND role = 'master')
);
