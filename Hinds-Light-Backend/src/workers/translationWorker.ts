import 'dotenv/config';
import { Worker, QueueEvents } from 'bullmq';
import { bullMqConnection } from '../lib/redis.js';
import { getTranslationProvider } from '../services/translation/TranslationProvider.js';
import { prisma } from '../lib/prisma.js';
import { TranslationStatus } from '@prisma/client';

type JobData = { contentItemId: string; targetLanguage?: string };

const translator = getTranslationProvider();

const worker = new Worker<JobData>(
  'translation',
  async (job) => {
    const id = job.data.contentItemId;
    const item = await prisma.contentItem.findUnique({ where: { id } });
    if (!item) throw new Error(`ContentItem ${id} not found`);
    if (item.translatedText && item.translationStatus === TranslationStatus.TRANSLATED) {
      return { skipped: true };
    }
    try {
      const translated = await translator.translateText(
        item.originalText,
        item.originalLanguage ?? 'he',
        job.data.targetLanguage ?? 'en'
      );
      await prisma.contentItem.update({
        where: { id },
        data: {
          translatedText: translated,
          translatedLanguage: job.data.targetLanguage ?? 'en',
          translationStatus: TranslationStatus.TRANSLATED
        }
      });
      return { translated: true };
    } catch (e) {
      await prisma.contentItem.update({
        where: { id },
        data: { translationStatus: TranslationStatus.FAILED }
      });
      throw e;
    }
  },
  { connection: bullMqConnection, concurrency: 3 }
);

const events = new QueueEvents('translation', { connection: bullMqConnection });
events.on('completed', ({ jobId }) =>
  console.log(`[translation] completed job ${jobId}`)
);
events.on('failed', ({ jobId, failedReason }) =>
  console.error(`[translation] failed job ${jobId}: ${failedReason}`)
);

process.on('SIGINT', async () => {
  await worker.close();
  process.exit(0);
});


