import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { ok } from '../utils/apiResponse.js';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().optional(),
  sourceId: z.string().optional(),
  lang: z.enum(['en', 'he']).default('en')
});

export async function registerItemsRoutes(app: FastifyInstance) {
  app.get('/api/v1/items', async (req) => {
    const parsed = listQuerySchema.parse(req.query);
    const where: Record<string, unknown> = {};
    if (parsed.sourceId) where.sourceId = parsed.sourceId;

    const take = parsed.limit;
    const cursor = parsed.before ? { id: parsed.before } : undefined;

    const items = await prisma.contentItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor } : {})
    });

    const mapped = items.map((i) => ({
      id: i.id,
      sourceId: i.sourceId,
      type: i.type,
      title: i.title,
      url: i.url,
      publishedAt: i.publishedAt,
      language: parsed.lang,
      text: parsed.lang === 'en' ? i.translatedText ?? i.originalText : i.originalText
    }));

    return ok({
      items: mapped,
      nextCursor: items.length === take ? items[items.length - 1]?.id ?? null : null
    });
  });

  app.get('/api/v1/items/:id', async (req) => {
    const { id } = req.params as { id: string };
    const item = await prisma.contentItem.findUnique({ where: { id } });
    if (!item) return ok(null as any);
    return ok({ item });
  });
}






