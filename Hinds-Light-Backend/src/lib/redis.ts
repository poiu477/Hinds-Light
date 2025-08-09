import Redis from 'ioredis';
import { env } from '../config/env.js';

// Workaround for TypeScript + NodeNext ESM typing quirk in Docker builds
export const redis = new (Redis as any)(env.REDIS_URL, {
  maxRetriesPerRequest: null
});

export const bullMqConnection = redis;






