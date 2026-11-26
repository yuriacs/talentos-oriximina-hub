// Importa o backup feito com `supabase db dump` para o Postgres próprio.
//
// Uso (com DATABASE_URL apontando para o banco novo, já migrado):
//   npm run import:supabase -- <pasta-do-backup> [--force]
//
// A pasta deve conter o data.sql e, se houver, a subpasta storage/
// (fotos baixadas com baixar-fotos.ps1). O roles.sql e o schema.sql do
// Supabase não são usados: a estrutura vem de db/migrations.
//
// O que é importado:
//   * todas as tabelas do esquema public (só as colunas que existem aqui);
//   * auth.users (com o hash bcrypt das senhas: ninguém precisa trocar de senha);
//   * vínculos de login com Google (auth.identities, provider = google);
//   * fotos e logos para UPLOADS_DIR, com os links reescritos para /uploads/.
// Sessões, logs de auditoria do Supabase e demais tabelas internas dele não são importados.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { config } from '../src/config.js';
import { migrate } from '../src/migrate.js';
import { ident, pool } from '../src/db.js';

const STORAGE_URL = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//g;

/** Decodifica um campo do formato texto do COPY do Postgres */
function decodeCopyField(raw: string): string | null {
  if (raw === '\\N') return null;
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c !== '\\') { out += c; continue; }
    const n = raw[++i];
    switch (n) {
      case 'b': out += '\b'; break;
      case 'f': out += '\f'; break;
      case 'n': out += '\n'; break;
      case 'r': out += '\r'; break;
      case 't': out += '\t'; break;
      case 'v': out += '\v'; break;
      case 'x': {
        const hex = raw.slice(i + 1).match(/^[0-9a-fA-F]{1,2}/)![0];
        out += String.fromCharCode(parseInt(hex, 16)); i += hex.length; break;
      }
      default:
        if (n >= '0' && n <= '7') {
          const oct = raw.slice(i).match(/^[0-7]{1,3}/)![0];
          out += String.fromCharCode(parseInt(oct, 8)); i += oct.length - 1;
        } else out += n;
    }
  }
  return out;
}

type Block = { schema: string; table: string; columns: string[]; rows: (string | null)[][] };

async function readCopyBlocks(file: string): Promise<Block[]> {
  const blocks: Block[] = [];
  let current: Block | null = null;
  const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!current) {
      const m = line.match(/^COPY "?([\w]+)"?\."?([\w]+)"? \((.*)\) FROM stdin;$/);
      if (m) current = { schema: m[1], table: m[2], columns: m[3].split(',').map((c) => c.trim().replace(/^"|"$/g, '')), rows: [] };
      continue;
    }
    if (line === '\\.') { blocks.push(current); current = null; continue; }
    current.rows.push(line.split('\t').map(decodeCopyField));
  }
  return blocks;
}

async function main() {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith('--'));
  const force = args.includes('--force');
  if (!dir) throw new Error('Informe a pasta do backup: npm run import:supabase -- <pasta>');
  const dataFile = path.join(dir, 'data.sql');
  if (!fs.existsSync(dataFile)) throw new Error(`Não encontrei ${dataFile}`);

  await migrate();
  const blocks = await readCopyBlocks(dataFile);
  const client = await pool.connect();
  try {
    const existing = (await client.query('SELECT count(*)::int AS n FROM auth.users')).rows[0].n;
    if (existing && !force) throw new Error(`O banco já tem ${existing} usuários. Use --force para importar mesmo assim (linhas repetidas são ignoradas).`);

    const targetCols = new Map<string, Set<string>>();
    for (const r of (await client.query(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'")).rows) {
      if (!targetCols.has(r.table_name)) targetCols.set(r.table_name, new Set());
      targetCols.get(r.table_name)!.add(r.column_name);
    }

    await client.query('BEGIN');
    // Desliga gatilhos e checagens de chave estrangeira durante a carga:
    // evita que o gatilho de novo usuário crie perfis duplicados.
    await client.query('SET LOCAL session_replication_role = replica');

    const insert = async (table: string, cols: string[], values: (string | null)[]) => {
      const sql = `INSERT INTO ${table} (${cols.map(ident).join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) ON CONFLICT DO NOTHING`;
      return (await client.query(sql, values)).rowCount ?? 0;
    };
    const summary: Record<string, number> = {};

    // auth.users
    const users = blocks.find((b) => b.schema === 'auth' && b.table === 'users');
    if (users) {
      const idx = (c: string) => users.columns.indexOf(c);
      let n = 0;
      for (const row of users.rows) {
        const get = (c: string) => (idx(c) >= 0 ? row[idx(c)] : null);
        if (!get('email')) continue;
        n += await insert('auth.users',
          ['id', 'email', 'encrypted_password', 'email_confirmed_at', 'raw_user_meta_data', 'last_sign_in_at', 'created_at', 'updated_at'],
          [get('id'), get('email'), get('encrypted_password') || null, get('email_confirmed_at'),
            get('raw_user_meta_data') ?? '{}', get('last_sign_in_at'), get('created_at') ?? new Date().toISOString(), get('updated_at') ?? new Date().toISOString()]);
      }
      summary['auth.users'] = n;
    }

    // Vínculos Google
    const identities = blocks.find((b) => b.schema === 'auth' && b.table === 'identities');
    if (identities) {
      const idx = (c: string) => identities.columns.indexOf(c);
      let n = 0;
      for (const row of identities.rows) {
        if (row[idx('provider')] !== 'google') continue;
        n += await insert('auth.identities', ['user_id', 'provider', 'provider_id'],
          [row[idx('user_id')], 'google', row[idx('provider_id')]]);
      }
      summary['auth.identities (google)'] = n;
    }

    // Tabelas do site
    for (const block of blocks.filter((b) => b.schema === 'public')) {
      const target = targetCols.get(block.table);
      if (!target) { console.warn(`Tabela ignorada (não existe aqui): public.${block.table}`); continue; }
      // As perguntas da pesquisa vêm pré-cadastradas pela migração; vale a versão do backup
      if (block.table === 'survey_questions' && block.rows.length) await client.query('DELETE FROM public.survey_questions');
      const keep = block.columns.map((c, i) => [c, i] as const).filter(([c]) => target.has(c));
      let n = 0;
      for (const row of block.rows) {
        const values = keep.map(([, i]) => {
          const v = row[i];
          return v === null ? null : v.replace(STORAGE_URL, '/uploads/');
        });
        n += await insert(`public.${ident(block.table)}`, keep.map(([c]) => c), values);
      }
      summary[`public.${block.table}`] = n;
    }

    await client.query('COMMIT');
    console.table(summary);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  // Fotos
  const storageDir = path.join(dir, 'storage');
  if (fs.existsSync(storageDir)) {
    await fsp.cp(storageDir, config.uploadsDir, { recursive: true, force: true });
    console.log(`Fotos copiadas de ${storageDir} para ${config.uploadsDir}`);
  } else {
    console.warn('Pasta storage/ não encontrada no backup: as fotos não foram copiadas.');
  }

  const orphans = (await pool.query(
    'SELECT count(*)::int AS n FROM public.profiles p LEFT JOIN auth.users u ON u.id = p.user_id WHERE u.id IS NULL')).rows[0].n;
  if (orphans) console.warn(`Atenção: ${orphans} perfis sem conta de login (já existiam assim no Supabase).`);
  await pool.end();
}

main().catch((err) => { console.error(err.message ?? err); process.exit(1); });
