ALTER TABLE public.manifest_domain_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Domain config readable by all" ON public.manifest_domain_config;
CREATE POLICY "Domain config readable by all" ON public.manifest_domain_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Domain config editable by master" ON public.manifest_domain_config;
CREATE POLICY "Domain config editable by master" ON public.manifest_domain_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.manifest_staff WHERE email = auth.jwt()->>'email' AND role = 'master')
);
