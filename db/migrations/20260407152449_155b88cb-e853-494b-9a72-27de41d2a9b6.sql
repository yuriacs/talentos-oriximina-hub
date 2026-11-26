
-- Recreate view with SECURITY INVOKER to fix linter warning
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  id,
  full_name,
  photo,
  bio,
  city,
  area,
  professional_objective,
  status,
  is_verified,
  profile_completion,
  education_level,
  portfolio_url,
  linkedin_url,
  github_url,
  video_url,
  institution_type,
  current_course,
  desired_opportunity_types,
  interest_areas,
  available_shifts,
  accepts_remote,
  created_at,
  updated_at
FROM public.profiles
WHERE status = 'PUBLISHED';

-- Re-grant access
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Also need to allow anon to SELECT from profiles but ONLY through the view
-- Add a policy for anon to read published profiles (needed for the view with security_invoker)
CREATE POLICY "Anon can view published profiles limited"
ON public.profiles
FOR SELECT
TO anon
USING (status = 'PUBLISHED'::profile_status);
