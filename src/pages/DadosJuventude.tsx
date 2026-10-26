import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { QuestionChartGrid } from '@/components/survey/SurveyCharts';
import { formatDateTime, type PublicDashboard, type QuestionStats } from '@/lib/survey';
import { BarChart3, Loader2, ShieldCheck } from 'lucide-react';

// Agrupa as perguntas públicas em seções; perguntas novas caem em "Outros indicadores"
const SECTIONS = [
  { title: 'Quem respondeu', keys: ['idade', 'moradia', 'raca', 'religiao', 'pcd'] },
  { title: 'Estudo, trabalho e renda', keys: ['estudo', 'trabalho', 'renda'] },
  { title: 'Conectividade e informação', keys: ['internet', 'fonte_informacao'] },
  { title: 'O que a juventude pensa', keys: ['temas_urgentes', 'avaliacao_politicas'] },
];

export default function DadosJuventude() {
  const [dashboard, setDashboard] = useState<PublicDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const { data } = await supabase.rpc('get_public_survey_dashboard');
      setDashboard((data as unknown as PublicDashboard) ?? null);
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  const questions = dashboard?.questions ?? [];
  const sectioned = new Set(SECTIONS.flatMap((s) => s.keys));
  const sections = [
    ...SECTIONS.map((s) => ({
      title: s.title,
      items: s.keys.map((k) => questions.find((q) => q.key === k)).filter(Boolean) as QuestionStats[],
    })),
    { title: 'Outros indicadores', items: questions.filter((q) => !sectioned.has(q.key)) },
  ].filter((s) => s.items.length);

  const rating = questions.find((q) => q.kind === 'scale' && q.average !== null);
  const topTheme = questions.find((q) => q.kind === 'multi')?.data.find((d) => d.name !== 'Outras respostas');

  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-bg opacity-5" />
        <div className="container px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-6">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Conhecendo as <span className="gradient-text">Juventudes</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Resultados da pesquisa da Secretaria Municipal de Juventude de Oriximiná sobre quem são os jovens do
              município, o que vivem e o que esperam das políticas públicas.
            </p>
          </div>
        </div>
      </section>

      <div className="container px-4 md:px-6 pb-16 space-y-10">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !dashboard || dashboard.total === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Os resultados da pesquisa ainda não foram publicados.</CardContent></Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Jovens participantes</p>
                  <p className="text-4xl font-bold tabular-nums">{dashboard.total}</p>
                </CardContent>
              </Card>
              {rating && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Nota média às políticas para jovens</p>
                    <p className="text-4xl font-bold tabular-nums">
                      {rating.average!.toLocaleString('pt-BR')}<span className="text-lg text-muted-foreground font-normal"> / 10</span>
                    </p>
                  </CardContent>
                </Card>
              )}
              {topTheme && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Tema mais urgente</p>
                    <p className="text-xl font-bold leading-tight mt-1">{topTheme.name}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl font-bold mb-4">{section.title}</h2>
                <QuestionChartGrid items={section.items} />
              </section>
            ))}

            <div className="flex gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <p>
                Os dados são apresentados apenas de forma agregada, sem identificar participantes. Opções com poucas
                respostas aparecem agrupadas em "Outras respostas".
                {dashboard.last_response_at && <> Última resposta recebida em {formatDateTime(dashboard.last_response_at)}.</>}
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
