// Aplica, em ordem, os arquivos de db/migrations que ainda não rodaram.
// Roda sozinho quando a API inicia; também pode ser chamado com `npm run migrate`.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { pool } from './db.js';

export async function migrate(log: (msg: string) => void = console.log) {
  const client = await pool.connect();
  try {
    // Esquema próprio para controle interno (fora do "public", que é exposto à API)
    await client.query('CREATE SCHEMA IF NOT EXISTS app_meta');
    await client.query(`CREATE TABLE IF NOT EXISTS app_meta.migrations (
      name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
    // Só uma instância da API migra por vez
    await client.query("SELECT pg_advisory_lock(hashtext('observatorio-migrations'))");

    const done = new Set((await client.query('SELECT name FROM app_meta.migrations')).rows.map((r) => r.name));
    const files = (await fs.readdir(config.migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await fs.readFile(path.join(config.migrationsDir, file), 'utf8');
      log(`Aplicando migração ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO app_meta.migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Falha na migração ${file}: ${(err as Error).message}`);
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext('observatorio-migrations'))").catch(() => {});
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => { console.log('Migrações em dia.'); return pool.end(); })
    .catch((err) => { console.error(err); process.exit(1); });
}
