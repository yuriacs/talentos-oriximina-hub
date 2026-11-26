
-- Remove the old public policy that exposes all columns to anon
DROP POLICY IF EXISTS "Public can view approved companies" ON public.companies;

-- Authenticated users can view approved companies (all columns)
CREATE POLICY "Authenticated can view approved companies"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (status = 'APROVADA');

-- Create a secure function that only returns non-sensitive fields for public listing
CREATE OR REPLACE FUNCTION public.get_public_companies()
RETURNS TABLE(
  id uuid,
  nome_fantasia text,
  setor_atividade text,
  porte text,
  endereco_cidade text,
  logo_url text,
  site_url text,
  instagram_url text,
  linkedin_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id, c.nome_fantasia, c.setor_atividade, c.porte,
    c.endereco_cidade, c.logo_url, c.site_url,
    c.instagram_url, c.linkedin_url
  FROM companies c
  WHERE c.status = 'APROVADA'
  ORDER BY c.nome_fantasia;
$$;
