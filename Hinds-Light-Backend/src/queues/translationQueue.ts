import { Queue } from 'bullmq';
import { bullMqConnection } from '../lib/redis.js';

export interface TranslateJobData {
  contentItemId: string;
  targetLanguage?: string;
}

export const translationQueue = new Queue<TranslateJobData>('translation', {
  connection: bullMqConnection
});

export async function enqueueTranslation(
  contentItemId: string,
  targetLanguage = 'en'
) {
  await translationQueue.add(
    'translate',
    { contentItemId, targetLanguage },
    {
      removeOnComplete: 1000,
      removeOnFail: 1000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    }
  );
}






