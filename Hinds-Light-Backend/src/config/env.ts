import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  TRANSLATION_PROVIDER: z.enum(['dummy', 'google']).default('dummy'),
  GOOGLE_TRANSLATE_API_KEY: z.string().optional(),
  GOOGLE_PROJECT_ID: z.string().optional()
});

export const env = envSchema.parse(process.env);






