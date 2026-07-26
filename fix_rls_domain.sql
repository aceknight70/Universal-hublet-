DROP POLICY IF EXISTS "Domain config editable by master" ON public.manifest_domain_config;
CREATE POLICY "Domain config editable by master" ON public.manifest_domain_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.manifest_staff WHERE email = auth.jwt()->>'email' AND role = 'master')
);
