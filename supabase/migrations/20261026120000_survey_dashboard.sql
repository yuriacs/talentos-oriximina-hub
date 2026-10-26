-- ============================================
-- Pesquisa "SEMJU: Conhecendo as Juventudes"
-- Respostas importadas da planilha do Google Forms.
-- Admins veem tudo; o público só vê agregados das
-- perguntas marcadas como públicas (via RPC).
-- ============================================

CREATE TABLE public.survey_questions (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  question TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  -- category: escolha única | multi: múltipla escolha | scale: nota numérica
  -- text: resposta aberta | personal: dado pessoal (nome, e-mail) | date: carimbo
  kind TEXT NOT NULL CHECK (kind IN ('category', 'multi', 'scale', 'text', 'personal', 'date')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  options TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Respostas abertas e dados pessoais nunca podem ser publicados
  CONSTRAINT survey_questions_public_kind CHECK (NOT is_public OR kind IN ('category', 'multi', 'scale'))
);
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Carimbo de data/hora do formulário; usado para não duplicar ao reimportar
  submitted_at TIMESTAMPTZ NOT NULL UNIQUE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  imported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage survey questions" ON public.survey_questions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage survey responses" ON public.survey_responses
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================
-- Perguntas da planilha atual
-- ============================================
INSERT INTO public.survey_questions (key, label, question, position, kind, is_public, options) VALUES
  ('carimbo', 'Data da resposta', 'Carimbo de data/hora', 0, 'date', false, NULL),
  ('nome', 'Nome', 'Qual seu nome?', 1, 'personal', false, NULL),
  ('idade', 'Faixa etária', 'E sua idade?', 2, 'category', true,
    ARRAY['10 a 14 anos', '15 a 19 anos', '20 a 24 anos', '25 a 29 anos']),
  ('moradia', 'Onde mora', 'Onde você mora?', 3, 'category', true,
    ARRAY['Zona urbana (cidade, bairro urbano)', 'Zona rural (campo, áreas agrícolas ou isoladas)', 'Comunidade quilombola', 'Comunidade ribeirinha', 'Comunidade indígena']),
  ('raca', 'Cor ou raça', 'Como você se autodeclara em relação a sua cor ou raça?', 4, 'category', true,
    ARRAY['Parda', 'Preta', 'Branca', 'Indígena', 'Amarela']),
  ('religiao', 'Religião', 'Como você se identifica em relação a religião?', 5, 'category', true,
    ARRAY['Evangélica', 'Católica', 'Espírita', 'Umbanda/ Candomblé', 'Outras Religiosidades', 'Sem religião', 'Não sei/ Não opinar']),
  ('estudo', 'Estudo', 'Está estudando?', 6, 'category', true,
    ARRAY['Ensino Fundamental', 'Ensino Médio', 'Graduação', 'Pós graduação', 'Parei, mas quero voltar']),
  ('trabalho', 'Trabalho', 'Está trabalhando?', 7, 'category', true,
    ARRAY['Sim, com carteira assinada', 'Sim, informal/autônomo', 'Sim, em atividades da comunidade (pesca, roça, etc.)', 'Bolsista', 'Não, mas quero trabalhar', 'Não trabalho']),
  ('renda', 'Renda familiar', 'Qual sua renda familiar?', 8, 'category', true,
    ARRAY['Menos de 01 salário mínimo', '01 salário mínimo', 'Mais de 01 salário mínimo', 'Mais de 02 salários mínimos']),
  ('pcd', 'Pessoa com deficiência', 'Você é uma Pessoa com Deficiência? Se sim, qual?', 9, 'category', true,
    ARRAY['Não Possuo', 'Física/Motora', 'Visual', 'Auditiva', 'Intelectual']),
  ('internet', 'Acesso à internet', 'Você tem acesso à internet?', 10, 'category', true,
    ARRAY['Sim,  com boa qualidade (Wi-fi)', 'Sim, mas com dificuldades (sinal fraco, instável, internet móvel etc.)', 'Não tenho acesso']),
  ('fonte_informacao', 'Principal fonte de informação', 'Qual a sua principal fonte de informação?', 11, 'category', true,
    ARRAY['Redes Sociais', 'Sites de Notícias', 'Sites específicos', 'Televisão', 'Rádio']),
  ('hobbies', 'Horas vagas', 'O que você gosta de fazer nas horas vagas? (hobby, lazer)', 12, 'text', false, NULL),
  ('temas_urgentes', 'Temas mais urgentes', 'Na sua opinião, quais os 3 temas mais urgentes para a juventude?', 13, 'multi', true,
    ARRAY['Saúde Mental e Apoio Psicossocial', 'Prevenção à Violência e Promoção da Vida Segura', 'Acesso à Cultura, Memória e Expressão', 'Preservação Ambiental e Sustentabilidade dos Territórios', 'Sexualidade, Afetos e Relacionamentos Saudáveis', 'Prevenção às Drogas e ao Tráfico', 'Emprego, Renda e Oportunidades', 'Acesso à Educação de Qualidade', 'Permanência Escolar e Acesso à Educação que Faça Sentido']),
  ('maior_dificuldade', 'Maior dificuldade', 'Qual a maior dificuldade enfrentada pelos jovens de sua comunidade ou bairro?', 14, 'text', false, NULL),
  ('conhece_projeto', 'Conhece projeto para juventude', 'Você conhece algum projeto voltado para juventude no seu bairro ou comunidade? Se sim, qual?', 15, 'text', false, NULL),
  ('expressoes_culturais', 'Expressões culturais', 'Quais expressões culturais do seu bairro ou comunidade, você gostaria de ver valorizadas e apoiadas pelo município?', 16, 'text', false, NULL),
  ('avaliacao_politicas', 'Avaliação das políticas municipais (0 a 10)', 'De 0 a 10 como você avalia as políticas atuais do município para jovens', 17, 'scale', true, NULL),
  ('sugestao_plano', 'Sugestão para o plano municipal', 'Deixe uma sugestão para o plano municipal de juventude:', 18, 'text', false, NULL),
  ('secretario_por_um_dia', 'Secretário(a) por um dia', 'Se fosse o(a) secretário(a) da juventude por um dia, o que você faria para melhorar a vida dos jovens?', 19, 'text', false, NULL),
  ('email_contato', 'E-mail para contato', 'Você gostaria de ser informado sobre futuras pesquisas e projetos para jovens? Se sim, coloque seu e-mail.', 20, 'personal', false, NULL);

-- ============================================
-- Dados públicos: apenas contagens agregadas das
-- perguntas públicas. Categorias com menos de 3
-- respostas são agrupadas em "Outras respostas"
-- para evitar identificar pessoas.
-- ============================================
CREATE OR REPLACE FUNCTION public.get_public_survey_dashboard()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  min_count CONSTANT INTEGER := 3;
  q RECORD;
  data JSONB;
  answered INTEGER;
  average NUMERIC;
  result JSONB := '[]'::jsonb;
BEGIN
  FOR q IN
    SELECT key, label, kind FROM survey_questions
    WHERE is_public AND kind IN ('category', 'multi', 'scale')
    ORDER BY position
  LOOP
    average := NULL;

    IF q.kind = 'multi' THEN
      SELECT count(*) INTO answered FROM survey_responses
      WHERE jsonb_typeof(answers -> q.key) = 'array' AND jsonb_array_length(answers -> q.key) > 0;

      WITH raw AS (
        SELECT v AS name, count(*) AS value
        FROM survey_responses, jsonb_array_elements_text(
          CASE WHEN jsonb_typeof(answers -> q.key) = 'array' THEN answers -> q.key ELSE '[]'::jsonb END
        ) AS v
        WHERE v <> ''
        GROUP BY v
      ), grouped AS (
        SELECT CASE WHEN value < min_count THEN 'Outras respostas' ELSE name END AS name, sum(value) AS value
        FROM raw GROUP BY 1
      )
      SELECT coalesce(jsonb_agg(jsonb_build_object('name', name, 'value', value) ORDER BY value DESC), '[]'::jsonb)
      INTO data FROM grouped;

    ELSIF q.kind = 'scale' THEN
      SELECT count(*), round(avg((answers ->> q.key)::numeric), 1) INTO answered, average
      FROM survey_responses
      WHERE jsonb_typeof(answers -> q.key) = 'number';

      SELECT coalesce(jsonb_agg(jsonb_build_object('name', name, 'value', value) ORDER BY name::numeric), '[]'::jsonb)
      INTO data
      FROM (
        SELECT answers ->> q.key AS name, count(*) AS value
        FROM survey_responses
        WHERE jsonb_typeof(answers -> q.key) = 'number'
        GROUP BY 1
      ) s;

    ELSE
      SELECT count(*) INTO answered FROM survey_responses
      WHERE coalesce(answers ->> q.key, '') <> '';

      WITH raw AS (
        SELECT answers ->> q.key AS name, count(*) AS value
        FROM survey_responses
        WHERE coalesce(answers ->> q.key, '') <> ''
        GROUP BY 1
      ), grouped AS (
        SELECT CASE WHEN value < min_count THEN 'Outras respostas' ELSE name END AS name, sum(value) AS value
        FROM raw GROUP BY 1
      )
      SELECT coalesce(jsonb_agg(jsonb_build_object('name', name, 'value', value) ORDER BY value DESC), '[]'::jsonb)
      INTO data FROM grouped;
    END IF;

    result := result || jsonb_build_array(jsonb_build_object(
      'key', q.key,
      'label', q.label,
      'kind', q.kind,
      'answered', answered,
      'average', average,
      'data', data
    ));
  END LOOP;

  RETURN jsonb_build_object(
    'total', (SELECT count(*) FROM survey_responses),
    'last_response_at', (SELECT max(submitted_at) FROM survey_responses),
    'questions', result
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_survey_dashboard() TO anon, authenticated;

-- Faz a API do Supabase enxergar as novas tabelas imediatamente
NOTIFY pgrst, 'reload schema';
