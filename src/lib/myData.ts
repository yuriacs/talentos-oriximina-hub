// Exporta todos os dados de quem está logado (direito de acesso e
// portabilidade, LGPD art. 18, II e V) e apaga a conta (art. 18, VI).
import { supabase } from '@/integrations/supabase/client';
import { CONTROLLER_NAME, DPO_EMAIL } from '@/lib/privacy';

const PROFILE_TABLES = [
  'education', 'skills', 'soft_skills', 'experiences', 'projects',
  'certifications', 'languages', 'availability',
] as const;

export async function collectMyData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Você precisa estar logado');

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw error;

  const related: Record<string, unknown[]> = {};
  if (profile) {
    for (const table of PROFILE_TABLES) {
      const { data } = await supabase.from(table as never).select('*').eq('profile_id', profile.id);
      related[table] = (data ?? []) as unknown[];
    }
    const { data: sent } = await supabase.from('messages').select('*').eq('sender_id', profile.id);
    const { data: received } = await supabase.from('messages').select('*').eq('receiver_id', profile.id);
    related.mensagens_enviadas = sent ?? [];
    related.mensagens_recebidas = received ?? [];
  }

  const { data: companies } = await supabase.from('companies').select('*').eq('user_id', user.id);
  const { data: consents } = await supabase.from('consent_records').select('document, version, granted, created_at').eq('user_id', user.id);

  return {
    gerado_em: new Date().toISOString(),
    controlador: CONTROLLER_NAME,
    contato_encarregado: DPO_EMAIL,
    conta: {
      id: user.id,
      email: user.email,
      criada_em: user.created_at,
      ultimo_acesso: user.last_sign_in_at,
      provedor_login: user.app_metadata?.provider,
    },
    perfil: profile,
    ...related,
    empresas: companies ?? [],
    consentimentos: consents ?? [],
  };
}

async function removeOwnFiles(bucket: string, userId: string) {
  const { data } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
  const paths = (data ?? []).map((f) => `${userId}/${f.name}`);
  if (paths.length) await supabase.storage.from(bucket).remove(paths);
}

export async function deleteMyAccount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Você precisa estar logado');

  // Arquivos primeiro: depois de apagar a conta não há mais permissão para isso
  await removeOwnFiles('avatars', user.id);
  await removeOwnFiles('company-logos', user.id);

  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  await supabase.auth.signOut();
}
