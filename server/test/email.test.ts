// Fluxos que dependem de e-mail, com um servidor SMTP falso local.
// Rode com: TEST_DATABASE_URL=postgres://.../obs_test_email npm test
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';
import { SMTPServer } from 'smtp-server';

const url = process.env.TEST_DATABASE_URL?.replace(/\/([^/]+)$/, '/$1_email');
const d = url ? describe : describe.skip;

d('API com e-mail', () => {
  let app: Awaited<ReturnType<typeof import('../src/app.js')['buildApp']>>;
  let smtp: SMTPServer;
  const inbox: string[] = [];
  let failNext = false;

  beforeAll(async () => {
    smtp = new SMTPServer({
      authOptional: true,
      disabledCommands: ['STARTTLS'],
      allowInsecureAuth: true,
      onAuth: (_auth, _s, cb) => cb(null, { user: 'ok' }),
      onData(stream, _s, cb) {
        let raw = '';
        stream.on('data', (c) => (raw += c));
        stream.on('end', () => {
          if (failNext) { failNext = false; return cb(new Error('caixa cheia')); }
          inbox.push(raw.replace(/=\r?\n/g, '').replace(/=3D/g, '='));
          cb();
        });
      },
    });
    await new Promise<void>((r) => smtp.listen(2525, '127.0.0.1', r));

    const admin = new pg.Client({ connectionString: url!.replace(/\/[^/]+$/, '/postgres') });
    await admin.connect();
    const name = new URL(url!).pathname.slice(1);
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${name}"`);
    await admin.end();
    Object.assign(process.env, {
      DATABASE_URL: url, UPLOADS_DIR: `/tmp/obs-test-email-${Date.now()}`, APP_URL: 'https://obs.teste',
      SMTP_HOST: '127.0.0.1', SMTP_PORT: '2525', SMTP_SECURE: 'false', SMTP_USER: 'robo@teste', SMTP_PASS: 'x',
      SMTP_FROM: 'Observatório <robo@teste>',
    });
    const { migrate } = await import('../src/migrate.js');
    await migrate(() => {});
    const { buildApp } = await import('../src/app.js');
    app = await buildApp();
  });

  afterAll(async () => {
    await app?.close();
    (await import('../src/db.js')).pool.end();
    await new Promise<void>((r) => smtp.close(() => r()));
  });

  const H = { 'x-obs-client': '1' };
  const linkFrom = (mail: string, re: RegExp) => mail.match(re)?.[0] ?? '';
  const cookieOf = (res: { cookies: { name: string; value: string }[] }) =>
    `obs_session=${res.cookies.find((c) => c.name === 'obs_session')?.value ?? ''}`;
  const signup = (email: string) => app.inject({ method: 'POST', url: '/api/auth/signup', headers: H,
    payload: { email, password: 'senha-segura-1', full_name: 'Lia Moura', terms_version: 'v', age_confirmed: true, redirect: '/meu-perfil' } });

  it('confirma o e-mail pelo link antes de permitir o login', async () => {
    const res = await signup('lia@exemplo.com');
    expect(res.json()).toEqual({ needsConfirmation: true });
    expect(res.cookies.find((c) => c.name === 'obs_session')).toBeUndefined();

    const login = await app.inject({ method: 'POST', url: '/api/auth/login', headers: H, payload: { email: 'lia@exemplo.com', password: 'senha-segura-1' } });
    expect(login.json().message).toBe('Email not confirmed');

    const link = linkFrom(inbox.at(-1)!, /https:\/\/obs\.teste\/api\/auth\/confirm\?token=[\w-]+&redirect=[^\s"<]+/);
    expect(link).not.toBe('');
    const confirm = await app.inject({ url: link.replace('https://obs.teste', '') });
    expect(confirm.statusCode).toBe(302);
    expect(confirm.headers.location).toBe('https://obs.teste/meu-perfil');
    const me = await app.inject({ url: '/api/auth/me', headers: { cookie: cookieOf(confirm) } });
    expect(me.json().user.email).toBe('lia@exemplo.com');

    // O mesmo link não vale duas vezes
    const again = await app.inject({ url: link.replace('https://obs.teste', '') });
    expect(again.headers.location).toContain('erro=link-invalido');
  });

  it('redefine a senha pelo link e derruba as sessões antigas', async () => {
    const before = await app.inject({ method: 'POST', url: '/api/auth/login', headers: H, payload: { email: 'lia@exemplo.com', password: 'senha-segura-1' } });
    const oldCookie = cookieOf(before);
    const count = inbox.length;
    await app.inject({ method: 'POST', url: '/api/auth/recover', headers: H, payload: { email: 'lia@exemplo.com' } });
    expect(inbox.length).toBe(count + 1);
    // E-mail que não existe: mesma resposta e nenhum envio
    const ghost = await app.inject({ method: 'POST', url: '/api/auth/recover', headers: H, payload: { email: 'ninguem@exemplo.com' } });
    expect(ghost.statusCode).toBe(200);
    expect(inbox.length).toBe(count + 1);

    const token = linkFrom(inbox.at(-1)!, /reset-password\?token=[\w-]+/).split('=')[1];
    const reset = await app.inject({ method: 'POST', url: '/api/auth/reset', headers: H, payload: { token, password: 'nova-senha-123' } });
    expect(reset.statusCode).toBe(200);
    expect((await app.inject({ url: '/api/auth/me', headers: { cookie: oldCookie } })).json().user).toBeNull();
    const ok = await app.inject({ method: 'POST', url: '/api/auth/login', headers: H, payload: { email: 'lia@exemplo.com', password: 'nova-senha-123' } });
    expect(ok.statusCode).toBe(200);
  });

  it('desfaz o cadastro se o e-mail de confirmação não puder ser enviado', async () => {
    failNext = true;
    const res = await signup('teo@exemplo.com');
    expect(res.statusCode).toBe(502);
    expect(res.json().message).toMatch(/e-mail de confirmação/);
    const retry = await signup('teo@exemplo.com');
    expect(retry.statusCode).toBe(200);
  });
});
