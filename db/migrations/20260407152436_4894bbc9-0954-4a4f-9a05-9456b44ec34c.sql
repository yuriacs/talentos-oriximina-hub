
-- Create a secure public view with only non-sensitive profile fields
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Grant access to the view for anon and authenticated
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Drop the old permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view published profiles" ON public.profiles;

-- Authenticated users can view their own profile or if admin
CREATE POLICY "Authenticated can view own or admin"
ON public.profiles
FOR SELECT
TO authenticated
USING ((user_id = auth.uid()) OR is_admin());

-- Published profiles visible to authenticated users (for profile detail pages)
CREATE POLICY "Authenticated can view published profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (status = 'PUBLISHED'::profile_status);
