
-- 1. Fix companies: restrict public SELECT to approved only
DROP POLICY IF EXISTS "Public can count companies" ON public.companies;
CREATE POLICY "Public can view approved companies"
ON public.companies
FOR SELECT
TO anon, authenticated
USING (status = 'APROVADO');

-- 2. Fix companies: require authentication for INSERT
DROP POLICY IF EXISTS "Public can register company" ON public.companies;
CREATE POLICY "Authenticated users can register company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Create a secure function to get public profile data
-- This respects contact_visibility settings per LGPD
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(
  _profile_id uuid,
  _requesting_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  profile_record profiles%ROWTYPE;
  is_owner boolean;
  is_admin_user boolean;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = _profile_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  is_owner := (_requesting_user_id IS NOT NULL AND profile_record.user_id = _requesting_user_id);
  is_admin_user := (_requesting_user_id IS NOT NULL AND has_role(_requesting_user_id, 'admin'));
  
  -- Base public data (always visible for published profiles)
  result := jsonb_build_object(
    'id', profile_record.id,
    'full_name', profile_record.full_name,
    'photo', profile_record.photo,
    'bio', profile_record.bio,
    'city', profile_record.city,
    'area', profile_record.area,
    'professional_objective', profile_record.professional_objective,
    'status', profile_record.status,
    'is_verified', profile_record.is_verified,
    'profile_completion', profile_record.profile_completion,
    'education_level', profile_record.education_level,
    'created_at', profile_record.created_at,
    'updated_at', profile_record.updated_at
  );
  
  -- Owner or admin sees everything
  IF is_owner OR is_admin_user THEN
    result := result || jsonb_build_object(
      'user_id', profile_record.user_id,
      'whatsapp', profile_record.whatsapp,
      'gender', profile_record.gender,
      'race_color', profile_record.race_color,
      'age_range', profile_record.age_range,
      'is_pcd', profile_record.is_pcd,
      'disability_type', profile_record.disability_type,
      'accessibility_needs', profile_record.accessibility_needs,
      'employment_status', profile_record.employment_status,
      'salary_range', profile_record.salary_range,
      'contact_visibility', profile_record.contact_visibility,
      'has_work_experience', profile_record.has_work_experience,
      'experience_time', profile_record.experience_time,
      'desired_opportunity_types', profile_record.desired_opportunity_types,
      'interest_areas', profile_record.interest_areas,
      'available_shifts', profile_record.available_shifts,
      'desired_hours', profile_record.desired_hours,
      'can_work_onsite', profile_record.can_work_onsite,
      'accepts_remote', profile_record.accepts_remote,
      'can_travel', profile_record.can_travel,
      'has_transport', profile_record.has_transport,
      'social_programs_interest', profile_record.social_programs_interest,
      'has_computer', profile_record.has_computer,
      'internet_access', profile_record.internet_access,
      'digital_skill_level', profile_record.digital_skill_level,
      'portfolio_url', profile_record.portfolio_url,
      'linkedin_url', profile_record.linkedin_url,
      'github_url', profile_record.github_url,
      'video_url', profile_record.video_url,
      'institution_type', profile_record.institution_type,
      'current_course', profile_record.current_course
    );
    RETURN result;
  END IF;
  
  -- Public professional data (non-sensitive)
  result := result || jsonb_build_object(
    'portfolio_url', profile_record.portfolio_url,
    'linkedin_url', profile_record.linkedin_url,
    'github_url', profile_record.github_url,
    'video_url', profile_record.video_url,
    'desired_opportunity_types', profile_record.desired_opportunity_types,
    'interest_areas', profile_record.interest_areas,
    'available_shifts', profile_record.available_shifts,
    'accepts_remote', profile_record.accepts_remote,
    'institution_type', profile_record.institution_type,
    'current_course', profile_record.current_course
  );
  
  -- Contact data based on visibility settings
  IF profile_record.contact_visibility = 'ALL' THEN
    result := result || jsonb_build_object(
      'whatsapp', profile_record.whatsapp
    );
  ELSIF profile_record.contact_visibility = 'WHATSAPP_LOGGED' AND _requesting_user_id IS NOT NULL THEN
    result := result || jsonb_build_object(
      'whatsapp', profile_record.whatsapp
    );
  ELSIF profile_record.contact_visibility = 'EMAIL_LOGGED' AND _requesting_user_id IS NOT NULL THEN
    result := result || jsonb_build_object(
      'whatsapp', NULL
    );
  ELSE
    result := result || jsonb_build_object(
      'whatsapp', NULL
    );
  END IF;
  
  RETURN result;
END;
$$;
