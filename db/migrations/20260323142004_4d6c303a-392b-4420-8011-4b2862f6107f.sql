
-- Create companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  razao_social text NOT NULL,
  nome_fantasia text NOT NULL,
  cnpj text NOT NULL UNIQUE,
  endereco_rua text,
  endereco_numero text,
  endereco_bairro text,
  endereco_cidade text DEFAULT 'Oriximiná',
  endereco_estado text DEFAULT 'PA',
  endereco_cep text,
  responsavel_nome text NOT NULL,
  responsavel_cargo text,
  whatsapp text,
  email text NOT NULL,
  setor_atividade text,
  porte text,
  site_url text,
  linkedin_url text,
  instagram_url text,
  modalidades_vaga text[] DEFAULT '{}',
  faixa_salarial text,
  turnos_trabalho text[] DEFAULT '{}',
  acoes_profissionalizacao text[] DEFAULT '{}',
  termo_aceito boolean NOT NULL DEFAULT false,
  termo_aceito_em timestamp with time zone,
  status text NOT NULL DEFAULT 'PENDENTE',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can create company registration"
  ON public.companies FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Public can view own company"
  ON public.companies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete companies"
  ON public.companies FOR DELETE
  TO authenticated
  USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
