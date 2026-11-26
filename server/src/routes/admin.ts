// Gestão de usuários pelo painel administrativo (substitui a antiga
// Edge Function "admin-user-management" do Supabase).
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config, emailEnabled } from '../config.js';
import { asSystem } from '../db.js';
import { createOneTimeToken, generateTempPassword, hashPassword, isAdmin, normalizeEmail } from '../auth.js';
import { sendPasswordResetEmail } from '../mail.js';

async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) { reply.code(401).send({ message: 'Faça login' }); return false; }
  const ok = await asSystem((db) => isAdmin(db, request.user!.id));
  if (!ok) { reply.code(403).send({ message: 'Acesso restrito a administradores' }); return false; }
  return true;
}

const log = (adminId: string, action: string, targetId: string | null, details: object = {}) =>
  asSystem((db) => db.query('INSERT INTO public.admin_logs (admin_id, action, target_id, details) VALUES ($1, $2, $3, $4)',
    [adminId, action, targetId, details]));

export async function adminRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { search?: string; limit?: string } }>('/api/admin/users', async (request, reply) => {
    if (!(await requireAdmin(request, reply))) return;
    const search = String(request.query.search ?? '').trim().toLowerCase();
    const limit = Math.min(Number(request.query.limit ?? 200) || 200, 10000);
    const { rows } = await asSystem((db) => db.query(
      `SELECT u.id, u.email, coalesce(p.full_name, u.raw_user_meta_data->>'full_name', '') AS full_name,
              p.id AS profile_id, u.created_at, u.last_sign_in_at, u.email_confirmed_at
         FROM auth.users u LEFT JOIN public.profiles p ON p.user_id = u.id
        WHERE $1 = '' OR lower(u.email) LIKE '%' || $1 || '%' OR lower(coalesce(p.full_name, '')) LIKE '%' || $1 || '%'
        ORDER BY u.created_at DESC LIMIT $2`, [search, limit]));
    return { users: rows };
  });

  app.post<{ Body: { user_id?: string } }>('/api/admin/users/reset-password', async (request, reply) => {
    if (!(await requireAdmin(request, reply))) return;
    const userId = String(request.body?.user_id ?? '');
    const tempPassword = generateTempPassword(12);
    const hash = await hashPassword(tempPassword);
    const found = await asSystem(async (db) => {
      const res = await db.query('UPDATE auth.users SET encrypted_password = $2, updated_at = now() WHERE id = $1', [userId, hash]);
      if (res.rowCount) await db.query('DELETE FROM auth.sessions WHERE user_id = $1', [userId]);
      return !!res.rowCount;
    });
    if (!found) return reply.code(404).send({ message: 'Usuário não encontrado' });
    await log(request.user!.id, 'admin_password_reset', userId);
    return { temp_password: tempPassword };
  });

  app.post<{ Body: { email?: string } }>('/api/admin/users/send-recovery-link', async (request, reply) => {
    if (!(await requireAdmin(request, reply))) return;
    if (!emailEnabled()) return reply.code(503).send({ message: 'Envio de e-mail não configurado no servidor (SMTP)' });
    const email = normalizeEmail(request.body?.email);
    const result = await asSystem(async (db) => {
      const { rows } = await db.query('SELECT id FROM auth.users WHERE lower(email) = $1', [email]);
      if (!rows[0]) return null;
      return { id: rows[0].id as string, token: await createOneTimeToken(db, rows[0].id, 'reset_password') };
    });
    if (!result) return reply.code(404).send({ message: 'Usuário não encontrado' });
    await sendPasswordResetEmail(email, `${config.appUrl}/reset-password?token=${result.token}`);
    await log(request.user!.id, 'admin_sent_recovery_link', result.id);
    return { ok: true };
  });
}
