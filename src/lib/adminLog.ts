// Registro de ações administrativas que envolvem dados pessoais
// (prestação de contas, LGPD art. 6º, X, e art. 37).
import { authApi, db } from '@/lib/api';
import type { Json } from '@/lib/database.types';

export async function logAdminAction(action: string, details: Record<string, unknown> = {}, targetId?: string) {
  const user = (await authApi.me()).data?.user;
  if (!user) return;
  const { error } = await db.from('admin_logs').insert({
    admin_id: user.id,
    action,
    target_id: targetId ?? null,
    details: details as Json,
  });
  if (error) console.error('Falha ao registrar log administrativo', error);
}
