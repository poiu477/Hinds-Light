import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { rateLimiterPlugin } from './plugins/rateLimiter.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerItemsRoutes } from './routes/items.js';
import { registerSourcesRoutes } from './routes/sources.js';
import { registerPostsRoutes } from './routes/posts.js';
import { registerTranslateRoutes } from './routes/translate.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined
    }
  });

  app.register(rateLimiterPlugin);
  app.register(async (instance) => {
    await registerHealthRoutes(instance);
    await registerItemsRoutes(instance);
    await registerSourcesRoutes(instance);
    await registerPostsRoutes(instance);
    await registerTranslateRoutes(instance);
  });

  return app;
}






