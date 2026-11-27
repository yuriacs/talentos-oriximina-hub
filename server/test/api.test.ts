// Testes de ponta a ponta da API contra um Postgres de teste.
// Rode com: TEST_DATABASE_URL=postgres://... npm test
// O banco indicado é APAGADO e recriado.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';

const url = process.env.TEST_DATABASE_URL;
const d = url ? describe : describe.skip;

d('API do Observatório', () => {
  let app: Awaited<ReturnType<typeof import('../src/app.js')['buildApp']>>;
  let pool: pg.Pool;

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: url!.replace(/\/[^/]+$/, '/postgres') });
    await admin.connect();
    const name = new URL(url!).pathname.slice(1);
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${name}"`);
    await admin.end();
    process.env.DATABASE_URL = url;
    process.env.UPLOADS_DIR = `/tmp/obs-test-uploads-${Date.now()}`;
    const { migrate } = await import('../src/migrate.js');
    await migrate(() => {});
    const { buildApp } = await import('../src/app.js');
    app = await buildApp();
    pool = new pg.Pool({ connectionString: url });
  });

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    const { pool: appPool } = await import('../src/db.js');
    await appPool.end();
  });

  const H = { 'x-obs-client': '1' };
  const cookieOf = (res: { cookies: { name: string; value: string }[] }) => {
    const c = res.cookies.find((x) => x.name === 'obs_session');
    return c ? `obs_session=${c.value}` : '';
  };
  const signup = async (email: string, name = 'Ana Souza') => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/signup', headers: H,
      payload: { email, password: 'senha-segura-1', full_name: name, terms_version: '2026-11-26', age_confirmed: true } });
    expect(res.statusCode).toBe(200);
    return cookieOf(res);
  };
  const db = (cookie: string, payload: object) =>
    app.inject({ method: 'POST', url: '/api/db', headers: { ...H, cookie }, payload });

  it('recusa pedidos de alteração sem o cabeçalho do site (CSRF)', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: {} });
    expect(res.statusCode).toBe(403);
  });

  it('cadastra, cria perfil e registra o aceite dos termos', async () => {
    const cookie = await signup('ana@exemplo.com');
    const me = (await app.inject({ url: '/api/auth/me', headers: { cookie } })).json();
    expect(me.user.email).toBe('ana@exemplo.com');
    expect(me.isAdmin).toBe(false);
    const consents = await pool.query("SELECT document, version FROM consent_records");
    expect(consents.rows).toEqual([{ document: 'termos_privacidade', version: '2026-11-26' }]);
  });

  it('não deixa cadastrar o mesmo e-mail duas vezes', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/signup', headers: H,
      payload: { email: 'ANA@exemplo.com', password: 'outra-senha-1', full_name: 'Ana Dois', terms_version: 'x', age_confirmed: true } });
    expect(res.statusCode).toBe(409);
  });

  it('faz login com senha bcrypt no formato do Supabase ($2a$)', async () => {
    const bcrypt = (await import('bcryptjs')).default;
    const hash = (await bcrypt.hash('senha-antiga-1', 10)).replace(/^\$2b\$/, '$2a$');
    await pool.query("INSERT INTO auth.users (email, encrypted_password, email_confirmed_at) VALUES ('velho@exemplo.com', $1, now())", [hash]);
    const ok = await app.inject({ method: 'POST', url: '/api/auth/login', headers: H, payload: { email: 'velho@exemplo.com', password: 'senha-antiga-1' } });
    expect(ok.statusCode).toBe(200);
    const bad = await app.inject({ method: 'POST', url: '/api/auth/login', headers: H, payload: { email: 'velho@exemplo.com', password: 'errada' } });
    expect(bad.statusCode).toBe(400);
  });

  it('aplica as regras RLS: visitante não lê perfis; dono lê e altera o próprio', async () => {
    const anon = (await db('', { table: 'profiles', action: 'select' })).json();
    expect(anon.data).toEqual([]);
    const cookie = await signup('bia@exemplo.com', 'Bia Lima');
    const mine = (await db(cookie, { table: 'profiles', action: 'select' })).json();
    expect(mine.data).toHaveLength(1);
    expect(mine.data[0].full_name).toBe('Bia Lima');
    const upd = await db(cookie, { table: 'profiles', action: 'update', values: { bio: 'Olá' }, filters: [{ column: 'id', op: 'eq', value: mine.data[0].id }] });
    expect(upd.json().count).toBe(1);
    // Não consegue se publicar direto nem se verificar
    const pub = await db(cookie, { table: 'profiles', action: 'update', values: { is_verified: true }, filters: [{ column: 'id', op: 'eq', value: mine.data[0].id }] });
    expect(pub.statusCode).toBe(400);
  });

  it('bloqueia raça/cor sem consentimento específico', async () => {
    const cookie = await signup('caio@exemplo.com', 'Caio Reis');
    const { data } = (await db(cookie, { table: 'profiles', action: 'select', columns: 'id' })).json();
    const res = await db(cookie, { table: 'profiles', action: 'update', values: { race_color: 'Parda' }, filters: [{ column: 'id', op: 'eq', value: data[0].id }] });
    expect(res.statusCode).toBe(400);
    expect(res.json().hint).toBe('sensitive_consent_required');
    const rpc = await app.inject({ method: 'POST', url: '/api/rpc/set_sensitive_data_consent', headers: { ...H, cookie }, payload: { _granted: true, _version: 'v1' } });
    expect(rpc.statusCode).toBe(200);
    const ok = await db(cookie, { table: 'profiles', action: 'update', values: { race_color: 'Parda' }, filters: [{ column: 'id', op: 'eq', value: data[0].id }] });
    expect(ok.statusCode).toBe(200);
  });

  it('não aceita tabela, coluna ou função fora da lista', async () => {
    expect((await db('', { table: 'pg_shadow', action: 'select' })).statusCode).toBe(400);
    expect((await db('', { table: 'profiles', action: 'select', columns: 'id; drop table x' })).statusCode).toBe(400);
    const fn = await app.inject({ method: 'POST', url: '/api/rpc/delete_my_account', headers: H, payload: {} });
    expect(fn.statusCode).toBe(404);
  });

  it('publica e lista perfis públicos sem dados sensíveis', async () => {
    const cookie = await signup('duda@exemplo.com', 'Duda Melo');
    await app.inject({ method: 'POST', url: '/api/rpc/set_my_profile_published', headers: { ...H, cookie }, payload: { _publish: true } });
    const list = (await app.inject({ method: 'POST', url: '/api/rpc/get_public_profiles', headers: H, payload: {} })).json();
    expect(list.data.map((p: { full_name: string }) => p.full_name)).toContain('Duda Melo');
    expect(Object.keys(list.data[0])).not.toContain('race_color');
  });

  it('envia foto só na própria pasta e apaga tudo ao excluir a conta', async () => {
    const cookie = await signup('eva@exemplo.com', 'Eva Nunes');
    const me = (await app.inject({ url: '/api/auth/me', headers: { cookie } })).json();
    const boundary = 'XYZ';
    const body = (p: string) => Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="path"\r\n\r\n${p}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="a.png"\r\nContent-Type: image/png\r\n\r\nPNGDATA\r\n--${boundary}--\r\n`);
    const headers = { ...H, cookie, 'content-type': `multipart/form-data; boundary=${boundary}` };
    const own = await app.inject({ method: 'POST', url: '/api/storage/avatars', headers, payload: body(`${me.user.id}/avatar.png`) });
    expect(own.statusCode).toBe(200);
    expect((await app.inject({ url: own.json().publicUrl })).statusCode).toBe(200);
    const other = await app.inject({ method: 'POST', url: '/api/storage/avatars', headers, payload: body('00000000-0000-0000-0000-000000000000/x.png') });
    expect(other.statusCode).toBe(403);
    const traversal = await app.inject({ method: 'POST', url: '/api/storage/avatars', headers, payload: body(`${me.user.id}/../x.png`) });
    expect(traversal.statusCode).toBe(403);

    const del = await app.inject({ method: 'POST', url: '/api/me/delete', headers: { ...H, cookie }, payload: {} });
    expect(del.statusCode).toBe(200);
    expect((await pool.query('SELECT 1 FROM auth.users WHERE id = $1', [me.user.id])).rowCount).toBe(0);
    expect((await app.inject({ url: own.json().publicUrl })).statusCode).toBe(404);
    expect((await app.inject({ url: '/api/auth/me', headers: { cookie } })).json().user).toBeNull();
  });

  it('rotas de admin exigem papel de administrador', async () => {
    const cookie = await signup('fabi@exemplo.com', 'Fabi Rocha');
    expect((await app.inject({ url: '/api/admin/users', headers: { cookie } })).statusCode).toBe(403);
    const me = (await app.inject({ url: '/api/auth/me', headers: { cookie } })).json();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [me.user.id]);
    const list = await app.inject({ url: '/api/admin/users?search=fabi', headers: { cookie } });
    expect(list.statusCode).toBe(200);
    expect(list.json().users[0].email).toBe('fabi@exemplo.com');
    const reset = await app.inject({ method: 'POST', url: '/api/admin/users/reset-password', headers: { ...H, cookie }, payload: { user_id: me.user.id } });
    expect(reset.json().temp_password).toHaveLength(12);
    // A senha temporária derruba as sessões, inclusive a do próprio admin
    expect((await app.inject({ url: '/api/auth/me', headers: { cookie } })).json().user).toBeNull();
  });

  it('impede quem não é admin de ler respostas da pesquisa', async () => {
    const cookie = await signup('gabi@exemplo.com', 'Gabi Costa');
    const res = (await db(cookie, { table: 'survey_responses', action: 'select' })).json();
    expect(res.data).toEqual([]);
  });
  it('limita tentativas de login pelo IP real, ignorando X-Forwarded-For falso', async () => {
    // Visitante 10.0.0.5 -> proxy HTTPS (172.18.0.1) -> nginx do container (172.18.0.3) -> API
    const tentativa = (falso: string, cliente = '10.0.0.5') => app.inject({
      method: 'POST', url: '/api/auth/login', remoteAddress: '172.18.0.3',
      headers: { ...H, 'x-forwarded-for': `${falso}, ${cliente}, 172.18.0.1` },
      payload: { email: 'ninguem@exemplo.com', password: 'errada123' },
    });
    for (let i = 0; i < 10; i++) expect((await tentativa(`1.2.3.${i}`)).statusCode).not.toBe(429);
    expect((await tentativa('9.9.9.9')).statusCode).toBe(429);
    // Outro visitante continua podendo tentar
    expect((await tentativa('9.9.9.9', '10.0.0.6')).statusCode).not.toBe(429);
  });
});
