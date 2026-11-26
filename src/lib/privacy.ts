// Constantes de privacidade (LGPD) usadas em todo o site.
// Ao mudar a Política de Privacidade ou os Termos de forma relevante,
// atualize TERMS_VERSION: todo usuário logado verá o aviso de novo aceite.
export const TERMS_VERSION = '2026-11-26';
export const TERMS_UPDATED_LABEL = '26 de novembro de 2026';

// Texto do consentimento específico para dados sensíveis (art. 11, I)
export const SENSITIVE_CONSENT_VERSION = '2026-11-26';

export const CONTROLLER_NAME = 'Prefeitura Municipal de Oriximiná — Secretaria Municipal da Juventude (SEMJU)';
export const DPO_EMAIL = 'semju@oriximina.pa.gov.br';

export const MIN_AGE = 18;

/** Erro do banco quando falta o consentimento de dados sensíveis */
export function isSensitiveConsentError(error: { message?: string; hint?: string } | null | undefined) {
  return !!error && (error.hint === 'sensitive_consent_required' || /dados sensíveis/i.test(error.message ?? ''));
}

/** Tabela ou função ainda não criada no banco (migration não aplicada) */
export function isMissingInDatabase(error: { code?: string } | null | undefined) {
  return !!error && ['PGRST202', 'PGRST205', '42P01', '42883'].includes(error.code ?? '');
}
