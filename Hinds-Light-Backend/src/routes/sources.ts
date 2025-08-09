import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { enqueueIngestSource } from '../queues/ingestQueue.js';
import { ok } from '../utils/apiResponse.js';

export async function registerSourcesRoutes(app: FastifyInstance) {
  app.get('/api/v1/sources', async () => {
    const sources = await prisma.source.findMany({ orderBy: { createdAt: 'desc' } });
    return ok(sources);
  });

  const bodySchema = z.object({
    type: z.literal('RSS'),
    name: z.string().min(1),
    url: z.string().url(),
    language: z.string().default('he'),
    active: z.boolean().default(true)
  });

  app.post('/api/v1/sources', async (req, reply) => {
    const body = bodySchema.parse(req.body);
    const source = await prisma.source.create({
      data: {
        type: 'RSS',
        name: body.name,
        url: body.url,
        language: body.language,
        active: body.active
      }
    });
    await enqueueIngestSource(source.id);
    reply.code(201);
    return ok(source);
  });
}






