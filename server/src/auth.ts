// Contas, senhas, sessões e códigos de uso único.
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { config } from './config.js';
import { asSystem, type Db } from './db.js';

export const SESSION_COOKIE = 'obs_session';
export const MIN_PASSWORD = 8;

export interface SessionUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  provider: 'email' | 'google';
}

declare module 'fastify' {
  interface FastifyRequest {
    user: SessionUser | null;
  }
}

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
export const randomToken = () => crypto.randomBytes(32).toString('base64url');

// bcrypt no mesmo formato do Supabase ($2a$/$2b$, custo 10): as senhas
// importadas continuam funcionando.
export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const checkPassword = (password: string, hash: string | null) =>
  hash ? bcrypt.compare(password, hash) : Promise.resolve(false);

export async function createSession(db: Db, reply: FastifyReply, userId: string) {
  const token = randomToken();
  const expires = new Date(Date.now() + config.sessionDays * 86400_000);
  await db.query('INSERT INTO auth.sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [
    userId, sha256(token), expires,
  ]);
  await db.query('UPDATE auth.users SET last_sign_in_at = now() WHERE id = $1', [userId]);
  reply.setCookie(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
    expires,
  });
}

export async function destroySession(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies[SESSION_COOKIE];
  if (token) await asSystem((db) => db.query('DELETE FROM auth.sessions WHERE token_hash = $1', [sha256(token)]));
  reply.clearCookie(SESSION_COOKIE, { path: '/' });
}

/** Lê o cookie e carrega o usuário da sessão (ou null). */
export async function loadSessionUser(request: FastifyRequest): Promise<SessionUser | null> {
  const token = request.cookies[SESSION_COOKIE];
  if (!token) return null;
  return asSystem(async (db) => {
    const { rows } = await db.query(
      `UPDATE auth.sessions s SET last_seen_at = now()
         FROM auth.users u
        WHERE s.token_hash = $1 AND s.expires_at > now() AND u.id = s.user_id
       RETURNING u.id, u.email, u.created_at, u.last_sign_in_at,
         (u.encrypted_password IS NULL AND EXISTS (
            SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'google')) AS google_only`,
      [sha256(token)],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      created_at: row.created_at,
      last_sign_in_at: row.last_sign_in_at,
      provider: row.google_only ? 'google' : 'email',
    };
  });
}

export async function isAdmin(db: Db, userId: string) {
  const { rows } = await db.query("SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'admin') AS ok", [userId]);
  return rows[0].ok as boolean;
}

/** Cria um código de uso único e devolve o valor que vai no link do e-mail. */
export async function createOneTimeToken(db: Db, userId: string, purpose: 'confirm_email' | 'reset_password') {
  const token = randomToken();
  const hours = purpose === 'confirm_email' ? 48 : 1;
  // Um código ativo por finalidade
  await db.query('DELETE FROM auth.one_time_tokens WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL', [userId, purpose]);
  await db.query(
    `INSERT INTO auth.one_time_tokens (user_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, $3, now() + make_interval(hours => $4))`,
    [userId, purpose, sha256(token), hours],
  );
  return token;
}

/** Valida e consome um código. Devolve o id do usuário ou null. */
export async function consumeOneTimeToken(db: Db, token: string, purpose: 'confirm_email' | 'reset_password') {
  const { rows } = await db.query(
    `UPDATE auth.one_time_tokens SET used_at = now()
      WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now()
     RETURNING user_id`,
    [sha256(token), purpose],
  );
  return (rows[0]?.user_id as string | undefined) ?? null;
}

export function generateTempPassword(length = 12) {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%&*'];
  const all = sets.join('');
  const chars = sets.map((s) => s[crypto.randomInt(s.length)]);
  while (chars.length < length) chars.push(all[crypto.randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export const normalizeEmail = (email: unknown) => String(email ?? '').trim().toLowerCase();
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

/** Aceita só caminhos internos do site como destino depois do login */
export function safeRedirect(value: unknown, fallback = '/meu-perfil') {
  const v = String(value ?? '');
  return v.startsWith('/') && !v.startsWith('//') && !v.includes('\\') ? v : fallback;
}
