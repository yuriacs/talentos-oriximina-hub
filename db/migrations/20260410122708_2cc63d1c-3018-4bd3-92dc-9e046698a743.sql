
-- 1. Allow company owners to update their own records
CREATE POLICY "Owner can update own company"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Replace the broad "Authenticated can view approved companies" policy
-- with one restricted to owner + admin only (public listing uses get_public_companies() RPC)
DROP POLICY IF EXISTS "Authenticated can view approved companies" ON public.companies;

CREATE POLICY "Owner can view own company"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins already have "Admins can view all companies" policy

-- 3. Remove broad authenticated SELECT on published profiles
-- (public listing uses get_public_profiles() RPC, detail view uses get_safe_profile_data() RPC)
DROP POLICY IF EXISTS "Authenticated can view published profiles" ON public.profiles;
