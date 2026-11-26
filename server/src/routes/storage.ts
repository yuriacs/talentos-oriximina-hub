// Fotos de perfil e logos de empresas, gravadas no disco do servidor.
// Cada usuário só envia, lista e apaga arquivos dentro da própria pasta
// (<bucket>/<id do usuário>/...), como era a regra no Supabase Storage.
import fs from 'node:fs/promises';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';

export const BUCKETS = ['avatars', 'company-logos'] as const;
const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
};

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;

/** Caminho seguro dentro do bucket, obrigatoriamente na pasta do usuário */
function resolvePath(bucket: string, relative: string, userId: string) {
  if (!(BUCKETS as readonly string[]).includes(bucket)) return null;
  const parts = relative.split('/');
  if (parts.length < 2 || parts[0] !== userId || !parts.every((s) => SEGMENT.test(s))) return null;
  return path.join(config.uploadsDir, bucket, ...parts);
}

/** Apaga todas as fotos e logos de um usuário (exclusão de conta) */
export async function removeUserFiles(userId: string) {
  if (!/^[0-9a-f-]{36}$/.test(userId)) return;
  for (const bucket of BUCKETS) {
    await fs.rm(path.join(config.uploadsDir, bucket, userId), { recursive: true, force: true });
  }
}

export async function storageRoutes(app: FastifyInstance) {
  app.post<{ Params: { bucket: string } }>('/api/storage/:bucket', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ message: 'Faça login para enviar arquivos' });
    const file = await request.file({ limits: { fileSize: MAX_BYTES, files: 1 } });
    if (!file) return reply.code(400).send({ message: 'Nenhum arquivo enviado' });
    if (!IMAGE_TYPES[file.mimetype]) return reply.code(400).send({ message: 'Envie uma imagem JPG, PNG, WEBP ou GIF' });

    const requested = String((file.fields.path as { value?: string } | undefined)?.value ?? '');
    const target = resolvePath(request.params.bucket, requested, request.user.id);
    if (!target) return reply.code(403).send({ message: 'Caminho de arquivo não permitido' });

    const buffer = await file.toBuffer();
    if (file.file.truncated) return reply.code(400).send({ message: 'A imagem deve ter no máximo 5MB' });
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
    return { path: requested, publicUrl: `/uploads/${request.params.bucket}/${requested}` };
  });

  app.get<{ Params: { bucket: string }; Querystring: { prefix?: string } }>('/api/storage/:bucket', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ message: 'Faça login' });
    const dir = resolvePath(request.params.bucket, `${request.user.id}/x`, request.user.id);
    if (!dir) return reply.code(403).send({ message: 'Não permitido' });
    const names = await fs.readdir(path.dirname(dir)).catch(() => [] as string[]);
    return { data: names.map((name) => ({ name })) };
  });

  app.delete<{ Params: { bucket: string } }>('/api/storage/:bucket', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ message: 'Faça login' });
    const paths = ((request.body ?? {}) as { paths?: string[] }).paths ?? [];
    for (const p of paths) {
      const target = resolvePath(request.params.bucket, String(p), request.user.id);
      if (!target) return reply.code(403).send({ message: 'Caminho de arquivo não permitido' });
      await fs.rm(target, { force: true });
    }
    return { ok: true };
  });
}
