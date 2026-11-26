import { config, emailEnabled, googleEnabled } from './config.js';
import { migrate } from './migrate.js';
import { buildApp } from './app.js';
import { verifySmtp } from './mail.js';

await migrate();
const app = await buildApp();
await app.listen({ port: config.port, host: config.host });
console.log(`API do Observatório ouvindo em ${config.host}:${config.port}`);
if (!emailEnabled()) {
  console.warn('SMTP não configurado: cadastros são confirmados na hora e a recuperação de senha por e-mail fica desligada.');
} else {
  const smtpError = await verifySmtp();
  if (smtpError) console.error(`ERRO NO SMTP: não foi possível entrar no servidor de e-mail (${smtpError}). Confira SMTP_* no .env.`);
  else console.log(`SMTP ok: e-mails saem de ${config.smtp.user}`);
}
if (!googleEnabled()) console.warn('Login com Google desligado (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET ausentes).');
