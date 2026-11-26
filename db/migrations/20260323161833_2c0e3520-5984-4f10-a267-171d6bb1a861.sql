CREATE POLICY "Public can count companies"
ON public.companies
FOR SELECT
TO anon, authenticated
USING (true);