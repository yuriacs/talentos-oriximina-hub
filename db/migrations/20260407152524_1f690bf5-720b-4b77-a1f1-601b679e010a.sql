
-- Remove the anon policy that exposes all columns
DROP POLICY IF EXISTS "Anon can view published profiles limited" ON public.profiles;

-- Drop the view - we'll use an RPC instead
DROP VIEW IF EXISTS public.public_profiles;

-- Create a secure function to list public profiles (no sensitive data)
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  full_name text,
  photo text,
  bio text,
  city text,
  area text,
  professional_objective text,
  is_verified boolean,
  profile_completion integer,
  education_level text,
  portfolio_url text,
  linkedin_url text,
  github_url text,
  video_url text,
  institution_type text,
  current_course text,
  desired_opportunity_types text[],
  interest_areas text[],
  available_shifts text[],
  accepts_remote boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.full_name, p.photo, p.bio, p.city, p.area,
    p.professional_objective, p.is_verified, p.profile_completion,
    p.education_level, p.portfolio_url, p.linkedin_url, p.github_url,
    p.video_url, p.institution_type, p.current_course,
    p.desired_opportunity_types, p.interest_areas, p.available_shifts,
    p.accepts_remote, p.created_at, p.updated_at
  FROM profiles p
  WHERE p.status = 'PUBLISHED'
  ORDER BY p.updated_at DESC;
$$;
