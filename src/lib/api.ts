// Cliente da API do Observatório (server/). O site fala só com o nosso
// servidor, que acessa o Postgres aplicando as regras de segurança do banco.
//
// db.from('tabela').select().eq('coluna', valor) funciona como antes;
// o resultado é sempre { data, error, count }.
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type Row<T> = T extends TableName ? Tables[T]['Row'] : Record<string, any>;

export interface ApiError { message: string; code?: string; hint?: string; details?: string; status?: number }
export interface ApiResult<T> { data: T | null; error: ApiError | null; count?: number | null }

async function request<T>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const isForm = body instanceof FormData;
    const res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: {
        'x-obs-client': '1',
        ...(body !== undefined && !isForm ? { 'content-type': 'application/json' } : {}),
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: { message: json.message ?? `Erro ${res.status}`, code: json.code, hint: json.hint, details: json.details, status: res.status } };
    return { data: (json.data !== undefined ? json.data : json) as T, error: null, count: json.count ?? null };
  } catch (err) {
    return { data: null, error: { message: 'Sem conexão com o servidor. Tente de novo.', details: String(err) } };
  }
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body: unknown = {}) => request<T>('POST', url, body),
  delete: <T>(url: string, body?: unknown) => request<T>('DELETE', url, body),
};

// ---------------------------------------------------------------- consultas

type Filter = { column: string; op: string; value: unknown };

class Query<R, D = R[]> implements PromiseLike<ApiResult<D>> {
  private spec: Record<string, any>;

  constructor(table: string) {
    this.spec = { table, action: 'select', filters: [] as Filter[], order: [] as { column: string; ascending: boolean }[] };
  }

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    // Depois de insert/update/delete, .select() não devolve linhas: é ignorado
    if (this.spec.action === 'select') {
      this.spec.columns = columns;
      if (options?.count) this.spec.count = options.count;
      if (options?.head) this.spec.head = true;
    }
    return this;
  }
  insert(values: Partial<R> | Partial<R>[]) { this.spec.action = 'insert'; this.spec.values = values; return this; }
  upsert(values: Partial<R> | Partial<R>[], options?: { onConflict?: string }) {
    this.spec.action = 'upsert'; this.spec.values = values; this.spec.onConflict = options?.onConflict; return this;
  }
  update(values: Partial<R>) { this.spec.action = 'update'; this.spec.values = values; return this; }
  delete() { this.spec.action = 'delete'; return this; }

  private filter(column: string, op: string, value: unknown) { this.spec.filters.push({ column, op, value }); return this; }
  eq(column: string, value: unknown) { return this.filter(column, 'eq', value); }
  neq(column: string, value: unknown) { return this.filter(column, 'neq', value); }
  in(column: string, values: readonly unknown[]) { return this.filter(column, 'in', values); }
  ilike(column: string, pattern: string) { return this.filter(column, 'ilike', pattern); }
  is(column: string, value: null | boolean) { return this.filter(column, 'is', value); }
  gte(column: string, value: unknown) { return this.filter(column, 'gte', value); }
  lte(column: string, value: unknown) { return this.filter(column, 'lte', value); }
  match(values: Record<string, unknown>) { Object.entries(values).forEach(([k, v]) => this.eq(k, v)); return this; }

  order(column: string, options?: { ascending?: boolean }) {
    this.spec.order.push({ column, ascending: options?.ascending !== false }); return this;
  }
  limit(n: number) { this.spec.limit = n; return this; }
  range(from: number, to: number) { this.spec.offset = from; this.spec.limit = to - from + 1; return this; }

  /** Uma linha ou null */
  maybeSingle(): PromiseLike<ApiResult<R | null>> {
    this.spec.single = true; return this as unknown as PromiseLike<ApiResult<R | null>>;
  }
  /** Exatamente uma linha (erro se não houver) */
  single(): PromiseLike<ApiResult<R>> {
    this.spec.single = true;
    return this.run().then((r) => (r.error || r.data ? r : { data: null, error: { message: 'Nenhuma linha encontrada', code: 'PGRST116' } })) as PromiseLike<ApiResult<R>>;
  }

  private run() { return request<D>('POST', '/api/db', this.spec); }

  then<A = ApiResult<D>, B = never>(onfulfilled?: ((value: ApiResult<D>) => A | PromiseLike<A>) | null, onrejected?: ((reason: unknown) => B | PromiseLike<B>) | null) {
    return this.run().then(onfulfilled, onrejected);
  }
}

export const db = {
  from<T extends TableName | (string & {})>(table: T) { return new Query<Row<T>>(table); },
  rpc<T = any>(fn: string, args: Record<string, unknown> = {}) { return request<T>('POST', `/api/rpc/${fn}`, args); },
};

// ---------------------------------------------------------------- arquivos

const IMAGE_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export const storage = {
  /** Extensão de arquivo a partir do tipo da imagem (null se o servidor não aceita esse tipo) */
  imageExtension(file: File) { return IMAGE_EXT[file.type] ?? null; },

  /** Envia uma imagem para <bucket>/<caminho>; o caminho deve começar com o id do usuário. */
  async upload(bucket: 'avatars' | 'company-logos', path: string, file: File) {
    const form = new FormData();
    form.append('path', path);
    form.append('file', file);
    return request<{ path: string; publicUrl: string }>('POST', `/api/storage/${bucket}`, form);
  },
  list(bucket: 'avatars' | 'company-logos') { return request<{ name: string }[]>('GET', `/api/storage/${bucket}`); },
  remove(bucket: 'avatars' | 'company-logos', paths: string[]) { return request('DELETE', `/api/storage/${bucket}`, { paths }); },
};

// ---------------------------------------------------------------- contas

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  provider: 'email' | 'google';
}

export const authApi = {
  me: () => request<{ user: AuthUser | null; isAdmin: boolean }>('GET', '/api/auth/me'),
  providers: () => request<{ google: boolean; emailConfirmation: boolean }>('GET', '/api/auth/providers'),
  signUp: (body: { email: string; password: string; full_name: string; terms_version: string; age_confirmed: boolean; redirect?: string | null }) =>
    request<{ needsConfirmation: boolean }>('POST', '/api/auth/signup', body),
  signIn: (email: string, password: string) => request('POST', '/api/auth/login', { email, password }),
  signOut: () => request('POST', '/api/auth/logout', {}),
  recover: (email: string) => request('POST', '/api/auth/recover', { email }),
  resetPassword: (token: string, password: string) => request('POST', '/api/auth/reset', { token, password }),
  changePassword: (password: string) => request('POST', '/api/auth/password', { password }),
  googleUrl: (redirect?: string | null) => `/api/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`,
  deleteAccount: () => request('POST', '/api/me/delete', {}),
};

// ---------------------------------------------------------------- admin

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  profile_id: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export const adminApi = {
  listUsers: (search = '', limit?: number) =>
    request<{ users: AdminUser[] }>('GET', `/api/admin/users?search=${encodeURIComponent(search)}${limit ? `&limit=${limit}` : ''}`),
  resetPassword: (userId: string) => request<{ temp_password: string }>('POST', '/api/admin/users/reset-password', { user_id: userId }),
  sendRecoveryLink: (email: string) => request('POST', '/api/admin/users/send-recovery-link', { email }),
};
