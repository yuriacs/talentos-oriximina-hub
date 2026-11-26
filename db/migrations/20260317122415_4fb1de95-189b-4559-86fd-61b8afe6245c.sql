
-- Add new columns to profiles table for expanded registration
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_range text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS race_color text,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS institution_type text,
  ADD COLUMN IF NOT EXISTS current_course text,
  ADD COLUMN IF NOT EXISTS employment_status text,
  ADD COLUMN IF NOT EXISTS has_work_experience boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS experience_time text,
  ADD COLUMN IF NOT EXISTS desired_opportunity_types text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interest_areas text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS salary_range text,
  ADD COLUMN IF NOT EXISTS available_shifts text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS desired_hours text,
  ADD COLUMN IF NOT EXISTS can_work_onsite boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS accepts_remote boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_travel boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_transport boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pcd boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS disability_type text,
  ADD COLUMN IF NOT EXISTS accessibility_needs text,
  ADD COLUMN IF NOT EXISTS social_programs_interest boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_computer boolean,
  ADD COLUMN IF NOT EXISTS internet_access text,
  ADD COLUMN IF NOT EXISTS digital_skill_level text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS video_url text;

-- Create soft_skills table
CREATE TABLE IF NOT EXISTS public.soft_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  rating integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.soft_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View soft_skills" ON public.soft_skills
  FOR SELECT TO public
  USING (
    (get_profile_user_id(profile_id) = auth.uid())
    OR is_admin()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = soft_skills.profile_id AND profiles.status = 'PUBLISHED')
  );

CREATE POLICY "Manage own soft_skills" ON public.soft_skills
  FOR INSERT TO authenticated
  WITH CHECK (get_profile_user_id(profile_id) = auth.uid());

CREATE POLICY "Update own soft_skills" ON public.soft_skills
  FOR UPDATE TO authenticated
  USING (get_profile_user_id(profile_id) = auth.uid());

CREATE POLICY "Delete own soft_skills" ON public.soft_skills
  FOR DELETE TO authenticated
  USING (get_profile_user_id(profile_id) = auth.uid());
