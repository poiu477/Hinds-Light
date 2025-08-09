import { Queue } from 'bullmq';
import { bullMqConnection } from '../lib/redis.js';

export interface IngestJobData {
  sourceId?: string;
}

export const ingestQueue = new Queue<IngestJobData>('ingest', {
  connection: bullMqConnection
});

export async function scheduleIngestAll(everyMs = 5 * 60 * 1000) {
  await ingestQueue.add(
    'ingest-all',
    {},
    { repeat: { every: everyMs }, jobId: 'ingest-all' }
  );
}

export async function enqueueIngestSource(sourceId: string) {
  await ingestQueue.add(
    'ingest-source',
    { sourceId },
    { removeOnComplete: 1000, removeOnFail: 1000, attempts: 3 }
  );
}






