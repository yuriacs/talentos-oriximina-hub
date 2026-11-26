// Máscaras, validações e normalização de links usadas nos cadastros.

export const onlyDigits = (v: string) => v.replace(/\D/g, '');

export function maskCNPJ(v: string) {
  return onlyDigits(v)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCEP(v: string) {
  return onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

/** CNPJ com dígitos verificadores válidos. */
export function isValidCNPJ(v: string) {
  const d = onlyDigits(v);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const digit = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + w * Number(d[i]), 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return digit(12) === Number(d[12]) && digit(13) === Number(d[13]);
}

/** Telefone com DDD: 10 (fixo) ou 11 (celular) dígitos. */
export function isValidPhone(v: string) {
  const n = onlyDigits(v).length;
  return n === 10 || n === 11;
}

/** "www.site.com" → "https://www.site.com"; vazio continua vazio. */
export function normalizeUrl(v: string) {
  const t = v.trim();
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function isValidUrl(v: string) {
  if (!v.trim()) return true;
  try {
    const url = new URL(normalizeUrl(v));
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

/** "@empresa", "empresa" ou o link do perfil → "https://instagram.com/empresa". */
export function normalizeInstagram(v: string) {
  const t = v.trim();
  if (!t) return '';
  const handle = t
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '');
  return handle ? `https://instagram.com/${handle}` : '';
}
