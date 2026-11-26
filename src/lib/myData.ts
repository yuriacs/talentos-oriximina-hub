// Exporta todos os dados de quem está logado (direito de acesso e
// portabilidade, LGPD art. 18, II e V) e apaga a conta (art. 18, VI).
import { authApi, db } from '@/lib/api';
import { CONTROLLER_NAME, DPO_EMAIL } from '@/lib/privacy';

const PROFILE_TABLES = [
  'education', 'skills', 'soft_skills', 'experiences', 'projects',
  'certifications', 'languages', 'availability',
] as const;

export async function collectMyData() {
  const user = (await authApi.me()).data?.user;
  if (!user) throw new Error('Você precisa estar logado');

  const { data: profile, error } = await db.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw error;

  const related: Record<string, unknown[]> = {};
  if (profile) {
    for (const table of PROFILE_TABLES) {
      const { data } = await db.from(table as never).select('*').eq('profile_id', profile.id);
      related[table] = (data ?? []) as unknown[];
    }
    const { data: sent } = await db.from('messages').select('*').eq('sender_id', profile.id);
    const { data: received } = await db.from('messages').select('*').eq('receiver_id', profile.id);
    related.mensagens_enviadas = sent ?? [];
    related.mensagens_recebidas = received ?? [];
  }

  const { data: companies } = await db.from('companies').select('*').eq('user_id', user.id);
  const { data: consents } = await db.from('consent_records').select('document, version, granted, created_at').eq('user_id', user.id);

  return {
    gerado_em: new Date().toISOString(),
    controlador: CONTROLLER_NAME,
    contato_encarregado: DPO_EMAIL,
    conta: {
      id: user.id,
      email: user.email,
      criada_em: user.created_at,
      ultimo_acesso: user.last_sign_in_at,
      provedor_login: user.provider,
    },
    perfil: profile,
    ...related,
    empresas: companies ?? [],
    consentimentos: consents ?? [],
  };
}

/** Apaga a conta no servidor: dados do banco, fotos, logos e sessões. */
export async function deleteMyAccount() {
  const { error } = await authApi.deleteAccount();
  if (error) throw new Error(error.message);
}
