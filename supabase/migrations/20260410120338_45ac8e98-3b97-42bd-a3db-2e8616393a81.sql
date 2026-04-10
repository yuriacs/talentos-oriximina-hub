
-- Drop the current permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users can update their own profile but CANNOT change is_verified or status
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND is_verified = (SELECT p.is_verified FROM public.profiles p WHERE p.id = profiles.id)
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = profiles.id)
  );

-- Admins can update any profile (including is_verified and status)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
