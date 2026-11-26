// Rotas de autenticação: cadastro, login, logout, confirmação de e-mail,
// recuperação de senha e login com Google.
import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { config, emailEnabled, googleEnabled } from '../config.js';
import { asSystem, withUser } from '../db.js';
import {
  MIN_PASSWORD, checkPassword, consumeOneTimeToken, createOneTimeToken, createSession, destroySession,
  hashPassword, isAdmin, isValidEmail, normalizeEmail, safeRedirect,
} from '../auth.js';
import { sendConfirmationEmail, sendPasswordResetEmail } from '../mail.js';
import { removeUserFiles } from './storage.js';

const OAUTH_COOKIE = 'obs_oauth';

export async function authRoutes(app: FastifyInstance) {
  const strict = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

  app.get('/api/auth/providers', async () => ({ google: googleEnabled(), emailConfirmation: emailEnabled() }));

  app.get('/api/auth/me', async (request) => {
    if (!request.user) return { user: null, isAdmin: false };
    const admin = await asSystem((db) => isAdmin(db, request.user!.id));
    return { user: request.user, isAdmin: admin };
  });

  app.post('/api/auth/signup', strict, async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? '');
    const fullName = String(body.full_name ?? '').trim().slice(0, 200);
    const termsVersion = String(body.terms_version ?? '');

    if (!isValidEmail(email)) return reply.code(400).send({ message: 'Informe um e-mail válido' });
    if (password.length < MIN_PASSWORD) return reply.code(400).send({ message: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres` });
    if (fullName.split(/\s+/).length < 2) return reply.code(400).send({ message: 'Informe nome e sobrenome' });
    if (!termsVersion || body.age_confirmed !== true) {
      return reply.code(400).send({ message: 'É preciso confirmar a idade mínima e aceitar os Termos e a Política de Privacidade' });
    }

    const hash = await hashPassword(password);
    const needsConfirmation = emailEnabled();
    const redirect = safeRedirect(body.redirect);

    const result = await asSystem(async (db) => {
      const exists = await db.query('SELECT 1 FROM auth.users WHERE lower(email) = $1', [email]);
      if (exists.rowCount) return { conflict: true as const };
      // O gatilho on_auth_user_created cria o perfil, o papel e o registro do aceite
      const { rows } = await db.query(
        `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [email, hash, needsConfirmation ? null : new Date(), { full_name: fullName, terms_version: termsVersion, age_confirmed: true }],
      );
      const userId = rows[0].id as string;
      if (needsConfirmation) {
        const token = await createOneTimeToken(db, userId, 'confirm_email');
        return { userId, token };
      }
      await createSession(db, reply, userId);
      return { userId };
    });

    if ('conflict' in result) return reply.code(409).send({ message: 'User already registered' });
    if (result.token) {
      const link = `${config.appUrl}/api/auth/confirm?token=${result.token}&redirect=${encodeURIComponent(redirect)}`;
      await sendConfirmationEmail(email, link);
    }
    return { needsConfirmation };
  });

  app.get('/api/auth/confirm', async (request, reply) => {
    const { token, redirect } = request.query as { token?: string; redirect?: string };
    const ok = token && await asSystem(async (db) => {
      const userId = await consumeOneTimeToken(db, token, 'confirm_email');
      if (!userId) return false;
      await db.query('UPDATE auth.users SET email_confirmed_at = coalesce(email_confirmed_at, now()) WHERE id = $1', [userId]);
      await createSession(db, reply, userId);
      return true;
    });
    return reply.redirect(ok ? `${config.appUrl}${safeRedirect(redirect)}` : `${config.appUrl}/login?erro=link-invalido`);
  });

  app.post('/api/auth/login', strict, async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? '');

    const outcome = await asSystem(async (db) => {
      const { rows } = await db.query(
        'SELECT id, encrypted_password, email_confirmed_at FROM auth.users WHERE lower(email) = $1', [email]);
      const user = rows[0];
      if (!user || !(await checkPassword(password, user.encrypted_password))) return 'invalid';
      if (!user.email_confirmed_at) return 'unconfirmed';
      await createSession(db, reply, user.id);
      return 'ok';
    });

    if (outcome === 'invalid') return reply.code(400).send({ message: 'Invalid login credentials' });
    if (outcome === 'unconfirmed') return reply.code(400).send({ message: 'Email not confirmed' });
    return { ok: true };
  });

  app.post('/api/auth/logout', async (request, reply) => {
    await destroySession(request, reply);
    return { ok: true };
  });

  app.post('/api/auth/recover', strict, async (request, reply) => {
    if (!emailEnabled()) {
      return reply.code(503).send({ message: 'A recuperação por e-mail não está disponível. Peça à SEMJU para redefinir sua senha.' });
    }
    const email = normalizeEmail((request.body as Record<string, unknown> | undefined)?.email);
    const token = await asSystem(async (db) => {
      const { rows } = await db.query('SELECT id FROM auth.users WHERE lower(email) = $1', [email]);
      return rows[0] ? createOneTimeToken(db, rows[0].id, 'reset_password') : null;
    });
    // Mesma resposta exista ou não a conta, para não revelar quem está cadastrado
    if (token) await sendPasswordResetEmail(email, `${config.appUrl}/reset-password?token=${token}`);
    return { ok: true };
  });

  app.post('/api/auth/reset', strict, async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>;
    const password = String(body.password ?? '');
    if (password.length < MIN_PASSWORD) return reply.code(400).send({ message: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres` });
    const hash = await hashPassword(password);
    const ok = await asSystem(async (db) => {
      const userId = await consumeOneTimeToken(db, String(body.token ?? ''), 'reset_password');
      if (!userId) return false;
      await db.query(
        `UPDATE auth.users SET encrypted_password = $2, email_confirmed_at = coalesce(email_confirmed_at, now()),
                updated_at = now() WHERE id = $1`, [userId, hash]);
      // Derruba as outras sessões: quem estava usando a senha antiga sai
      await db.query('DELETE FROM auth.sessions WHERE user_id = $1', [userId]);
      await createSession(db, reply, userId);
      return true;
    });
    if (!ok) return reply.code(400).send({ message: 'Link inválido ou expirado. Peça um novo link.' });
    return { ok: true };
  });

  // Troca de senha de quem já está logado
  app.post('/api/auth/password', strict, async (request, reply) => {
    if (!request.user) return reply.code(401).send({ message: 'Faça login novamente' });
    const password = String((request.body as Record<string, unknown> | undefined)?.password ?? '');
    if (password.length < MIN_PASSWORD) return reply.code(400).send({ message: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres` });
    const hash = await hashPassword(password);
    await asSystem((db) => db.query('UPDATE auth.users SET encrypted_password = $2, updated_at = now() WHERE id = $1', [request.user!.id, hash]));
    return { ok: true };
  });

  // ---------------- Login com Google (OAuth 2.0 / OpenID Connect) ----------------
  const callbackUrl = () => `${config.appUrl}/api/auth/google/callback`;

  app.get('/api/auth/google', async (request, reply) => {
    if (!googleEnabled()) return reply.redirect(`${config.appUrl}/login?erro=google-indisponivel`);
    const state = crypto.randomBytes(16).toString('base64url');
    const redirect = safeRedirect((request.query as { redirect?: string }).redirect);
    reply.setCookie(OAUTH_COOKIE, JSON.stringify({ state, redirect }), {
      path: '/api/auth/google', httpOnly: true, sameSite: 'lax', secure: config.cookieSecure, maxAge: 600,
    });
    const params = new URLSearchParams({
      client_id: config.google.clientId,
      redirect_uri: callbackUrl(),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  app.get('/api/auth/google/callback', async (request, reply) => {
    const fail = (motivo: string) => reply.redirect(`${config.appUrl}/login?erro=${motivo}`);
    const { code, state } = request.query as { code?: string; state?: string };
    let saved: { state?: string; redirect?: string } = {};
    try { saved = JSON.parse(request.cookies[OAUTH_COOKIE] ?? '{}'); } catch { /* cookie inválido */ }
    reply.clearCookie(OAUTH_COOKIE, { path: '/api/auth/google' });
    if (!code || !state || state !== saved.state) return fail('google');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: config.google.clientId, client_secret: config.google.clientSecret,
        redirect_uri: callbackUrl(), grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) return fail('google');
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${access_token}` },
    });
    if (!infoRes.ok) return fail('google');
    const info = (await infoRes.json()) as { sub?: string; email?: string; email_verified?: boolean; name?: string };
    if (!info.sub || !info.email || !info.email_verified) return fail('google-email');
    const email = normalizeEmail(info.email);

    await asSystem(async (db) => {
      let userId: string | undefined = (await db.query(
        "SELECT user_id FROM auth.identities WHERE provider = 'google' AND provider_id = $1", [info.sub])).rows[0]?.user_id;
      if (!userId) {
        // Conta já existente com o mesmo e-mail (verificado pelo Google): vincula
        userId = (await db.query('SELECT id FROM auth.users WHERE lower(email) = $1', [email])).rows[0]?.id;
        if (!userId) {
          // Conta nova. Sem terms_version: o site pede o aceite no primeiro acesso.
          userId = (await db.query(
            `INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
             VALUES ($1, now(), $2) RETURNING id`, [email, { full_name: info.name ?? email }])).rows[0].id;
        } else {
          await db.query('UPDATE auth.users SET email_confirmed_at = coalesce(email_confirmed_at, now()) WHERE id = $1', [userId]);
        }
        await db.query("INSERT INTO auth.identities (user_id, provider, provider_id) VALUES ($1, 'google', $2)", [userId, info.sub]);
      }
      await createSession(db, reply, userId!);
    });
    return reply.redirect(`${config.appUrl}${safeRedirect(saved.redirect)}`);
  });

  // ---------------- Exclusão da própria conta (LGPD art. 18, VI) ----------------
  app.post('/api/me/delete', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ message: 'Faça login novamente' });
    const userId = request.user.id;
    await withUser(userId, (db) => db.query('SELECT public.delete_my_account()'));
    await removeUserFiles(userId);
    reply.clearCookie('obs_session', { path: '/' });
    return { ok: true };
  });
}
