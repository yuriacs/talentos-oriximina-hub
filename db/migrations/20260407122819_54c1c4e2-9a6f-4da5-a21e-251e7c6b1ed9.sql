-- Fix RLS policy to match actual status value 'APROVADA'
DROP POLICY IF EXISTS "Public can view approved companies" ON public.companies;
CREATE POLICY "Public can view approved companies"
ON public.companies FOR SELECT
TO anon, authenticated
USING (status = 'APROVADA');