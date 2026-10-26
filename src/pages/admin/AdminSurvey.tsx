import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Download, Eye, EyeOff, ExternalLink, FileSpreadsheet, Search, Upload, Users, CalendarClock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionChartGrid } from '@/components/survey/SurveyCharts';
import {
  CHARTABLE_KINDS,
  KIND_LABELS,
  aggregateQuestion,
  answerToText,
  formatDateTime,
  readSurveyFile,
  responsesToCsv,
  type ParsedSheet,
  type SurveyQuestion,
  type SurveyResponse,
} from '@/lib/survey';

const ALL = '__all__';

export default function AdminSurvey() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [q, r] = await Promise.all([
      supabase.from('survey_questions').select('*').order('position'),
      supabase.from('survey_responses').select('id, submitted_at, answers').order('submitted_at', { ascending: false }),
    ]);
    if (q.error || r.error) toast.error('Erro ao carregar a pesquisa');
    setQuestions((q.data as SurveyQuestion[]) || []);
    setResponses((r.data as unknown as SurveyResponse[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Pesquisa Conhecendo as Juventudes</h1>
          <p className="text-muted-foreground">Visão completa das respostas — somente administradores</p>
        </div>
        <Link to="/dados-juventude" target="_blank">
          <Button variant="outline" size="sm" className="gap-2"><ExternalLink className="h-4 w-4" />Ver página pública</Button>
        </Link>
      </div>

      <Tabs defaultValue="painel">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="painel">Painel completo</TabsTrigger>
          <TabsTrigger value="respostas">Respostas ({responses.length})</TabsTrigger>
          <TabsTrigger value="visibilidade">Visibilidade pública</TabsTrigger>
          <TabsTrigger value="importar">Importar planilha</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="mt-6">
          <FullDashboard questions={questions} responses={responses} />
        </TabsContent>
        <TabsContent value="respostas" className="mt-6">
          <ResponsesTable questions={questions} responses={responses} />
        </TabsContent>
        <TabsContent value="visibilidade" className="mt-6">
          <VisibilitySettings questions={questions} onChange={setQuestions} />
        </TabsContent>
        <TabsContent value="importar" className="mt-6">
          <ImportSheet questions={questions} responses={responses} userId={user?.id} onImported={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FullDashboard({ questions, responses }: { questions: SurveyQuestion[]; responses: SurveyResponse[] }) {
  const [filterKey, setFilterKey] = useState(ALL);
  const [filterValue, setFilterValue] = useState(ALL);

  const categoryQuestions = questions.filter((q) => q.kind === 'category');
  const filterQuestion = categoryQuestions.find((q) => q.key === filterKey);
  const filterOptions = filterQuestion ? aggregateQuestion(filterQuestion, responses).data.map((d) => d.name) : [];

  const filtered = useMemo(
    () =>
      filterQuestion && filterValue !== ALL
        ? responses.filter((r) => r.answers[filterQuestion.key] === filterValue)
        : responses,
    [responses, filterQuestion, filterValue],
  );

  const charts = questions.filter((q) => CHARTABLE_KINDS.includes(q.kind)).map((q) => aggregateQuestion(q, filtered));
  const publicKeys = new Set(questions.filter((q) => q.is_public).map((q) => q.key));
  const textQuestions = questions.filter((q) => q.kind === 'text');
  const last = responses[0]?.submitted_at;

  const summary = [
    { label: 'Respostas', value: responses.length, icon: Users },
    { label: 'Última resposta', value: last ? formatDateTime(last) : '—', icon: CalendarClock },
    { label: 'Perguntas públicas', value: `${publicKeys.size} de ${questions.length}`, icon: Globe },
  ];

  if (!responses.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhuma resposta importada ainda. Use a aba <strong>Importar planilha</strong>.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{card.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <span className="text-sm text-muted-foreground">Filtrar respostas por</span>
        <Select value={filterKey} onValueChange={(v) => { setFilterKey(v); setFilterValue(ALL); }}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Sem filtro</SelectItem>
            {categoryQuestions.map((q) => <SelectItem key={q.key} value={q.key}>{q.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {filterQuestion && (
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="sm:w-72"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as respostas</SelectItem>
              {filterOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {filtered.length !== responses.length && (
          <span className="text-sm text-muted-foreground">{filtered.length} de {responses.length} respostas</span>
        )}
      </div>

      <QuestionChartGrid
        items={charts}
        badgeFor={(s) =>
          publicKeys.has(s.key)
            ? <Badge variant="secondary" className="gap-1 shrink-0"><Eye className="h-3 w-3" />Público</Badge>
            : <Badge variant="outline" className="gap-1 shrink-0"><EyeOff className="h-3 w-3" />Só admin</Badge>
        }
      />

      <div>
        <h2 className="font-display text-lg font-semibold mb-1">Respostas abertas</h2>
        <p className="text-sm text-muted-foreground mb-4">Textos livres — nunca aparecem na página pública.</p>
        <Accordion type="multiple" className="rounded-lg border px-4">
          {textQuestions.map((q) => {
            const items = filtered.filter((r) => answerToText(r.answers[q.key]));
            return (
              <AccordionItem key={q.key} value={q.key}>
                <AccordionTrigger className="text-left">
                  <span>{q.label} <span className="text-muted-foreground font-normal">({items.length})</span></span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs text-muted-foreground mb-3">{q.question}</p>
                  <ul className="space-y-2">
                    {items.map((r) => (
                      <li key={r.id ?? r.submitted_at} className="text-sm rounded-md bg-muted/50 px-3 py-2">
                        {answerToText(r.answers[q.key])}
                        <span className="block text-xs text-muted-foreground mt-1">
                          {answerToText(r.answers.nome) || 'Sem nome'} · {answerToText(r.answers.idade)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}

function ResponsesTable({ questions, responses }: { questions: SurveyQuestion[]; responses: SurveyResponse[] }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SurveyResponse | null>(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return responses;
    return responses.filter((r) =>
      Object.values(r.answers).some((v) => answerToText(v).toLowerCase().includes(term)),
    );
  }, [responses, search]);

  const exportCsv = () => {
    const blob = new Blob([responsesToCsv(questions, visible)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesquisa-juventudes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar em qualquer resposta (nome, e-mail, texto...)" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={!visible.length}>
          <Download className="h-4 w-4" />Exportar CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Idade</TableHead>
                <TableHead className="hidden lg:table-cell">Onde mora</TableHead>
                <TableHead className="hidden lg:table-cell">E-mail</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.id ?? r.submitted_at} className="cursor-pointer" onClick={() => setSelected(r)}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(r.submitted_at)}</TableCell>
                  <TableCell className="font-medium">{answerToText(r.answers.nome) || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{answerToText(r.answers.idade)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{answerToText(r.answers.moradia)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{answerToText(r.answers.email_contato)}</TableCell>
                  <TableCell><Button variant="ghost" size="sm">Ver</Button></TableCell>
                </TableRow>
              ))}
              {!visible.length && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma resposta encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected && (answerToText(selected.answers.nome) || 'Resposta sem nome')}</DialogTitle>
          </DialogHeader>
          {selected && (
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-muted-foreground">Data da resposta</dt>
                <dd className="text-sm">{formatDateTime(selected.submitted_at)}</dd>
              </div>
              {questions.filter((q) => q.kind !== 'date').map((q) => (
                <div key={q.key}>
                  <dt className="text-xs text-muted-foreground">{q.question}</dt>
                  <dd className="text-sm">{answerToText(selected.answers[q.key]) || <span className="text-muted-foreground">Sem resposta</span>}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VisibilitySettings({
  questions,
  onChange,
}: {
  questions: SurveyQuestion[];
  onChange: (questions: SurveyQuestion[]) => void;
}) {
  const update = async (key: string, patch: Partial<Pick<SurveyQuestion, 'is_public' | 'label'>>) => {
    const { error } = await supabase
      .from('survey_questions')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (error) {
      toast.error('Erro ao salvar');
      return;
    }
    onChange(questions.map((q) => (q.key === key ? { ...q, ...patch } : q)));
    toast.success('Salvo');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">O que aparece na página pública</CardTitle>
        <CardDescription>
          A página pública mostra só gráficos com totais — nunca respostas individuais. Respostas abertas e dados
          pessoais (nome, e-mail) não podem ser publicados. Opções com menos de 3 respostas aparecem agrupadas em
          "Outras respostas" para que ninguém seja identificado.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título exibido</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="w-28 text-right">Público</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => {
              const chartable = CHARTABLE_KINDS.includes(q.kind);
              return (
                <TableRow key={q.key}>
                  <TableCell>
                    <Input
                      defaultValue={q.label}
                      className="h-8"
                      onBlur={(e) => {
                        const label = e.target.value.trim();
                        if (label && label !== q.label) update(q.key, { label });
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{q.question}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={q.kind === 'personal' ? 'destructive' : 'outline'}>{KIND_LABELS[q.kind]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={q.is_public}
                      disabled={!chartable}
                      onCheckedChange={(checked) => update(q.key, { is_public: checked })}
                      aria-label={`Exibir "${q.label}" na página pública`}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ImportSheet({
  questions,
  responses,
  userId,
  onImported,
}: {
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  userId?: string;
  onImported: () => Promise<void>;
}) {
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [busy, setBusy] = useState(false);

  const existing = useMemo(() => new Set(responses.map((r) => new Date(r.submitted_at).getTime())), [responses]);
  const newCount = parsed ? parsed.responses.filter((r) => !existing.has(new Date(r.submitted_at).getTime())).length : 0;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setParsed(null);
    try {
      setParsed(await readSurveyFile(file, questions));
    } catch {
      toast.error('Não foi possível ler a planilha. Envie o arquivo .xlsx exportado do Google Forms.');
    }
  };

  const runImport = async () => {
    if (!parsed) return;
    setBusy(true);
    if (parsed.newQuestions.length) {
      const { error } = await supabase.from('survey_questions').upsert(parsed.newQuestions);
      if (error) {
        toast.error('Erro ao criar as novas perguntas');
        setBusy(false);
        return;
      }
    }
    for (let i = 0; i < parsed.responses.length; i += 500) {
      const chunk = parsed.responses.slice(i, i + 500).map((r) => ({
        submitted_at: r.submitted_at,
        answers: r.answers as unknown as Json,
        imported_by: userId ?? null,
      }));
      const { error } = await supabase.from('survey_responses').upsert(chunk, { onConflict: 'submitted_at' });
      if (error) {
        toast.error('Erro ao importar as respostas');
        setBusy(false);
        return;
      }
    }
    if (userId) {
      await supabase.from('admin_logs').insert({
        admin_id: userId,
        action: 'survey_imported',
        details: { file: fileName, total: parsed.responses.length, new: newCount },
      });
    }
    toast.success(`${parsed.responses.length} respostas importadas (${newCount} novas)`);
    setParsed(null);
    setFileName('');
    setBusy(false);
    await onImported();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Importar respostas</CardTitle>
        <CardDescription>
          No Google Forms, abra a planilha de respostas e baixe como <strong>.xlsx</strong> (Arquivo → Fazer download).
          Pode enviar a planilha inteira sempre: respostas já importadas são atualizadas, e só as novas são adicionadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:bg-muted/40 transition-colors">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium">{fileName || 'Escolher arquivo .xlsx'}</span>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
          />
        </label>

        {parsed && (
          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
            <p><strong>{parsed.responses.length}</strong> respostas encontradas na planilha</p>
            <p><strong>{newCount}</strong> novas · {parsed.responses.length - newCount} já importadas (serão atualizadas)</p>
            {parsed.skippedRows > 0 && (
              <p className="text-destructive">{parsed.skippedRows} linhas ignoradas por não terem data/hora válida</p>
            )}
            {parsed.newQuestions.length > 0 && (
              <div>
                <p>Colunas novas (entrarão como resposta aberta, fora da página pública):</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {parsed.newQuestions.map((q) => <li key={q.key}>{q.question}</li>)}
                </ul>
              </div>
            )}
            <Button onClick={runImport} disabled={busy || !parsed.responses.length} className="gap-2 mt-2">
              <Upload className="h-4 w-4" />{busy ? 'Importando...' : 'Importar respostas'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
