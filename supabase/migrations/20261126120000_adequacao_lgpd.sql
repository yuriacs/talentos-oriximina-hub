-- ============================================================
-- Adequação à LGPD (Lei nº 13.709/2018)
-- Aplicar no SQL Editor do Supabase (ou via `supabase db push`).
-- Todas as mudanças são aditivas ou corretivas: nenhum dado existente é apagado.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CORREÇÃO DE SEGURANÇA: get_safe_profile_data
-- Antes, a função confiava no parâmetro _requesting_user_id enviado
-- pelo navegador. Qualquer pessoa podia informar o UUID de um admin e
-- receber todos os dados do perfil (raça/cor, deficiência, renda...).
-- Também devolvia perfis em rascunho ou bloqueados.
-- Agora a identidade vem sempre de auth.uid(); o parâmetro é ignorado
-- e mantido só para não quebrar chamadas antigas.
-- ------------------------------------------------------------
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
  pr profiles%ROWTYPE;
  caller uuid := auth.uid();
  is_owner boolean;
  is_admin_user boolean;
  is_approved_company boolean;
BEGIN
  SELECT * INTO pr FROM profiles WHERE id = _profile_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  is_owner := caller IS NOT NULL AND pr.user_id = caller;
  is_admin_user := caller IS NOT NULL AND has_role(caller, 'admin');

  -- Rascunhos e perfis bloqueados só existem para o dono e para admins
  IF pr.status <> 'PUBLISHED' AND NOT (is_owner OR is_admin_user) THEN
    RETURN NULL;
  END IF;

  result := jsonb_build_object(
    'id', pr.id,
    'full_name', pr.full_name,
    'photo', pr.photo,
    'bio', pr.bio,
    'city', pr.city,
    'area', pr.area,
    'professional_objective', pr.professional_objective,
    'status', pr.status,
    'is_verified', pr.is_verified,
    'profile_completion', pr.profile_completion,
    'education_level', pr.education_level,
    'created_at', pr.created_at,
    'updated_at', pr.updated_at,
    'portfolio_url', pr.portfolio_url,
    'linkedin_url', pr.linkedin_url,
    'github_url', pr.github_url,
    'video_url', pr.video_url,
    'desired_opportunity_types', pr.desired_opportunity_types,
    'interest_areas', pr.interest_areas,
    'available_shifts', pr.available_shifts,
    'accepts_remote', pr.accepts_remote,
    'institution_type', pr.institution_type,
    'current_course', pr.current_course
  );

  -- Dono ou admin vê tudo
  IF is_owner OR is_admin_user THEN
    RETURN result || jsonb_build_object(
      'user_id', pr.user_id,
      'whatsapp', pr.whatsapp,
      'gender', pr.gender,
      'race_color', pr.race_color,
      'age_range', pr.age_range,
      'is_pcd', pr.is_pcd,
      'disability_type', pr.disability_type,
      'accessibility_needs', pr.accessibility_needs,
      'employment_status', pr.employment_status,
      'salary_range', pr.salary_range,
      'contact_visibility', pr.contact_visibility,
      'has_work_experience', pr.has_work_experience,
      'experience_time', pr.experience_time,
      'desired_hours', pr.desired_hours,
      'can_work_onsite', pr.can_work_onsite,
      'can_travel', pr.can_travel,
      'has_transport', pr.has_transport,
      'social_programs_interest', pr.social_programs_interest,
      'has_computer', pr.has_computer,
      'internet_access', pr.internet_access,
      'digital_skill_level', pr.digital_skill_level,
      'sensitive_data_consent_at', pr.sensitive_data_consent_at
    );
  END IF;

  -- WhatsApp conforme a escolha do jovem.
  -- "WHATSAPP_LOGGED" significa empresas aprovadas (como diz a tela de edição),
  -- e não qualquer pessoa com conta.
  is_approved_company := caller IS NOT NULL AND EXISTS (
    SELECT 1 FROM companies c WHERE c.user_id = caller AND c.status = 'APROVADA'
  );

  IF pr.contact_visibility = 'ALL'
     OR (pr.contact_visibility = 'WHATSAPP_LOGGED' AND is_approved_company) THEN
    result := result || jsonb_build_object('whatsapp', pr.whatsapp);
  ELSE
    result := result || jsonb_build_object('whatsapp', NULL);
  END IF;

  RETURN result;
END;
$$;

-- ------------------------------------------------------------
-- 2. Perfil apagado junto com a conta
-- A FK profiles.user_id -> auth.users foi removida em 17/03/2026.
-- Sem ela, excluir um usuário deixava o perfil órfão no banco.
-- NOT VALID: vale para exclusões futuras sem travar por eventuais
-- órfãos antigos (veja a consulta de conferência no fim do arquivo).
-- ------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- ------------------------------------------------------------
-- 3. Logs de auditoria não somem quando um admin sai
-- ------------------------------------------------------------
ALTER TABLE public.admin_logs ALTER COLUMN admin_id DROP NOT NULL;
ALTER TABLE public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey;
ALTER TABLE public.admin_logs
  ADD CONSTRAINT admin_logs_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 4. Registro de consentimentos (art. 8º, §2º: o controlador
-- precisa provar que o consentimento foi dado)
-- Linhas nunca são editadas nem apagadas pelo usuário; uma revogação
-- é uma nova linha com granted = false.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document text NOT NULL CHECK (document IN ('termos_privacidade', 'dados_sensiveis')),
  version text NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS consent_records_user_idx ON public.consent_records (user_id, document, created_at DESC);
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own consents" ON public.consent_records;
CREATE POLICY "View own consents" ON public.consent_records
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Record own consent" ON public.consent_records;
CREATE POLICY "Record own consent" ON public.consent_records
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND document = 'termos_privacidade');
-- Consentimento de dados sensíveis só entra pela função set_sensitive_data_consent

-- Aceite feito no formulário de cadastro (vem nos metadados do signUp)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  IF NEW.raw_user_meta_data ? 'terms_version' THEN
    INSERT INTO public.consent_records (user_id, document, version, granted)
    VALUES (NEW.id, 'termos_privacidade', NEW.raw_user_meta_data->>'terms_version', true);
  END IF;

  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 5. Dados sensíveis (art. 5º, II e art. 11): raça/cor e deficiência
-- só podem ser gravados com consentimento específico e destacado.
-- Dados já existentes não são apagados; o usuário é convidado a
-- confirmar ou apagar na tela "Meu perfil".
-- ------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sensitive_data_consent_at timestamptz;

CREATE OR REPLACE FUNCTION public.enforce_sensitive_data_consent()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- A data de consentimento só muda pela função set_sensitive_data_consent
  IF current_setting('app.sensitive_consent_rpc', true) IS DISTINCT FROM 'on' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.sensitive_data_consent_at := NULL;
    ELSE
      NEW.sensitive_data_consent_at := OLD.sensitive_data_consent_at;
    END IF;
  END IF;

  IF NEW.sensitive_data_consent_at IS NULL THEN
    IF (TG_OP = 'INSERT' AND (NEW.race_color IS NOT NULL OR NEW.is_pcd IS TRUE
          OR NEW.disability_type IS NOT NULL OR NEW.accessibility_needs IS NOT NULL))
       OR (TG_OP = 'UPDATE' AND (
          (NEW.race_color IS DISTINCT FROM OLD.race_color AND NEW.race_color IS NOT NULL)
          OR (NEW.is_pcd IS DISTINCT FROM OLD.is_pcd AND NEW.is_pcd IS TRUE)
          OR (NEW.disability_type IS DISTINCT FROM OLD.disability_type AND NEW.disability_type IS NOT NULL)
          OR (NEW.accessibility_needs IS DISTINCT FROM OLD.accessibility_needs AND NEW.accessibility_needs IS NOT NULL)))
    THEN
      RAISE EXCEPTION 'Consentimento para dados sensíveis não registrado'
        USING ERRCODE = 'P0001', HINT = 'sensitive_consent_required';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_sensitive_data_consent ON public.profiles;
CREATE TRIGGER enforce_sensitive_data_consent
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_sensitive_data_consent();

-- Dar ou revogar o consentimento. Revogar apaga os dados sensíveis.
CREATE OR REPLACE FUNCTION public.set_sensitive_data_consent(_granted boolean, _version text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  PERFORM set_config('app.sensitive_consent_rpc', 'on', true);

  IF _granted THEN
    UPDATE profiles SET sensitive_data_consent_at = now() WHERE user_id = caller;
  ELSE
    UPDATE profiles
      SET sensitive_data_consent_at = NULL,
          race_color = NULL,
          is_pcd = NULL,
          disability_type = NULL,
          accessibility_needs = NULL
      WHERE user_id = caller;
  END IF;

  PERFORM set_config('app.sensitive_consent_rpc', 'off', true);

  INSERT INTO consent_records (user_id, document, version, granted)
  VALUES (caller, 'dados_sensiveis', coalesce(_version, 'sem-versao'), _granted);
END;
$$;
REVOKE ALL ON FUNCTION public.set_sensitive_data_consent(boolean, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_sensitive_data_consent(boolean, text) TO authenticated;

-- ------------------------------------------------------------
-- 6. O próprio jovem publica e despublica o perfil
-- A política de UPDATE impede o usuário de mudar o status, então o
-- botão "Publicar" da tela falhava. Despublicar é parte do direito
-- de revogar o consentimento para exibição pública.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_my_profile_published(_publish boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  UPDATE profiles
    SET status = CASE WHEN _publish THEN 'PUBLISHED'::profile_status ELSE 'DRAFT'::profile_status END
    WHERE user_id = auth.uid() AND status <> 'BLOCKED';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil não encontrado ou bloqueado pela administração';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.set_my_profile_published(boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_my_profile_published(boolean) TO authenticated;

-- ------------------------------------------------------------
-- 7. Exclusão da própria conta (art. 18, VI)
-- Apaga empresa, perfil (com formação, habilidades, projetos,
-- mensagens e denúncias em cascata), consentimentos, papéis e o
-- usuário de autenticação. Fotos e logos são removidos pelo site
-- antes de chamar esta função (o Supabase não permite apagar
-- arquivos do Storage por SQL).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  DELETE FROM companies WHERE user_id = caller;
  DELETE FROM profiles WHERE user_id = caller;
  DELETE FROM auth.users WHERE id = caller;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_my_account() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

-- ------------------------------------------------------------
-- 8. Pesquisa: remover nomes de respondentes já importados
-- (minimização, art. 6º, III). O e-mail de quem pediu para ser
-- avisado sobre novas pesquisas é mantido.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.anonymize_survey_names()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores';
  END IF;

  UPDATE survey_responses SET answers = answers - 'nome' WHERE answers ? 'nome';
  GET DIAGNOSTICS affected = ROW_COUNT;

  INSERT INTO admin_logs (admin_id, action, details)
  VALUES (auth.uid(), 'survey_names_removed', jsonb_build_object('responses', affected));

  RETURN affected;
END;
$$;
REVOKE ALL ON FUNCTION public.anonymize_survey_names() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.anonymize_survey_names() TO authenticated;

NOTIFY pgrst, 'reload schema';

-- ------------------------------------------------------------
-- Conferência (rode à parte, só leitura): perfis sem usuário.
-- SELECT p.id, p.full_name, p.created_at FROM public.profiles p
--   LEFT JOIN auth.users u ON u.id = p.user_id WHERE u.id IS NULL;
-- ------------------------------------------------------------
