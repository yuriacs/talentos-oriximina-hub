import { describe, expect, it } from 'vitest';
import { aggregateQuestion, parseSheetRows, parseTimestamp, splitMulti, type SurveyQuestion } from '@/lib/survey';

const q = (key: string, question: string, kind: SurveyQuestion['kind'], options: string[] | null = null): SurveyQuestion => ({
  key, label: key, question, position: 0, kind, is_public: false, options,
});

const temas = ['Saúde Mental e Apoio Psicossocial', 'Emprego, Renda e Oportunidades', 'Acesso à Cultura, Memória e Expressão'];
const questions = [
  q('carimbo', 'Carimbo de data/hora', 'date'),
  q('nome', 'Qual seu nome?', 'personal'),
  q('renda', 'Qual sua renda familiar?', 'category', ['01 salário mínimo', 'Mais de 01 salário mínimo']),
  q('temas', 'Quais os 3 temas?', 'multi', temas),
  q('nota', 'De 0 a 10', 'scale'),
];

describe('survey parser', () => {
  it('separa múltipla escolha com opções que contêm vírgula', () => {
    expect(splitMulti('Saúde Mental e Apoio Psicossocial, Emprego, Renda e Oportunidades, Algo novo', temas)).toEqual([
      'Saúde Mental e Apoio Psicossocial',
      'Emprego, Renda e Oportunidades',
      'Algo novo',
    ]);
  });

  it('converte hora local de Oriximiná para UTC', () => {
    expect(parseTimestamp(new Date(Date.UTC(2026, 2, 31, 12, 39, 5)))).toBe('2026-03-31T15:39:05.000Z');
    expect(parseTimestamp('31/03/2026 12:39:05')).toBe('2026-03-31T15:39:05.000Z');
  });

  it('normaliza variações de escrita e cria colunas novas', () => {
    const parsed = parseSheetRows(
      [
        ['Carimbo de data/hora', 'Qual seu nome?', 'Qual sua renda familiar?', 'Quais os 3 temas?', 'De 0 a 10', 'Pergunta nova'],
        [new Date(Date.UTC(2026, 0, 1)), 'Ana ', 'Mais de 1salário mínimo.', 'Emprego, Renda e Oportunidades', 7, 'oi'],
        [new Date(Date.UTC(2026, 0, 2)), 'Bia', 'Mais de 01 salário mínimo', null, '9', null],
        [null, 'Sem data', null, null, null, null],
      ],
      questions,
    );
    expect(parsed.skippedRows).toBe(1);
    expect(parsed.newQuestions.map((n) => n.question)).toEqual(['Pergunta nova']);
    expect(parsed.responses[0].answers).toEqual({
      nome: 'Ana',
      renda: 'Mais de 01 salário mínimo',
      temas: ['Emprego, Renda e Oportunidades'],
      nota: 7,
      perguntanova: 'oi',
    });

    const renda = aggregateQuestion(questions[2], parsed.responses);
    expect(renda.data).toEqual([{ name: 'Mais de 01 salário mínimo', value: 2 }]);
    expect(aggregateQuestion(questions[4], parsed.responses).average).toBe(8);
  });
});
