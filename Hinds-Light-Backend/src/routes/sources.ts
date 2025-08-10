import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { enqueueIngestSource } from '../queues/ingestQueue.js';
import { ok } from '../utils/apiResponse.js';

export async function registerSourcesRoutes(app: FastifyInstance) {
  // Get all sources with optional category filtering
  app.get('/api/v1/sources', async (req) => {
    const querySchema = z.object({
      category: z.string().optional(),
      active: z.string().optional().transform((val) => val ? val === 'true' : undefined)
    });
    
    const query = querySchema.parse(req.query);
    
    const where: any = {};
    if (query.active !== undefined) {
      where.active = query.active;
    }
    
    // If filtering by category, we need sources that have items with that category
    if (query.category) {
      where.items = {
        some: {
          translatedTags: {
            has: query.category
          }
        }
      };
    }
    
    const sources = await prisma.source.findMany({ 
      where,
      include: {
        _count: {
          select: { items: true }
        },
        items: {
          select: { translatedTags: true },
          where: {
            translatedTags: {
              isEmpty: false
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' } 
    });

    // Transform to include unique categories for each source
    const sourcesWithCategories = sources.map((source: any) => {
      const allTags = source.items.flatMap((item: any) => item.translatedTags);
      const categories = [...new Set(allTags)]
        .filter((tag): tag is string => tag != null && typeof tag === 'string' && tag.trim() !== '')
        .sort();
      
      // Remove items from response to keep it clean
      const { items, ...sourceWithoutItems } = source;
      return {
        ...sourceWithoutItems,
        categories
      };
    });

    return ok(sourcesWithCategories);
  });

  // Get unique categories from RSS feed content (translated to English)
  app.get('/api/v1/sources/categories', async () => {
    // Get all unique translated tags from content items of active sources
    const result = await prisma.contentItem.findMany({
      select: { translatedTags: true },
      where: {
        source: {
          active: true,
          type: 'RSS'
        },
        translatedTags: {
          isEmpty: false
        }
      }
    });
    
    // Flatten all translated tags and get unique values
    const allTags = result.flatMap((item: any) => item.translatedTags);
    const uniqueCategories = [...new Set(allTags)]
      .filter((tag): tag is string => tag != null && typeof tag === 'string' && tag.trim() !== '')
      .sort();
    
    return ok(uniqueCategories);
  });

  // Get categories for a specific source (translated to English)
  app.get('/api/v1/sources/:id/categories', async (req) => {
    const { id } = req.params as { id: string };
    
    const result = await prisma.contentItem.findMany({
      select: { translatedTags: true },
      where: {
        sourceId: id,
        translatedTags: {
          isEmpty: false
        }
      }
    });
    
    // Flatten all translated tags and get unique values for this source
    const allTags = result.flatMap((item: any) => item.translatedTags);
    const uniqueCategories = [...new Set(allTags)]
      .filter((tag): tag is string => tag != null && typeof tag === 'string' && tag.trim() !== '')
      .sort();
    
    return ok(uniqueCategories);
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

  // Trigger reingestion for a specific source
  app.post('/api/v1/sources/:id/reingest', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const source = await prisma.source.findUnique({ where: { id } });
    if (!source) {
      reply.code(404);
      return ok({ error: 'Source not found' });
    }
    
    if (!source.active || source.type !== 'RSS' || !source.url) {
      reply.code(400);
      return ok({ error: 'Source is not an active RSS feed' });
    }
    
    await enqueueIngestSource(source.id);
    return ok({ message: `Reingestion enqueued for source: ${source.name}` });
  });

  // Trigger reingestion for all active RSS sources
  app.post('/api/v1/sources/reingest-all', async () => {
    const sources = await prisma.source.findMany({
      where: { active: true, type: 'RSS', NOT: { url: null } }
    });
    
    let enqueuedCount = 0;
    for (const source of sources) {
      await enqueueIngestSource(source.id);
      enqueuedCount++;
    }
    
    return ok({ 
      message: `Reingestion enqueued for ${enqueuedCount} RSS sources`,
      enqueuedSources: sources.map(s => ({ id: s.id, name: s.name }))
    });
  });
}






