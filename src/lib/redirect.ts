// Para onde voltar depois do login/cadastro (?redirect=/cadastro-empresa).
// Só aceita caminhos internos, para não virar um redirecionamento aberto.
export function getRedirectPath(search: string): string | null {
  const value = new URLSearchParams(search).get('redirect');
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export function withRedirect(path: string, redirect: string | null | undefined): string {
  return redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;
}
