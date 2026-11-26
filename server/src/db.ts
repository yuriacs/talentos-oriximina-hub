// Acesso ao Postgres.
//
// Toda consulta feita em nome de quem usa o site passa por withUser():
// abre uma transação, informa ao banco quem é o usuário (app.user_id) e
// troca para o papel "anon" ou "authenticated". A partir daí as regras de
// segurança por linha (RLS) das tabelas decidem o que pode ser lido ou
// alterado, exatamente como antes no Supabase.
import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 });

export type Db = pg.PoolClient;

export async function withUser<T>(userId: string | null, fn: (db: Db) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId ?? '']);
    await client.query(userId ? 'SET LOCAL ROLE authenticated' : 'SET LOCAL ROLE anon');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Transação com o usuário dono do banco (sem RLS). Só para login, sessões e tarefas internas. */
export async function asSystem<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export const ident = (name: string) => pg.escapeIdentifier(name);

/** Converte um erro do Postgres na resposta que o site espera ({ message, code, hint }). */
export function pgErrorBody(err: unknown) {
  const e = err as { message?: string; code?: string; hint?: string; detail?: string };
  return { message: e.message ?? 'Erro no banco de dados', code: e.code, hint: e.hint, details: e.detail };
}
