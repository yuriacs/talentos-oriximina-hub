
-- Enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.profile_status AS ENUM ('DRAFT', 'PUBLISHED', 'BLOCKED');
CREATE TYPE public.skill_level AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO');
CREATE TYPE public.skill_category AS ENUM ('HARD', 'SOFT');
CREATE TYPE public.availability_type AS ENUM ('ESTAGIO', 'FREELANCE', 'VOLUNTARIO', 'PROJETO', 'MENTORIA');
CREATE TYPE public.contact_visibility AS ENUM ('INTERNAL_ONLY', 'EMAIL_LOGGED', 'WHATSAPP_LOGGED', 'ALL', 'HIDDEN');
CREATE TYPE public.language_level AS ENUM ('BASICO', 'INTERMEDIARIO', 'AVANCADO', 'FLUENTE', 'NATIVO');
CREATE TYPE public.report_status AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  photo TEXT,
  bio TEXT DEFAULT '',
  city TEXT DEFAULT 'Oriximiná',
  professional_objective TEXT DEFAULT '',
  status profile_status NOT NULL DEFAULT 'DRAFT',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  profile_completion INTEGER NOT NULL DEFAULT 0,
  contact_visibility contact_visibility NOT NULL DEFAULT 'INTERNAL_ONLY',
  whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Education
CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level TEXT NOT NULL,
  course TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INTEGER NOT NULL,
  current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category skill_category NOT NULL,
  level skill_level NOT NULL DEFAULT 'INICIANTE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Experiences
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  place TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN NOT NULL DEFAULT false,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  problem TEXT DEFAULT '',
  solution TEXT DEFAULT '',
  technologies TEXT[] DEFAULT '{}',
  results TEXT,
  links TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Certifications
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course TEXT NOT NULL,
  institution TEXT NOT NULL,
  hours INTEGER NOT NULL DEFAULT 0,
  attachment_url TEXT,
  completed_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Languages
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  level language_level NOT NULL DEFAULT 'BASICO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Availability
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type availability_type NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT DEFAULT '',
  status report_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Admin logs
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS (security definer)
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.get_profile_user_id(_profile_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.profiles WHERE id = _profile_id
$$;

CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin());

-- profiles
CREATE POLICY "Anyone can view published profiles" ON public.profiles FOR SELECT USING (status = 'PUBLISHED' OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Authenticated users can create profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- education
CREATE POLICY "View education" ON public.education FOR SELECT USING (
  public.get_profile_user_id(profile_id) = auth.uid() OR public.is_admin() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND status = 'PUBLISHED')
);
CREATE POLICY "Manage own education" ON public.education FOR INSERT TO authenticated WITH CHECK (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Update own education" ON public.education FOR UPDATE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Delete own education" ON public.education FOR DELETE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());

-- skills
CREATE POLICY "View skills" ON public.skills FOR SELECT USING (
  public.get_profile_user_id(profile_id) = auth.uid() OR public.is_admin() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND status = 'PUBLISHED')
);
CREATE POLICY "Manage own skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Update own skills" ON public.skills FOR UPDATE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Delete own skills" ON public.skills FOR DELETE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());

-- experiences
CREATE POLICY "View experiences" ON public.experiences FOR SELECT USING (
  public.get_profile_user_id(profile_id) = auth.uid() OR public.is_admin() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND status = 'PUBLISHED')
);
CREATE POLICY "Manage own experiences" ON public.experiences FOR INSERT TO authenticated WITH CHECK (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Update own experiences" ON public.experiences FOR UPDATE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Delete own experiences" ON public.experiences FOR DELETE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());

-- projects
CREATE POLICY "View projects" ON public.projects FOR SELECT USING (
  public.get_profile_user_id(profile_id) = auth.uid() OR public.is_admin() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND status = 'PUBLISHED')
);
CREATE POLICY "Manage own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Update own projects" ON public.projects FOR UPDATE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Delete own projects" ON public.projects FOR DELETE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());

-- certifications
CREATE POLICY "View certifications" ON public.certifications FOR SELECT USING (
  public.get_profile_user_id(profile_id) = auth.uid() OR public.is_admin() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND status = 'PUBLISHED')
);
CREATE POLICY "Manage own certifications" ON public.certifications FOR INSERT TO authenticated WITH CHECK (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Update own certifications" ON public.certifications FOR UPDATE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Delete own certifications" ON public.certifications FOR DELETE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());

-- languages
CREATE POLICY "View languages" ON public.languages FOR SELECT USING (
  public.get_profile_user_id(profile_id) = auth.uid() OR public.is_admin() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND status = 'PUBLISHED')
);
CREATE POLICY "Manage own languages" ON public.languages FOR INSERT TO authenticated WITH CHECK (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Update own languages" ON public.languages FOR UPDATE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Delete own languages" ON public.languages FOR DELETE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());

-- availability
CREATE POLICY "View availability" ON public.availability FOR SELECT USING (
  public.get_profile_user_id(profile_id) = auth.uid() OR public.is_admin() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND status = 'PUBLISHED')
);
CREATE POLICY "Manage own availability" ON public.availability FOR INSERT TO authenticated WITH CHECK (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Update own availability" ON public.availability FOR UPDATE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());
CREATE POLICY "Delete own availability" ON public.availability FOR DELETE TO authenticated USING (public.get_profile_user_id(profile_id) = auth.uid());

-- messages
CREATE POLICY "View own messages" ON public.messages FOR SELECT TO authenticated USING (
  sender_id = public.get_my_profile_id() OR receiver_id = public.get_my_profile_id() OR public.is_admin()
);
CREATE POLICY "Send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = public.get_my_profile_id());
CREATE POLICY "Mark own messages as read" ON public.messages FOR UPDATE TO authenticated USING (receiver_id = public.get_my_profile_id());

-- reports
CREATE POLICY "Admins can view reports" ON public.reports FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = public.get_my_profile_id());
CREATE POLICY "Admins can manage reports" ON public.reports FOR UPDATE TO authenticated USING (public.is_admin());

-- admin_logs
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can create logs" ON public.admin_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  -- Assign role
  IF NEW.email = 'admin@btjo.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
