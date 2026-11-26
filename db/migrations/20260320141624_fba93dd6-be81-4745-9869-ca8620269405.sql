-- Originalmente criava o bucket "avatars" no Storage do Supabase.
-- Sem Supabase, as fotos ficam no disco do servidor (UPLOADS_DIR) e a
-- permissão de envio é verificada pela API (cada usuário só grava na
-- própria pasta). Nada a fazer no banco.
SELECT 1;
