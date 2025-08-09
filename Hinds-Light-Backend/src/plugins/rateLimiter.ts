import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../lib/redis.js';

const limiter = new RateLimiterRedis({
  storeClient: redis,
  points: 300,
  duration: 60 * 15,
  keyPrefix: 'rlflx'
});

export const rateLimiterPlugin: FastifyPluginAsync = fp(async (app) => {
  app.addHook('onRequest', async (req, reply) => {
    try {
      await limiter.consume(req.ip, 1);
    } catch {
      return reply.code(429).send({ error: 'Too Many Requests' });
    }
  });
});






