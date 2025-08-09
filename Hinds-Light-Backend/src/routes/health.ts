import type { FastifyInstance } from 'fastify';
import { ok } from '../utils/apiResponse.js';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ok({ status: 'ok', uptime: process.uptime() }));
}






