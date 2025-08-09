import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse.js';
import { getTranslationProvider } from '../services/translation/TranslationProvider.js';

const bodySchema = z.object({
  text: z.string().min(1),
  from: z.string().default('he').optional(),
  to: z.string().default('en').optional()
});

export async function registerTranslateRoutes(app: FastifyInstance) {
  app.post('/api/translate', async (req) => {
    const body = bodySchema.parse(req.body);
    const provider = getTranslationProvider();
    try {
      const translated = await provider.translateText(body.text, body.from ?? 'he', body.to ?? 'en');
      return ok({
        originalText: body.text,
        translatedText: translated,
        confidence: 1,
        detectedLanguage: body.from ?? 'he'
      });
    } catch (e: any) {
      return fail('INTERNAL_ERROR', e?.message || 'Translation failed');
    }
  });
}


