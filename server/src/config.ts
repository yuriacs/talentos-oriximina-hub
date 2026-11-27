// Configuração lida das variáveis de ambiente (veja server/.env.example).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// Funciona tanto rodando o .ts (src/) quanto o compilado (dist/src/)
const serverRoot = here.includes(`${path.sep}dist${path.sep}`)
  ? path.resolve(here, '..', '..')
  : path.resolve(here, '..');

// Em desenvolvimento, lê server/.env (no Docker as variáveis vêm do compose)
try { process.loadEnvFile(path.join(serverRoot, '.env')); } catch { /* sem arquivo .env */ }

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  isProduction,
  port: Number(env('PORT', '3000')),
  host: env('HOST', '0.0.0.0'),
  databaseUrl: env('DATABASE_URL', 'postgres://postgres@localhost:5432/observatorio'),
  /** Endereço público do site, sem barra no fim (links de e-mail e do Google) */
  appUrl: env('APP_URL', 'http://localhost:8080').replace(/\/$/, ''),
  migrationsDir: env('MIGRATIONS_DIR', path.resolve(serverRoot, '..', 'db', 'migrations')),
  uploadsDir: env('UPLOADS_DIR', path.resolve(serverRoot, 'uploads')),
  cookieSecure: env('COOKIE_SECURE', isProduction ? 'true' : 'false') === 'true',
  sessionDays: Number(env('SESSION_DAYS', '30')),
  /** Quantos proxies ficam na frente da API (Caddy ou Nginx do servidor + nginx do container) */
  trustProxyHops: Number(env('TRUST_PROXY_HOPS', '2')),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Observatório da Juventude <semju@oriximina.pa.gov.br>',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
};

/** Sem SMTP completo não dá para mandar e-mail: o cadastro é confirmado na hora. */
export const emailEnabled = () => !!(config.smtp.host && config.smtp.user && config.smtp.pass);
export const googleEnabled = () => !!(config.google.clientId && config.google.clientSecret);
