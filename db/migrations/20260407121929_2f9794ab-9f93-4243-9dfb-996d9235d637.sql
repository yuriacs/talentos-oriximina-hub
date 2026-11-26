
-- Fix the remaining permissive policy on companies INSERT
DROP POLICY IF EXISTS "Authenticated users can register company" ON public.companies;
CREATE POLICY "Authenticated users can register own company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
