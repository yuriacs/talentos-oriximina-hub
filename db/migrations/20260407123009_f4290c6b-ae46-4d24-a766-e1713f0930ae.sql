-- Add logo_url column to companies
ALTER TABLE public.companies ADD COLUMN logo_url text;

-- O bucket "company-logos" do Supabase foi substituído pela pasta
-- uploads/company-logos no servidor (permissões verificadas pela API).
