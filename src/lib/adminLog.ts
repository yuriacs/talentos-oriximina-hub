// Registro de ações administrativas que envolvem dados pessoais
// (prestação de contas, LGPD art. 6º, X, e art. 37).
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export async function logAdminAction(action: string, details: Record<string, unknown> = {}, targetId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action,
    target_id: targetId ?? null,
    details: details as Json,
  });
  if (error) console.error('Falha ao registrar log administrativo', error);
}
