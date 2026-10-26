// Exporta todas as tabelas do banco (com a sessão de admin) e a lista de
// usuários do Auth, para migrar o site para outro projeto Supabase.
import { supabase } from '@/integrations/supabase/client';

// Ordem de importação: tabelas referenciadas vêm antes das que referenciam
export const EXPORT_TABLES = [
  'user_roles',
  'profiles',
  'education',
  'skills',
  'soft_skills',
  'experiences',
  'projects',
  'certifications',
  'languages',
  'availability',
  'companies',
  'messages',
  'reports',
  'admin_logs',
  'survey_questions',
  'survey_responses',
] as const;

const PAGE_SIZE = 1000;
// A função admin-user-management devolve no máximo 200 usuários
const USER_LIST_LIMIT = 200;

export interface ExportUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export interface FullExport {
  exported_at: string;
  source_url: string;
  users: ExportUser[];
  users_may_be_truncated: boolean;
  tables: Record<string, Record<string, unknown>[]>;
  skipped_tables: string[];
}

async function fetchTable(table: string): Promise<Record<string, unknown>[] | null> {
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table as never)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      // Tabela que não existe neste banco (ex.: pesquisa ainda não migrada)
      if (error.code === 'PGRST205' || error.code === '42P01') return null;
      throw new Error(`${table}: ${error.message}`);
    }
    rows.push(...((data ?? []) as Record<string, unknown>[]));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

export async function exportAllData(onProgress?: (step: string) => void): Promise<FullExport> {
  onProgress?.('usuários');
  const { data, error } = await supabase.functions.invoke('admin-user-management', {
    body: { action: 'list_users', search: '' },
  });
  if (error) throw new Error(`usuários: ${error.message}`);
  const users = ((data as { users?: ExportUser[] })?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    email_confirmed_at: u.email_confirmed_at,
  }));

  const tables: FullExport['tables'] = {};
  const skipped: string[] = [];
  for (const table of EXPORT_TABLES) {
    onProgress?.(table);
    const rows = await fetchTable(table);
    if (rows === null) skipped.push(table);
    else tables[table] = rows;
  }

  return {
    exported_at: new Date().toISOString(),
    source_url: import.meta.env.VITE_SUPABASE_URL,
    users,
    users_may_be_truncated: users.length >= USER_LIST_LIMIT,
    tables,
    skipped_tables: skipped,
  };
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
