// Monta o servidor (separado de index.ts para poder ser usado nos testes).
import fs from 'node:fs/promises';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { config } from './config.js';
import { loadSessionUser } from './auth.js';
import { authRoutes } from './routes/auth.js';
import { dataRoutes } from './routes/data.js';
import { storageRoutes } from './routes/storage.js';
import { adminRoutes } from './routes/admin.js';

export async function buildApp() {
  const app = Fastify({
    logger: config.isProduction ? { level: 'info' } : { level: 'warn' },
    // Atrás do nginx: usa o IP real do visitante para o limite de tentativas
    trustProxy: true,
    bodyLimit: 2 * 1024 * 1024,
  });

  await app.register(cookie);
  await app.register(multipart);
  await app.register(rateLimit, { global: true, max: 300, timeWindow: '1 minute' });

  app.decorateRequest('user', null);

  app.addHook('onRequest', async (request, reply) => {
    // Proteção contra CSRF: pedidos que alteram dados precisam vir do próprio
    // site (fetch com este cabeçalho, que outro site não consegue enviar).
    if (request.url.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
        && request.headers['x-obs-client'] !== '1') {
      return reply.code(403).send({ message: 'Pedido recusado' });
    }
    request.user = await loadSessionUser(request);
  });

  // Fotos e logos públicos
  await fs.mkdir(config.uploadsDir, { recursive: true });
  await app.register(fastifyStatic, {
    root: config.uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
    index: false,
    maxAge: '1h',
  });

  await app.register(storageRoutes);
  await app.register(authRoutes);
  await app.register(dataRoutes);
  await app.register(adminRoutes);

  app.get('/api/health', async () => ({ ok: true }));

  app.setErrorHandler((err, request, reply) => {
    request.log.error(err);
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    const expose = status < 500 || (err as { expose?: boolean }).expose;
    reply.code(status).send({ message: expose ? (err as Error).message : 'Erro interno do servidor' });
  });

  return app;
}
