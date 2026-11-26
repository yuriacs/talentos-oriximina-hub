
-- Fix overly permissive policies
DROP POLICY "Public can view own company" ON public.companies;
DROP POLICY "Anyone can create company registration" ON public.companies;

-- Allow anyone (including anon) to insert - this is the public registration form
CREATE POLICY "Public can register company"
  ON public.companies FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
