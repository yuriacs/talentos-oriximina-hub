import { config, emailEnabled, googleEnabled } from './config.js';
import { migrate } from './migrate.js';
import { buildApp } from './app.js';

await migrate();
const app = await buildApp();
await app.listen({ port: config.port, host: config.host });
console.log(`API do Observatório ouvindo em ${config.host}:${config.port}`);
if (!emailEnabled()) console.warn('SMTP não configurado: cadastros são confirmados na hora e a recuperação de senha por e-mail fica desligada.');
if (!googleEnabled()) console.warn('Login com Google desligado (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET ausentes).');
