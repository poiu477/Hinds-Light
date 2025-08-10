import 'dotenv/config';
import { Worker, Queue, QueueEvents } from 'bullmq';
import { bullMqConnection } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import Parser from 'rss-parser';
import { enqueueTranslation } from '../queues/translationQueue.js';
import { fetchFeedXml, politeDelay, warmUpOrigin, sanitizeXml } from '../lib/fetchFeed.js';
import { translateCategories } from '../utils/translateCategories.js';
// Avoid importing enums that may not be exported by Prisma types in this setup

type JobData = { sourceId?: string };

const queue = new Queue<JobData>('ingest', { connection: bullMqConnection });

async function ensureRepeatable() {
  await queue.add('ingest-all', {}, { repeat: { every: 5 * 60 * 1000 }, jobId: 'ingest-all' });
}
ensureRepeatable().catch(console.error);

const parser = new Parser({
  headers: {
    // Identify as Google FeedFetcher per request
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
    Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
    'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7'
  }
});

const worker = new Worker<JobData>(
  'ingest',
  async (job) => {
    if (job.name === 'ingest-source' && job.data.sourceId) {
      const source = await prisma.source.findUnique({ where: { id: job.data.sourceId } });
      if (source && source.active && source.type === 'RSS' && source.url) {
        await ingestRssSource(source.id, source.url);
      }
      return { source: source?.id };
    }
    const sources = await prisma.source.findMany({
      where: { active: true, type: 'RSS', NOT: { url: null } }
    });
    for (const src of sources) {
      await ingestRssSource(src.id, src.url as string);
    }
    return { count: sources.length };
  },
  { connection: bullMqConnection, concurrency: 1 }
);

async function ingestRssSource(sourceId: string, feedUrl: string) {
  let feed: Parser.Output<any>;
  try {
    await warmUpOrigin(feedUrl);
    const xmlRaw = await fetchFeedXml(feedUrl);
    const xml = sanitizeXml(xmlRaw);
    feed = (await parser.parseString(xml)) as Parser.Output<any>;
  } catch (err: any) {
    console.error(`[ingest] Failed to fetch/parse RSS for ${feedUrl}: ${err?.message || err}`);
    return;
  }
  for (const entry of feed.items) {
    const url = (entry.link ?? '').trim();
    const title = entry.title ?? null;
    const originalText = (
      (entry as any).contentSnippet || (entry as any).content || title || ''
    )
      .toString()
      .trim();
    if (!originalText) continue;
    
    // Extract categories from RSS entry
    const categories: string[] = [];
    if ((entry as any).categories) {
      const entryCategories = (entry as any).categories;
      if (Array.isArray(entryCategories)) {
        for (const cat of entryCategories) {
          if (typeof cat === 'string' && cat.trim()) {
            categories.push(cat.trim());
          } else if (cat && typeof cat === 'object' && cat.name && typeof cat.name === 'string') {
            categories.push(cat.name.trim());
          } else if (cat && typeof cat === 'object' && cat._ && typeof cat._ === 'string') {
            categories.push(cat._.trim());
          }
        }
      }
    }
    // Also check for category field (singular)
    if ((entry as any).category && typeof (entry as any).category === 'string') {
      categories.push((entry as any).category.trim());
    }
    
    // Translate categories from Hebrew to English
    let translatedCategories: string[] = [];
    if (categories.length > 0) {
      try {
        console.log(`[ingest] Translating ${categories.length} categories for ${url}:`, categories);
        translatedCategories = await translateCategories(categories);
        console.log(`[ingest] Translated categories:`, translatedCategories);
      } catch (error) {
        console.error(`[ingest] Failed to translate categories for ${url}:`, error);
        translatedCategories = []; // Continue with empty translated categories on error
      }
    }
    
    let publishedAt: Date | null = null;
    if ((entry as any).isoDate) {
      publishedAt = new Date((entry as any).isoDate);
    } else if (entry.pubDate) {
      const maybe = new Date(entry.pubDate);
      if (!isNaN(maybe.getTime())) publishedAt = maybe;
    }
    try {
      let item;
      if (url) {
        item = await prisma.contentItem.upsert({
          where: { url },
          create: {
            sourceId,
            type: 'ARTICLE',
            title,
            url,
            originalLanguage: 'he',
            originalText,
            translationStatus: 'PENDING',
            publishedAt: publishedAt ?? undefined,
            tags: categories,
            translatedTags: translatedCategories,
            rawJson: entry as any
          },
          update: {
            tags: categories,
            translatedTags: translatedCategories
          }
        });
      } else {
        // Fallback dedup when URL is missing: hash based on source + title + date + text length
        const crypto = await import('node:crypto');
        const hashInput = `${sourceId}|${title ?? ''}|${publishedAt?.toISOString() ?? ''}|${originalText.length}`;
        const contentHash = crypto.createHash('sha256').update(hashInput).digest('hex');
        item = await prisma.contentItem.upsert({
          where: { contentHash },
          create: {
            sourceId,
            type: 'ARTICLE',
            title,
            contentHash,
            originalLanguage: 'he',
            originalText,
            translationStatus: 'PENDING',
            publishedAt: publishedAt ?? undefined,
            tags: categories,
            translatedTags: translatedCategories,
            rawJson: entry as any
          },
          update: {
            tags: categories,
            translatedTags: translatedCategories
          }
        });
      }
      // Only enqueue translation if not already translated
      if ((item as any).translationStatus !== 'TRANSLATED' || !(item as any).translatedText) {
        await enqueueTranslation(item.id, 'en');
      }
    } catch (e: any) {
      console.error('[ingest] Error saving content item', e?.message || e);
    }
  }
  // Be polite to origins between sources
  await politeDelay(500);
}

const events = new QueueEvents('ingest', { connection: bullMqConnection });
events.on('completed', ({ jobId }) =>
  console.log(`[ingest] completed job ${jobId}`)
);
events.on('failed', ({ jobId, failedReason }) =>
  console.error(`[ingest] failed job ${jobId}: ${failedReason}`)
);

process.on('SIGINT', async () => {
  await worker.close();
  process.exit(0);
});


