// Consultas às tabelas e funções do banco feitas pelo site.
//
// O site descreve a consulta (tabela, filtros, ordem); a API monta o SQL
// com nomes validados contra o catálogo do banco e valores sempre como
// parâmetros, e executa dentro de withUser(): o que cada pessoa pode ver
// ou alterar continua sendo decidido pelas regras RLS das tabelas.
import type { FastifyInstance } from 'fastify';
import { ident, pgErrorBody, pool, withUser } from '../db.js';

type Filter = { column: string; op: 'eq' | 'neq' | 'in' | 'ilike' | 'is' | 'gte' | 'lte' | 'gt' | 'lt'; value: unknown };
type Order = { column: string; ascending?: boolean };

interface DbRequest {
  table: string;
  action: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  columns?: string;
  filters?: Filter[];
  order?: Order[];
  limit?: number;
  offset?: number;
  count?: 'exact';
  head?: boolean;
  single?: boolean;
  values?: Record<string, unknown> | Record<string, unknown>[];
  onConflict?: string;
}

const MAX_ROWS = 5000;
const OPS: Record<Filter['op'], string> = { eq: '=', neq: '<>', ilike: 'ILIKE', gte: '>=', lte: '<=', gt: '>', lt: '<', in: 'IN', is: 'IS' };

// Funções que o site pode chamar diretamente. Cada uma ainda tem suas
// próprias permissões (GRANT EXECUTE) e verificações no banco.
const RPC_ALLOWED = new Set([
  'get_public_profiles', 'get_public_companies', 'get_public_survey_dashboard', 'get_safe_profile_data',
  'set_my_profile_published', 'set_sensitive_data_consent', 'anonymize_survey_names',
  'promote_to_admin', 'demote_from_admin', 'is_admin',
]);

interface Catalog { tables: Map<string, { columns: Set<string>; primaryKey: string[] }>; functions: Map<string, boolean> }
let catalog: Catalog | null = null;

export async function loadCatalog(): Promise<Catalog> {
  const tables = new Map<string, { columns: Set<string>; primaryKey: string[] }>();
  const cols = await pool.query(
    `SELECT c.table_name, c.column_name FROM information_schema.columns c
       JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'`);
  for (const r of cols.rows) {
    if (!tables.has(r.table_name)) tables.set(r.table_name, { columns: new Set(), primaryKey: [] });
    tables.get(r.table_name)!.columns.add(r.column_name);
  }
  const pks = await pool.query(
    `SELECT tc.table_name, kcu.column_name FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public' AND tc.constraint_type = 'PRIMARY KEY' ORDER BY kcu.ordinal_position`);
  for (const r of pks.rows) tables.get(r.table_name)?.primaryKey.push(r.column_name);
  const fns = await pool.query(
    "SELECT p.proname, p.proretset FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public'");
  const functions = new Map<string, boolean>(fns.rows.map((r) => [r.proname, r.proretset]));
  catalog = { tables, functions };
  return catalog;
}

class BadRequest extends Error {}

function buildQuery(req: DbRequest, cat: Catalog) {
  const table = cat.tables.get(req.table);
  if (!table) throw new BadRequest(`Tabela desconhecida: ${req.table}`);
  const col = (name: string) => {
    if (!table.columns.has(name)) throw new BadRequest(`Coluna desconhecida: ${req.table}.${name}`);
    return ident(name);
  };
  const params: unknown[] = [];
  const p = (v: unknown) => {
    // Objetos e listas de objetos (jsonb) vão como JSON; listas simples, como array do Postgres
    params.push(v !== null && typeof v === 'object' && !(Array.isArray(v) && v.every((x) => typeof x !== 'object' || x === null)) ? JSON.stringify(v) : v);
    return `$${params.length}`;
  };

  const where = (req.filters ?? []).map((f) => {
    if (!(f.op in OPS)) throw new BadRequest(`Filtro inválido: ${f.op}`);
    if (f.op === 'in') {
      if (!Array.isArray(f.value)) throw new BadRequest('Filtro "in" precisa de uma lista');
      if (f.value.length === 0) return 'false';
      return `${col(f.column)} = ANY(${p(f.value)})`;
    }
    if (f.op === 'is') {
      if (f.value !== null && f.value !== true && f.value !== false) throw new BadRequest('Filtro "is" aceita null, true ou false');
      return `${col(f.column)} IS ${f.value === null ? 'NULL' : f.value ? 'TRUE' : 'FALSE'}`;
    }
    return `${col(f.column)} ${OPS[f.op]} ${p(f.value)}`;
  });
  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const tableSql = `public.${ident(req.table)}`;

  switch (req.action) {
    case 'select': {
      const selected = (req.columns ?? '*').trim();
      const columnsSql = selected === '*' ? '*' : selected.split(',').map((c) => col(c.trim())).join(', ');
      const orderSql = (req.order ?? []).length
        ? ` ORDER BY ${req.order!.map((o) => `${col(o.column)} ${o.ascending === false ? 'DESC' : 'ASC'}`).join(', ')}`
        : '';
      const limit = Math.min(Math.max(Number(req.limit ?? MAX_ROWS), 0), MAX_ROWS);
      const offset = Math.max(Number(req.offset ?? 0), 0);
      return {
        sql: `SELECT ${columnsSql} FROM ${tableSql}${whereSql}${orderSql} LIMIT ${limit} OFFSET ${offset}`,
        countSql: req.count ? `SELECT count(*)::int AS n FROM ${tableSql}${whereSql}` : null,
        params,
      };
    }
    case 'delete':
      if (!where.length) throw new BadRequest('Apagar sem filtro não é permitido');
      return { sql: `DELETE FROM ${tableSql}${whereSql}`, countSql: null, params };
    case 'update': {
      if (!where.length) throw new BadRequest('Atualizar sem filtro não é permitido');
      const values = req.values as Record<string, unknown>;
      if (!values || Array.isArray(values) || !Object.keys(values).length) throw new BadRequest('Nada para atualizar');
      const sets = Object.entries(values).map(([k, v]) => `${col(k)} = ${p(v)}`).join(', ');
      return { sql: `UPDATE ${tableSql} SET ${sets}${whereSql}`, countSql: null, params };
    }
    case 'insert':
    case 'upsert': {
      const rows = Array.isArray(req.values) ? req.values : [req.values ?? {}];
      if (!rows.length) throw new BadRequest('Nada para inserir');
      const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
      if (!keys.length) throw new BadRequest('Nada para inserir');
      const keySql = keys.map(col).join(', ');
      const valuesSql = rows.map((r) => `(${keys.map((k) => (k in r ? p(r[k]) : 'DEFAULT')).join(', ')})`).join(', ');
      let conflictSql = '';
      if (req.action === 'upsert') {
        const target = req.onConflict ? req.onConflict.split(',').map((c) => c.trim()) : table.primaryKey;
        if (!target.length) throw new BadRequest('Upsert precisa de onConflict');
        const updates = keys.filter((k) => !target.includes(k)).map((k) => `${col(k)} = EXCLUDED.${col(k)}`);
        conflictSql = ` ON CONFLICT (${target.map(col).join(', ')}) ${updates.length ? `DO UPDATE SET ${updates.join(', ')}` : 'DO NOTHING'}`;
      }
      return { sql: `INSERT INTO ${tableSql} (${keySql}) VALUES ${valuesSql}${conflictSql}`, countSql: null, params };
    }
    default:
      throw new BadRequest('Ação inválida');
  }
}

export async function dataRoutes(app: FastifyInstance) {
  await loadCatalog();

  app.post('/api/db', async (request, reply) => {
    const req = request.body as DbRequest;
    const cat = catalog!;
    let query;
    try {
      query = buildQuery(req, cat);
    } catch (err) {
      if (err instanceof BadRequest) return reply.code(400).send({ message: err.message, code: 'BAD_REQUEST' });
      throw err;
    }
    try {
      return await withUser(request.user?.id ?? null, async (db) => {
        const count = query.countSql ? (await db.query(query.countSql, query.params)).rows[0].n : null;
        if (req.action === 'select' && req.head) return { data: null, count };
        const res = await db.query(query.sql, query.params);
        if (req.action !== 'select') return { data: null, count: res.rowCount };
        if (req.single) {
          if (res.rows.length > 1) return reply.code(406).send({ message: 'Mais de uma linha encontrada', code: 'PGRST116' });
          return { data: res.rows[0] ?? null, count };
        }
        return { data: res.rows, count };
      });
    } catch (err) {
      return reply.code(400).send(pgErrorBody(err));
    }
  });

  app.post<{ Params: { fn: string } }>('/api/rpc/:fn', async (request, reply) => {
    const { fn } = request.params;
    const returnsSet = catalog!.functions.get(fn);
    if (!RPC_ALLOWED.has(fn) || returnsSet === undefined) return reply.code(404).send({ message: `Função desconhecida: ${fn}`, code: '42883' });
    const args = (request.body ?? {}) as Record<string, unknown>;
    const names = Object.keys(args);
    if (names.some((n) => !/^_?[a-z][a-z0-9_]*$/.test(n))) return reply.code(400).send({ message: 'Parâmetro inválido' });
    const argSql = names.map((n, i) => `${ident(n)} => $${i + 1}`).join(', ');
    const sql = returnsSet ? `SELECT * FROM public.${ident(fn)}(${argSql})` : `SELECT public.${ident(fn)}(${argSql}) AS result`;
    try {
      return await withUser(request.user?.id ?? null, async (db) => {
        const res = await db.query(sql, names.map((n) => args[n]));
        return { data: returnsSet ? res.rows : res.rows[0]?.result ?? null };
      });
    } catch (err) {
      return reply.code(400).send(pgErrorBody(err));
    }
  });
}

export const __test = { buildQuery, loadCatalog };
