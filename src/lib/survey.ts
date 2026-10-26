// Pesquisa "SEMJU: Conhecendo as Juventudes" — leitura da planilha do
// Google Forms, normalização das respostas e agregação para os gráficos.

export type QuestionKind = 'category' | 'multi' | 'scale' | 'text' | 'personal' | 'date';

export interface SurveyQuestion {
  key: string;
  label: string;
  question: string;
  position: number;
  kind: QuestionKind;
  is_public: boolean;
  options: string[] | null;
}

export type AnswerValue = string | number | string[] | null;
export type Answers = Record<string, AnswerValue>;

export interface SurveyResponse {
  id?: string;
  submitted_at: string;
  answers: Answers;
}

export interface ChartDatum {
  name: string;
  value: number;
}

export interface QuestionStats {
  key: string;
  label: string;
  kind: QuestionKind;
  answered: number;
  average: number | null;
  data: ChartDatum[];
}

export interface PublicDashboard {
  total: number;
  last_response_at: string | null;
  questions: QuestionStats[];
}

export const CHARTABLE_KINDS: QuestionKind[] = ['category', 'multi', 'scale'];

export const KIND_LABELS: Record<QuestionKind, string> = {
  category: 'Escolha única',
  multi: 'Múltipla escolha',
  scale: 'Nota',
  text: 'Resposta aberta',
  personal: 'Dado pessoal',
  date: 'Data',
};

/** Chave de comparação: sem acentos, caixa, pontuação, espaços e zeros à esquerda. */
export function canon(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\b0+(?=\d)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Remove espaços extras e pontuação final ("Não Possuo." → "Não Possuo"). */
export function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().replace(/[.;,]+$/, '').trim();
}

function matchOption(value: string, options: string[] | null): string {
  const cleaned = cleanText(value);
  if (!options) return cleaned;
  const target = canon(cleaned);
  return options.find((o) => canon(o) === target) ?? cleaned;
}

/**
 * Separa uma resposta de múltipla escolha. As opções podem conter vírgulas
 * ("Emprego, Renda e Oportunidades"), então juntamos pedaços consecutivos
 * até formar uma opção conhecida.
 */
export function splitMulti(value: string, options: string[] | null): string[] {
  const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
  const known = new Map((options ?? []).map((o) => [canon(o), o]));
  const result: string[] = [];
  let i = 0;
  while (i < parts.length) {
    let matched = false;
    for (let j = parts.length; j > i; j--) {
      const option = known.get(canon(parts.slice(i, j).join(', ')));
      if (option) {
        result.push(option);
        i = j;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push(cleanText(parts[i]));
      i++;
    }
  }
  return [...new Set(result)];
}

/** Horário de Oriximiná (UTC−3, sem horário de verão). */
const LOCAL_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Converte o "Carimbo de data/hora" para ISO. A planilha guarda a hora local
 * sem fuso; o leitor de xlsx a entrega como se fosse UTC.
 */
export function parseTimestamp(value: unknown): string | null {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return new Date(value.getTime() + LOCAL_OFFSET_MS).toISOString();
  }
  if (typeof value === 'number') {
    // Número serial do Excel (dias desde 30/12/1899)
    const ms = Math.round((value - 25569) * 86400 * 1000);
    return new Date(ms + LOCAL_OFFSET_MS).toISOString();
  }
  if (typeof value === 'string') {
    const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
      const [, d, mo, y, h = '0', mi = '0', s = '0'] = m;
      const ms = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
      return new Date(ms + LOCAL_OFFSET_MS).toISOString();
    }
  }
  return null;
}

export function normalizeAnswer(raw: unknown, question: SurveyQuestion): AnswerValue {
  if (raw === null || raw === undefined || raw === '') return null;
  switch (question.kind) {
    case 'scale': {
      const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(',', '.'));
      return isNaN(n) ? null : n;
    }
    case 'multi': {
      const list = splitMulti(String(raw), question.options);
      return list.length ? list : null;
    }
    case 'category':
      return matchOption(String(raw), question.options) || null;
    case 'date':
      return parseTimestamp(raw);
    default: {
      const text = String(raw).replace(/\s+/g, ' ').trim();
      return text || null;
    }
  }
}

function slugify(value: string): string {
  return canon(value).slice(0, 40) || 'pergunta';
}

export interface ParsedSheet {
  responses: SurveyResponse[];
  /** Colunas da planilha que ainda não existem em survey_questions. */
  newQuestions: SurveyQuestion[];
  skippedRows: number;
}

/**
 * Lê as linhas da planilha (primeira linha = cabeçalho) e associa cada coluna
 * a uma pergunta pelo texto do cabeçalho.
 */
export function parseSheetRows(rows: unknown[][], questions: SurveyQuestion[]): ParsedSheet {
  const [header = [], ...body] = rows;
  const byText = new Map(questions.map((q) => [canon(q.question), q]));
  const usedKeys = new Set(questions.map((q) => q.key));
  const newQuestions: SurveyQuestion[] = [];
  let nextPosition = Math.max(0, ...questions.map((q) => q.position)) + 1;

  const columns = header.map((cell) => {
    const text = String(cell ?? '').trim();
    if (!text) return null;
    const existing = byText.get(canon(text));
    if (existing) return existing;

    let key = slugify(text);
    for (let n = 2; usedKeys.has(key); n++) key = `${slugify(text)}_${n}`;
    usedKeys.add(key);
    const created: SurveyQuestion = {
      key,
      label: text,
      question: text,
      position: nextPosition++,
      kind: 'text',
      is_public: false,
      options: null,
    };
    newQuestions.push(created);
    byText.set(canon(text), created);
    return created;
  });

  const dateIndex = columns.findIndex((q) => q?.kind === 'date');
  const responses: SurveyResponse[] = [];
  let skippedRows = 0;

  for (const row of body) {
    if (!row || row.every((c) => c === null || c === undefined || c === '')) continue;
    const submittedAt = dateIndex >= 0 ? parseTimestamp(row[dateIndex]) : null;
    if (!submittedAt) {
      skippedRows++;
      continue;
    }
    const answers: Answers = {};
    columns.forEach((q, i) => {
      if (!q || q.kind === 'date') return;
      const value = normalizeAnswer(row[i], q);
      if (value !== null) answers[q.key] = value;
    });
    responses.push({ submitted_at: submittedAt, answers });
  }

  return { responses, newQuestions, skippedRows };
}

/** Lê o arquivo .xlsx enviado pelo admin. */
export async function readSurveyFile(file: File, questions: SurveyQuestion[]): Promise<ParsedSheet> {
  const { default: readXlsxFile } = await import('read-excel-file');
  const rows = await readXlsxFile(file);
  return parseSheetRows(rows as unknown[][], questions);
}

function sortedCounts(counts: Map<string, number>): ChartDatum[] {
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Mesma agregação da RPC pública, mas sem agrupar categorias pequenas. */
export function aggregateQuestion(question: SurveyQuestion, responses: SurveyResponse[]): QuestionStats {
  const counts = new Map<string, number>();
  let answered = 0;
  let sum = 0;

  for (const r of responses) {
    const value = r.answers[question.key];
    if (value === null || value === undefined || value === '') continue;
    if (question.kind === 'multi') {
      const list = Array.isArray(value) ? value : [String(value)];
      if (!list.length) continue;
      answered++;
      list.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
    } else if (question.kind === 'scale') {
      if (typeof value !== 'number') continue;
      answered++;
      sum += value;
      counts.set(String(value), (counts.get(String(value)) ?? 0) + 1);
    } else {
      answered++;
      const name = String(value);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  const data =
    question.kind === 'scale'
      ? [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => +a.name - +b.name)
      : sortedCounts(counts);

  return {
    key: question.key,
    label: question.label,
    kind: question.kind,
    answered,
    average: question.kind === 'scale' && answered ? Math.round((sum / answered) * 10) / 10 : null,
    data,
  };
}

export function answerToText(value: AnswerValue | undefined): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join('; ');
  return String(value);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Belem',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/** Exporta as respostas (todas as colunas) para CSV com separador ";" (Excel pt-BR). */
export function responsesToCsv(questions: SurveyQuestion[], responses: SurveyResponse[]): string {
  const cols = questions.filter((q) => q.kind !== 'date');
  const escape = (v: string) => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const header = ['Data da resposta', ...cols.map((q) => q.label)].map(escape).join(';');
  const lines = responses.map((r) =>
    [formatDateTime(r.submitted_at), ...cols.map((q) => answerToText(r.answers[q.key]))].map(escape).join(';'),
  );
  return '﻿' + [header, ...lines].join('\n');
}
