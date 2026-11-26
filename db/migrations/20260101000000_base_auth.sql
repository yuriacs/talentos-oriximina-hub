-- ============================================================
-- Base do banco do Observatório da Juventude (Postgres puro).
--
-- Substitui o que o Supabase criava automaticamente:
--   * papéis "anon" (visitante) e "authenticated" (logado), usados pelas
--     regras de segurança por linha (RLS) de todas as tabelas;
--   * esquema "auth" com usuários, vínculos de login (Google), sessões e
--     códigos de uso único (confirmar e-mail, redefinir senha);
--   * função auth.uid(), que diz às regras quem está fazendo o pedido.
--
-- A API abre cada pedido numa transação, executa
--   SELECT set_config('app.user_id', '<id do usuário>', true);
--   SET LOCAL ROLE authenticated;   -- ou anon
-- e só então consulta as tabelas. Assim as regras do banco valem sempre,
-- mesmo que haja um erro no código da API.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END $$;

-- O usuário que a API usa para conectar precisa poder "vestir" esses papéis
DO $$
BEGIN
  EXECUTE format('GRANT anon, authenticated TO %I', current_user);
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;

-- Usuários. Senhas em bcrypt (mesmo formato do Supabase, para que as
-- senhas antigas continuem valendo depois da importação).
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  encrypted_password text,
  email_confirmed_at timestamptz,
  raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sign_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON auth.users (lower(email));

-- Vínculo com provedores externos (hoje só Google: provider_id = "sub")
CREATE TABLE IF NOT EXISTS auth.identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_id)
);

-- Sessões de login. Guardamos só o hash do token do cookie.
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON auth.sessions (user_id);

-- Códigos de uso único enviados por e-mail
CREATE TABLE IF NOT EXISTS auth.one_time_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('confirm_email', 'reset_password')),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Quem está fazendo o pedido (definido pela API em cada transação)
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.user_id', true), '')::uuid
$$;

-- Os papéis da API só enxergam a função auth.uid(), nunca as tabelas do auth
REVOKE ALL ON ALL TABLES IN SCHEMA auth FROM anon, authenticated;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;

-- Como no Supabase: as tabelas do esquema public ficam acessíveis aos
-- papéis da API, e o que cada um pode ver é decidido pelas regras RLS.
-- Toda tabela nova precisa de "ENABLE ROW LEVEL SECURITY".
GRANT USAGE ON SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
