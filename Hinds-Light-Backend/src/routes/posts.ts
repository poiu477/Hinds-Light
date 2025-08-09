import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse.js';

const getPostsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['timestamp', 'engagement', 'sentiment']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  query: z.string().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  platform: z.enum(['x', 'news', 'court', 'political']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  verified: z.coerce.boolean().optional(),
  minEngagement: z.coerce.number().optional()
});

export async function registerPostsRoutes(app: FastifyInstance) {
  // Map platform to our SourceType/ContentType for now ('news' -> RSS/ARTICLE)
  const platformWhereMap: Record<string, object> = {
    news: { type: 'ARTICLE' }
  };

  app.get('/api/posts', async (req) => {
    const q = getPostsQuery.parse(req.query);

    const where: any = {};
    if (q.query) where.OR = [{ title: { contains: q.query } }, { originalText: { contains: q.query } }, { translatedText: { contains: q.query } }];
    if (q.sentiment) where.sentiment = q.sentiment;
    if (q.verified !== undefined) where.verified = q.verified;
    if (q.tags?.length) where.tags = { hasSome: q.tags };
    if (q.platform) Object.assign(where, platformWhereMap[q.platform] ?? {});
    if (q.dateFrom || q.dateTo) where.publishedAt = {
      ...(q.dateFrom ? { gte: new Date(q.dateFrom) } : {}),
      ...(q.dateTo ? { lte: new Date(q.dateTo) } : {})
    };
    if (q.author) where.OR = [...(where.OR ?? []), { authorUsername: { contains: q.author } }, { authorDisplayName: { contains: q.author } }];
    if (q.minEngagement) where.AND = [
      ...(where.AND ?? []),
      { OR: [
        { metricsLikes: { gte: q.minEngagement } },
        { metricsShares: { gte: q.minEngagement } },
        { metricsReplies: { gte: q.minEngagement } }
      ] }
    ];

    const page = q.page;
    const limit = q.limit;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.contentItem.count({ where }),
      prisma.contentItem.findMany({
        where,
        orderBy:
          q.sortBy === 'timestamp'
            ? { publishedAt: q.sortOrder }
            : q.sortBy === 'engagement'
            ? { metricsLikes: q.sortOrder }
            : { sentiment: q.sortOrder },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return ok(items, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  });

  app.get('/api/posts/:id', async (req) => {
    const { id } = req.params as { id: string };
    const item = await prisma.contentItem.findUnique({ where: { id } });
    if (!item) return fail('NOT_FOUND');
    return ok(item);
  });
}


