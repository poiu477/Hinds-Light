import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { ok } from '../utils/apiResponse.js';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().optional(),
  sourceId: z.string().optional(),
  sourceIds: z.string().optional().transform(val => val ? val.split(',') : undefined),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
  lang: z.enum(['en', 'he']).default('en')
});

export async function registerItemsRoutes(app: FastifyInstance) {
  app.get('/api/v1/items', async (req) => {
    const parsed = listQuerySchema.parse(req.query);
    const where: Record<string, unknown> = {};
    
    // Build OR conditions for flexible filtering
    const orConditions: Array<Record<string, unknown>> = [];
    
    // Handle source filtering - support both single sourceId and multiple sourceIds
    if (parsed.sourceIds && parsed.sourceIds.length > 0) {
      orConditions.push({ sourceId: { in: parsed.sourceIds } });
    } else if (parsed.sourceId) {
      orConditions.push({ sourceId: parsed.sourceId });
    }
    
    // Handle tag filtering using translatedTags for English display
    if (parsed.tags && parsed.tags.length > 0) {
      orConditions.push({ translatedTags: { hasSome: parsed.tags } });
    }
    
    // Apply OR logic if multiple filter types are selected, otherwise use direct conditions
    if (orConditions.length > 1) {
      where.OR = orConditions;
    } else if (orConditions.length === 1) {
      Object.assign(where, orConditions[0]);
    }

    const take = parsed.limit;
    const cursor = parsed.before ? { id: parsed.before } : undefined;

    type ItemRow = {
      id: string;
      sourceId: string;
      type: string;
      title: string | null;
      url: string | null;
      publishedAt: Date | null;
      originalLanguage: string;
      originalText: string;
      translatedLanguage: string | null;
      translatedText: string | null;
      translationStatus: string;
      tags: string[];
      translatedTags: string[];
    };

    const items: ItemRow[] = await prisma.contentItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor } : {}),
      select: {
        id: true,
        sourceId: true,
        type: true,
        title: true,
        url: true,
        publishedAt: true,
        originalLanguage: true,
        originalText: true,
        translatedLanguage: true,
        translatedText: true,
        translationStatus: true,
        tags: true,
        translatedTags: true
      }
    });

    const mapped = items.map((i: ItemRow) => ({
      id: i.id,
      sourceId: i.sourceId,
      type: i.type,
      title: i.title,
      url: i.url,
      publishedAt: i.publishedAt,
      // Keep existing shape
      language: parsed.lang,
      text: parsed.lang === 'en' ? i.translatedText ?? i.originalText : i.originalText,
      // Provide both fields explicitly for clients that render both
      originalLanguage: i.originalLanguage,
      originalText: i.originalText,
      translatedLanguage: i.translatedLanguage ?? null,
      translatedText: i.translatedText ?? null,
      translationStatus: i.translationStatus,
      // Include tags for filtering and display
      tags: i.tags,
      translatedTags: i.translatedTags
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






